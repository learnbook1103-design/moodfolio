// 이메일 형식 검증
export const isValidEmail = (email) => {
    // Check for Korean or non-ASCII characters
    const hasNonASCII = /[^\x00-\x7F]/.test(email);
    if (hasNonASCII) {
        return false; // Reject emails with Korean or special unicode characters
    }

    // Standard email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 비밀번호 강도 체크
export const checkPasswordStrength = (password) => {
    if (!password || password.length < 8) return 'weak';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const types = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (password.length >= 12 && types === 4) return 'strong';
    if (types >= 3) return 'medium';
    return 'weak';
};

// 비밀번호 강도 메시지
export const getPasswordStrengthMessage = (strength) => {
    const messages = {
        weak: '비밀번호가 너무 약합니다. 8자 이상, 영문/숫자/특수문자를 포함하세요.',
        medium: '적절한 비밀번호입니다.',
        strong: '강력한 비밀번호입니다!'
    };
    return messages[strength] || '';
};

// 비밀번호 강도 색상
export const getPasswordStrengthColor = (strength) => {
    const colors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500'
    };
    return colors[strength] || 'bg-gray-500';
};

// 비밀번호 강도 텍스트 색상
export const getPasswordStrengthTextColor = (strength) => {
    const colors = {
        weak: 'text-red-400',
        medium: 'text-yellow-400',
        strong: 'text-green-400'
    };
    return colors[strength] || 'text-gray-400';
};

// 이름 검증 (2자 이상)
export const isValidName = (name) => {
    return name && name.trim().length >= 2;
};
