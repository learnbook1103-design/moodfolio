import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function ServiceRoadmapTemplate({ answers, isEditing, onUpdate }) {
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
    id: index + 1,
    index, // Keep track of original index
    title: project.title || '',
    desc: project.desc || '',
    link: project.link || '',
    image: project.image || ''
  }));



  const headerText = "text-slate-900 dark:text-white";
  const subText = "text-slate-600 dark:text-slate-400";
  const columnBg = "bg-slate-100/50 dark:bg-white/5";
  const cardBg = "bg-white dark:bg-slate-800";
  const cardBorder = "border-slate-200 dark:border-white/5";

  return (
    <div className="min-h-screen relative font-sans flex flex-col overflow-hidden bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      <header className="px-8 py-8 border-b border-white/10 relative z-10 bg-white/30 dark:bg-black/20 backdrop-blur-md flex flex-col md:flex-row justify-between items-end">
        <div className="flex items-center gap-6">
          {answers.profile_image && (
            <img src={answers.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shadow-md hidden md:block" />
          )}
          {isEditing ? (
            <div className="ring-2 ring-emerald-400/50 rounded p-3 bg-black/20">
              <input
                type="text"
                value={answers.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-b border-white/30 text-white mb-3 px-2 py-2 font-serif"
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
          ) : (
            <div>
              <h1 className={`text-3xl font-bold ${headerText} mb-2 font-serif`}>{answers.name || "Service Planner"}</h1>
              <p className={`text-sm ${subText}`}>{answers.job} | {answers.strength}</p>
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <span className={`text-xs ${subText} font-medium`}>Workflow View</span>
          <span className={`h-6 px-3 rounded-full text-xs font-bold border flex items-center ${currentStyle.pill}`}>Project Roadmap</span>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-8 relative z-10">
        <div className="min-w-[1000px] flex gap-6 h-full items-start">

          {/* Column 1: Career Summary */}
          <div className={`flex-1 min-w-[300px] rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-sm border border-transparent dark:border-white/5 ${columnBg}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-white/10">
              <h3 className={`text-xs font-bold tracking-widest ${currentStyle.textHighlight}`}>CAREER SUMMARY</h3>
            </div>
            <div className={`p-5 rounded-xl border ${cardBg} ${cardBorder} shadow-sm`}>
              <p className={`text-sm ${subText} leading-relaxed whitespace-pre-line`}>
                {answers.career_summary || "경력 사항이 입력되지 않았습니다."}
              </p>
            </div>
          </div>

          {/* Column 2: Projects */}
          <div className={`flex-2 min-w-[400px] rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-sm border border-transparent dark:border-white/5 ${columnBg}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-white/10">
              <h3 className={`text-xs font-bold tracking-widest ${currentStyle.textHighlight}`}>KEY PROJECTS</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-white/10 ${subText}`}>{projects.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {projects.map((item, i) => (
                <div key={i} className={`p-5 rounded-xl border ${cardBg} ${cardBorder} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-1`}>
                  <div className="flex gap-2 mb-3">
                    <span className={`w-12 h-1.5 rounded-full`} style={{ backgroundColor: currentStyle.glowColor }}></span>
                  </div>
                  {isEditing ? (
                    <>
                      <input type="text" value={item.title} onChange={(e) => handleProjectUpdate(i, 'title', e.target.value)} className="font-bold text-lg w-full bg-black/10 border border-white/10 rounded px-2 py-1 mb-2 text-slate-900 dark:text-white" />
                      <textarea rows="2" value={item.desc} onChange={(e) => handleProjectUpdate(i, 'desc', e.target.value)} className="text-sm w-full bg-black/10 border border-white/10 rounded px-2 py-1 resize-none mb-2 text-slate-900 dark:text-white" />
                      <input type="text" value={item.link || ''} onChange={(e) => handleProjectUpdate(i, 'link', e.target.value)} placeholder="링크(URL)" className="text-xs w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                    </>
                  ) : (
                    <>
                      <h4 className={`font-bold text-lg ${headerText} mb-2 font-serif`}>{item.title}</h4>
                      <p className={`text-sm ${subText} leading-snug mb-3`}>{item.desc}</p>
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Link ↗</a>}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 단계 추가 버튼 */}
            {isEditing && projects.length < 5 && (
              <div className="mt-8 text-center">
                <button onClick={() => {
                  const newProjects = [...(answers.projects || []), {
                    title: '새 단계',
                    desc: '단계 설명을 입력하세요',
                    link: ''
                  }];
                  handleEditChange('projects', newProjects);
                }} className="px-6 py-2 bg-teal-500/20 border border-teal-500 text-teal-300 rounded-lg hover:bg-teal-500/30 transition">
                  + 단계 추가
                </button>

              </div>
            )}
          </div>

          {/* Column 3: Contact */}
          <div className={`flex-1 min-w-[200px] rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-sm border border-transparent dark:border-white/5 ${columnBg}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-white/10">
              <h3 className={`text-xs font-bold tracking-widest ${currentStyle.textHighlight}`}>CONTACT</h3>
            </div>
            <div className={`p-5 rounded-xl border ${cardBg} ${cardBorder} shadow-sm text-center`}>
              <p className={`text-sm font-bold ${headerText} mb-1`}>{answers.name}</p>
              <p className={`text-xs ${subText}`}>{answers.email}</p>
              <p className={`text-xs ${subText}`}>{answers.phone}</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}