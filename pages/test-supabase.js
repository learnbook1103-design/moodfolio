import { supabase } from '../lib/supabase'

// Supabase 연결 테스트 페이지
export default function SupabaseTest() {
    const testConnection = async () => {
        try {
            // 1. 연결 테스트
            const { data, error } = await supabase
                .from('user_profiles')
                .select('count')

            if (error) {
                console.error('❌ 연결 실패:', error)
                alert('연결 실패: ' + error.message)
            } else {
                console.log('✅ Supabase 연결 성공!')
                alert('✅ Supabase 연결 성공!')
            }
        } catch (err) {
            console.error('❌ 오류:', err)
            alert('오류: ' + err.message)
        }
    }

    const testInsert = async () => {
        try {
            // 2. 테스트 데이터 삽입
            const { data, error } = await supabase
                .from('user_profiles')
                .insert({
                    email: 'test@example.com',
                    name: '테스트 사용자',
                    job: 'developer',
                    experience: 3
                })
                .select()

            if (error) {
                console.error('❌ 삽입 실패:', error)
                alert('삽입 실패: ' + error.message)
            } else {
                console.log('✅ 데이터 삽입 성공:', data)
                alert('✅ 데이터 삽입 성공!')
            }
        } catch (err) {
            console.error('❌ 오류:', err)
            alert('오류: ' + err.message)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    Supabase 연결 테스트
                </h1>

                <div className="space-y-4">
                    <button
                        onClick={testConnection}
                        className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
                    >
                        1. 연결 테스트
                    </button>

                    <button
                        onClick={testInsert}
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
                    >
                        2. 데이터 삽입 테스트
                    </button>
                </div>

                <div className="mt-6 p-4 bg-black/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                        브라우저 콘솔(F12)에서 자세한 로그를 확인하세요
                    </p>
                </div>
            </div>
        </div>
    )
}
