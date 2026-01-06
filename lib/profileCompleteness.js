/**
 * Profile Completeness Utility
 * Calculates profile completion percentage and provides next steps
 */

// Weighted scoring system (total: 100%)
const WEIGHTS = {
    // Basic Info (30%)
    name: 5,
    email: 5,
    phone: 5,
    profile_image: 5,
    intro: 10,

    // Professional Info (30%)
    job: 10,
    strength: 10,
    career_summary: 10,

    // Projects (25%)
    projects_count: 10,      // Has at least 1 project
    projects_complete: 15,   // Projects have key fields

    // Skills (10%)
    skills: 10,

    // Contact/Links (5%)
    github: 2.5,
    linkedin: 2.5
};

/**
 * Calculate profile completeness percentage
 * @param {Object} userData - User profile data
 * @returns {Object} { percentage, score, maxScore, breakdown, missing }
 */
export function calculateProfileCompleteness(userData) {
    if (!userData) {
        return { percentage: 0, score: 0, maxScore: 100, breakdown: {}, missing: [] };
    }

    let score = 0;
    const breakdown = {};
    const missing = [];

    // Basic Info
    if (userData.name?.trim()) {
        score += WEIGHTS.name;
        breakdown.name = WEIGHTS.name;
    } else {
        missing.push({ field: 'name', label: '이름', weight: WEIGHTS.name, priority: 1 });
    }

    if (userData.email?.trim()) {
        score += WEIGHTS.email;
        breakdown.email = WEIGHTS.email;
    } else {
        missing.push({ field: 'email', label: '이메일', weight: WEIGHTS.email, priority: 1 });
    }

    if (userData.phone?.trim()) {
        score += WEIGHTS.phone;
        breakdown.phone = WEIGHTS.phone;
    } else {
        missing.push({ field: 'phone', label: '전화번호', weight: WEIGHTS.phone, priority: 2 });
    }

    if (userData.profile_image?.trim()) {
        score += WEIGHTS.profile_image;
        breakdown.profile_image = WEIGHTS.profile_image;
    } else {
        missing.push({ field: 'profile_image', label: '프로필 사진', weight: WEIGHTS.profile_image, priority: 1 });
    }

    if (userData.intro?.trim() && userData.intro.length > 10) {
        score += WEIGHTS.intro;
        breakdown.intro = WEIGHTS.intro;
    } else {
        missing.push({ field: 'intro', label: '자기소개', weight: WEIGHTS.intro, priority: 1 });
    }

    // Professional Info
    // Professional Info
    if (userData.job?.trim() || userData.default_job?.trim()) {
        score += WEIGHTS.job;
        breakdown.job = WEIGHTS.job;
    } else {
        missing.push({ field: 'job', label: '직무', weight: WEIGHTS.job, priority: 1 });
    }

    if (userData.strength?.trim() || userData.default_strength?.trim()) {
        score += WEIGHTS.strength;
        breakdown.strength = WEIGHTS.strength;
    } else {
        missing.push({ field: 'strength', label: '강점/전문분야', weight: WEIGHTS.strength, priority: 2 });
    }

    if (userData.career_summary?.trim() && userData.career_summary.length > 20) {
        score += WEIGHTS.career_summary;
        breakdown.career_summary = WEIGHTS.career_summary;
    } else {
        missing.push({ field: 'career_summary', label: '경력 요약', weight: WEIGHTS.career_summary, priority: 2 });
    }

    // Projects
    const projects = userData.projects || [];
    if (projects.length > 0) {
        score += WEIGHTS.projects_count;
        breakdown.projects_count = WEIGHTS.projects_count;

        // Check if projects are complete (have key fields)
        const completeProjects = projects.filter(p =>
            p.title?.trim() &&
            p.desc?.trim() &&
            (p.tech_stack?.trim() || (p.tags && p.tags.length > 0)) &&
            p.role?.trim()
        );

        if (completeProjects.length > 0) {
            const completionRatio = completeProjects.length / projects.length;
            const projectScore = WEIGHTS.projects_complete * completionRatio;
            score += projectScore;
            breakdown.projects_complete = projectScore;
        } else {
            missing.push({
                field: 'projects_complete',
                label: '프로젝트 상세 정보 (역할, 기술 스택)',
                weight: WEIGHTS.projects_complete,
                priority: 1
            });
        }
    } else {
        missing.push({ field: 'projects_count', label: '프로젝트 추가', weight: WEIGHTS.projects_count, priority: 1 });
        missing.push({ field: 'projects_complete', label: '프로젝트 상세 정보', weight: WEIGHTS.projects_complete, priority: 1 });
    }

    // Skills
    const skills = userData.skills;
    if ((Array.isArray(skills) && skills.length > 0) || (typeof skills === 'string' && skills.trim())) {
        score += WEIGHTS.skills;
        breakdown.skills = WEIGHTS.skills;
    } else {
        missing.push({ field: 'skills', label: '보유 기술', weight: WEIGHTS.skills, priority: 2 });
    }

    // Contact/Links
    if (userData.github?.trim()) {
        score += WEIGHTS.github;
        breakdown.github = WEIGHTS.github;
    } else {
        missing.push({ field: 'github', label: 'GitHub 링크', weight: WEIGHTS.github, priority: 3 });
    }

    if (userData.linkedin?.trim()) {
        score += WEIGHTS.linkedin;
        breakdown.linkedin = WEIGHTS.linkedin;
    } else {
        missing.push({ field: 'linkedin', label: 'LinkedIn 링크', weight: WEIGHTS.linkedin, priority: 3 });
    }

    const percentage = Math.round(score);

    return {
        percentage,
        score,
        maxScore: 100,
        breakdown,
        missing: missing.sort((a, b) => a.priority - b.priority || b.weight - a.weight)
    };
}

