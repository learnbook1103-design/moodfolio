import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from "react-grid-layout";
import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

const ResponsiveGridLayout = WidthProvider(Responsive);

// 기본 레이아웃 (헤더 + 갤러리 6개 + 연락처) - 매거진 스타일 비대칭
const defaultLayouts = {
  lg: [
    { i: 'header', x: 0, y: 0, w: 3, h: 2 },       // 헤더 - 전체 너비
    { i: 'item-1', x: 0, y: 2, w: 2, h: 2 },       // 메인 작품 - 크게
    { i: 'item-2', x: 2, y: 2, w: 1, h: 2 },       // 서브 작품 - 세로
    { i: 'item-3', x: 0, y: 4, w: 1, h: 2 },       // 작품 3
    { i: 'item-4', x: 1, y: 4, w: 1, h: 1 },       // 작품 4 - 작게
    { i: 'item-5', x: 2, y: 4, w: 1, h: 1 },       // 작품 5 - 작게
    { i: 'item-6', x: 1, y: 5, w: 2, h: 2 },       // 작품 6 - 가로로 넓게
    { i: 'contact', x: 0, y: 6, w: 1, h: 1 },      // 연락처 - 간결하게
  ],
  md: [
    { i: 'header', x: 0, y: 0, w: 2, h: 2 },
    { i: 'item-1', x: 0, y: 2, w: 2, h: 2 },
    { i: 'item-2', x: 0, y: 4, w: 1, h: 2 },
    { i: 'item-3', x: 1, y: 4, w: 1, h: 2 },
    { i: 'item-4', x: 0, y: 6, w: 2, h: 2 },
    { i: 'item-5', x: 0, y: 8, w: 1, h: 2 },
    { i: 'item-6', x: 1, y: 8, w: 1, h: 2 },
    { i: 'contact', x: 0, y: 10, w: 2, h: 1 },
  ]
};

