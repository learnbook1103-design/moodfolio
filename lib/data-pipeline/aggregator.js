// lib/data-pipeline/aggregator.js
// 데이터 집계 및 인사이트 생성

import { supabase } from '../supabase.js';

export class DataAggregator {
    // 직군별 인사이트 집계
    async aggregateInsights(jobType) {
        try {
            // 1. 해당 직군의 모든 채용공고 가져오기
            const { data: jobs, error } = await supabase
                .from('job_postings')
                .select('*')
                .eq('job_type', jobType)
                .eq('is_valid', true);

            if (error) throw error;
            if (!jobs || jobs.length === 0) {
                console.log(`⚠️ No jobs found for ${jobType}`);
                return null;
            }

            console.log(`📊 Aggregating ${jobs.length} jobs for ${jobType}...`);

            // 2. 기술 스택 집계
            const skillCounts = {};
            jobs.forEach(job => {
                // 필수 기술
                (job.required_skills || []).forEach(skill => {
                    skillCounts[skill] = skillCounts[skill] || { required: 0, preferred: 0 };
                    skillCounts[skill].required++;
                });

                // 우대 기술
                (job.preferred_skills || []).forEach(skill => {
                    skillCounts[skill] = skillCounts[skill] || { required: 0, preferred: 0 };
                    skillCounts[skill].preferred++;
                });
            });

            const topSkills = Object.entries(skillCounts)
                .map(([skill, counts]) => ({
                    skill,
                    requiredCount: counts.required,
                    preferredCount: counts.preferred,
                    totalCount: counts.required + counts.preferred,
                    requiredRate: counts.required / jobs.length,
                    totalRate: (counts.required + counts.preferred) / jobs.length,
                    importance: counts.required > jobs.length * 0.5 ? 'critical' :
                        counts.required > jobs.length * 0.3 ? 'high' : 'medium'
                }))
                .sort((a, b) => b.totalCount - a.totalCount)
                .slice(0, 30);

            // 3. 키워드 집계
            const keywordCounts = {};
            jobs.forEach(job => {
                (job.keywords || []).forEach(keyword => {
                    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
                });
            });

            const topKeywords = Object.entries(keywordCounts)
                .map(([keyword, count]) => ({
                    keyword,
                    count,
                    frequency: count / jobs.length
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 50);

            // 4. 기술 조합 분석 (자주 함께 나오는 기술)
            const skillCombinations = this.findSkillCombinations(jobs);

            // 5. 캐시에 저장
            const insights = {
                job_type: jobType,
                top_skills: topSkills,
                top_keywords: topKeywords,
                skill_combinations: skillCombinations,
                sample_size: jobs.length,
                data_quality_score: this.calculateQualityScore(jobs)
            };

            const { error: upsertError } = await supabase
                .from('market_insights_cache')
                .upsert(insights, {
                    onConflict: 'job_type'
                });

            if (upsertError) throw upsertError;

            console.log(`✅ Aggregated insights for ${jobType}:`, {
                topSkills: topSkills.length,
                topKeywords: topKeywords.length,
                sampleSize: jobs.length
            });

            return insights;

        } catch (error) {
            console.error(`Error aggregating insights for ${jobType}:`, error);
            throw error;
        }
    }

    // 기술 조합 찾기
    findSkillCombinations(jobs) {
        const combinations = {};

        jobs.forEach(job => {
            const allSkills = [
                ...(job.required_skills || []),
                ...(job.preferred_skills || [])
            ];

            // 2개 조합
            for (let i = 0; i < allSkills.length; i++) {
                for (let j = i + 1; j < allSkills.length; j++) {
                    const combo = [allSkills[i], allSkills[j]].sort().join(' + ');
                    combinations[combo] = (combinations[combo] || 0) + 1;
                }
            }
        });

        return Object.entries(combinations)
            .map(([combo, count]) => ({
                combination: combo,
                count,
                frequency: count / jobs.length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }

    // 데이터 품질 점수 계산
    calculateQualityScore(jobs) {
        let score = 0;

        // 샘플 사이즈 (50개 이상 = 1.0)
        score += Math.min(jobs.length / 50, 1.0) * 0.5;

        // 기술 스택 정보 완성도
        const withSkills = jobs.filter(job =>
            (job.required_skills?.length || 0) + (job.preferred_skills?.length || 0) > 0
        ).length;
        score += (withSkills / jobs.length) * 0.3;

        // 키워드 정보 완성도
        const withKeywords = jobs.filter(job =>
            (job.keywords?.length || 0) > 0
        ).length;
        score += (withKeywords / jobs.length) * 0.2;

        return Math.min(score, 1.0);
    }

    // 트렌드 계산 (주간)
    async calculateWeeklyTrends(jobType) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // 이번 주 일요일
        weekStart.setHours(0, 0, 0, 0);

        // 이번 주 데이터
        const { data: thisWeekJobs } = await supabase
            .from('job_postings')
            .select('*')
            .eq('job_type', jobType)
            .gte('scraped_at', weekStart.toISOString());

        // 지난 주 데이터
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const { data: lastWeekJobs } = await supabase
            .from('job_postings')
            .select('*')
            .eq('job_type', jobType)
            .gte('scraped_at', lastWeekStart.toISOString())
            .lt('scraped_at', weekStart.toISOString());

        // 기술별 트렌드 계산
        const thisWeekSkills = this.countSkills(thisWeekJobs || []);
        const lastWeekSkills = this.countSkills(lastWeekJobs || []);

        const trends = [];
        Object.keys(thisWeekSkills).forEach(skill => {
            const thisWeekCount = thisWeekSkills[skill];
            const lastWeekCount = lastWeekSkills[skill] || 0;
            const growthRate = lastWeekCount > 0
                ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
                : 100;

            trends.push({
                skill_name: skill,
                job_type: jobType,
                week_start: weekStart.toISOString().split('T')[0],
                mention_count: thisWeekCount,
                total_postings: thisWeekJobs.length,
                mention_rate: thisWeekCount / thisWeekJobs.length,
                growth_rate: growthRate
            });
        });

        // skill_trends 테이블에 저장
        if (trends.length > 0) {
            await supabase
                .from('skill_trends')
                .upsert(trends, {
                    onConflict: 'skill_name,job_type,week_start'
                });
        }

        return trends;
    }

    // 기술 카운트 헬퍼
    countSkills(jobs) {
        const counts = {};
        jobs.forEach(job => {
            [...(job.required_skills || []), ...(job.preferred_skills || [])].forEach(skill => {
                counts[skill] = (counts[skill] || 0) + 1;
            });
        });
        return counts;
    }
}

export default DataAggregator;
