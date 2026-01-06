// components/RecommendationPanel.js
import { useState, useEffect } from 'react';
import { formatPeerComparisonData } from '../lib/peerComparison';
import { supabase } from '../lib/supabase';

export default function RecommendationPanel({ insights, userSkills = [] }) {
    const [activeTab, setActiveTab] = useState('skills');
    const [peerComparison, setPeerComparison] = useState(null);
    const [loadingPeerData, setLoadingPeerData] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    // Check if user is guest
    useEffect(() => {
        async function checkUserStatus() {
            const { data: { session } } = await supabase.auth.getSession();
            setIsGuest(!session?.user);
        }
        checkUserStatus();
    }, []);

    if (!insights) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    const { mustHaveSkills, niceToHaveSkills, effectiveKeywords, keyStrengths, personalizedRecommendations } = insights;

    // Fetch peer comparison data
    useEffect(() => {
        async function fetchPeerComparison() {
            if (!insights?.metadata?.jobType || insights?.metadata?.yearsExperience === undefined) {
                return;
            }

            setLoadingPeerData(true);
            try {
                const response = await fetch('/api/get-peer-comparison', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobType: insights.metadata.jobType,
                        yearsExperience: insights.metadata.yearsExperience,
                        userSkills: userSkills
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    setPeerComparison(formatPeerComparisonData(data));
                } else {
                    console.error('Failed to fetch peer comparison:', data.error);
                }
            } catch (error) {
                console.error('Error fetching peer comparison:', error);
            } finally {
                setLoadingPeerData(false);
            }
        }

        fetchPeerComparison();
    }, [insights?.metadata?.jobType, insights?.metadata?.yearsExperience, userSkills]);

    return (
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            {/* 헤더 */}
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="text-3xl"></span>
                    AI 커리어 인사이트
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {insights.metadata?.yearsExperience}년차 {insights.metadata?.jobType === 'developer' ? '개발자' :
                        insights.metadata?.jobType === 'designer' ? '디자이너' :
                            insights.metadata?.jobType === 'marketer' ? '마케터' : '서비스 기획자'} 시장 분석 기반
                </p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { id: 'skills', label: '기술 분석' },
                    { id: 'keywords', label: '키워드' },
                    { id: 'strengths', label: '강점' },
                    { id: 'recommendations', label: '추천' },
                    { id: 'peers', label: '동료 비교' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="space-y-6">
                {/* 기술 분석 탭 */}
                {activeTab === 'skills' && (
                    <>
                        {/* 보유 기술 평가 */}
                        {personalizedRecommendations?.strengths?.length > 0 && (
                            <section className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                                <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <span className="text-xl">✅</span>
                                    잘하고 있어요!
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {personalizedRecommendations.strengths.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 필수 기술 */}
                        <section>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="text-xl"></span>
                                필수 기술 (Must-Have)
                            </h4>
                            <div className="space-y-2">
                                {mustHaveSkills?.map((skill, i) => {
                                    const hasSkill = userSkills.some(s =>
                                        s.toLowerCase().includes(skill.name.toLowerCase()) ||
                                        skill.name.toLowerCase().includes(s.toLowerCase())
                                    );

                                    return (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-lg border transition-all ${hasSkill
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {hasSkill && <span className="text-green-600">✓</span>}
                                                    <span className="font-medium text-slate-900 dark:text-white">{skill.name}</span>
                                                    {skill.importance === 'critical' && (
                                                        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded">
                                                            필수
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {skill.adoption}% 보유
                                                    </span>
                                                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${skill.adoption}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{skill.reason}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 우대 기술 */}
                        <section>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <span className="text-xl"></span>
                                우대 기술 (Nice-to-Have)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {niceToHaveSkills?.map((skill, i) => (
                                    <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-900 dark:text-white">{skill.name}</span>
                                            {skill.trend === 'rising' && <span className="text-xs">상승</span>}
                                            {skill.trend === 'emerging' && <span className="text-xs">신규</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{skill.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* 키워드 탭 */}
                {activeTab === 'keywords' && (
                    <section>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl"></span>
                            효과적인 표현
                        </h4>
                        <div className="space-y-4">
                            {effectiveKeywords?.map((item, i) => (
                                <div key={i} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-start gap-3">
                                        <span className="text-purple-600 dark:text-purple-400 text-xl">→</span>
                                        <div className="flex-1">
                                            <strong className="text-slate-900 dark:text-white block mb-1">"{item.keyword}"</strong>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.context}</p>
                                            {item.example && (
                                                <div className="text-xs text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-800 p-2 rounded italic">
                                                    예시: {item.example}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 강점 탭 */}
                {activeTab === 'strengths' && (
                    <section>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl"></span>
                            강조할 강점
                        </h4>
                        <div className="space-y-3">
                            {keyStrengths?.map((item, i) => (
                                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <h5 className="font-medium text-slate-900 dark:text-white mb-1">{item.strength}</h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 추천 탭 */}
                {activeTab === 'recommendations' && (
                    <section>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl"></span>
                            개인화된 추천
                        </h4>

                        {/* 부족한 기술 */}
                        {personalizedRecommendations?.gaps?.length > 0 && (
                            <div className="mb-6">
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">학습 추천 기술</h5>
                                <div className="space-y-2">
                                    {personalizedRecommendations.gaps.map((gap, i) => (
                                        <div key={i} className={`p-4 rounded-lg border ${gap.priority === 'high'
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                            : gap.priority === 'medium'
                                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                            }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-slate-900 dark:text-white">{gap.skill}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${gap.priority === 'high'
                                                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                                    : gap.priority === 'medium'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {gap.priority === 'high' ? '높음' : gap.priority === 'medium' ? '중간' : '낮음'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{gap.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 학습 경로 */}
                        {personalizedRecommendations?.learningPath?.length > 0 && (
                            <div>
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">추천 학습 순서</h5>
                                <div className="space-y-2">
                                    {personalizedRecommendations.learningPath.map((step, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* 동료 비교 탭 */}
                {activeTab === 'peers' && (
                    <section>
                        {loadingPeerData ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : isGuest ? (
                            /* 게스트 사용자용 티저 */
                            <div className="relative overflow-hidden">
                                {/* 블러 처리된 배경 */}
                                <div className="relative">
                                    {/* 미리보기 카드들 (블러) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 blur-sm select-none pointer-events-none">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">보유 기술</span>
                                                <span className="text-2xl"></span>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">8개</div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">평균: 6개</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">순위</span>
                                                <span className="text-2xl"></span>
                                            </div>
                                            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">상위 25%</div>
                                            <div className="text-xs text-purple-600 dark:text-purple-400">상위 75%</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 border border-green-200 dark:border-green-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-green-700 dark:text-green-300 font-medium">인기 기술 보유율</span>
                                                <span className="text-2xl"></span>
                                            </div>
                                            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">80%</div>
                                            <div className="text-xs text-green-600 dark:text-green-400">Top 10 중 보유</div>
                                        </div>
                                    </div>

                                    {/* 블러 처리된 차트 미리보기 */}
                                    <div className="space-y-2 blur-sm select-none pointer-events-none mb-6">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">#{i}</span>
                                                        <span className="font-medium text-slate-900 dark:text-white">기술 {i}</span>
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{90 - i * 10}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${90 - i * 10}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 오버레이 CTA */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-900/80 dark:to-slate-900">
                                    <div className="text-center px-6 py-8 max-w-md">
                                        <div className="text-6xl mb-4 animate-bounce"></div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                            동료들과 비교해보세요!
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                            같은 연차의 다른 개발자들은 어떤 기술을 보유하고 있을까요?<br />
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">회원가입</span>하고 나의 순위와 추천 기술을 확인하세요!
                                        </p>
                                        <div className="space-y-3">
                                            <a
                                                href="/signup"
                                                className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                            >
                                                무료로 시작하기
                                            </a>
                                            <a
                                                href="/login"
                                                className="block w-full px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                            >
                                                이미 계정이 있으신가요? 로그인
                                            </a>
                                        </div>
                                        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <span>✓</span>
                                                <span>무료</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>✓</span>
                                                <span>30초 가입</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>✓</span>
                                                <span>개인정보 보호</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !peerComparison?.available ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl"></span>
                                    <div>
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                                            동료 비교 데이터를 사용할 수 없습니다
                                        </h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                            {peerComparison?.message || '같은 연차의 사용자 데이터가 충분하지 않습니다.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* 요약 카드 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    {/* 보유 기술 수 */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">보유 기술</span>
                                            <span className="text-2xl"></span>
                                        </div>
                                        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                                            {peerComparison.summary.userSkillCount}개
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                            평균: {peerComparison.summary.peerAverageSkillCount}개
                                        </div>
                                    </div>

                                    {/* 순위 */}
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">순위</span>
                                            <span className="text-2xl">{peerComparison.comparison.badge.emoji}</span>
                                        </div>
                                        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                                            {peerComparison.comparison.badge.text}
                                        </div>
                                        <div className="text-xs text-purple-600 dark:text-purple-400">
                                            상위 {100 - peerComparison.summary.userRank}%
                                        </div>
                                    </div>

                                    {/* 커버리지 */}
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 border border-green-200 dark:border-green-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-green-700 dark:text-green-300 font-medium">인기 기술 보유율</span>
                                            <span className="text-2xl"></span>
                                        </div>
                                        <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                                            {peerComparison.summary.skillCoverage}%
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                            Top 10 중 보유
                                        </div>
                                    </div>
                                </div>

                                {/* 비교 메시지 */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-6 border border-blue-200 dark:border-blue-800">
                                    <p className="text-slate-700 dark:text-slate-300 text-center">
                                        {peerComparison.comparison.message}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
                                        {peerComparison.summary.sampleSize}명의 동료 데이터 기반
                                    </p>
                                </div>

                                {/* 인기 기술 */}
                                <div className="mb-6">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl"></span>
                                        동료들이 많이 보유한 기술 Top 10
                                    </h4>
                                    <div className="space-y-2">
                                        {peerComparison.popularSkills.map((skill, i) => (
                                            <div key={i} className={`p-4 rounded-lg border transition-all ${skill.hasSkill
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                            #{i + 1}
                                                        </span>
                                                        {skill.hasSkill && <span className="text-green-600">✓</span>}
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {skill.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {skill.adoptionRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${skill.hasSkill ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        style={{ width: `${skill.adoptionRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 추천 학습 기술 */}
                                {peerComparison.recommendedSkills?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                            <span className="text-xl"></span>
                                            동료들이 보유했지만 내가 없는 기술
                                        </h4>
                                        <div className="space-y-2">
                                            {peerComparison.recommendedSkills.map((rec, i) => (
                                                <div key={i} className={`p-4 rounded-lg border ${rec.priority === 'high'
                                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {rec.skill}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded ${rec.priority === 'high'
                                                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                                            : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                                            }`}>
                                                            {rec.priority === 'high' ? '높음' : '중간'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {rec.reason}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}
            </div>

            {/* 푸터 */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {insights.metadata?.source === 'gemini-market-knowledge' ? 'AI 시장 분석 기반' : '기본 데이터 기반'} ·
                    업데이트: {new Date(insights.metadata?.generatedAt).toLocaleDateString('ko-KR')}
                </p>
            </div>
        </div>
    );
}
