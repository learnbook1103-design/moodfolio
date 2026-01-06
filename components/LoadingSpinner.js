import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingSpinner({ isLoading, message = '로딩 중...' }) {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-2xl flex flex-col items-center gap-4">
                        {/* Animated spinner */}
                        <div className="relative w-16 h-16">
                            <motion.div
                                className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                        </div>

                        {/* Loading message */}
                        <p className="text-white font-medium text-lg">{message}</p>

                        {/* Animated dots */}
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-emerald-400 rounded-full"
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