/**
 * Get next steps to improve profile
 * @param {Object} userData - User profile data
 * @param {number} limit - Maximum number of suggestions (default: 3)
 * @returns {Array} Array of suggestions with priority
 */
export function getNextSteps(userData, limit = 3) {
    const { missing } = calculateProfileCompleteness(userData);
    return missing.slice(0, limit);
}

/**
 * Get completion level badge
 * @param {number} percentage - Completion percentage
 * @returns {Object} { level, color, icon, message, gradient }
 */
export function getCompletionLevel(percentage) {
    if (percentage >= 90) {
        return {
            level: 'expert',
            label: '완벽!',
            icon: '🏆',
            message: '완벽한 프로필! 채용담당자가 좋아할 거예요!',
            color: 'text-amber-500',
            bg: 'bg-amber-500/20',
            border: 'border-amber-500',
            gradient: 'from-amber-500 to-yellow-500'
        };
    } else if (percentage >= 70) {
        return {
            level: 'advanced',
            label: '거의 완성',
            icon: '🌟',
            message: '거의 다 왔어요! 조금만 더!',
            color: 'text-green-500',
            bg: 'bg-green-500/20',
            border: 'border-green-500',
            gradient: 'from-green-500 to-emerald-500'
        };
    } else if (percentage >= 40) {
        return {
            level: 'intermediate',
            label: '진행 중',
            icon: '🟡',
            message: '좋아요! 계속 진행하세요!',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500',
            gradient: 'from-yellow-500 to-green-500'
        };
    } else {
        return {
            level: 'beginner',
            label: '시작 단계',
            icon: '🔴',
            message: '프로필을 완성하여 더 많은 기회를 얻으세요!',
            color: 'text-red-500',
            bg: 'bg-red-500/20',
            border: 'border-red-500',
            gradient: 'from-red-500 to-orange-500'
        };
    }
}

/**
 * Get motivational message based on recent progress
 * @param {number} oldPercentage - Previous completion percentage
 * @param {number} newPercentage - Current completion percentage
 * @returns {string|null} Motivational message or null
 */
export function getProgressMessage(oldPercentage, newPercentage) {
    // Milestone celebrations
    if (oldPercentage < 50 && newPercentage >= 50) {
        return '🎊 절반 완성! 계속 진행하세요!';
    }
    if (oldPercentage < 75 && newPercentage >= 75) {
        return '🌟 75% 달성! 거의 다 왔어요!';
    }
    if (oldPercentage < 90 && newPercentage >= 90) {
        return '🏆 90% 달성! 완벽한 프로필이 눈앞에!';
    }
    if (oldPercentage < 100 && newPercentage >= 100) {
        return '🎉 100% 완성! 완벽한 프로필입니다!';
    }

    // General progress
    const diff = newPercentage - oldPercentage;
    if (diff >= 10) {
        return `✨ +${diff}% 증가! 잘하고 있어요!`;
    }

    return null;
}

// Backward compatibility exports
export function getCompletionMessage(score) {
    return getCompletionLevel(score).message;
}

export function hasMinimumProfile(userData) {
    return calculateProfileCompleteness(userData).percentage >= 25;
}
