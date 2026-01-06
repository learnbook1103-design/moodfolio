import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import HeroSection from '../../components/HeroSection';
import Step3Content from '../../components/Step3Content';
import Step4Content from '../../components/Step4Content';

import BackgroundElements from '../../components/BackgroundElements';
import { apiWrapper } from '../../utils/apiHelper'; // Shared helper
import { supabase } from '../../lib/supabase';
import { createPortfolio, updateUserProfile } from '../../lib/db';

export default function SurveyPage() {
    const router = useRouter();
    const [view, setView] = useState('hero');
    const [userData, setUserData] = useState({});

    useEffect(() => {
        // Load minimal user data from signup (simulated session)
        const stored = localStorage.getItem('signup_data');
        if (stored) {
            setUserData(JSON.parse(stored));
        } else {
            // If no signup data, redirect to signup (optional, for Safety)
            // router.push('/signup'); 
        }

        // 개발자 도구에서 설정한 단계로 바로 이동
        const devStep = localStorage.getItem('dev_survey_step');
        if (devStep) {
            setView(devStep);
            localStorage.removeItem('dev_survey_step'); // 플래그 제거
        }
    }, []);

    const handleHeroComplete = (heroData) => { setUserData(prev => ({ ...prev, ...heroData })); setView('step3'); };
    const handleStep3Next = (step3Data) => { setUserData(prev => ({ ...prev, ...step3Data })); setView('step4'); }; // Updated to merge data
    const handleStep3Prev = () => { setView('hero'); };

    // Step4 now goes directly to result page
    const handleStep4Next = async () => {
        try {
            // Create portfolio entry with template settings
            const newPortfolio = {
                job: userData.job || 'developer',
                strength: userData.strength || 'problem',
                moods: userData.moods || ['#차분한']
            };

            // Create user profile with personal data
            const userProfile = {
                name: userData.name || '',
                email: userData.email || '',
                intro: userData.intro || '',
                phone: userData.phone || '',
                link: userData.link || '',
                career_summary: userData.career_summary || '',
                projects: []
            };

            // Extract projects based on job type
            const isDesigner = userData.job?.toLowerCase().includes('design');
            const maxProjects = 6;

            for (let i = 1; i <= maxProjects; i++) {
                const titleKey = isDesigner ? `design_project${i}_title` : `project${i}_title`;
                const descKey = isDesigner ? `design_project${i}_desc` : `project${i}_desc`;
                const linkKey = isDesigner ? `design_project${i}_link` : `project${i}_link`;
                const fileKey = isDesigner ? `design_project${i}_file` : `project${i}_file`;

                if (userData[titleKey]) {
                    userProfile.projects.push({
                        id: i,
                        title: userData[titleKey] || '',
                        desc: userData[descKey] || '',
                        link: userData[linkKey] || '',
                        file: userData[fileKey] || ''
                    });
                }
            }

            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Logged-in user: Save to Supabase
                console.log('💾 Saving to Supabase for user:', user.id);
                try {
                    // Step 1: Update user profile
                    console.log('📝 Updating user profile...');
                    await updateUserProfile(user.id, userProfile);
                    console.log('✅ User profile updated');

                    // Step 2: Create portfolio (Supabase auto-generates UUID)
                    console.log('📁 Creating portfolio...');
                    const savedPortfolio = await createPortfolio(user.id, newPortfolio);
                    console.log('✅ Portfolio created:', savedPortfolio);

                    // Step 3: Save to localStorage for quick access
                    localStorage.setItem('current_portfolio_id', savedPortfolio.id);

                    // Step 4: Wait a bit to ensure DB commit
                    console.log('⏳ Waiting for DB commit...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    console.log('✅ Supabase save successful, redirecting to result page');

                    alert("설정이 완료되었습니다! 결과 페이지로 이동합니다.");
                    router.push(`/result?portfolio=${savedPortfolio.id}`);
                } catch (dbError) {
                    console.error('❌ Supabase save failed:', dbError);
                    alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
                    // Do NOT redirect on error - let user retry
                }
            } else {
                // Guest user: Save to LocalStorage with guest_ prefix
                console.log('Guest user detected, saving to LocalStorage');
                const guestPortfolioId = `guest_${Date.now()}`;

                const guestPortfolio = {
                    id: guestPortfolioId,
                    job: userData.job || 'developer',
                    strength: userData.strength || 'problem',
                    moods: userData.moods || ['#차분한'],
                    bgm: userData.bgm || 'Mute',
                    profile: userProfile,
                    createdAt: new Date().toISOString()
                };

                try {
                    sessionStorage.setItem('guest_portfolio', JSON.stringify(guestPortfolio));
                    console.log('✅ Guest portfolio saved to SessionStorage');

                    alert("임시 포트폴리오가 생성되었습니다!\n브라우저를 닫으면 자동 삭제되니 로그인하여 영구 저장하세요.");
                    router.push(`/result?portfolio=${guestPortfolioId}`);
                } catch (e) {
                    console.error('LocalStorage save failed:', e);
                    alert("저장 중 오류가 발생했습니다.");
                }
            }

        } catch (error) {
            console.error("Save portfolio error:", error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };
    const handleStep4Prev = () => { setView('step3'); };

    return (
        <div className="min-h-screen bg-[#1a2e35] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <BackgroundElements animate={false} />

            {/* Content Area */}
            <div className="relative z-30 w-full h-full flex items-center justify-center px-4 overflow-y-auto py-10">
                <AnimatePresence mode="wait">

                    {view === 'hero' && (
                        <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full flex items-center justify-center">
                            <HeroSection answers={userData} handleChange={(key, value) => setUserData(prev => ({ ...prev, [key]: value }))} onComplete={handleHeroComplete} />
                        </motion.div>
                    )}

                    {view === 'step3' && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="w-full h-full flex items-center justify-center">
                            <Step3Content answers={userData} handleChange={(key, value) => setUserData(prev => ({ ...prev, [key]: value }))} onNext={handleStep3Next} onPrev={handleStep3Prev} />
                        </motion.div>
                    )}

                    {view === 'step4' && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="w-full h-full flex items-center justify-center">
                            <Step4Content answers={userData} handleChange={(key, value) => setUserData(prev => ({ ...prev, [key]: value }))} onNext={handleStep4Next} onPrev={handleStep4Prev} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* 개발자 도구 */}

        </div>
    );
}
