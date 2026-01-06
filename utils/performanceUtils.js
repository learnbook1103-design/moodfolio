/**
 * Performance Monitoring Utilities
 * Track and report web vitals and custom metrics
 */

/**
 * Report Web Vitals to analytics
 * @param {Object} metric - Web Vital metric
 */
export function reportWebVitals(metric) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(metric);
    }

    // Send to analytics service (example: Google Analytics)
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
        });
    }

    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: metric.name,
                value: metric.value,
                id: metric.id,
                timestamp: Date.now(),
            }),
        }).catch(console.error);
    }
}

/**
 * Measure page load performance
 * @returns {Object} - Performance metrics
 */
export function measurePageLoad() {
    if (typeof window === 'undefined' || !window.performance) {
        return null;
    }

    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    return {
        pageLoadTime,
        connectTime,
        renderTime,
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        ttfb: perfData.responseStart - perfData.navigationStart,
    };
}

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} properties - Event properties
 */
export function trackEvent(eventName, properties = {}) {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, properties);
    }

    // Custom analytics
    if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: eventName,
                properties,
                timestamp: Date.now(),
            }),
        }).catch(console.error);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Event:', eventName, properties);
    }
}

/**
 * Measure component render time
 * @param {string} componentName - Component name
 * @returns {Function} - End measurement function
 */
export function measureRenderTime(componentName) {
    const startTime = performance.now();

    return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        if (renderTime > 16) {
            // Longer than one frame (60fps)
            console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
        }

        trackEvent('component_render', {
            component: componentName,
            duration: renderTime,
        });

        return renderTime;
    };
}

/**
 * Monitor memory usage
 * @returns {Object} - Memory info
 */
export function getMemoryUsage() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
        return null;
    }

    const memory = window.performance.memory;
    return {
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
}

/**
 * Check if page is slow
 * @returns {boolean} - True if slow
 */
export function isPageSlow() {
    const metrics = measurePageLoad();
    if (!metrics) return false;

    // Consider slow if page load > 3 seconds
    return metrics.pageLoadTime > 3000;
}

/**
 * Get network information
 * @returns {Object} - Network info
 */
export function getNetworkInfo() {
    if (typeof window === 'undefined' || !navigator.connection) {
        return null;
    }

    const connection = navigator.connection;
    return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
    };
}

/**
 * Log performance summary
 */
export function logPerformanceSummary() {
    const pageLoad = measurePageLoad();
    const memory = getMemoryUsage();
    const network = getNetworkInfo();

    console.group('📊 Performance Summary');
    console.log('Page Load:', pageLoad);
    console.log('Memory:', memory);
    console.log('Network:', network);
    console.groupEnd();
}

/**
 * Setup performance observer
 */
export function setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
        return;
    }

    // Observe long tasks
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    console.warn('Long task detected:', entry.duration.toFixed(2) + 'ms');
                    trackEvent('long_task', {
                        duration: entry.duration,
                        name: entry.name,
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
        // PerformanceObserver not supported
    }
}
