import { useState, useEffect } from 'react';
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

// 기본 레이아웃
const defaultLayouts = {
  lg: [
    { i: 'profile', x: 0, y: 0, w: 3, h: 3 },
    { i: 'metric', x: 3, y: 0, w: 1, h: 1 },
    { i: 'tools', x: 3, y: 1, w: 1, h: 2 },
    { i: 'project-main', x: 0, y: 3, w: 4, h: 2 },
  ],
  md: [ // Tablet (3 cols)
    { i: 'profile', x: 0, y: 0, w: 2, h: 3 },
    { i: 'metric', x: 2, y: 0, w: 1, h: 1 },
    { i: 'tools', x: 2, y: 1, w: 1, h: 2 },
    { i: 'project-main', x: 0, y: 3, w: 3, h: 2 },
  ],
  sm: [ // Large Phone (2 cols)
    { i: 'profile', x: 0, y: 0, w: 1, h: 3 },      // Reduced width to 1 (50%)
    { i: 'metric', x: 1, y: 0, w: 1, h: 1 },       // Moved to right column
    { i: 'tools', x: 1, y: 1, w: 1, h: 2 },        // Moved to right column
    { i: 'project-main', x: 0, y: 3, w: 2, h: 2 }, // Bottom full width
  ],
  xs: [ // Mobile (1 col)
    { i: 'profile', x: 0, y: 0, w: 1, h: 2 },
    { i: 'metric', x: 0, y: 2, w: 1, h: 1 },
    { i: 'tools', x: 0, y: 3, w: 1, h: 2 },
    { i: 'project-main', x: 0, y: 5, w: 1, h: 2 },
  ],
  xxs: [ // Small Mobile (1 col)
    { i: 'profile', x: 0, y: 0, w: 1, h: 2 },
    { i: 'metric', x: 0, y: 2, w: 1, h: 1 },
    { i: 'tools', x: 0, y: 3, w: 1, h: 2 },
    { i: 'project-main', x: 0, y: 5, w: 1, h: 2 },
  ]
};

