import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function MarketerDeckTemplate({ answers, isEditing, onUpdate }) {
  const selectedMoods = answers.moods || [];
  const selectedBgmTitle = answers.bgm || "음악 없음 (Mute)";
  const currentStyle = getStyleByMood(selectedMoods);

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  // Helper for array updates
  const handleProjectUpdate = (index, field, value) => {
    const newProjects = [...(answers.projects || [])];
    if (!newProjects[index]) newProjects[index] = {};
    newProjects[index] = { ...newProjects[index], [field]: value };
    handleEditChange('projects', newProjects);
  };

  // Use projects array directly
  const projects = (answers.projects || []).map((project, index) => ({
    id: `0${index + 1}`,
    index, // Keep track of original index
    title: project.title || '',
    subtitle: "Key Strategy",
    content: project.desc || '',
    link: project.link || '',
    image: project.image || '' // Add image field
  }));



  const slideBg = "bg-white/95 dark:bg-slate-900/90";
  const slideBorder = "border border-slate-200 dark:border-white/10";
  const textMain = "text-slate-900 dark:text-white";
  const textSub = "text-slate-500 dark:text-slate-400";

  return (
    <div className="min-h-screen relative font-sans py-12 md:py-20 px-4 bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />

      <main className="relative z-10 max-w-5xl mx-auto space-y-16">

        {/* Slide 1: Cover Page */}
        <div className={`aspect-video w-full ${slideBg} ${slideBorder} rounded-xl shadow-2xl p-10 md:p-20 flex flex-col justify-center relative overflow-hidden backdrop-blur-xl`}>
          <div className={`absolute top-0 right-0 w-2/3 h-full bg-linear-to-l ${currentStyle.headerGradient} opacity-20 dark:opacity-30`}></div>

          {/* Profile Image - Artist/Hero Style Position */}
          {answers.profile_image && (
            <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 z-20">
              <img
                src={answers.profile_image}
                alt="Profile"
                className="w-40 h-40 md:w-64 md:h-64 rounded-full object-cover border-4 border-white/30 dark:border-white/10 shadow-2xl transition-transform hover:scale-105 duration-500"
              />
              {/* Decorative Ring */}
              <div className="absolute -inset-4 border border-white/20 rounded-full scale-110 opacity-50 animate-pulse"></div>
            </div>
          )}

          <div className="relative z-10 max-w-2xl">
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="ring-2 ring-emerald-400/50 rounded p-3 bg-black/20 backdrop-blur-sm">
                  <input
                    type="text"
                    value={answers.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full text-5xl md:text-6xl font-black bg-transparent border-b border-white/30 text-white mb-3 px-2 py-2 font-serif"
                    placeholder="이름"
                  />
                  <input
                    type="text"
                    value={answers.strength || ''}
                    onChange={(e) => handleEditChange('strength', e.target.value)}
                    className="w-full bg-transparent border-b border-white/30 text-slate-300 px-2 py-2 text-sm"
                    placeholder="강점"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className={`text-sm font-bold tracking-[0.3em] uppercase mb-6 ${currentStyle.textHighlight}`}>Marketing Strategy Portfolio</div>
                <h1 className={`text-5xl md:text-7xl font-black ${textMain} leading-tight drop-shadow-sm font-serif`}>
                  {answers.name || "Marketer"}<br />PORTFOLIO
                </h1>
              </>
            )}
          </div>
          <div className="relative z-10 border-t-2 border-slate-900 dark:border-white pt-8 flex justify-between items-end">
            <div><h2 className={`text-2xl font-bold ${textMain}`}>{answers.job}</h2><p className={textSub}>{answers.strength}</p></div>
            <div className="text-right"><p className={`font-mono text-xs ${textSub}`}>CONFIDENTIAL</p><p className={`font-mono text-xs ${textSub}`}>{new Date().toLocaleDateString()}</p></div>
          </div>
        </div>

        {/* Slide Loop: Projects */}
        {projects.map((slide, i) => (
          <div key={i} className={`aspect-video w-full ${slideBg} ${slideBorder} rounded-xl shadow-xl p-8 md:p-16 flex flex-col relative backdrop-blur-md`}>
            <div className="flex justify-between items-start mb-8 md:mb-12 border-b border-slate-200 dark:border-white/10 pb-6">
              <div>
                <span className={`text-xs font-bold uppercase tracking-widest ${textSub} mb-1 block`}>{slide.subtitle}</span>
                {isEditing ? (
                  <input type="text" value={slide.title} onChange={(e) => handleProjectUpdate(i, 'title', e.target.value)} className="text-3xl md:text-4xl font-bold w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                ) : (
                  <h2 className={`text-3xl md:text-4xl font-bold ${textMain}`}>{slide.title}</h2>
                )}
              </div>
              <div className={`text-4xl font-black ${textSub} opacity-20`}>{slide.id}</div>
            </div>
            <div className="flex-1 grid md:grid-cols-2 gap-12 items-center">
              {isEditing ? (
                <textarea rows="6" value={slide.content} onChange={(e) => handleProjectUpdate(i, 'desc', e.target.value)} className="text-xl md:text-2xl font-medium leading-relaxed w-full bg-black/10 border border-white/10 rounded px-2 py-2 resize-none text-slate-900 dark:text-white" />
              ) : (
                <p className={`text-xl md:text-2xl font-medium leading-relaxed ${textMain} whitespace-pre-line`}>{slide.content}</p>
              )}

              {/* Visual/Image Section */}
              <div className="w-full aspect-video bg-slate-100 dark:bg-black/30 rounded-lg border border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center relative overflow-hidden group">
                {slide.image ? (
                  // Show actual image if available
                  <>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className={`absolute inset-0 bg-linear-to-br ${currentStyle.headerGradient} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                  </>
                ) : (
                  // Placeholder when no image
                  <div className={`absolute inset-0 bg-linear-to-br ${currentStyle.headerGradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                )}

                {/* Edit mode: Image URL input */}
                {isEditing && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                    <input
                      type="text"
                      value={slide.image || ''}
                      onChange={(e) => handleProjectUpdate(i, 'image', e.target.value)}
                      placeholder="이미지 URL"
                      className="w-full text-xs bg-black/70 border border-white/30 rounded px-2 py-1 text-white placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={slide.link || ''}
                      onChange={(e) => handleProjectUpdate(i, 'link', e.target.value)}
                      placeholder="상세 링크(URL)"
                      className="w-full text-xs bg-black/70 border border-white/30 rounded px-2 py-1 text-white placeholder-gray-400"
                    />
                  </div>
                )}

                {/* View mode: Link display */}
                {!isEditing && !slide.image && (
                  slide.link ? (
                    <a href={slide.link} target="_blank" rel="noreferrer" className={`font-bold underline ${currentStyle.textHighlight}`}>View Detail ↗</a>
                  ) : (
                    <span className={`font-mono text-sm ${textSub}`}>( Strategy Visualization )</span>
                  )
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-between text-[10px] font-mono uppercase tracking-widest opacity-50 text-slate-500 dark:text-slate-400"><span>{answers.name} Portfolio</span><span>Page {i + 2}</span></div>
          </div>
        ))}

        {/* 프로젝트 추가 버튼 */}
        {isEditing && projects.length < 5 && (
          <div className="mt-8 text-center">
            <button onClick={() => {
              const newProjects = [...(answers.projects || []), {
                title: '새 슬라이드',
                desc: '슬라이드 내용을 입력하세요',
                link: ''
              }];
              handleEditChange('projects', newProjects);
            }} className="px-6 py-2 bg-indigo-500/20 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition">
              + 슬라이드 추가
            </button>
          </div>
        )}

        {projects.length === 0 && <div className="text-center text-slate-500">등록된 프로젝트가 없습니다.</div>}

      </main>
    </div>
  );
}