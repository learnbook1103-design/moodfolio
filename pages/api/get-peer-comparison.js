// pages/api/get-peer-comparison.js
// API endpoint for comparing user skills with peers of the same experience level

import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { jobType, yearsExperience, userSkills = [] } = req.body;

    if (!jobType || yearsExperience === undefined) {
        return res.status(400).json({ error: '직군과 연차 정보가 필요합니다.' });
    }

    try {
        // 1. Get peer statistics for this cohort
        const { data: peerStats, error: statsError } = await supabase
            .from('peer_skill_stats')
            .select('*')
            .eq('job_type', jobType)
            .eq('years_experience', yearsExperience)
            .order('adoption_rate', { ascending: false });

        if (statsError) {
            console.error('[Peer Comparison] Error fetching stats:', statsError);
            throw statsError;
        }

        // 2. Check minimum sample size for privacy
        const totalUsers = peerStats?.[0]?.total_users || 0;
        const MIN_SAMPLE_SIZE = 5;

        if (totalUsers < MIN_SAMPLE_SIZE) {
            return res.status(200).json({
                available: false,
                message: `같은 연차의 사용자 데이터가 충분하지 않습니다 (최소 ${MIN_SAMPLE_SIZE}명 필요)`,
                sampleSize: totalUsers
            });
        }

        // 3. Calculate user statistics
        const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
        const userSkillCount = userSkills.length;

        // 4. Get popular skills (top 10)
        const popularSkills = peerStats
            .slice(0, 10)
            .map(stat => ({
                name: stat.skill_name,
                adoptionRate: Math.round(stat.adoption_rate * 100),
                userCount: stat.user_count,
                hasSkill: userSkillSet.has(stat.skill_name.toLowerCase())
            }));

        // 5. Calculate average skill count for peers
        const { data: cohortData, error: cohortError } = await supabase
            .from('user_profiles')
            .select('skills')
            .eq('job_type', jobType)
            .eq('years_experience', yearsExperience);

        if (cohortError) {
            console.error('[Peer Comparison] Error fetching cohort:', cohortError);
        }

        let averageSkillCount = 0;
        let skillCounts = [];

        if (cohortData && cohortData.length > 0) {
            skillCounts = cohortData
                .map(profile => {
                    if (!profile.skills) return 0;
                    try {
                        const skills = Array.isArray(profile.skills)
                            ? profile.skills
                            : JSON.parse(profile.skills);
                        return skills.length;
                    } catch {
                        return 0;
                    }
                })
                .filter(count => count > 0);

            averageSkillCount = skillCounts.length > 0
                ? Math.round(skillCounts.reduce((a, b) => a + b, 0) / skillCounts.length)
                : 0;
        }

        // 6. Calculate user rank (percentile)
        let userRank = 50; // Default to median
        if (skillCounts.length > 0) {
            const betterThanCount = skillCounts.filter(count => userSkillCount > count).length;
            userRank = Math.round((betterThanCount / skillCounts.length) * 100);
        }

        // 7. Find recommended skills (popular but user doesn't have)
        const recommendedSkills = peerStats
            .filter(stat =>
                !userSkillSet.has(stat.skill_name.toLowerCase()) &&
                stat.adoption_rate >= 0.3 // At least 30% adoption
            )
            .slice(0, 5)
            .map(stat => ({
                skill: stat.skill_name,
                adoptionRate: Math.round(stat.adoption_rate * 100),
                priority: stat.adoption_rate >= 0.5 ? 'high' : 'medium',
                reason: `${Math.round(stat.adoption_rate * 100)}%의 동료가 보유한 기술`
            }));

        // 8. Calculate skill coverage
        const topSkillsSet = new Set(popularSkills.slice(0, 10).map(s => s.name.toLowerCase()));
        const userTopSkillsCount = userSkills.filter(s => topSkillsSet.has(s.toLowerCase())).length;
        const skillCoverage = Math.round((userTopSkillsCount / Math.min(10, popularSkills.length)) * 100);

        return res.status(200).json({
            available: true,
            sampleSize: totalUsers,
            userStats: {
                skillCount: userSkillCount,
                rank: userRank, // Percentile (0-100)
                skillCoverage, // % of top 10 skills user has
            },
            peerStats: {
                averageSkillCount,
                totalUsers,
                skillDistribution: {
                    min: Math.min(...skillCounts),
                    max: Math.max(...skillCounts),
                    median: skillCounts.sort((a, b) => a - b)[Math.floor(skillCounts.length / 2)] || 0
                }
            },
            popularSkills,
            recommendedSkills,
            metadata: {
                jobType,
                yearsExperience,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[Peer Comparison] Error:', error);
        return res.status(500).json({
            error: '피어 비교 데이터를 가져오는 중 오류가 발생했습니다.',
            details: error.message
        });
    }
}
