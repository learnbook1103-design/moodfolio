import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ResetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setIsLoading(true);

        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            console.error('Password update error:', error);
            setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!password) return { label: '', color: '' };
        if (password.length < 6) return { label: '약함', color: 'text-red-400' };
        if (password.length < 10) return { label: '보통', color: 'text-yellow-400' };
        return { label: '강함', color: 'text-emerald-400' };
    };

    const strength = getPasswordStrength();

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
                <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl text-center">
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">비밀번호 변경 완료!</h2>
                    <p className="text-gray-400 mb-6">
                        새로운 비밀번호로 로그인해주세요.
                    </p>
                    <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
                <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                    새 비밀번호 설정
                </h2>
                <p className="text-gray-400 text-sm text-center mb-8">
                    새로운 비밀번호를 입력해주세요.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">새 비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="최소 6자 이상"
                            className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                            required
                        />
                        {password && (
                            <p className={`text-sm mt-1 ${strength.color}`}>
                                강도: {strength.label}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호를 다시 입력하세요"
                            className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-bold transition-all ${isLoading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                            }`}
                    >
                        {isLoading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm text-gray-400 hover:text-emerald-400 transition">
                        ← 로그인 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
