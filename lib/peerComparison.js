// lib/peerComparison.js
// Utility functions for peer comparison feature

/**
 * Calculate user's percentile rank among peers
 * @param {number} userValue - User's metric value
 * @param {number[]} peerValues - Array of peer metric values
 * @returns {number} Percentile rank (0-100)
 */
export function calculateUserRank(userValue, peerValues) {
    if (!peerValues || peerValues.length === 0) return 50;

    const betterThanCount = peerValues.filter(val => userValue > val).length;
    return Math.round((betterThanCount / peerValues.length) * 100);
}

/**
 * Get popular skills that user doesn't own
 * @param {string[]} userSkills - User's skills
 * @param {Array} popularSkills - Popular skills with adoption rates
 * @param {number} minAdoptionRate - Minimum adoption rate threshold (0-1)
 * @returns {Array} Recommended skills
 */
export function getPopularSkillsNotOwned(userSkills, popularSkills, minAdoptionRate = 0.3) {
    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));

    return popularSkills
        .filter(skill =>
            !userSkillSet.has(skill.name.toLowerCase()) &&
            skill.adoptionRate >= minAdoptionRate * 100
        )
        .map(skill => ({
            ...skill,
            priority: skill.adoptionRate >= 50 ? 'high' : 'medium',
            reason: `${skill.adoptionRate}%의 동료가 보유`
        }));
}

/**
 * Format peer comparison data for UI display
 * @param {Object} rawData - Raw API response
 * @returns {Object} Formatted data for UI
 */
export function formatPeerComparisonData(rawData) {
    if (!rawData || !rawData.available) {
        return {
            available: false,
            message: rawData?.message || '데이터를 사용할 수 없습니다'
        };
    }

    const { userStats, peerStats, popularSkills, recommendedSkills } = rawData;

    return {
        available: true,
        summary: {
            userSkillCount: userStats.skillCount,
            peerAverageSkillCount: peerStats.averageSkillCount,
            userRank: userStats.rank,
            skillCoverage: userStats.skillCoverage,
            sampleSize: rawData.sampleSize
        },
        comparison: {
            difference: userStats.skillCount - peerStats.averageSkillCount,
            percentile: userStats.rank,
            badge: getBadge(userStats.rank),
            message: getComparisonMessage(userStats.skillCount, peerStats.averageSkillCount, userStats.rank)
        },
        popularSkills,
        recommendedSkills,
        distribution: peerStats.skillDistribution
    };
}

/**
 * Get badge based on percentile rank
 * @param {number} rank - Percentile rank (0-100)
 * @returns {Object} Badge info
 */
function getBadge(rank) {
    if (rank >= 90) return { emoji: '🏆', text: '상위 10%', color: 'gold' };
    if (rank >= 75) return { emoji: '🥇', text: '상위 25%', color: 'silver' };
    if (rank >= 50) return { emoji: '🥈', text: '상위 50%', color: 'bronze' };
    return { emoji: '📊', text: '평균 이하', color: 'gray' };
}

/**
 * Get comparison message
 * @param {number} userCount - User's skill count
 * @param {number} avgCount - Average skill count
 * @param {number} rank - User's percentile rank
 * @returns {string} Comparison message
 */
function getComparisonMessage(userCount, avgCount, rank) {
    const diff = userCount - avgCount;

    if (diff > 3) {
        return `동료들보다 ${diff}개 더 많은 기술을 보유하고 있어요! 🎉`;
    } else if (diff > 0) {
        return `평균보다 ${diff}개 더 많은 기술을 보유하고 있어요.`;
    } else if (diff === 0) {
        return '동료들과 비슷한 수준의 기술을 보유하고 있어요.';
    } else {
        return `평균보다 ${Math.abs(diff)}개 적은 기술을 보유하고 있어요. 추천 기술을 확인해보세요!`;
    }
}

/**
 * Calculate skill coverage percentage
 * @param {string[]} userSkills - User's skills
 * @param {Array} topSkills - Top N skills to compare against
 * @returns {number} Coverage percentage (0-100)
 */
export function calculateSkillCoverage(userSkills, topSkills) {
    if (!topSkills || topSkills.length === 0) return 0;

    const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));
    const topSkillSet = new Set(topSkills.map(s => s.name.toLowerCase()));

    const matchCount = [...userSkillSet].filter(skill => topSkillSet.has(skill)).length;
    return Math.round((matchCount / topSkills.length) * 100);
}
