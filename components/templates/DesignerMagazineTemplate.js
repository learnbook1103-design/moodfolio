import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";

export default function DesignerMagazineTemplate({ answers, isEditing, onUpdate, theme = 'light' }) {
  const selectedMoods = answers.moods || [];
  const currentStyle = getStyleByMood(selectedMoods);

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  // Use standard projects array (same as other templates)
  // Use standard projects array (same as other templates)
  const projects = (answers.projects || []).map((project, index) => ({
    id: index + 1,
    title: project.title || '',
    type: 'link',
    image: project.image || '',
    link: project.link || ''
  }));

  const handleProjectChange = (index, field, value) => {
    if (onUpdate) {
      onUpdate(prev => {
        const updatedProjects = [...(prev.projects || [])];
        if (!updatedProjects[index]) updatedProjects[index] = {};
        updatedProjects[index] = { ...updatedProjects[index], [field]: value };
        return { ...prev, projects: updatedProjects };
      });
    }
  };

  const handleAddProject = () => {
    if (onUpdate) {
      onUpdate(prev => ({
        ...prev,
        projects: [
          ...(prev.projects || []),
          { title: 'New Story', link: '', image: '' }
        ]
      }));
    }
  };

  // 레이아웃 스타일 클래스 (순서대로 반복)
  const layoutClasses = [
    "md:col-span-2 md:aspect-video", // 1번: 큼
    "md:col-span-1 md:aspect-[3/4]", // 2번: 세로
    "md:col-span-1 md:aspect-[4/3]", // 3번: 가로
    "md:col-span-2 md:aspect-[16/9]"  // 4번: 와이드
  ];

  // Theme-aware CSS variables
  const baseBg = "bg-white/95 dark:bg-slate-900/95";
  const subText = "text-slate-600 dark:text-slate-400";

  const titleText = "text-slate-900 dark:text-white";

  const pageBg = "bg-gray-50 dark:bg-gray-900";

  return (
    <div className={`min-h-screen relative font-serif bg-transparent transition-colors duration-500`}>
      <PortfolioBackground moods={selectedMoods} />

      <main className="relative z-10 max-w-7xl mx-auto py-12 px-6 md:px-12">

        {/* 헤더 */}
        <header className="mb-20 pt-10 border-b border-white/10 dark:border-white/10">
          {/* Profile Image */}
          {answers.profile_image && (
            <div className="mb-8 flex justify-center">
              <img
                src={answers.profile_image}
                alt={answers.name || 'Profile'}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-xl"
              />
            </div>
          )}
          {isEditing ? (
            <div className="ring-2 ring-emerald-400/50 rounded-lg p-4 bg-black/20">
              <input
                type="text"
                value={answers.job || ''}
                onChange={(e) => handleEditChange('job', e.target.value)}
                className="w-full text-xs font-sans tracking-widest uppercase bg-transparent border-b border-white/30 px-2 py-1 mb-4"
                placeholder="직군"
              />
              <input
                type="text"
                value={answers.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full text-5xl md:text-7xl font-extrabold bg-transparent border-b border-white/30 text-white mb-4 px-2 py-2"
                placeholder="이름"
              />
              <textarea
                value={answers.career_summary || ''}
                onChange={(e) => handleEditChange('career_summary', e.target.value)}
                className="w-full bg-transparent border-b border-white/30 text-slate-300 px-2 py-2"
                placeholder="경력 요약"
                rows="2"
              />
            </div>
          ) : (
            <>
              <p className={`text-sm font-sans tracking-widest uppercase mb-4 ${currentStyle.textHighlight}`}>
                {answers.job} / {answers.strength}
              </p>
              <h1 className={`text-7xl md:text-9xl font-extrabold tracking-tighter mb-8 ${titleText} wrap-break-word`}>
                {answers.name || "Portfolio"}
              </h1>
              {answers.career_summary && (
                <p className={`text-xl md:text-2xl font-light italic ${subText} mb-12 border-l-4 pl-6 border-current opacity-80`}>
                  "{answers.career_summary}"
                </p>
              )}
            </>
          )}
        </header>

        {/* 프로젝트 그리드 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((item, index) => {
            // 레이아웃 클래스 순환 할당
            const styleClass = layoutClasses[index % layoutClasses.length];

            return (
              <div
                key={item.id}
                className={`${styleClass} rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] 
                            ${baseBg} ${titleText} border border-transparent hover:border-slate-300 relative overflow-hidden group`}
              >
                <div className="flex flex-col h-full justify-between relative z-10">
                  {/* 상단 정보 */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-sans font-semibold uppercase ${subText}`}>PROJECT 0{item.id}</span>
                    <span className={`text-xs font-sans font-bold px-3 py-1 rounded-full border ${currentStyle.pill}`}>
                      {new Date().getFullYear()}
                    </span>
                  </div>

                  {/* 중앙 컨텐츠 */}
                  <div className="flex-1 my-4 flex items-center justify-center relative">
                    {item.image ? (
                      <>
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                        {/* Dark overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40 rounded-xl"></div>
                      </>
                    ) : (
                      <div className={`absolute inset-0 opacity-10 dark:opacity-20 bg-linear-to-tr ${currentStyle.headerGradient} rounded-xl`}></div>
                    )}

                    {/* 텍스트는 이미지 위에 뜸 - 가시성 개선 */}
                    {isEditing ? (
                      <div className="relative z-20 w-full px-4">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                          className="w-full text-2xl md:text-3xl font-black text-center bg-black/40 border border-white/30 rounded text-white p-2"
                        />
                      </div>
                    ) : (
                      <h2 className="relative text-2xl md:text-3xl font-black leading-tight text-white text-center z-20 px-4 break-words" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)' }}>
                        {item.title}
                      </h2>
                    )}
                  </div>

                  {/* 하단 설명 */}
                  <div className={`text-sm ${subText} mt-4 pt-4 border-t border-slate-300 dark:border-white/10 flex flex-col gap-2`}>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={item.image || ''}
                          onChange={(e) => handleProjectChange(index, 'image', e.target.value)}
                          placeholder="이미지 URL"
                          className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/20 rounded px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={item.link || ''}
                          onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                          placeholder="링크 URL"
                          className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/20 rounded px-2 py-1 text-xs"
                        />
                      </>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <span>{item.type === 'file' ? 'Image Work' : 'Link Available'}</span>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer" className="underline hover:text-blue-500">Visit Link ↗</a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {projects.map((item, index) => {
            // ... (rest of mapping)
          })}
        </section>

        {isEditing && (
          <div className="mt-12 text-center">
            <button onClick={handleAddProject} className="px-8 py-3 bg-emerald-500/10 border border-emerald-500 text-emerald-500 font-bold rounded-full hover:bg-emerald-500/20 transition-all">
              + Add New Story
            </button>
          </div>
        )}

      </main>

      <footer className="relative z-10 py-20 text-center">
        <p className={subText}>© {new Date().getFullYear()} {answers.name}</p>
        <p className={`text-xs mt-2 ${subText}`}>{answers.email}</p>
      </footer>
    </div>
  );
}