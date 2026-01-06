/**
 * Security Utilities
 * Input sanitization and validation functions
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export function sanitizeHTML(input) {
    if (!input) return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password string
 * @returns {object} - Validation result with strength level
 */
export function validatePassword(password) {
    if (!password) {
        return { valid: false, strength: 'none', message: '비밀번호를 입력해주세요.' };
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Check minimum length
    if (password.length < minLength) {
        return {
            valid: false,
            strength: 'weak',
            message: `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`,
        };
    }

    // Calculate strength
    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChar) strength++;
    if (password.length >= 12) strength++;

    // Determine strength level
    let strengthLevel = 'weak';
    let message = '비밀번호가 약합니다.';
    let valid = false;

    if (strength >= 4) {
        strengthLevel = 'strong';
        message = '강력한 비밀번호입니다.';
        valid = true;
    } else if (strength >= 3) {
        strengthLevel = 'medium';
        message = '보통 수준의 비밀번호입니다.';
        valid = true;
    } else {
        message = '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.';
    }

    return {
        valid,
        strength: strengthLevel,
        message,
        details: {
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            length: password.length,
        },
    };
}

/**
 * Sanitize user input for database queries
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
    if (!input) return '';

    // Remove potentially dangerous characters
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate name (letters, spaces, hyphens only)
 * @param {string} name - Name string
 * @returns {boolean} - True if valid
 */
export function isValidName(name) {
    if (!name || name.trim().length === 0) return false;
    const nameRegex = /^[a-zA-Z가-힣\s-]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
}

/**
 * Rate limiting helper (client-side)
 * @param {string} key - Unique key for the action
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - True if allowed
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const storageKey = `rateLimit_${key}`;

    try {
        const data = JSON.parse(localStorage.getItem(storageKey) || '{"attempts":[],"blocked":false}');

        // Remove old attempts outside the window
        data.attempts = data.attempts.filter(timestamp => now - timestamp < windowMs);

        // Check if blocked
        if (data.blocked && data.blockedUntil > now) {
            return false;
        }

        // Check attempts
        if (data.attempts.length >= maxAttempts) {
            data.blocked = true;
            data.blockedUntil = now + windowMs;
            localStorage.setItem(storageKey, JSON.stringify(data));
            return false;
        }

        // Add new attempt
        data.attempts.push(now);
        data.blocked = false;
        localStorage.setItem(storageKey, JSON.stringify(data));

        return true;
    } catch (error) {
        console.error('Rate limit check failed:', error);
        return true; // Allow on error
    }
}

/**
 * Get password strength color
 * @param {string} strength - Strength level (weak, medium, strong)
 * @returns {string} - Tailwind color class
 */
export function getPasswordStrengthColor(strength) {
    const colors = {
        weak: 'text-red-500',
        medium: 'text-yellow-500',
        strong: 'text-green-500',
        none: 'text-gray-500',
    };
    return colors[strength] || colors.none;
}

/**
 * Get password strength bar width
 * @param {string} strength - Strength level
 * @returns {string} - Width percentage
 */
export function getPasswordStrengthWidth(strength) {
    const widths = {
        weak: '33%',
        medium: '66%',
        strong: '100%',
        none: '0%',
    };
    return widths[strength] || widths.none;
}
