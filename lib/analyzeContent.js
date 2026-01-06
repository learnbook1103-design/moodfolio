// lib/analyzeContent.js

export function analyzeProjectContent(answers) {
  if (!answers) return null;

  // 1. 분석할 텍스트 수집 (프로젝트 제목, 설명, 경력 요약 등)
  // 1. 분석할 텍스트 수집 (프로젝트 제목, 설명, 경력 요약 등)
  const projectsText = Array.isArray(answers.projects)
    ? answers.projects.map(p => `${p.title || ''} ${p.desc || ''} ${p.description || ''}`).join(" ")
    : "";

  const textData = [
    answers.intro || "",
    answers.career_summary || "",
    projectsText
  ].join(" ").toLowerCase();

  // 2. 직군별/템플릿별 키워드 정의
  const keywords = {
    developer: {
      problem: ["해결", "오류", "버그", "최적화", "개선", "error", "fix", "issue", "solved"],
      impl: ["구현", "개발", "배포", "스택", "api", "react", "next", "build", "deploy"],
      tech: ["분석", "연구", "아키텍처", "알고리즘", "deep", "study", "docs", "structure"]
    },
    designer: {
      visual: ["그래픽", "비주얼", "로고", "컬러", "graphic", "logo", "brand", "visual"],
      brand: ["스토리", "컨셉", "철학", "브랜딩", "story", "concept", "mood"],
      ux: ["사용자", "경험", "리서치", "테스트", "ux", "ui", "user", "flow"]
    },
    marketer: {
      data: ["데이터", "성과", "수치", "도달", "data", "kpi", "roas", "result"],
      strategy: ["전략", "기획", "제안", "시장", "strategy", "plan", "market"],
      creative: ["콘텐츠", "제작", "카피", "소재", "content", "creative", "copy"]
    },
    service: {
      revenue: ["매출", "비즈니스", "사업", "수익", "business", "revenue", "sales"],
      ops: ["운영", "효율", "관리", "프로세스", "operation", "manage", "process"],
      comm: ["소통", "협업", "문서", "조율", "communication", "coop", "docs"]
    }
  };

  // 3. 점수 계산
  let maxScore = 0;
  let recommended = { job: 'developer', strength: 'impl' }; // 기본값

  Object.entries(keywords).forEach(([jobKey, templates]) => {
    Object.entries(templates).forEach(([templateKey, words]) => {
      let score = 0;
      words.forEach(word => {
        // 해당 단어가 텍스트에 포함된 횟수만큼 점수 증가
        const regex = new RegExp(word, "g");
        const count = (textData.match(regex) || []).length;
        score += count;
      });

      if (score > maxScore) {
        maxScore = score;
        recommended = { job: jobKey, strength: templateKey };
      }
    });
  });

  return recommended;
}