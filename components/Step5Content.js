import ImportResumeButton from './ImportResumeButton';
import { simulateAIRefinement } from '../utils/apiHelper';

// ==========================================
// [내부 컴포넌트 4] Step5: AI 코칭 (버튼 색상 수정됨)
// ==========================================
export default function Step5Content({ answers, handleChange, onNext, onPrev }) {
    const options = [
        { label: "문장 다듬기가 어려워요", desc: "자소서/경력기술서 윤문 요청", reaction: "✍️ 문장 다듬기? 제가 전문입니다!" },
        { label: "어떤 내용을 강조할지 모르겠어요", desc: "강점 발굴 요청", reaction: "💎 숨겨진 강점, 제가 찾아드릴게요!" },
        { label: "면접 질문이 궁금해요", desc: "예상 질문 추출 요청", reaction: "🧐 면접관의 마음을 읽어드릴게요!" },
    ];

    const handleSelect = (label) => { handleChange('ai_request', label); };

    // 이력서 데이터 적용 핸들러 (Step5)
    const handleImportToStep5 = async (text, images = []) => {
        if (!text) return;

        // 텍스트 분석으로 코칭 옵션 결정
        let analyzedCoaching = "어떤 내용을 강조할지 모르겠어요"; // 기본값
        if (text.length > 500) analyzedCoaching = "문장 다듬기가 어려워요";
        if (text.match(/interview|question|면접/i)) analyzedCoaching = "면접 질문이 궁금해요";

        handleSelect(analyzedCoaching);

        // Auto-assign images to projects
        if (images && images.length > 0) {
            try {
                // Store images in localStorage
                localStorage.setItem('resume_images', JSON.stringify(images));
                console.log(`Stored ${images.length} images from resume`);

                // Get job type from answers
                const isDesigner = answers?.job === 'designer';
                const maxProjects = 6;

                // Assign images to projects
                const imagesToAssign = Math.min(images.length, maxProjects);
                for (let i = 0; i < imagesToAssign; i++) {
                    const projectNum = i + 1;
                    const projectKey = isDesigner ? `design_project${projectNum}` : `project${projectNum}`;

                    // Set project type to 'file' and assign image
                    handleChange(isDesigner ? `design_type_${projectNum}` : `project_type_${projectNum}`, 'file');
                    handleChange(`${projectKey}_file`, images[i]);

                    console.log(`Assigned image ${i + 1} to ${projectKey}`);
                }

                console.log(`Auto-assigned ${imagesToAssign} images to projects from Step5`);
            } catch (e) {
                console.warn('Failed to store or assign images:', e);
            }
        }

        const imageInfo = images && images.length > 0 ? `\n이미지 ${images.length}개 자동 배치됨` : '';
        alert(`📄 이력서 분석 완료! \n\n내용을 바탕으로 '${analyzedCoaching}' 옵션을 추천해드렸습니다.${imageInfo}`);
    };

    return (
        <div className="w-full max-w-2xl p-8 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl relative">
            {/* 이력서 가져오기 버튼 */}
            <div className="absolute top-8 right-8">
                <ImportResumeButton onImport={handleImportToStep5} />
            </div>

            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-200 via-white to-emerald-200 mb-2 font-serif">
                    AI 코칭 설정
                </h2>
                <p className="text-emerald-100/70 text-sm">가장 고민되는 점을 선택하면 AI가 도와줍니다.</p>
            </div>

            <div className="mb-12">
                <label className="block text-lg font-bold text-white mb-4">Q8. 현재 가장 고민되는 점은?</label>
                <div className="grid grid-cols-1 gap-4">
                    {options.map((opt) => (
                        <button key={opt.label} onClick={() => handleSelect(opt.label)}
                            className={`p-6 rounded-2xl border text-left transition-all flex flex-col group backdrop-blur-sm
                  ${answers.ai_request === opt.label
                                    ? 'border-emerald-400/60 bg-emerald-600/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/30'
                                }`}
                        >
                            <span className="text-lg font-bold mb-1 group-hover:text-emerald-300 transition-colors">{opt.label}</span>
                            <span className="text-sm opacity-70">👉 {opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={onPrev} className="flex-1 py-4 px-6 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 hover:text-white transition-all">이전 단계</button>

                {/* [수정됨] 완료 버튼: Emerald/Cyan 계열로 변경 */}
                <button onClick={onNext} className="w-full py-4 px-6 rounded-xl bg-linear-to-r from-emerald-400 to-cyan-500 text-white font-bold hover:opacity-90 shadow-lg transition-all transform active:scale-95">설정 완료 & 제출하기 ✨</button>
            </div>
        </div>
    );
}
