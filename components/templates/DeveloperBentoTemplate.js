import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from "react-grid-layout";
import PortfolioBackground from "../PortfolioBackground";
import ProfileHeader from "../ProfileHeader";
import { getStyleByMood } from "./moodColorMap";
import BGMButton from "../BGMButton";

// RGL 설정
const ResponsiveGridLayout = WidthProvider(Responsive);

// 기본 레이아웃 (반응형) - 6개 프로젝트 전체 배치
const defaultLayouts = {
  lg: [
    // Row 0-2: Profile (좌측 2칸) + Contact/Proj-1 (우측 1칸)
    { i: 'profile', x: 0, y: 0, w: 2, h: 3 },      // 프로필 (0,0) 2x3
    { i: 'contact', x: 2, y: 0, w: 1, h: 1 },      // 연락처 (2,0) 1x1
    { i: 'proj-1', x: 2, y: 1, w: 1, h: 2 },       // 프로젝트1 (2,1) 1x2

    // Row 3-4: Proj-2 (좌측 1칸) + Proj-3 (중앙+우측 2칸)
    { i: 'proj-2', x: 0, y: 3, w: 1, h: 2 },       // 프로젝트2 (0,3) 1x2
    { i: 'proj-3', x: 1, y: 3, w: 2, h: 2 },       // 프로젝트3 (1,3) 2x2

    // Row 5-6: Proj-4, Proj-5, Proj-6 (3개 나란히)
    { i: 'proj-4', x: 0, y: 5, w: 1, h: 2 },       // 프로젝트4 (0,5) 1x2
    { i: 'proj-5', x: 1, y: 5, w: 1, h: 2 },       // 프로젝트5 (1,5) 1x2
    { i: 'proj-6', x: 2, y: 5, w: 1, h: 2 },       // 프로젝트6 (2,5) 1x2

    // Row 7: Empty (여백)
    { i: 'empty', x: 0, y: 7, w: 1, h: 1 },        // 빈 공간 (0,7) 1x1
  ],
  md: [
    { i: 'profile', x: 0, y: 0, w: 2, h: 2 },
    { i: 'contact', x: 0, y: 2, w: 2, h: 1 },
    { i: 'proj-1', x: 0, y: 3, w: 2, h: 2 },
    { i: 'proj-2', x: 0, y: 5, w: 1, h: 2 },
    { i: 'proj-3', x: 1, y: 5, w: 1, h: 2 },
    { i: 'proj-4', x: 0, y: 7, w: 2, h: 2 },
    { i: 'proj-5', x: 0, y: 9, w: 2, h: 2 },
    { i: 'proj-6', x: 0, y: 11, w: 2, h: 2 },
  ]
};

