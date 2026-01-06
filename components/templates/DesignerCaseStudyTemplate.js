import PortfolioBackground from "../PortfolioBackground";
import { getStyleByMood } from "./moodColorMap";

export default function DesignerCaseStudyTemplate({ answers, isEditing, onUpdate }) {
  const selectedMoods = answers.moods || [];
  const currentStyle = getStyleByMood(selectedMoods);

  // 에디트 업데이트 함수
  const handleEditChange = (key, value) => {
    if (onUpdate) {
      onUpdate(prev => ({ ...prev, [key]: value }));
    }
  };

  // Use projects array directly
  const projects = (answers.projects || []).map((project, index) => ({
    id: index + 1,
    title: project.title || '',
    type: 'file',
    src: project.image || ''
  }));

  const baseBg = "bg-white/90 dark:bg-slate-900/90";
  const titleText = "text-slate-900 dark:text-white";
  const subText = "text-slate-600 dark:text-slate-400";
  const cardBg = "bg-white dark:bg-slate-800";
  const borderStyle = "border border-slate-200 dark:border-slate-700";

  return (
    <div className="min-h-screen relative font-sans bg-transparent transition-colors duration-500">
      <PortfolioBackground moods={selectedMoods} />

      <main className="relative z-10 max-w-6xl mx-auto py-20 px-6 md:px-12">

        {/* 헤더 */}
        <header className="mb-20">
          {isEditing ? (
            <div className="flex flex-col items-start gap-4">
              {answers.profile_image && (
                <img src={answers.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-white/20 mb-4" />
              )}
              <div className="ring-2 ring-emerald-400/50 rounded-lg p-4 bg-black/20 w-full mb-4">
                <input
                  type="text"
                  value={answers.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  className="w-full text-4xl font-bold bg-transparent border-b border-white/30 text-white mb-4 px-2 py-2"
                  placeholder="이름"
                />
                <input
                  type="text"
                  value={answers.intro || ''}
                  onChange={(e) => handleEditChange('intro', e.target.value)}
                  className="w-full bg-transparent border-b border-white/30 text-slate-300 px-2 py-2"
                  placeholder="소개"
                />
              </div>
            </div>
          ) : (
            <>
              {answers.profile_image && (
                <img src={answers.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 dark:border-white/20 mb-6 shadow-md" />
              )}
              <h1 className={`text-4xl font-bold mb-4 ${titleText}`}>{answers.name || "Designer"}</h1>
              <p className={`text-lg ${subText}`}>{answers.intro}</p>
            </>
          )}
        </header>
        {/* 헤더 */}
        <header className="mb-24 text-center md:text-left">
          <span className={`inline-block py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${currentStyle.pill}`}>
            UX/UI Case Studies
          </span>
          <h1 className={`text-5xl md:text-7xl font-bold leading-tight mb-6 ${titleText}`}>
            Thinking beyond pixels,<br />
            Designing <span className={`text-transparent bg-clip-text bg-linear-to-r ${currentStyle.headerGradient}`}>Impact.</span>
          </h1>
          <div className={`p-6 rounded-2xl bg-white/50 dark:bg-black/20 border ${borderStyle} backdrop-blur-sm`}>
            <p className={`text-lg md:text-xl ${subText} leading-relaxed`}>
              "안녕하세요, <b>{answers.name}</b>입니다. <br />
              {answers.career_summary || "사용자 중심의 논리적인 해결책을 설계합니다."}"
            </p>
          </div>
        </header>

        {/* 프로젝트 리스트 */}
        <section className="space-y-16">
          {projects.map((study, index) => (
            <article
              key={study.id}
              className={`group relative flex flex-col md:flex-row gap-8 p-8 rounded-3xl transition-all duration-300 hover:shadow-xl ${cardBg} ${borderStyle}`}
            >
              {/* 왼쪽: 타이틀 및 정보 */}
              <div className="w-full md:w-1/3 flex flex-col justify-between space-y-6">
                <div>
                  <span className={`text-6xl font-black opacity-10 absolute top-4 left-6 pointer-events-none ${titleText}`}>
                    0{index + 1}
                  </span>
                  <div className="relative z-10">
                    {isEditing ? (
                      <input type="text" value={study.title} onChange={(e) => handleEditChange(`design_project${study.id}_title`, e.target.value)} className="text-3xl font-bold mb-2 w-full bg-black/10 border border-white/10 rounded px-2 py-1 text-slate-900 dark:text-white" />
                    ) : (
                      <h2 className={`text-3xl font-bold mb-2 group-hover:underline decoration-2 underline-offset-4 ${titleText}`}>
                        {study.title}
                      </h2>
                    )}
                    <p className={`text-sm font-medium ${currentStyle.textHighlight} mb-4`}>
                      {study.type === 'file' ? "Design Work" : "Web/App Link"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 이미지 또는 링크 미리보기 */}
              <div className="w-full md:w-2/3 border-l-0 md:border-l border-slate-200 dark:border-slate-700 md:pl-8 flex flex-col justify-center">
                <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-600">
                  {isEditing ? (
                    <input type="text" value={study.src || ''} onChange={(e) => handleEditChange(`design_project${study.id}_link`, e.target.value)} placeholder="이미지 링크 또는 파일 경로" className="w-full h-full bg-black/10 border border-white/10 rounded px-2 py-2 text-slate-900 dark:text-white" />
                  ) : (
                    study.type === 'file' && study.src ? (
                      <img src={study.src} alt={study.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl mb-2">🔗</span>
                        <span className="text-sm px-4 text-center break-all">{study.src || "Link not provided"}</span>
                      </div>
                    )
                  )}
                </div>

                <div className="pt-6 flex justify-end">
                  {study.type === 'link' && study.src ? (
                    <a href={study.src} target="_blank" rel="noreferrer" className={`text-sm font-bold flex items-center gap-2 transition-colors hover:gap-3 ${titleText}`}>
                      Visit Project <span>→</span>
                    </a>
                  ) : (
                    <span className={`text-sm text-slate-400`}>Image Only</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* 프로젝트 추가 버튼 */}
        {isEditing && projects.length < 6 && (
          <div className="mt-8 text-center">
            <button onClick={() => {
              const nextNum = projects.length + 1;
              handleEditChange(`design_project${nextNum}_title`, '새 프로젝트');
              handleEditChange(`design_project${nextNum}_link`, '');
            }} className="px-6 py-2 bg-pink-500/20 border border-pink-500 text-pink-300 rounded-lg hover:bg-pink-500/30 transition">
              + 프로젝트 추가
            </button>
          </div>
        )}

        {/* 하단 CTA */}
        <section className="mt-32 text-center">
          <h2 className={`text-3xl font-bold mb-6 ${titleText}`}>
            Contact
          </h2>
          <a href={`mailto:${answers.email}`} className={`inline-block px-8 py-4 rounded-full text-white font-bold shadow-lg transition-transform hover:-translate-y-1 bg-linear-to-r ${currentStyle.headerGradient}`}>
            {answers.email}
          </a>
        </section>

      </main>
    </div>
  );
}