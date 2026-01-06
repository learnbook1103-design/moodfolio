import { useState } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import ProfileHeader from "../ProfileHeader";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

export default function DeveloperTimelineTemplate({ answers, isEditing, onUpdate, theme = 'light' }) {
  const selectedMoods = answers.moods || [];
  const selectedBgmTitle = answers.bgm || "음악 없음 (Mute)";
  const currentStyle = getStyleByMood(selectedMoods);

  // Use projects array directly (max 6 featured projects)
  const projects = (answers.projects || []).map((project, index) => ({
    id: index,
    year: `PROJECT ${(index + 1).toString().padStart(2, '0')}`,
    title: project.title || '',
    desc: project.desc || project.description || '',
    link: project.link || '',
    image: project.image || ''
  }));

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  // Theme-aware CSS variables

  const baseBg = "bg-white dark:bg-slate-900/90";
  const baseBorder = "border-gray-300 border-2 dark:border-white/10 dark:border-2";
  const baseShadow = "shadow-lg shadow-gray-300/50 dark:shadow-2xl dark:shadow-black/50";
  const baseText = "text-slate-900 dark:text-white";
  const subText = "text-slate-600 dark:text-slate-400";
  const pageBg = "bg-gray-50 dark:bg-gray-900";

  return (
    <div className={`min-h-screen relative ${pageBg} transition-colors duration-500`}>
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      <main className="relative z-10 max-w-4xl mx-auto pt-10 pb-20">
        {/* Profile Header */}
        <ProfileHeader
          userData={answers}
          isEditing={isEditing}
          variant="default"
          customStyle={{
            container: `p-8 rounded-2xl backdrop-blur-lg transition-all duration-500 ${baseBg} ${baseShadow} mb-12 border-2`,
            containerBorderColor: currentStyle.glowColor,
            nameText: `text-3xl md:text-4xl font-extrabold tracking-tight ${currentStyle.textHighlight} font-serif mb-2`,
            introText: `text-lg ${subText} mt-2`,
            contactText: `text-sm ${subText}`,
            contactHover: 'hover:text-blue-500'
          }}
        />

        {/* 타임라인 섹션 */}
        <section className="relative pt-8">
          <h2 className={`text-3xl font-bold mb-12 tracking-tight ${baseText} font-serif text-center md:text-left`}>
            Problem Solving Log
          </h2>

          <div className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 top-24 bottom-0 w-[2px]`} style={{ backgroundColor: currentStyle.glowColor }}></div>

          {projects.map((project, index) => (
            <div key={index} className={`mb-16 flex flex-col md:flex-row relative ${baseText} ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

              {/* 타임라인 점 */}
              <div className={`absolute left-4 md:left-1/2 top-0 w-4 h-4 rounded-full z-10 -translate-x-[7px] md:-translate-x-1/2 border-2 bg-white dark:bg-gray-900`} style={{ borderColor: currentStyle.glowColor }}></div>


              {/* 날짜/라벨 */}
              <div className={`md:w-1/2 md:px-10 mb-2 md:mb-0 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} pl-10 md:pl-0`}>
                <span className={`text-sm font-bold px-2 py-1 rounded ${currentStyle.pill}`}>{project.year}</span>
              </div>

              {/* 프로젝트 카드 */}
              <div className={`w-full md:w-1/2 pl-10 md:pl-0 ${index % 2 === 0 ? 'md:pl-10' : 'md:pr-10'}`}>
                <div
                  className={`p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] ${baseBg} ${baseShadow} border-2 ${isEditing ? 'ring-2 ring-blue-400/50' : ''}`}
                  style={{ borderColor: currentStyle.glowColor }}
                >
                  {isEditing ? (
                    <>
                      <input type="text" value={project.title} onChange={(e) => handleEditChange(`project${project.id}_title`, e.target.value)} className={`w-full text-xl font-bold bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 mb-2 ${baseText}`} />
                      <textarea value={project.desc} onChange={(e) => handleEditChange(`project${project.id}_desc`, e.target.value)} rows="2" className={`w-full text-sm bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 mb-2 resize-none ${baseText}`} />
                      <input type="text" value={project.image || ''} onChange={(e) => handleEditChange(`project${project.id}_image`, e.target.value)} placeholder="이미지 URL" className={`w-full text-xs bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 mb-2 ${baseText}`} />
                      <input type="text" value={project.link || ''} onChange={(e) => handleEditChange(`project${project.id}_link`, e.target.value)} placeholder="프로젝트 링크" className={`w-full text-xs bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 ${baseText}`} />
                    </>
                  ) : (
                    <>
                      <h3 className={`text-xl font-bold ${baseText} mb-2`}>{project.title}</h3>
                      <p className={`text-sm ${subText} mb-4 leading-relaxed`}>{project.desc}</p>

                      {/* Project Image */}
                      {project.image && (
                        <div className={`my-3 rounded-lg overflow-hidden border ${baseBorder}`}>
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-auto object-cover max-h-48"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {project.link && (
                        <a href={project.link} target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-500 hover:underline">
                          View Project →
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* 프로젝트 추가 버튼 */}
          {isEditing && projects.length < 50 && (
            <div className="mt-8 text-center">
              <button onClick={() => {
                const nextNum = projects.length + 1;
                handleEditChange(`project${nextNum}_title`, '새 프로젝트');
                handleEditChange(`project${nextNum}_desc`, '프로젝트 설명을 입력하세요');
              }} className="px-6 py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition">
                + 프로젝트 추가
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}