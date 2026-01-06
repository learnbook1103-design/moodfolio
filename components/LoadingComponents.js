import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes and styles
 */
export function LoadingSpinner({ size = 'md', color = 'emerald' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const colors = {
        emerald: 'border-emerald-500',
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-500',
    };

    return (
        <div
            className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`}
        />
    );
}

/**
 * Loading Overlay Component
 * Full-screen loading overlay with message
 */
export function LoadingOverlay({ message = '로딩 중...', show = false }) {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-white/10 flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" color="emerald" />
                <p className="text-white text-lg font-medium">{message}</p>
            </div>
        </motion.div>
    );
}

/**
 * Skeleton Loader Component
 * Skeleton loading placeholder for content
 */
export function SkeletonLoader({ className = '', count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-gray-700/50 rounded ${className}`}
                />
            ))}
        </>
    );
}

/**
 * Button Loading State Component
 * Button with integrated loading state
 */
export function LoadingButton({
    children,
    loading = false,
    disabled = false,
    onClick,
    className = '',
    loadingText = '처리 중...',
    ...props
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`relative ${className} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="white" />
                    {loadingText}
                </span>
            ) : (
                children
            )}
        </button>
    );
}

/**
 * Inline Loading Component
 * Small inline loading indicator
 */
export function InlineLoading({ text = '로딩 중...' }) {
    return (
        <div className="flex items-center gap-2 text-gray-400">
            <LoadingSpinner size="sm" color="gray" />
            <span className="text-sm">{text}</span>
        </div>
    );
}

/**
 * Card Skeleton Component
 * Skeleton for card-based layouts
 */
export function CardSkeleton({ count = 3 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="bg-gray-800/50 rounded-xl p-6 border border-white/10"
                >
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-700 rounded w-1/2" />
                        <div className="h-32 bg-gray-700 rounded" />
                    </div>
                </div>
            ))}
        </>
    );
}

/**
 * Progress Bar Component
 * Animated progress indicator
 */
export function ProgressBar({ progress = 0, showPercentage = true }) {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">진행률</span>
                {showPercentage && (
                    <span className="text-sm font-medium text-emerald-400">
                        {Math.round(progress)}%
                    </span>
                )}
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                />
            </div>
        </div>
    );
}

export default LoadingSpinner;
