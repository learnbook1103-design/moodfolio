import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { LayerBack, TreeLeft, TreeRight, GroundFront } from "./PlaceholderAssets";
// [수정] normalizeJob은 이제 필요 없어서 제거했습니다.
import { JOB_SPECS } from "../lib/jobData";

// --- 데이터 설정 ---
const MOOD_OPTIONS = ["#차분한", "#열정적인", "#신뢰감있는", "#힙한(Hip)", "#창의적인", "#미니멀한", "#클래식한"];
const BGM_OPTIONS = ["Smart & Professional", "Emotion & Storytelling", "Impact & Creative", "Mute"];

const initialJobOptions = Object.entries(JOB_SPECS).map(([key, data]) => ({
  label: data.label,
  value: key,
  icon: data.icon
}));

const initialQuestions = [
  { id: 'job', text: "지원하시는 직무 분야를\n선택해주세요.", options: initialJobOptions },
  { id: 'strength', text: "잠시만 기다려주세요...", options: [] },
  { id: 'moods', text: "보여주고 싶은 분위기는?\n(최대 3개)", options: MOOD_OPTIONS.map(mood => ({ label: mood, value: mood })) },
  { id: 'bgm', text: "배경 음악(BGM)을\n골라주세요.", options: BGM_OPTIONS.map(bgm => ({ label: bgm, value: bgm })) }
];

// --- 애니메이션 설정 ---
const titleAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const buttonAnim = {
  initial: { opacity: 0, scale: 0.5 },
  animate: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }
  }),
  exit: (i) => ({
    scale: [1, 1.4, 0],
    opacity: [1, 1, 0],
    transition: { duration: 0.4, ease: "easeInOut", delay: i * 0.05 }
  })
};

export default function HeroSection({ answers, handleChange, onComplete }) {
  const router = useRouter();

  const [questions, setQuestions] = useState(initialQuestions);
  const [currentStep, setCurrentStep] = useState(0);
  const [localAnswers, setLocalAnswers] = useState(answers || {});

  useEffect(() => { setLocalAnswers(answers || {}); }, [answers]);

  console.log('HeroSection Debug: questions', questions);
  console.log('HeroSection Debug: currentStep', currentStep);
  const currentQuestion = questions[currentStep];
  console.log('HeroSection Debug: currentQuestion', currentQuestion);
  const isLastStep = currentStep === questions.length - 1;

  // 답변 선택 핸들러
  const handleSelect = (value) => {
    const qId = currentQuestion.id;
    let newAnswers = { ...localAnswers };

    if (qId === 'moods') {
      const currentMoods = localAnswers.moods || [];
      let newMoods;
      if (currentMoods.includes(value)) newMoods = currentMoods.filter(m => m !== value);
      else {
        if (currentMoods.length >= 3) return;
        newMoods = [...currentMoods, value];
      }
      newAnswers[qId] = newMoods;
    } else {
      newAnswers[qId] = value;

      // [수정] 직무(Q1) 선택 시 -> 강점(Q2) 질문 업데이트 로직
      if (qId === 'job') {
        const jobKey = value; // [핵심 수정] 변환 없이 바로 사용! (이미 'designer' 등이 들어옴)
        const jobData = JOB_SPECS[jobKey];

        if (jobData) {
          const strengthOptions = jobData.strengths.map(s => ({
            label: s.label.replace(" (", "\n("),
            value: s.id
          }));
          const jobName = jobData.label;

          setQuestions(prev => {
            const newQ = [...prev];
            newQ[1] = { id: 'strength', text: `${jobName}로서\n가장 돋보이는 강점은?`, options: strengthOptions };
            return newQ;
          });
        }
      }
    }
    setLocalAnswers(newAnswers);
    if (handleChange) handleChange(qId, newAnswers[qId]);
  };

  const handleNext = () => {
    if (isLastStep) { if (onComplete) onComplete(localAnswers); }
    else { setCurrentStep((prev) => prev + 1); }
  };

  const handlePrev = () => {
    if (currentStep > 0) { setCurrentStep((prev) => prev - 1); }
  };

  const isStepValid = () => {
    const ans = localAnswers[currentQuestion?.id];
    if (currentQuestion?.id === 'moods') return ans && ans.length > 0;
    return !!ans;
  };

  // Safety check: if currentQuestion is undefined, return loading state
  if (!currentQuestion) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4">
        <p className="text-white text-xl">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4">

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">

          <motion.div className="mb-16 flex flex-col items-center" variants={titleAnim} initial="initial" animate="animate" exit="exit">
            <h2 className="font-serif text-4xl md:text-6xl font-extrabold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-tight whitespace-pre-line pb-2">
              {currentQuestion.text}
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {currentQuestion.options.map((option, idx) => {
              const qId = currentQuestion.id;
              let isSelected = false;
              if (qId === 'moods') isSelected = localAnswers.moods?.includes(option.value);
              else isSelected = localAnswers[qId] === option.value;

              const selectedClasses = "bg-emerald-500/30 text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50";
              const unselectedClasses = "bg-white/10 hover:bg-white/20 text-gray-100";

              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  custom={idx}
                  variants={buttonAnim}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                  className={`
                      relative group flex flex-col items-center justify-center
                      rounded-2xl backdrop-blur-xl transition-all duration-150
                      min-w-40 max-w-60 px-8 py-6
                      shadow-lg text-lg font-medium font-sans
                      transform-gpu will-change-transform
                      ${isSelected ? selectedClasses : unselectedClasses}
                      ${isStepValid() && !isSelected ? (qId === 'moods' ? "opacity-70" : "opacity-40 grayscale-50") : "opacity-100"}
                    `}
                >
                  {option.icon && (
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="w-12 h-12 mb-3 object-contain drop-shadow-md"
                    />
                  )}
                  <span className="relative z-10 drop-shadow-md whitespace-pre-wrap break-keep leading-snug will-change-auto">{option.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-6 min-h-[50px]">
        <AnimatePresence>
          {currentStep > 0 && (
            <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors text-sm underline underline-offset-4">
              ← 이전 질문
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isStepValid() && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={handleNext} className="group flex items-center gap-3 text-emerald-300 hover:text-white transition-colors text-lg font-semibold tracking-wide">
              <span>{isLastStep ? "다음 단계로" : "다음 질문"}</span>
              <span className="p-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{isLastStep ? <path d="M20 6 9 17l-5-5" /> : <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>}</svg></span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}