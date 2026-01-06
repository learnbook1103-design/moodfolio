import { useState } from 'react';

// ==========================================
// [내부 컴포넌트 3] Step4: 경력 및 갤러리
// ==========================================
export default function Step4Content({ answers, handleChange, onNext, onPrev }) {
    const isDesigner = answers.job === "designer";
    const [visibleProjects, setVisibleProjects] = useState(() => {
        if (answers.project6_title) return 6;
        if (answers.project5_title) return 5;
        if (answers.project4_title) return 4;
        if (answers.project3_title) return 3;
        if (answers.project2_title) return 2;
        return 1;
    });

    const handleAddProject = () => { if (visibleProjects < 6) setVisibleProjects(prev => prev + 1); };
    const handleRemoveProject = (projectNum) => {
        if (visibleProjects > 1) {
            // Get all current project data
            const projects = [];
            for (let i = 1; i <= visibleProjects; i++) {
                if (i !== projectNum) {
                    projects.push({
                        title: answers[`project${i}_title`] || '',
                        desc: answers[`project${i}_desc`] || '',
                        link: answers[`project${i}_link`] || ''
                    });
                }
            }

            // Clear all project data
            for (let i = 1; i <= 6; i++) {
                handleChange(`project${i}_title`, '');
                handleChange(`project${i}_desc`, '');
                handleChange(`project${i}_link`, '');
            }

            // Reassign remaining projects
            projects.forEach((project, index) => {
                const newNum = index + 1;
                handleChange(`project${newNum}_title`, project.title);
                handleChange(`project${newNum}_desc`, project.desc);
                handleChange(`project${newNum}_link`, project.link);
            });

            setVisibleProjects(prev => prev - 1);
        }
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return alert("2MB 이하 파일만 가능합니다.");
            const reader = new FileReader();
            reader.onloadend = () => handleChange(key, reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleNextClick = () => {
        if (isDesigner) {
            // 디자이너: 6개 프로젝트 필수
            let validCount = 0;
            for (let i = 1; i <= 6; i++) {
                const title = answers[`design_project${i}_title`];
                const desc = answers[`design_project${i}_desc`];
                const link = answers[`design_project${i}_link`];
                const file = answers[`design_project${i}_file`];

                if (title && (desc || link || file)) {
                    validCount++;
                } else if (title && !(desc || link || file)) {
                    return alert(`작품 ${i}: 제목이 있으면 설명, 링크, 또는 이미지 중 하나는 입력해주세요!`);
                }
            }

            if (validCount < 6) {
                return alert(`디자이너는 6개 프로젝트를 모두 채워주세요! (${validCount}/6)\n각 프로젝트는 제목 + (설명/링크/이미지 중 하나) 필수입니다.`);
            }
        } else {
            // 개발자: 최소 1개 프로젝트 필수
            const title1 = answers.project1_title;
            const desc1 = answers.project1_desc;
            const link1 = answers.project1_link;
            const file1 = answers.project1_file;

            if (!title1) {
                return alert("최소 1개의 프로젝트는 입력해주세요!");
            }

            if (title1 && !(desc1 || link1 || file1)) {
                return alert("프로젝트 제목이 있으면 설명, 링크, 또는 이미지 중 하나는 입력해주세요!");
            }
        }
        onNext();
    };


    const filledCount = [1, 2, 3, 4, 5, 6].filter(i => answers[`design_project${i}_title`] && (answers[`design_project${i}_link`] || answers[`design_project${i}_file`])).length;
    const inputStyle = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all";

    return (
        <div className="w-full max-w-5xl p-8 rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl relative">

            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-200 via-white to-emerald-200 mb-2 font-serif">
                    {isDesigner ? "디자인 갤러리 구성" : "핵심 경력 기술"}
                </h2>
                <p className="text-emerald-100/70 text-sm">{isDesigner ? "작품 6개를 선정하여 등록해주세요." : "포트폴리오의 알맹이를 채워주세요."}</p>
            </div>

            <div className="mb-12">
                <label className="block text-lg font-bold text-white mb-3">경력 요약</label>
                <textarea rows="4" placeholder="주요 경력 사항을 입력하세요..." className={inputStyle} value={answers.career_summary || ''} onChange={(e) => handleChange('career_summary', e.target.value)} />
            </div>

            {isDesigner ? (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                        <div><strong className="text-emerald-300 block mb-1">디자이너 미션</strong><span className="text-sm text-gray-300">이미지 파일이나 URL 중 선택하세요.</span></div>
                        <span className={`text-2xl font-bold ${filledCount === 6 ? 'text-emerald-400' : 'text-orange-400'}`}>{filledCount} / 6</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <div key={num} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all">
                                <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-gray-400">WORK 0{num}</span>{(answers[`design_project${num}_link`] || answers[`design_project${num}_file`]) && <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded">✔ 완료</span>}</div>
                                <input type="text" placeholder="작품 제목" className={`mb-3 ${inputStyle} py-2 text-sm`} value={answers[`design_project${num}_title`] || ''} onChange={(e) => handleChange(`design_project${num}_title`, e.target.value)} />
                                <textarea rows="2" placeholder="작품 설명 (선택사항)" className={`mb-3 ${inputStyle} py-2 text-sm resize-none`} value={answers[`design_project${num}_desc`] || ''} onChange={(e) => handleChange(`design_project${num}_desc`, e.target.value)} />

                                {/* 링크 입력 */}
                                <div className="mb-3">
                                    <label className="block text-xs text-gray-400 mb-1">작품 링크 (선택사항)</label>
                                    <input type="text" placeholder="https://..." className={`${inputStyle} py-2 text-sm`} value={answers[`design_project${num}_link`] || ''} onChange={(e) => handleChange(`design_project${num}_link`, e.target.value)} />
                                </div>

                                {/* 이미지 업로드 */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">🖼️ 작품 이미지 (선택사항)</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, `design_project${num}_file`)} className="w-full text-xs text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                                    {answers[`design_project${num}_file`] && <img src={answers[`design_project${num}_file`]} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-white/10" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4"><label className="block text-lg font-bold text-white">대표 프로젝트</label><span className="text-sm text-gray-400">({visibleProjects}/6)</span></div>
                    {[1, 2, 3, 4, 5, 6].slice(0, visibleProjects).map((num) => (
                        <div key={num} className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6 relative">
                            <div className="flex justify-between items-center mb-4"><h4 className="text-emerald-400 font-bold">프로젝트 {num}</h4>{visibleProjects > 1 && <button onClick={() => handleRemoveProject(num)} className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">삭제 🗑️</button>}</div>
                            <div className="grid grid-cols-1 gap-4">
                                <input type="text" placeholder="프로젝트명" className={inputStyle} value={answers[`project${num}_title`] || ''} onChange={(e) => handleChange(`project${num}_title`, e.target.value)} />
                                <textarea rows="2" placeholder="간단 설명 (50자 내외)" className={inputStyle} value={answers[`project${num}_desc`] || ''} onChange={(e) => handleChange(`project${num}_desc`, e.target.value)} />

                                {/* 링크 입력 */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">참조 링크 (선택사항)</label>
                                    <input
                                        type="text"
                                        placeholder="GitHub, 배포 URL 등"
                                        className={inputStyle}
                                        value={answers[`project${num}_link`] || ''}
                                        onChange={(e) => handleChange(`project${num}_link`, e.target.value)}
                                    />
                                </div>

                                {/* 이미지 업로드 */}
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">🖼️ 대표 이미지 (선택사항)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, `project${num}_file`)}
                                        className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer transition-all"
                                    />
                                    {answers[`project${num}_file`] && (
                                        <div className="relative mt-3">
                                            <img
                                                src={answers[`project${num}_file`]}
                                                alt="프로젝트 미리보기"
                                                className="w-full h-48 object-cover rounded-lg border border-white/20"
                                            />
                                            <button
                                                onClick={() => handleChange(`project${num}_file`, '')}
                                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-emerald-400 mt-1">
                                    팁: 링크와 이미지를 모두 추가하면 더 완성도 높은 포트폴리오가 됩니다!
                                </p>
                            </div>
                        </div>
                    ))}
                    {visibleProjects < 6 && <button onClick={handleAddProject} className="w-full py-4 border-2 border-dashed border-white/20 text-gray-400 rounded-xl hover:border-emerald-500 hover:text-emerald-400 transition-all font-bold">+ 프로젝트 추가하기</button>}
                </div>
            )}

            <div className="flex gap-4">
                <button onClick={onPrev} className="flex-1 py-4 px-6 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold hover:bg-white/10 hover:text-white transition-all">이전 단계</button>
                <button onClick={handleNextClick} className="flex-1 py-4 px-6 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:brightness-110 transition-all transform active:scale-95">다음 단계</button>
            </div>
        </div>
    );
}
