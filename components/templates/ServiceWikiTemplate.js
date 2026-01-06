import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function ServiceWikiTemplate({ answers, isEditing, onUpdate, theme = 'light' }) {
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
    // Ensure object exists
    if (!newProjects[index]) newProjects[index] = {};
    newProjects[index] = { ...newProjects[index], [field]: value };
    handleEditChange('projects', newProjects);
  };

  // Use projects array directly
  const projects = (answers.projects || []).map((project, index) => ({
    id: `proj-${index + 1}`,
    index, // Keep track of original index
    title: project.title || '',
    desc: project.desc || '',
    link: project.link || '',
    image: project.image || ''
  }));



  const pageBg = "bg-white dark:bg-[#191919]";
  const textMain = "text-[#37352f] dark:text-[#d9d9d9]";
  const textSub = "text-slate-500 dark:text-slate-400";
  const borderLine = "border-slate-200 dark:border-white/10";
  const hoverBg = "hover:bg-slate-100 dark:hover:bg-white/5";

  return (
    <div className="min-h-screen relative font-sans bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />

      <div className="flex relative z-10 max-w-7xl mx-auto min-h-screen">
        {/* Sidebar */}
        <aside className={`w-64 hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto p-6 ${pageBg} ${borderLine} border-r`}>
          <div className="pt-10">
            <h1 className={`text-xl font-black mb-6 ${textMain}`}>
              <span className="text-2xl mr-2">📑</span>Wiki
            </h1>
            <nav className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{answers.name}'s Space</h3>
              <a href="#intro" className={`block px-3 py-2 rounded-lg text-sm ${hoverBg} ${textMain}`}>1. Introduction</a>
              <a href="#projects" className={`block px-3 py-2 rounded-lg text-sm ${hoverBg} ${textMain}`}>2. Key Projects</a>
              {projects.map(p => (
                <a key={p.id} href={`#${p.id}`} className={`block px-3 py-2 ml-4 rounded-lg text-xs ${hoverBg} ${textSub}`}>- {p.title}</a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 ${pageBg}`}>
          {/* Cover */}
          <div className={`h-40 w-full relative overflow-hidden bg-linear-to-r ${currentStyle.headerGradient} opacity-90 rounded-xl mb-10`}>
            <div className="absolute inset-0 bg-black/10"></div>
            {isEditing ? (
              <input
                type="text"
                value={answers.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="absolute bottom-4 left-6 text-white font-bold text-3xl drop-shadow-md font-serif bg-transparent border-b border-white/30 px-2 py-1 w-[90%]"
                placeholder="이름"
              />
            ) : (
              <div className="absolute bottom-4 left-6 text-white font-bold text-3xl drop-shadow-md font-serif">{answers.name}</div>
            )}
          </div>

          {/* Profile Icon (Notion Style) */}
          <div className="relative -mt-16 ml-8 mb-8 z-20">
            {answers.profile_image ? (
              <img src={answers.profile_image} alt="Profile" className="w-24 h-24 rounded-lg object-cover border-4 border-gray-50 dark:border-gray-900 shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-white dark:bg-slate-800 border-4 border-gray-50 dark:border-gray-900 shadow-xl flex items-center justify-center text-4xl">
                📝
              </div>
            )}
          </div>

          <article className="max-w-3xl space-y-16">
            {/* Intro */}
            <section id="intro">
              <h2 className={`text-2xl font-bold mb-4 ${textMain} border-b ${borderLine} pb-2`}>Introduction</h2>
              <div className={`p-5 rounded-lg border ${borderLine} bg-slate-50 dark:bg-white/5`}>
                <div className="flex items-center gap-2 mb-2 text-xl">💡 <span className="font-bold">About Me</span></div>
                <p className={`text-base ${textMain} leading-relaxed whitespace-pre-line`}>
                  {answers.intro || "소개가 없습니다."}
                </p>
                <div className={`mt-4 text-sm ${textSub} pt-4 border-t ${borderLine}`}>
                  {answers.career_summary}
                </div>
              </div>
            </section>

            {/* Projects */}
            <section id="projects">
              <h2 className={`text-2xl font-bold mb-6 ${textMain} border-b ${borderLine} pb-2`}>Key Projects</h2>
              <div className="space-y-8">
                {projects.map((proj, i) => (
                  <div key={proj.id} id={proj.id}>
                    <h3 className={`text-xl font-bold mb-2 ${textMain} flex items-center gap-2`}>
                      <span className="text-slate-400 text-sm">0{i + 1}.</span>
                      {isEditing ? (
                        <input type="text" value={proj.title} onChange={(e) => handleProjectUpdate(i, 'title', e.target.value)} className="ml-2 w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                      ) : (
                        proj.title
                      )}
                    </h3>
                    <div className="pl-6 border-l-2" style={{ borderColor: currentStyle.glowColor }}>
                      {isEditing ? (
                        <textarea rows="3" value={proj.desc} onChange={(e) => handleProjectUpdate(i, 'desc', e.target.value)} className="w-full bg-black/10 border border-white/10 rounded px-2 py-1 resize-none text-slate-900 dark:text-white" />
                      ) : (
                        <p className={`text-base ${textSub} leading-relaxed whitespace-pre-line mb-3`}>
                          {proj.desc}
                        </p>
                      )}
                      {isEditing ? (
                        <input type="text" value={proj.link || ''} onChange={(e) => handleProjectUpdate(i, 'link', e.target.value)} placeholder="Reference Link URL" className="mt-2 text-sm w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                      ) : (
                        proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="ml-6 text-sm text-blue-500 hover:underline">
                            🔗 Reference Link
                          </a>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
}