export default function DeveloperBentoTemplate({ answers, isEditing, onUpdate, theme = 'light' }) {
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

  // Use projects array directly
  const projects = (answers.projects || []).map((project, index) => ({
    id: `proj-${index + 1}`,
    title: project.title || '',
    desc: project.desc || project.description || '',
    link: project.link || '',
    image: project.image || ''
  }));

  useEffect(() => {
    setMounted(true);
    // Always use default layout (ignore localStorage)
    localStorage.removeItem('bento_layout');
    setLayouts(defaultLayouts);
  }, []);

  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('bento_layout', JSON.stringify(allLayouts));
  };

  // Theme-aware CSS variables

  const baseBg = "bg-white dark:bg-slate-900/90";
  const baseBorder = "border-gray-300 dark:border-white/10";
  const baseShadow = "shadow-lg shadow-gray-300/50 dark:shadow-2xl dark:shadow-black/50";
  const baseText = "text-slate-900 dark:text-white";
  const subText = "text-slate-600 dark:text-slate-400";
  const pageBg = "bg-gray-50 dark:bg-gray-900";

  // 박스 스타일 (무드 컬러 테두리 적용)
  const boxStyle = `rounded-3xl ${baseShadow} backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-all ${baseBg} border-2`;

  // [수정] 드래그 중일 때 스타일 (흔들림 효과 제거, 테두리만 강조)
  const dragStyle = isEditing ? "cursor-move ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent z-50" : "";

  // [NEW] 리사이즈 핸들 아이콘 (우측 하단)
  const ResizeHandle = () => (
    isEditing && (
      <div className="absolute bottom-1 right-1 text-emerald-500 z-50 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM14 22H12V20H14V22ZM18 18H16V16H18V18Z" />
        </svg>
      </div>
    )
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative font-sans bg-transparent transition-colors duration-500">
      <BGMButton bgmTitle={selectedBgmTitle} />
      <PortfolioBackground moods={selectedMoods} />



      {/* [수정] 에디터가 열려있으면(isEditing) 오른쪽 여백을 확보해서 가려짐 방지 */}
      <main
        className={`relative z-10 w-full px-4 mx-auto pt-10 pb-40 transition-all duration-300 ${isEditing ? 'mr-[420px]' : ''}`}
      >
        <header className={`mb-12 pl-6 pt-6 ${isEditing ? 'ring-2 ring-emerald-400/50 p-4 rounded-lg' : ''}`}>
          {isEditing ? (
            <>
              <input type="text" value={answers.name || ''} onChange={(e) => handleEditChange('name', e.target.value)} className={`text-5xl font-extrabold tracking-tight mb-2 w-full bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 ${baseText}`} />
              <input type="text" value={answers.intro || ''} onChange={(e) => handleEditChange('intro', e.target.value)} placeholder="소개" className={`text-xl font-medium w-full mt-2 bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 ${subText}`} />
            </>
          ) : (
            <>
              <h1 className={`text-5xl font-extrabold tracking-tight mb-2 ${baseText} font-serif`}>
                {answers.name}
              </h1>
              <p className={`text-xl font-medium ${subText}`}>
                <span className={`font-bold ${currentStyle.textHighlight}`}>Full-Stack Developer</span> Portfolio
              </p>
            </>
          )}
        </header>

        {isEditing && (
          <div className="mb-8 p-3 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm inline-flex items-center gap-2 animate-pulse border border-emerald-500/50">
            <span>✋</span> 박스를 드래그하여 옮기고, 우측 하단을 잡아 크기를 조절하세요!
          </div>
        )}

        {/* [수정 사항]
            1. draggableHandle 삭제 -> 박스 전체 드래그 가능
            2. isDraggable, isResizable -> isEditing 상태와 연동
            3. rowHeight -> 150으로 조정
        */}
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
        // resizeHandles={['se']} // 기본값(우측하단) 사용
        >
          {/* 1. 프로필 박스 */}
          <div key="profile" className={`${boxStyle} ${dragStyle}`} style={{ borderColor: currentStyle.glowColor }}>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-current opacity-10 blur-3xl" style={{ color: currentStyle.glowColor }}></div>
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div>
                {/* Profile Image */}
                {answers.profile_image && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={answers.profile_image}
                      alt={answers.name || 'Profile'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg"
                    />
                  </div>
                )}
                <h2 className={`text-3xl font-bold ${baseText} mb-2`}>About Me</h2>
                <p className={`text-lg leading-relaxed ${subText}`}>{answers.intro || "기술로 세상을 더 편리하게 만드는 개발자입니다."}</p>
                <p className={`mt-4 text-sm ${subText} line-clamp-3`}>{answers.career_summary}</p>
              </div>
              <div className="mt-6 flex gap-2 flex-wrap">
                {selectedMoods.map(m => <span key={m} className={`px-3 py-1 rounded-full text-xs border ${currentStyle.pill}`}>{m}</span>)}
              </div>
            </div>
            <ResizeHandle />
          </div>

          {/* 2. 연락처 박스 */}
          <div key="contact" className={`${boxStyle} ${dragStyle} p-6 flex flex-col justify-center`} style={{ borderColor: currentStyle.glowColor }}>
            <h3 className={`text-lg font-bold ${baseText} mb-4`}>Contact</h3>
            <div className={`text-sm ${subText} space-y-2`}>
              <p>📧 {answers.email}</p>
              <p>📞 {answers.phone}</p>
              <a href={answers.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block">🔗 Link</a>
            </div>
            <ResizeHandle />
          </div>

          {/* 3. 프로젝트 박스들 */}
          {projects.map((item) => (
            <div key={item.id} className={`${boxStyle} ${dragStyle} p-6 group`} style={{ borderColor: currentStyle.glowColor }}>
              <div className="flex flex-col h-full">
                <div>
                  {isEditing ? (
                    <>
                      <input type="text" value={item.title} onChange={(e) => handleEditChange(`project${item.id.split('-')[1]}_title`, e.target.value)} className={`font-bold text-lg mb-2 w-full bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 ${baseText}`} />
                      <textarea rows="3" value={item.desc} onChange={(e) => handleEditChange(`project${item.id.split('-')[1]}_desc`, e.target.value)} className={`text-sm ${subText} w-full bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 resize-none mb-2`} />
                      <input type="text" value={item.image || ''} onChange={(e) => handleEditChange(`project${item.id.split('-')[1]}_image`, e.target.value)} placeholder="이미지 URL" className={`text-xs w-full bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 mb-2 ${baseText}`} />
                    </>
                  ) : (
                    <>
                      {/* Project Image - Show prominently if available */}
                      {item.image && (
                        <div className={`mb-3 rounded-lg overflow-hidden border ${baseBorder} shadow-md`}>
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <h3 className={`font-bold text-lg ${baseText} mb-2`}>{item.title}</h3>
                      <p className={`text-sm ${subText} line-clamp-2 mb-3`}>{item.desc}</p>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <input type="text" value={item.link || ''} onChange={(e) => handleEditChange(`project${item.id.split('-')[1]}_link`, e.target.value)} placeholder="프로젝트 링크" className={`mt-4 text-xs w-full bg-white/30 dark:bg-black/40 border-slate-400 dark:border-white/30 border-2 rounded px-2 py-1 ${baseText}`} />
                ) : (
                  item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="mt-4 text-xs font-bold uppercase tracking-wider text-blue-500 hover:text-blue-400">
                      View Project ↗
                    </a>
                  )
                )}
              </div>
              <ResizeHandle />
            </div>
          ))}

          {/* 4. 프로젝트 추가 버튼 (편집 모드) */}
          {isEditing && projects.length < 50 && (
            <div key="add-btn" className="flex items-center justify-center rounded-3xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer" onClick={() => {
              const nextNum = projects.length + 1;
              handleEditChange(`project${nextNum}_title`, '새 프로젝트');
              handleEditChange(`project${nextNum}_desc`, '프로젝트 설명을 입력하세요');
            }}>
              <div className="text-center">
                <div className="text-3xl mb-2">+</div>
                <div className="text-sm font-bold text-emerald-400">프로젝트 추가</div>
              </div>
              <ResizeHandle />
            </div>
          )}

          {/* 5. 빈 공간 (데코) */}
          {!isEditing && (
            <div key="empty" className={`border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl flex items-center justify-center text-slate-400`}>

            </div>
          )}

        </ResponsiveGridLayout>
      </main>
    </div>
  );
}