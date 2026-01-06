import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function ServiceJourneyTemplate({ answers, isEditing, onUpdate }) {
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
    step: `0${index + 1}`,
    label: `PROJECT ${index + 1}`,
    index, // Keep track of original index
    title: project.title || '',
    desc: project.desc || '',
    link: project.link || '',
    image: project.image || ''
  }));



  const titleText = "text-slate-900 dark:text-white";
  const descText = "text-slate-600 dark:text-slate-400";
  const cardBg = "bg-white/80 dark:bg-slate-900/80";
  const cardBorder = "border-slate-200 dark:border-white/10";

  return (
    <div className="min-h-screen relative font-sans overflow-x-hidden bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 relative z-10">
        {isEditing ? (
          <div className="flex flex-col items-center gap-6">
            {answers.profile_image && (
              <img src={answers.profile_image} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-2xl" />
            )}
            <div className="ring-2 ring-emerald-400/50 rounded-lg p-4 bg-black/20 max-w-2xl w-full">
              <input
                type="text"
                value={answers.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full text-3xl font-extrabold bg-transparent border-b border-white/30 text-white mb-4 px-2 py-2"
                placeholder="이름"
              />
              <textarea
                value={answers.intro || ''}
                onChange={(e) => handleEditChange('intro', e.target.value)}
                className="w-full bg-transparent border-b border-white/30 text-slate-300 px-2 py-2"
                placeholder="소개"
                rows="2"
              />
            </div>
          </div>
        ) : (
          <>
            {answers.profile_image && (
              <div className="mb-8">
                <img src={answers.profile_image} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-2xl mx-auto" />
              </div>
            )}
            <span className={`text-sm font-bold tracking-[0.3em] uppercase mb-6 ${currentStyle.textHighlight}`}>Service Strategy & Planning</span>
            <h1 className={`text-5xl md:text-7xl font-extrabold leading-tight max-w-4xl ${titleText} mb-8 drop-shadow-sm font-serif`}>
              비즈니스의 문제를 정의하고<br />
              <span className={`text-transparent bg-clip-text bg-linear-to-r ${currentStyle.headerGradient}`}>실질적인 솔루션</span>을 만듭니다.
            </h1>
            <p className={`text-lg md:text-xl font-light max-w-2xl ${descText}`}>
              안녕하세요, <strong>{answers.name || "Service Planner"}</strong>입니다.<br />
              {answers.intro || "사용자의 니즈와 비즈니스 목표 사이의 최적점을 찾아내는 여정을 소개합니다."}
            </p>
          </>
        )}
        {!isEditing && <div className="absolute bottom-10 animate-bounce"><span className="text-2xl text-slate-400">↓</span></div>}
      </section>

      {/* Journey Steps */}
      <section className="max-w-5xl mx-auto px-6 pb-40 relative z-10">
        <div className={`absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 -ml-px bg-linear-to-b ${currentStyle.headerGradient} opacity-30`}></div>

        <div className="space-y-32">
          {/* 경력 요약 (Start Point) */}
          <div className={`relative flex flex-col md:flex-row items-center justify-between`}>
            <div className={`absolute left-6 md:left-1/2 -ml-2.5 w-5 h-5 rounded-full border-4 z-10 shadow-lg bg-white dark:bg-slate-900`} style={{ borderColor: currentStyle.glowColor }}></div>
            <div className={`md:w-[45%] pl-16 md:pl-0 md:text-right md:pr-16`}>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-4 backdrop-blur-sm shadow-sm ${currentStyle.pill}`}>ABOUT ME</span>
              <div className={`p-8 rounded-2xl backdrop-blur-md shadow-xl ${cardBg} ${cardBorder} border`}>
                <h3 className={`text-2xl font-bold mb-4 ${titleText} font-serif`}>Career Summary</h3>
                <p className={`text-base leading-relaxed ${descText} whitespace-pre-line`}>{answers.career_summary || "입력된 경력 사항이 없습니다."}</p>
              </div>
            </div>
            <div className="hidden md:block md:w-[45%]"></div>
          </div>

          {/* 프로젝트 리스트 */}
          {projects.map((item, idx) => (
            <div key={item.step} className={`relative flex flex-col md:flex-row items-center justify-between ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className={`absolute left-6 md:left-1/2 -ml-2.5 w-5 h-5 rounded-full border-4 z-10 shadow-lg bg-white dark:bg-slate-900`} style={{ borderColor: currentStyle.glowColor }}></div>
              <div className={`hidden md:block md:w-[45%] ${idx % 2 === 0 ? 'text-right pr-16' : 'text-left pl-16'}`}>
                <span className={`text-6xl font-black opacity-10 ${titleText}`}>{item.step}</span>
              </div>
              <div className={`md:w-[45%] pl-16 md:pl-0 ${idx % 2 === 0 ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'}`}>
                <div className={`p-8 rounded-2xl backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${cardBg} ${cardBorder} border`}>
                  {isEditing ? (
                    <>
                      <input type="text" value={item.title} onChange={(e) => handleProjectUpdate(idx, 'title', e.target.value)} className="text-2xl font-bold mb-4 w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                      <textarea rows="4" value={item.desc} onChange={(e) => handleProjectUpdate(idx, 'desc', e.target.value)} className="w-full bg-black/10 border border-white/10 rounded px-2 py-1 resize-none text-slate-900 dark:text-white" />
                      <input type="text" value={item.link || ''} onChange={(e) => handleProjectUpdate(idx, 'link', e.target.value)} placeholder="상세 링크(URL)" className="mt-2 text-sm w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                    </>
                  ) : (
                    <>
                      <h3 className={`text-2xl font-bold mb-4 ${titleText} font-serif`}>{item.title}</h3>
                      <p className={`text-base leading-relaxed ${descText}`}>{item.desc}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noreferrer" className={`inline-block mt-4 text-sm font-bold underline ${currentStyle.textHighlight}`}>
                          자세히 보기 →
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 여정 추가 버튼 */}
        {isEditing && projects.length < 5 && (
          <div className="mt-8 text-center">
            <button onClick={() => {
              const newProjects = [...(answers.projects || []), {
                title: '새 여정',
                desc: '여정 설명을 입력하세요',
                link: ''
              }];
              handleEditChange('projects', newProjects);
            }} className="px-6 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition">
              + 여정 추가
            </button>
          </div>
        )}
      </section>

      <footer className="text-center pb-20 relative z-10">
        <div className="mb-4">
          <p className={titleText}>Contact</p>
          <p className={descText}>{answers.email}</p>
        </div>
        <button className={`px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg border-2 ${currentStyle.textHighlight} border-current bg-white dark:bg-slate-900`}>전체 포트폴리오 다운로드</button>
      </footer>
    </div>
  );
}