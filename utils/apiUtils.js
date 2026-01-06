/**
 * API Helper Utilities
 * Provides error handling and loading state management for API calls
 */

/**
 * Wrapper for fetch API with error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data or throws error
 */
export async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail ||
                errorData.message ||
                `HTTP Error: ${response.status} ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        // Network errors or parsing errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('네트워크 연결을 확인해주세요. 서버에 접속할 수 없습니다.');
        }
        throw error;
    }
}

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export function getErrorMessage(error) {
    if (!error) return '알 수 없는 오류가 발생했습니다.';

    // Custom error messages
    const errorMessages = {
        'Failed to fetch': '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
        'NetworkError': '네트워크 오류가 발생했습니다.',
        'Unauthorized': '로그인이 필요합니다.',
        'Forbidden': '접근 권한이 없습니다.',
        'Not Found': '요청한 리소스를 찾을 수 없습니다.',
        'Internal Server Error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };

    const message = error.message || error.toString();

    // Check for known error patterns
    for (const [key, value] of Object.entries(errorMessages)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return message;
}

/**
 * Show toast notification (can be replaced with a toast library)
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
export function showNotification(message, type = 'info') {
    // Simple alert for now - can be replaced with a toast library like react-hot-toast
    const emoji = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
    }[type] || 'ℹ️';

    alert(`${emoji} ${message}`);
}

/**
 * Validate environment variables
 * @returns {object} - Validation result
 */
export function validateEnv() {
    const required = [
        'NEXT_PUBLIC_GOOGLE_API_KEY',
        'NEXT_PUBLIC_API_URL',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        return {
            valid: false,
            missing,
            message: `필수 환경 변수가 설정되지 않았습니다: ${missing.join(', ')}`,
        };
    }

    return { valid: true, missing: [], message: 'All environment variables are set' };
}

/**
 * Retry failed API calls
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} - Result of function
 */
export async function retryAsync(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;

        await new Promise(resolve => setTimeout(resolve, delay));
        return retryAsync(fn, retries - 1, delay * 2); // Exponential backoff
    }
}
