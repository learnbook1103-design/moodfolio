import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function DeveloperDocsTemplate({ answers, isEditing, onUpdate, theme = 'light' }) {
  const selectedMoods = answers.moods || [];
  const selectedBgmTitle = answers.bgm || "음악 없음 (Mute)";
  const currentStyle = getStyleByMood(selectedMoods);

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  // Use projects array directly
  const projects = (answers.projects || []).map((project, index) => ({
    id: `proj-${index + 1}`,
    title: project.title || '',
    content: project.desc || project.description || '',
    link: project.link || '',
    image: project.image || ''
  }));

  // Theme-aware CSS variables
  const baseBorder = "border-gray-300 dark:border-white/10";
  const baseShadow = "shadow-lg shadow-gray-300/50 dark:shadow-2xl dark:shadow-black/50";
  const baseText = "text-slate-900 dark:text-white";
  const subText = "text-slate-600 dark:text-slate-400";
  const highlightColor = currentStyle.textHighlight;

  return (
    <div className={`min-h-screen relative p-0 bg-transparent transition-colors duration-500`}>
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      <div className="flex relative z-10 max-w-7xl mx-auto min-h-screen">

        {/* 사이드바 */}
        <aside
          className={`w-64 hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto p-6 bg-white dark:bg-slate-900/95 border-r-2 transition-colors duration-500`}
          style={{ borderColor: currentStyle.glowColor }}
        >
          <div className="pt-10">
            {isEditing ? (
              <>
                <input type="text" value={answers.name || ''} onChange={(e) => handleEditChange('name', e.target.value)} className={`text-xl font-black mb-6 w-full bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 ${baseText}`} />
              </>
            ) : (
              <h1 className={`text-xl font-black mb-6 ${baseText}`}>
                <span className={`font-mono text-2xl mr-2 ${highlightColor}`}>&lt;/&gt;</span>
                Dev Docs
              </h1>
            )}

            <nav className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Projects</h3>
              {projects.map((proj) => (
                <a key={proj.id} href={`#${proj.id}`} className={`block px-3 py-2 rounded-lg text-sm transition-colors hover:bg-slate-100 dark:hover:bg-white/5 ${baseText}`}>
                  {isEditing ? (
                    <input type="text" value={proj.title} onChange={(e) => handleEditChange(`project${proj.id.split('-')[1]}_title`, e.target.value)} className="w-full bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 text-sm text-slate-900 dark:text-white" />
                  ) : proj.title}
                </a>
              ))}
            </nav>

            <div className={`mt-8 pt-4 border-t ${baseBorder}`}>
              {/* Profile Image */}
              {answers.profile_image && (
                <div className="mb-3 flex justify-center">
                  <img
                    src={answers.profile_image}
                    alt={answers.name || 'Profile'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md"
                  />
                </div>
              )}
              {isEditing ? (
                <>
                  <input type="text" value={answers.name || ''} onChange={(e) => handleEditChange('name', e.target.value)} className={`text-sm font-bold w-full bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 ${baseText}`} />
                  <input type="text" value={answers.email || ''} onChange={(e) => handleEditChange('email', e.target.value)} className="text-xs w-full mt-1 bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 text-slate-900 dark:text-slate-400" />
                </>
              ) : (
                <>
                  <p className={`text-sm font-bold ${baseText}`}>{answers.name}</p>
                  <p className="text-xs text-slate-400">{answers.email}</p>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className={`flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 relative`}>
          {/* Top Accent Line */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentStyle.headerGradient} opacity-50`}></div>

          <header className="mb-16 pt-10 border-b pb-6 dark:border-white/10">
            <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight font-serif bg-clip-text text-transparent bg-gradient-to-r ${currentStyle.headerGradient} pb-4`}>
              Technical Documentation
            </h1>

            <div className="flex items-center gap-4 mb-6">
              {answers.profile_image && (
                <img
                  src={answers.profile_image}
                  alt={answers.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-white/20"
                />
              )}
              <div>
                <div className={`font-bold text-lg ${baseText}`}>
                  {answers.name || 'Anonymous Developer'}
                </div>
                <div className={`text-sm ${subText}`}>
                  {answers.job} | {answers.strength}
                </div>
              </div>
            </div>

            <p className={`text-lg ${subText} leading-relaxed`}>{answers.intro}</p>
          </header>

          <article className="max-w-3xl space-y-16">
            {projects.map((proj, index) => (
              <section key={proj.id} id={proj.id}>
                <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${currentStyle.textHighlight}`}>
                  <span style={{ color: currentStyle.glowColor }}>#</span>
                  {isEditing ? (
                    <input type="text" value={proj.title} onChange={(e) => handleEditChange(`project${proj.id.split('-')[1]}_title`, e.target.value)} className={`text-2xl font-bold bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 w-full ${currentStyle.textHighlight}`} />
                  ) : proj.title}
                </h2>

                <div className={`p-6 rounded-lg border-2 ${baseShadow} bg-white/50 dark:bg-black/20`} style={{ borderColor: currentStyle.glowColor }}>
                  {isEditing ? (
                    <>
                      <textarea rows="4" value={proj.content} onChange={(e) => handleEditChange(`project${proj.id.split('-')[1]}_desc`, e.target.value)} className="text-lg w-full bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 resize-none mb-2 text-slate-900 dark:text-white" />
                      <input type="text" value={proj.image || ''} onChange={(e) => handleEditChange(`project${proj.id.split('-')[1]}_image`, e.target.value)} placeholder="이미지 URL" className="text-sm w-full bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 mb-2 text-slate-900 dark:text-white" />
                      <input type="text" value={proj.link || ''} onChange={(e) => handleEditChange(`project${proj.id.split('-')[1]}_link`, e.target.value)} placeholder="Repository 링크" className="text-sm w-full bg-white/30 dark:bg-black/40 border-2 border-slate-400 dark:border-white/30 rounded px-2 py-1 text-slate-900 dark:text-white" />
                    </>
                  ) : (
                    <>
                      <p className={`text-lg ${subText} leading-relaxed whitespace-pre-line mb-4`}>
                        {proj.content}
                      </p>

                      {/* Project Image */}
                      {proj.image && (
                        <div className="my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-auto object-cover max-h-64"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className={`inline-block mt-4 hover:underline font-medium transition-colors ${currentStyle.textHighlight}`}>
                          🔗 Repository Link
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* 장식용 코드 블록 */}
                <div className={`mt-4 p-4 rounded font-mono text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-500`}>
                            // Project Configuration loaded...<br />
                            // Status: Completed<br />
                            // Year: {2024 - index}
                </div>
              </section>
            ))}

            {/* 프로젝트 추가 버튼 */}
            {isEditing && projects.length < 50 && (
              <div className="mt-8 text-center">
                <button onClick={() => {
                  const nextNum = projects.length + 1;
                  handleEditChange(`project${nextNum}_title`, '새 프로젝트');
                  handleEditChange(`project${nextNum}_desc`, '프로젝트 설명을 입력하세요');
                }} className="px-6 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition">
                  + 프로젝트 추가
                </button>
              </div>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}