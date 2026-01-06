// pages/api/get-market-insights-rag.js
// RAG 기반 시장 인사이트 API (채용공고 데이터 활용)

import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { jobType, yearsExperience, userSkills } = req.body;

    if (!jobType) {
        return res.status(400).json({ error: '직군 정보가 필요합니다.' });
    }

    try {
        // 1. 캐시된 RAG 데이터 가져오기
        const { data: cachedInsights, error: cacheError } = await supabase
            .from('market_insights_cache')
            .select('*')
            .eq('job_type', jobType)
            .single();

        if (cacheError || !cachedInsights) {
            console.log('[RAG] No cached data, falling back to Gemini');
            return getFallbackInsights(req, res, jobType, yearsExperience, userSkills);
        }

        console.log(`[RAG] Found cached data for ${jobType}, sample size: ${cachedInsights.sample_size}`);

        // 2. RAG 데이터 기반 인사이트 생성
        const insights = await generateRAGInsights(cachedInsights, yearsExperience, userSkills);

        return res.status(200).json(insights);

    } catch (error) {
        console.error('[RAG] Error:', error);
        return getFallbackInsights(req, res, jobType, yearsExperience, userSkills);
    }
}

// RAG 데이터 기반 인사이트 생성
async function generateRAGInsights(cachedData, yearsExp, userSkills) {
    const { top_skills, top_keywords, skill_combinations, sample_size } = cachedData;

    // 1. 필수 기술 (보유율 50% 이상)
    const mustHaveSkills = top_skills
        .filter(s => s.requiredRate >= 0.5)
        .slice(0, 7)
        .map(s => ({
            name: s.skill,
            adoption: Math.round(s.totalRate * 100),
            importance: s.importance,
            reason: `${sample_size}개 채용공고 중 ${s.requiredCount}개에서 필수 요구 (${Math.round(s.requiredRate * 100)}%)`
        }));

    // 2. 우대 기술 (보유율 20-50%)
    const niceToHaveSkills = top_skills
        .filter(s => s.totalRate >= 0.2 && s.totalRate < 0.5)
        .slice(0, 5)
        .map(s => ({
            name: s.skill,
            trend: s.preferredCount > s.requiredCount ? 'emerging' : 'stable',
            reason: `${Math.round(s.totalRate * 100)}%의 채용공고에서 언급`
        }));

    // 3. 효과적인 키워드
    const effectiveKeywords = top_keywords
        .slice(0, 7)
        .map(k => ({
            keyword: k.keyword,
            context: `${sample_size}개 공고 중 ${k.count}회 언급`,
            example: `"${k.keyword}"을 활용한 자기소개 작성 권장`
        }));

    // 4. 강조할 강점
    const keyStrengths = [
        {
            strength: "기술 스택 다양성",
            description: `${mustHaveSkills.length}개 이상의 핵심 기술 보유`
        },
        {
            strength: "실무 경험",
            description: `${yearsExp}년차에 적합한 프로젝트 경험`
        },
        {
            strength: "협업 능력",
            description: top_keywords.some(k => k.keyword.includes('협업'))
                ? "팀 협업 경험 강조"
                : "커뮤니케이션 능력 개발"
        }
    ];

    // 5. 개인화된 추천
    const userSkillSet = new Set((userSkills || []).map(s => s.toLowerCase()));
    const marketSkills = new Set(top_skills.map(s => s.skill.toLowerCase()));

    const strengths = [];
    const gaps = [];

    // 사용자가 보유한 필수 기술
    mustHaveSkills.forEach(skill => {
        if (userSkillSet.has(skill.name.toLowerCase())) {
            strengths.push(`${skill.name} 보유 (필수 기술, 상위 ${100 - skill.adoption}%)`);
        } else {
            gaps.push({
                skill: skill.name,
                priority: 'high',
                reason: `${skill.adoption}%의 채용공고에서 요구하는 필수 기술`
            });
        }
    });

    // 학습 경로
    const learningPath = [];
    if (gaps.length > 0) {
        learningPath.push(`1순위: ${gaps[0].skill} 학습 (가장 많이 요구되는 기술)`);
        if (gaps.length > 1) {
            learningPath.push(`2순위: ${gaps[1].skill} 학습`);
        }
    }
    if (niceToHaveSkills.length > 0) {
        learningPath.push(`3순위: ${niceToHaveSkills[0].name} 학습 (경쟁력 강화)`);
    }

    // 기술 조합 추천
    if (skill_combinations && skill_combinations.length > 0) {
        const topCombo = skill_combinations[0];
        learningPath.push(`추천 조합: ${topCombo.combination} (${Math.round(topCombo.frequency * 100)}%의 공고에서 함께 요구)`);
    }

    return {
        mustHaveSkills,
        niceToHaveSkills,
        effectiveKeywords,
        keyStrengths,
        personalizedRecommendations: {
            strengths: strengths.length > 0 ? strengths : ["기본기가 탄탄합니다"],
            gaps,
            learningPath
        },
        metadata: {
            jobType: cachedData.job_type,
            yearsExperience: yearsExp,
            sampleSize: sample_size,
            dataQuality: cachedData.data_quality_score,
            lastUpdated: cachedData.last_updated,
            source: 'rag-job-postings'
        }
    };
}

// Fallback: Gemini 기반 인사이트
async function getFallbackInsights(req, res, jobType, yearsExp, userSkills) {
    // 기존 get-market-insights.js 로직 재사용
    const fallbackData = {
        developer: {
            mustHaveSkills: [
                { name: "JavaScript", adoption: 95, importance: "critical", reason: "웹 개발의 필수 언어" },
                { name: "React", adoption: 85, importance: "high", reason: "가장 인기있는 프론트엔드 프레임워크" }
            ],
            niceToHaveSkills: [
                { name: "TypeScript", trend: "rising", reason: "타입 안정성" }
            ],
            effectiveKeywords: [
                { keyword: "사용자 경험", context: "UX 향상" }
            ],
            keyStrengths: [
                { strength: "문제 해결", description: "기술적 챌린지 극복" }
            ]
        }
        // ... 다른 직군
    };

    const data = fallbackData[jobType] || fallbackData.developer;

    return res.status(200).json({
        ...data,
        personalizedRecommendations: {
            strengths: ["기본기가 탄탄합니다"],
            gaps: [{ skill: "추가 분석 필요", priority: "medium", reason: "더 많은 정보가 필요합니다" }],
            learningPath: ["현재 기술 심화"]
        },
        metadata: {
            jobType,
            yearsExperience: yearsExp,
            source: 'fallback-data'
        }
    });
}