export default function MarketerDashboardTemplate({ answers, isEditing, onUpdate }) {
  const selectedMoods = answers.moods || [];
  const selectedBgmTitle = answers.bgm || "음악 없음 (Mute)";
  const style = getStyleByMood(selectedMoods);

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState(defaultLayouts);

  // Use projects array directly
  const projects = (answers.projects || []).map((project, index) => ({
    id: index + 1,
    title: project.title || '',
    desc: project.desc || '',
    link: project.link || '',
    image: project.image || ''
  }));

  useEffect(() => {
    setMounted(true);
    const savedLayout = localStorage.getItem('dashboard_layout');
    if (savedLayout) setLayouts(JSON.parse(savedLayout));
  }, []);


  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('dashboard_layout', JSON.stringify(allLayouts));
  };

  // Theme-aware CSS variables
  const cardClass = `bg-white/90 dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg overflow-hidden flex flex-col justify-between`;
  const dragStyle = isEditing ? "cursor-move ring-2 ring-emerald-400 z-50" : "";
  const ResizeHandle = () => isEditing ? <div className="absolute bottom-1 right-1 text-emerald-500 z-50 pointer-events-none">◢</div> : null;

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      <main className="relative z-10 max-w-[1400px] mx-auto pt-24 pb-20 px-4 md:px-8">

        {isEditing && (
          <div className="mb-4 flex items-center justify-between p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <span className="animate-pulse">✨ 편집 모드: 대시보드 위젯을 자유롭게 배치해보세요!</span>
            <button
              onClick={() => {
                if (confirm('모든 위젯 배치를 초기화하시겠습니까?')) {
                  setLayouts(defaultLayouts);
                  localStorage.removeItem('dashboard_layout');
                }
              }}
              className="px-3 py-1 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded text-xs font-bold transition shadow-sm"
            >
              ↺ 레이아웃 초기화
            </button>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={150}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditing}
          isResizable={isEditing}
          margin={[16, 16]}
        >
          {/* 1. Profile */}
          <div key="profile" className={`${cardClass} ${dragStyle}`}>
            <div className={`absolute right-0 top-0 w-64 h-64 bg-linear-to-br ${style.headerGradient} opacity-20 blur-3xl`} />
            {isEditing ? (
              <div className="z-10 flex flex-col gap-3">
                {answers.profile_image && (
                  <img src={answers.profile_image} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/50 shadow-md mb-2" />
                )}
                <div className="ring-2 ring-emerald-400/50 rounded p-3 bg-black/20">
                  <input
                    type="text"
                    value={answers.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full text-3xl font-bold bg-transparent border-b border-white/30 text-white mb-3 px-2 py-2 font-serif"
                    placeholder="이름"
                  />
                  <input
                    type="text"
                    value={answers.intro || ''}
                    onChange={(e) => handleEditChange('intro', e.target.value)}
                    className="w-full text-slate-300 bg-transparent border-b border-white/30 px-2 py-2 text-sm"
                    placeholder="소개"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5 z-10">
                {answers.profile_image && (
                  <img src={answers.profile_image} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-lg shrink-0" />
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-serif leading-tight select-none text-slate-900 dark:text-white mb-1">
                    {answers.name}'s Lab
                  </h1>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium select-none line-clamp-2">
                    {answers.intro}
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4 z-10">
              {selectedMoods.map(tag => <span key={tag} className={`text-[10px] px-2 py-1 rounded border bg-white/5 ${style.pill}`}>{tag}</span>)}
            </div>
            <ResizeHandle />
          </div>

          {/* 2. Key Metric */}
          <div key="metric" className={`${cardClass} items-center justify-center text-center ring-1 ${style.accentRing} ${dragStyle}`}>
            <span className="text-sm text-slate-600 dark:text-slate-400 mb-1 select-none">Focus</span>
            <span className={`text-3xl font-black drop-shadow-md ${style.textHighlight} wrap-break-word select-none`}>{answers.strength}</span>
            <ResizeHandle />
          </div>

          {/* 3. Tools */}
          <div key="tools" className={`${cardClass} ${dragStyle}`}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 select-none text-slate-900 dark:text-white"><span className={`w-2 h-2 rounded-full ${style.dot.replace('bg-', 'bg-')}`}></span> Career</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line select-none">{answers.career_summary}</p>
            <ResizeHandle />
          </div>

          {/* 4. Projects */}
          <div key="project-main" className={`${cardClass} ${dragStyle}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold select-none text-slate-900 dark:text-white">Campaigns</h3>
              <span className={`text-xs px-2 py-1 rounded bg-white/10 ${style.textHighlight} select-none`}>{projects.length} Projects</span>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {projects.map((item, idx) => (
                <div key={idx} className="group p-4 rounded-2xl bg-white/5 border border-white/5">
                  {isEditing ? (
                    <>
                      <input type="text" value={item.title} onChange={(e) => handleEditChange(`project${item.id}_title`, e.target.value)} className="font-bold text-lg w-full bg-white/30 dark:bg-black/10 border-2 border-slate-400 dark:border-white/10 rounded px-2 py-1 mb-2 text-slate-900 dark:text-white" />
                      <textarea rows="2" value={item.desc} onChange={(e) => handleEditChange(`project${item.id}_desc`, e.target.value)} className="text-sm w-full bg-white/30 dark:bg-black/10 border-2 border-slate-400 dark:border-white/10 rounded px-2 py-1 resize-none text-slate-900 dark:text-white" />
                      <input type="text" value={item.image || ''} onChange={(e) => handleEditChange(`project${item.id}_image`, e.target.value)} placeholder="이미지 URL" className="text-xs w-full bg-white/30 dark:bg-black/10 border-2 border-slate-400 dark:border-white/10 rounded px-2 py-1 mb-2 text-slate-900 dark:text-white" />
                      <input type="text" value={item.link || ''} onChange={(e) => handleEditChange(`project${item.id}_link`, e.target.value)} placeholder="링크(URL)" className="text-xs w-full bg-white/30 dark:bg-black/10 border-2 border-slate-400 dark:border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                    </>
                  ) : (
                    <>
                      {item.image && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
                        </div>
                      )}
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-400 mb-2">{item.desc}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            <ResizeHandle />
          </div>

          {/* 프로젝트 추가 버튼 */}
          {isEditing && projects.length < 3 && (
            <div key="add-btn" className="flex items-center justify-center rounded-3xl border-2 border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition cursor-pointer" onClick={() => {
              const nextNum = projects.length + 1;
              handleEditChange(`project${nextNum}_title`, '새 프로젝트');
              handleEditChange(`project${nextNum}_desc`, '프로젝트 설명을 입력하세요');
            }}>
              <div className="text-center">
                <div className="text-3xl mb-2">+</div>
                <div className="text-sm font-bold text-purple-400">프로젝트 추가</div>
              </div>
              <ResizeHandle />
            </div>
          )}

        </ResponsiveGridLayout>
      </main>
    </div>
  );
}