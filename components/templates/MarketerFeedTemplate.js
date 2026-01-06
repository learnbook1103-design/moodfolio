import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function MarketerFeedTemplate({ answers, isEditing, onUpdate }) {
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



  const baseBg = "bg-white/95 dark:bg-slate-900/95";
  const cardBorder = "border-slate-200 dark:border-white/10";

  return (
    <div className="min-h-screen w-full relative p-0 md:p-8 bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />

      <div className="w-full max-w-md md:max-w-2xl mx-auto min-h-screen border-x border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-md relative z-10 shadow-2xl">

        {/* Profile Header */}
        <div className={`p-6 border-b ${cardBorder} ${baseBg}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-full border-2 p-1 overflow-hidden relative ${currentStyle.accentRing.replace('ring', 'border')}`}>
              {answers.profile_image ? (
                <img src={answers.profile_image} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl">👤</div>
              )}
            </div>
            {isEditing ? (
              <div className="flex-1 ring-1 ring-emerald-400/50 rounded p-2 bg-black/20">
                <input
                  type="text"
                  value={answers.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="w-full text-lg font-bold text-white bg-transparent border-b border-white/30 px-1 py-1 mb-1 font-serif"
                  placeholder="이름"
                />
                <input
                  type="text"
                  value={answers.intro || ''}
                  onChange={(e) => handleEditChange('intro', e.target.value)}
                  className="w-full text-sm text-slate-300 bg-transparent border-b border-white/30 px-1 py-1"
                  placeholder="소개"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-serif">{answers.name || "Marketer"}</h1>
                <span className="text-sm text-slate-500 dark:text-slate-400">{answers.job}</span>
              </div>
            )}
            <div className="ml-auto">
              <button className={`px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10`}>Follow</button>
            </div>
          </div>
          {!isEditing && (
            <>
              <p className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4`}>
                {answers.intro}
              </p>
              <div className="flex gap-2 flex-wrap">
                {selectedMoods.map((tag, i) => (
                  <span key={i} className={`text-xs text-blue-500 dark:text-blue-400`}>{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Feed Items */}
        <div className={`bg-white/50 dark:bg-black/20 pb-20`}>
          {projects.map((item, index) => (
            <article key={index} className={`border-b ${cardBorder} mb-6 pt-4`}>
              <div className="px-4 flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">M</div>
                <div><div className="text-sm font-bold text-slate-800 dark:text-white">{answers.name}</div><div className="text-xs text-slate-500">Project {item.id}</div></div>
                <div className="ml-auto text-slate-500 cursor-pointer">•••</div>
              </div>

              {/* Square Content Area */}
              <div className="w-full aspect-square bg-slate-200 dark:bg-white/5 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer border-y border-white/10">
                {/* Background Image or Gradient */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : null}
                <div className={`absolute inset-0 bg-linear-to-br ${currentStyle.headerGradient} ${item.image ? 'opacity-50' : 'opacity-30'} group-hover:opacity-40 transition-opacity`}></div>

                <div className="relative z-10 text-center px-8 transform group-hover:scale-[1.02] transition-transform">
                  <span className={`text-xs font-bold px-2 py-1 rounded border bg-black/50 backdrop-blur mb-4 inline-block ${currentStyle.pill}`}>Creative</span>
                  {isEditing ? (
                    <>
                      <input type="text" value={item.title} onChange={(e) => handleProjectUpdate(index, 'title', e.target.value)} className="text-3xl md:text-4xl font-black w-full bg-black/20 border border-white/20 rounded px-2 py-1 text-slate-900 dark:text-white mb-2" />
                      <input type="text" value={item.image || ''} onChange={(e) => handleProjectUpdate(index, 'image', e.target.value)} placeholder="이미지 URL" className="text-xs w-full bg-black/70 border border-white/30 rounded px-2 py-1 text-white placeholder-gray-400" />
                    </>
                  ) : (
                    <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg leading-tight font-serif break-keep">
                      {item.title}
                    </h2>
                  )}
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-4 text-2xl mb-3"><button>❤️</button><button>💬</button><button>🚀</button></div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white mr-2">{answers.name}</span>
                  {isEditing ? (
                    <textarea rows="2" value={item.desc} onChange={(e) => handleProjectUpdate(index, 'desc', e.target.value)} className="w-full bg-black/10 border border-white/10 rounded px-2 py-1 resize-none text-slate-900 dark:text-white" />
                  ) : (
                    item.desc
                  )}
                </div>
                {isEditing ? (
                  <div className="mt-2">
                    <input type="text" value={item.link || ''} onChange={(e) => handleProjectUpdate(index, 'link', e.target.value)} placeholder="링크(URL)" className="w-full text-xs bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                  </div>
                ) : (
                  item.link && <div className="mt-2"><a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 font-bold">🔗 Link in Bio (Click)</a></div>
                )}
              </div>
            </article>
          ))}

          {/* 프로젝트 추가 버튼 */}
          {isEditing && projects.length < 6 && (
            <div className="mt-8 text-center">
              <button onClick={() => {
                const newProjects = [...(answers.projects || []), {
                  title: '새 항목',
                  desc: '내용을 입력하세요',
                  link: ''
                }];
                handleEditChange('projects', newProjects);
              }} className="px-6 py-2 bg-orange-500/20 border border-orange-500 text-orange-300 rounded-lg hover:bg-orange-500/30 transition">
                + 항목 추가
              </button>
            </div>
          )}

          {projects.length === 0 && <div className="p-10 text-center text-gray-500">아직 게시물이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}