export default function DesignerGalleryTemplate({ answers, isEditing, onUpdate, theme = 'light' }) {
  const selectedMoods = answers.moods || [];
  const selectedBgmTitle = answers.bgm || "음악 없음 (Mute)";
  const currentStyle = getStyleByMood(selectedMoods);

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  const [mounted, setMounted] = useState(false);
  const [layouts, setLayouts] = useState(defaultLayouts);

  // Use standard projects array (same as other templates)
  const projects = (answers.projects || []).map((project, index) => ({
    id: index + 1,
    title: project.title || '',
    type: 'link',
    src: project.image || project.link || ''
  }));


  useEffect(() => {
    setMounted(true);
    // Always use default layout (ignore localStorage)
    localStorage.removeItem('gallery_layout');
    setLayouts(defaultLayouts);
  }, []);


  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('gallery_layout', JSON.stringify(allLayouts));
  };

  // Theme-aware CSS variables
  const cardBg = "bg-white/90 dark:bg-black/40";
  const cardBorder = "border-slate-200 dark:border-white/10";
  const titleText = "text-slate-900 dark:text-white";
  const subText = "text-slate-600 dark:text-slate-400";

  const pageBg = "bg-gray-50 dark:bg-gray-900";
  const dragStyle = isEditing ? "cursor-move ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent z-50" : "";

  // 리사이즈 핸들
  const ResizeHandle = () => (
    isEditing && (
      <div className="absolute bottom-1 right-1 text-emerald-500 z-50 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM14 22H12V20H14V22ZM18 18H16V16H18V18Z" /></svg>
      </div>
    )
  );

  if (!mounted) return null;

  return (
    <div className={`min-h-screen relative p-6 md:p-10 bg-transparent transition-colors duration-500`}>
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      <main className="relative z-10 w-full px-4 mx-auto pt-10 pb-20">

        {isEditing && <div className="mb-4 text-center p-2 bg-emerald-500/20 text-emerald-400 rounded-lg animate-pulse">✨ 편집 모드: 박스를 드래그하거나 크기를 조절해보세요!</div>}

        {/* Header */}
        <div className="mb-12">
          {isEditing ? (
            <div className="ring-2 ring-emerald-400/50 rounded-lg p-4 bg-black/20">
              <input
                type="text"
                value={answers.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
                className="w-full text-4xl font-black bg-transparent border-b border-white/30 text-white mb-4 px-2 py-2"
                placeholder="이름"
              />
              <input
                type="text"
                value={answers.intro || ''}
                onChange={(e) => handleEditChange('intro', e.target.value)}
                className="w-full text-lg text-slate-300 bg-transparent border-b border-white/30 px-2 py-2"
                placeholder="소개"
              />
            </div>
          ) : (
            <div>
              <h1 className={`text-4xl font-black ${titleText} mb-2`}>{answers.name}'s Gallery</h1>
              <p className={`${subText} text-lg`}>{answers.intro}</p>
            </div>
          )}
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
          rowHeight={150}
          onLayoutChange={onLayoutChange}
          isDraggable={isEditing}
          isResizable={isEditing}
          margin={[12, 12]}
          compactType={null}
          preventCollision={false}
        >
          {/* Header */}
          <div key="header" className={`flex flex-col justify-center items-center text-center ${dragStyle}`}>
            {/* Profile Image */}
            {answers.profile_image && (
              <div className="mb-6">
                <img
                  src={answers.profile_image}
                  alt={answers.name || 'Profile'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-xl mx-auto"
                />
              </div>
            )}
            <h1 className={`text-6xl md:text-8xl font-black tracking-tighter mb-4 ${titleText} font-serif select-none`}>
              {answers.name || "Designer"}
            </h1>
            <p className={`text-xl font-medium ${subText} select-none`}>
              {answers.job || "Visual Designer"} | <span className={`${currentStyle.textHighlight}`}>{answers.strength || "Portfolio"}</span>
            </p>
            <ResizeHandle />
          </div>

          {/* Projects */}
          {projects.map((item) => (
            <div key={`item-${item.id}`} className={`group relative rounded-2xl overflow-hidden shadow-lg ${cardBg} ${cardBorder} border hover:ring-4 ${currentStyle.accentRing} ${dragStyle}`}>
              <div className="w-full h-full flex items-center justify-center relative bg-gray-100 dark:bg-gray-800">
                {item.src ? (
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover pointer-events-none" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center select-none">
                    <span className="text-4xl mb-2 opacity-50">🔗</span>
                    <span className="text-xs text-slate-400 break-all px-4">{item.src || "No Link"}</span>
                  </div>
                )}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-linear-to-br ${currentStyle.headerGradient} transition-opacity`}></div>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className={`text-xs font-bold uppercase tracking-widest mb-1 ${currentStyle.textHighlight}`}>PROJECT 0{item.id}</span>
                {isEditing ? (
                  <input type="text" value={item.title} onChange={(e) => handleEditChange(`project${item.id}_title`, e.target.value)} className="text-xl font-bold w-full bg-black/20 border border-white/20 rounded px-2 py-1 text-white" />
                ) : (
                  <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>
                )}
                {/* 편집 모드에서 이미지 링크 수정 */}
                {isEditing && (
                  <input type="text" value={item.src || ''} onChange={(e) => handleEditChange(`project${item.id}_image`, e.target.value)} placeholder="이미지 링크 또는 파일 경로" className="mt-2 text-xs w-full bg-white/20 dark:bg-black/30 border-2 border-slate-300 dark:border-white/20 rounded px-2 py-1 text-white" />
                )}
              </div>
              <ResizeHandle />
            </div>
          ))}

          {/* 프로젝트 추가 버튼 */}
          {isEditing && projects.length < 50 && (
            <div key="add-btn" className={`group relative rounded-2xl overflow-hidden shadow-lg border-2 border-dashed ${cardBorder} flex items-center justify-center flex-col p-6 bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer`} onClick={() => {
              const nextNum = projects.length + 1;
              handleEditChange(`project${nextNum}_title`, '새 프로젝트');
              handleEditChange(`project${nextNum}_image`, '');
            }}>
              <div className="text-4xl mb-2">+</div>
              <h3 className={`text-lg font-bold text-emerald-400 select-none`}>프로젝트 추가</h3>
              <ResizeHandle />
            </div>
          )}

          {/* Contact */}
          <div key="contact" className={`group relative rounded-2xl overflow-hidden shadow-lg border ${cardBorder} flex items-center justify-center flex-col p-6 ${cardBg} ${dragStyle}`}>
            <div className="text-4xl mb-4 select-none">✨</div>
            <h3 className={`text-2xl font-bold ${titleText} mb-2 select-none`}>Contact Me</h3>
            <p className={`${subText} select-none`}>{answers.email}</p>
            <ResizeHandle />
          </div>

        </ResponsiveGridLayout>
      </main>
    </div>
  );
}