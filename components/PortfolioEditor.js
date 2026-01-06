import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { getUserProfile, updateUserProfile, updatePortfolio } from '../lib/db';

// Updated: 2025-12-19 16:20
const TEMPLATE_OPTIONS = {
  developer: [
    { id: 'problem', name: 'Timeline', desc: '문제 해결 과정 (타임라인)' },
    { id: 'impl', name: 'Bento', desc: '구현 결과물 (그리드)' },
    { id: 'tech', name: 'Docs', desc: '기술 깊이 (문서)' },
  ],
  designer: [
    { id: 'visual', name: 'Gallery', desc: '비주얼 임팩트 (갤러리)' },
    { id: 'brand', name: 'Magazine', desc: '브랜드 스토리 (매거진)' },
    { id: 'ux', name: 'Case Study', desc: '논리적 흐름 (케이스)' },
  ],
  marketer: [
    { id: 'data', name: 'Dashboard', desc: '성과 데이터 (대시보드)' },
    { id: 'strategy', name: 'Deck', desc: '전략 제안 (슬라이드)' },
    { id: 'creative', name: 'Feed', desc: '콘텐츠 (피드)' },
  ],
  service: [
    { id: 'revenue', name: 'Journey', desc: '비즈니스 임팩트 (여정)' },
    { id: 'ops', name: 'Roadmap', desc: '운영 효율화 (로드맵)' },
    { id: 'comm', name: 'Wiki', desc: '협업 문서화 (위키)' },
  ]
};

// Flatten all templates for the unified grid
const ALL_TEMPLATES = [
  ...TEMPLATE_OPTIONS.developer,
  ...TEMPLATE_OPTIONS.designer,
  ...TEMPLATE_OPTIONS.marketer,
  ...TEMPLATE_OPTIONS.service
];

const JOB_CATEGORIES = [
  { id: 'developer', label: '개발자' },
  { id: 'designer', label: '디자이너' },
  { id: 'marketer', label: '마케터' },
  { id: 'service', label: '기획자' },
];

const MOOD_OPTIONS = ["#차분한", "#열정적인", "#신뢰감있는", "#힙한(Hip)", "#창의적인", "#미니멀한", "#클래식한"];

const BGM_OPTIONS = [
  { id: "Smart & Professional", label: "Example: Midnight Logic, Deep Dive" },
  { id: "Emotion & Storytelling", label: "Example: Modern Art, Silent Space" },
  { id: "Impact & Creative", label: "Example: The Voyage, Mystic East" },
  { id: "Mute", label: "음악 없음" }
];

export default function PortfolioEditor({ isOpen, onClose, answers, setAnswers, aiRecommendation, widget = false }) {
  if (!isOpen) return null;

  // Track selected job internally for tabs, sync with answers
  const currentJob = answers.job?.toLowerCase() || 'developer';

  const handleChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleJobChange = (jobId) => {
    handleChange('job', jobId);

    // [Fix] Auto-select the first template when job changes to prevent mismatch
    const defaultTemplate = TEMPLATE_OPTIONS[jobId]?.[0]?.id;
    if (defaultTemplate) {
      handleChange('strength', defaultTemplate);
      handleChange('template', defaultTemplate);
    }
  };

  const handleTemplateChange = (templateId) => {
    // Only update strength/template, DO NOT update job
    handleChange('strength', templateId);
    handleChange('template', templateId); // [Fix] Ensure template field is also updated
  };

  const containerClass = widget
    ? 'fixed right-6 bottom-20 z-50 w-[400px] max-h-[80vh] overflow-y-auto p-4 bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl'
    : 'fixed inset-0 z-9999 overflow-y-auto bg-black/80 backdrop-blur-sm p-4 flex items-start justify-center pt-10';

  const panelInnerClass = widget ? 'w-full' : 'w-full max-w-3xl';

  return (
    <motion.div
      initial={widget ? { opacity: 0, y: 10 } : { opacity: 0, y: 20 }}
      animate={widget ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      exit={widget ? { opacity: 0, y: 10 } : { opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={containerClass}
    >
      <div className={panelInnerClass + ' rounded-3xl p-6'}>
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
            Portfolio 수정
          </h2>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">

          {/* 1. 직군 선택 (Tabs) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
              Select Job Rule
            </h3>
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {JOB_CATEGORIES.map((job) => {
                const isActive = currentJob === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => handleJobChange(job.id)}
                    className={`flex-1 py-2 text-xs font-bold transition-all rounded-lg
                      ${isActive
                        ? 'bg-yellow-400 text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {job.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 px-1">
              * 선택한 직군에 맞춰 AI 인사이트와 프로젝트 입력 형식이 변경됩니다.
            </p>
          </section>

          {/* 2. 템플릿 선택 (Unified Grid) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              Select Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ALL_TEMPLATES.map((t) => {
                // AI Recommendation Check
                const isAiPick = aiRecommendation && aiRecommendation.strength === t.id;
                const isSelected = answers.strength === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleTemplateChange(t.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden
                         ${isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }
                         ${isAiPick ? 'border-yellow-400/50' : ''}
                       `}
                  >
                    {isAiPick && <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none"></div>}

                    <div>
                      <span className={`font-bold text-sm flex items-center gap-2 ${isSelected ? 'text-emerald-400' : 'text-gray-200'}`}>
                        {t.name}
                        {isAiPick && (
                          <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold animate-pulse">
                            AI Pick
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-400">{t.desc}</span>
                    </div>
                    {isSelected && (
                      <span className="text-emerald-400 font-bold text-lg">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. 무드 */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">Mood & Vibe</h3>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button key={mood} onClick={() => handleChange('moods', [mood])} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${(answers.moods?.[0] === mood) ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>{mood}</button>
              ))}
            </div>
          </section>

          {/* 4. 배경음악 (BGM) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">Background Music</h3>
            <div className="grid grid-cols-1 gap-2">
              {BGM_OPTIONS.map((bgm) => {
                const isSelected = answers.bgm === bgm.id || (!answers.bgm && bgm.id === 'Mute');
                return (
                  <button
                    key={bgm.id}
                    onClick={() => handleChange('bgm', bgm.id)}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-between group
                      ${isSelected
                        ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className={`font-bold text-sm ${isSelected ? 'text-indigo-400' : 'text-gray-200'}`}>
                          {bgm.id}
                        </div>
                        <div className="text-xs text-gray-400">{bgm.label}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-indigo-400 font-bold text-lg">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. 프로필 정보 (제거됨) */}

          {/* 4. 대표 프로젝트 선택 (제거됨) */}
        </div>

        {/* Footer Buttons Removed per new design */}
        {/* <div className="mt-6 pt-4 border-t border-white/10 pb-2 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600 transition">취소</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:brightness-110 transition active:scale-95 disabled:opacity-70 disabled:cursor-wait">
            {isSaving ? '저장 중...' : '수정 완료'}
          </button>
        </div> */}
      </div>
    </motion.div>
  );
}