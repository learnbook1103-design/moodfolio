import { motion } from 'framer-motion';
import Link from 'next/link';


// 공통 에러 레이아웃 컴포넌트
export default function ErrorLayout({
    errorCode,
    title,
    message,
    showRefresh = false,
    accentColor = 'emerald'
}) {
    const accentColors = {
        emerald: {
            from: 'from-emerald-400',
            to: 'to-blue-500',
            glow: 'shadow-[0_0_30px_rgba(52,211,153,0.3)]',
            button: 'bg-emerald-600 hover:bg-emerald-500'
        },
        red: {
            from: 'from-red-400',
            to: 'to-orange-500',
            glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
            button: 'bg-red-600 hover:bg-red-500'
        }
    };

    const colors = accentColors[accentColor] || accentColors.emerald;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a2e35] to-gray-900 flex flex-col items-center justify-center relative overflow-hidden px-4">

            {/* 배경 애니메이션 효과 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 2 }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"
                />
            </div>

            {/* 메인 콘텐츠 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center max-w-2xl"
            >
                {/* 에러 코드 */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`text-9xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-linear-to-r ${colors.from} ${colors.to} mb-6 ${colors.glow}`}
                >
                    {errorCode}
                </motion.div>

                {/* 타이틀 */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-4"
                >
                    {title}
                </motion.h1>

                {/* 메시지 */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-gray-400 mb-12 leading-relaxed"
                >
                    {message}
                </motion.p>

                {/* 버튼들 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Link href="/">
                        <button className={`px-8 py-4 rounded-xl ${colors.button} text-white font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            메인으로 돌아가기
                        </button>
                    </Link>

                    {showRefresh && (
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            페이지 새로고침
                        </button>
                    )}
                </motion.div>

                {/* MoodFolio 로고 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16"
                >
                    <Link href="/">
                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-gray-400 to-gray-600 hover:from-emerald-400 hover:to-blue-500 transition-all cursor-pointer">
                            MoodFolio
                        </span>
                    </Link>
                </motion.div>
            </motion.div>

            {/* 개발자 도구 */}

        </div>
    );
}
