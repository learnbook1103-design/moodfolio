/**
 * Accessibility Utilities
 * Helper functions for improving web accessibility
 */

/**
 * Generate unique ID for accessibility
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Unique ID
 */
export function generateA11yId(prefix = 'a11y') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get ARIA label for form validation state
 * @param {boolean} isValid - Validation state
 * @param {string} fieldName - Field name
 * @returns {string} - ARIA label
 */
export function getValidationAriaLabel(isValid, fieldName) {
    if (isValid === null) return `${fieldName} 입력`;
    if (isValid) return `${fieldName} 입력 완료`;
    return `${fieldName} 입력 오류`;
}

/**
 * Get ARIA live region announcement
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level (polite, assertive)
 * @returns {object} - ARIA attributes
 */
export function getAriaLiveAttributes(message, priority = 'polite') {
    return {
        'aria-live': priority,
        'aria-atomic': 'true',
        role: 'status',
    };
}

/**
 * Check if element is keyboard accessible
 * @param {HTMLElement} element - DOM element
 * @returns {boolean} - True if keyboard accessible
 */
export function isKeyboardAccessible(element) {
    if (!element) return false;

    const tabIndex = element.getAttribute('tabindex');
    const role = element.getAttribute('role');
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];

    return (
        interactiveTags.includes(element.tagName.toLowerCase()) ||
        (tabIndex !== null && parseInt(tabIndex) >= 0) ||
        role === 'button' ||
        role === 'link'
    );
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 * @param {Function} onEnter - Callback for Enter key
 * @param {Function} onSpace - Callback for Space key
 */
export function handleKeyboardNav(event, onEnter, onSpace) {
    if (event.key === 'Enter' && onEnter) {
        event.preventDefault();
        onEnter(event);
    } else if (event.key === ' ' && onSpace) {
        event.preventDefault();
        onSpace(event);
    }
}

/**
 * Get color contrast ratio
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} - Contrast ratio
 */
export function getContrastRatio(color1, color2) {
    const getLuminance = (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;

        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG standards
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} level - WCAG level (AA, AAA)
 * @param {boolean} largeText - Is large text (18pt+ or 14pt+ bold)
 * @returns {boolean} - True if meets standards
 */
export function meetsWCAGContrast(foreground, background, level = 'AA', largeText = false) {
    const ratio = getContrastRatio(foreground, background);

    if (level === 'AAA') {
        return largeText ? ratio >= 4.5 : ratio >= 7;
    }

    // AA level
    return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Focus trap for modals and dialogs
 * @param {HTMLElement} container - Container element
 * @returns {Function} - Cleanup function
 */
export function createFocusTrap(container) {
    if (!container) return () => { };

    const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    if (firstElement) firstElement.focus();

    // Return cleanup function
    return () => {
        container.removeEventListener('keydown', handleTabKey);
    };
}

/**
 * Announce to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Priority (polite, assertive)
 */
export function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Skip to main content link helper
 * @param {string} mainContentId - ID of main content element
 */
export function skipToMainContent(mainContentId = 'main-content') {
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        mainContent.removeAttribute('tabindex');
    }
}
