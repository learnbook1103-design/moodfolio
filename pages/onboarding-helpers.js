// pages/onboarding-helpers.js
// 온보딩 페이지에서 사용할 헬퍼 함수들

// 경력 연차 계산
export const calculateYearsFromCareer = (careerText) => {
    if (!careerText) return 0;

    // "3년", "3년차", "3 years" 등 패턴 찾기
    const yearMatch = careerText.match(/(\d+)\s*(?:년|year)/i);
    if (yearMatch) return parseInt(yearMatch[1]);

    // "2020 - 2023" 같은 기간 계산
    const periodMatch = careerText.match(/(\d{4})\s*-\s*(\d{4}|현재|Present)/i);
    if (periodMatch) {
        const startYear = parseInt(periodMatch[1]);
        const endYear = periodMatch[2].match(/\d{4}/)
            ? parseInt(periodMatch[2])
            : new Date().getFullYear();
        return endYear - startYear;
    }

    return 3; // 기본값
};

// 시장 인사이트 가져오기
export const fetchMarketInsights = async (jobType, yearsExp, skills) => {
    try {
        const response = await fetch('/api/get-market-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobType,
                yearsExperience: yearsExp,
                userSkills: skills
            })
        });

        const insights = await response.json();
        console.log('✨ Market insights loaded:', insights);
        return insights;
    } catch (error) {
        console.error('Failed to fetch insights:', error);
        return null;
    }
};
