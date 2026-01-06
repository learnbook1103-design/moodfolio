import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    calculateProfileCompleteness,
    getNextSteps,
    getCompletionMessage,
    getCompletionLevel
} from '../lib/profileCompleteness';

export default function ProfileCompletenessCard({ userData, onActionClick }) {
    const [score, setScore] = useState(0);
    const [nextSteps, setNextSteps] = useState([]);
    const [message, setMessage] = useState('');
    const [level, setLevel] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (userData) {
            const completionScore = calculateProfileCompleteness(userData);
            const steps = getNextSteps(userData);
            const motivationMessage = getCompletionMessage(completionScore);
            const completionLevel = getCompletionLevel(completionScore);

            setScore(completionScore);
            setNextSteps(steps);
            setMessage(motivationMessage);
            setLevel(completionLevel);
        }
    }, [userData]);

    // Don't show if profile is 100% complete
    if (score >= 100) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 mb-6"
            >
                <div className="flex items-center gap-3">
                    <div className="text-4xl">👑</div>
                    <div>
                        <h3 className="text-xl font-bold text-white">완벽한 프로필!</h3>
                        <p className="text-gray-300 text-sm">
                            {message}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🎯</div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            프로필 완성도: {score}%
                        </h3>
                        <p className="text-sm text-gray-400">
                            {level} 단계
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <svg
                        className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                    />
                </div>
            </div>

            {/* Message */}
            <p className="text-gray-300 text-sm mb-4">
                💡 {message}
            </p>

            {/* Next Steps */}
            <AnimatePresence>
                {isExpanded && nextSteps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="border-t border-white/10 pt-4">
                            <h4 className="text-white font-semibold mb-3">다음 단계:</h4>
                            <div className="space-y-2">
                                {nextSteps.slice(0, 3).map((step) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-gray-400">☐</span>
                                                <span className="text-white font-medium">{step.title}</span>
                                                <span className="text-emerald-400 text-sm">+{step.points}%</span>
                                            </div>
                                            <p className="text-gray-400 text-sm ml-6">
                                                {step.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onActionClick && onActionClick(step.action)}
                                            className="ml-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100"
                                        >
                                            추가하기 →
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapse hint */}
            {!isExpanded && nextSteps.length > 0 && (
                <p className="text-gray-500 text-sm text-center">
                    {nextSteps.length}개의 추천 단계가 있습니다
                </p>
            )}
        </motion.div>
    );
}
