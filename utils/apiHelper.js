export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// [Virtual Data Helper] API Wrapper definition
export const apiWrapper = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, options);
        if (!response.ok) throw new Error('API request failed');
        return await response.json();
    } catch (error) {
        console.warn(`[Mock Mode] API request to ${endpoint} failed. Using virtual data.`);

        // Virtual Data Responses
        if (endpoint === '/signup') {
            return { message: "회원가입 성공 (가상 데이터)" };
        }
        if (endpoint === '/save-portfolio') {
            return { message: "포트폴리오 저장 성공 (가상 데이터)" };
        }

        throw error; // Unknown endpoint, rethrow
    }
};

// [Helper] AI Refinement - Now with Real Gemini Flash API
export const simulateAIRefinement = async (text) => {
    // Try to use Gemini API first
    try {
        const response = await fetch('/api/analyze-resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ resumeText: text })
        });

        if (response.ok) {
            const geminiData = await response.json();

            // API 응답을 그대로 반환 (이미 프로젝트 필드 구조에 맞춰져 있음)
            return geminiData;
        }
    } catch (error) {
        console.warn('[Gemini API Failed] Falling back to regex extraction:', error);
    }

    // Fallback: Regex-based extraction (original logic)
    const extractedData = {
        name: null,
        email: null,
        phone: null,
        github: null,
        skills: [],
        projects: []
    };

    // Extract Email
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) extractedData.email = emailMatch[1];

    // Extract Phone (Korean format)
    const phoneMatch = text.match(/(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/);
    if (phoneMatch) extractedData.phone = phoneMatch[1].replace(/\s/g, '-');

    // Extract GitHub URL
    const githubMatch = text.match(/(https?:\/\/)?(github\.com\/[a-zA-Z0-9_-]+)/i);
    if (githubMatch) extractedData.github = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;

    // Extract Name
    const namePatterns = [
        /이름[:\s]+([가-힣]{2,4})/,
        /name[:\s]+([a-zA-Z\s]{2,20})/i,
        /^([가-힣]{2,4})\s*$/m
    ];
    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match) {
            extractedData.name = match[1].trim();
            break;
        }
    }

    // Extract Skills
    const skillKeywords = [
        'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
        'Spring', 'Django', 'FastAPI', 'Express', 'Next.js', 'Nuxt.js',
        'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
        'MongoDB', 'MySQL', 'PostgreSQL', 'Redis',
        'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
        'Git', 'GitHub', 'GitLab', 'CI/CD',
        'Figma', 'Sketch', 'Adobe XD', 'Photoshop'
    ];

    skillKeywords.forEach(skill => {
        const regex = new RegExp(`\\b${skill}\\b`, 'i');
        if (regex.test(text)) {
            extractedData.skills.push(skill);
        }
    });

    // Extract Projects
    const projectPatterns = [
        /프로젝트[:\s]*([^\n]{10,50})/g,
        /project[:\s]*([^\n]{10,50})/gi,
        /개발[:\s]*([^\n]{10,50})/g,
        /구현[:\s]*([^\n]{10,50})/g
    ];

    const foundProjects = new Set();
    projectPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null && foundProjects.size < 3) {
            const projectTitle = match[1].trim()
                .replace(/[.。,，]/g, '')
                .slice(0, 40);
            if (projectTitle.length > 5) {
                foundProjects.add(projectTitle);
            }
        }
    });

    Array.from(foundProjects).forEach((title) => {
        const titleIndex = text.indexOf(title);
        const contextStart = Math.max(0, titleIndex - 50);
        const contextEnd = Math.min(text.length, titleIndex + title.length + 100);
        const context = text.slice(contextStart, contextEnd);

        extractedData.projects.push({
            title: title,
            desc: `${context.slice(0, 80)}... 프로젝트를 성공적으로 완수했습니다.`,
            link: extractedData.github || ''
        });
    });

    if (extractedData.projects.length === 0 && extractedData.skills.length > 0) {
        const mainSkill = extractedData.skills[0];
        extractedData.projects.push({
            title: `${mainSkill} 기반 웹 애플리케이션 개발`,
            desc: `${mainSkill}을 활용하여 사용자 중심의 웹 서비스를 구현했습니다.`,
            link: extractedData.github || ''
        });
    }

    // Generate refined intro
    const keywords = {
        frontend: text.match(/react|vue|angular|javascript|frontend|프론트/i),
        backend: text.match(/node|python|java|backend|백엔드/i),
        design: text.match(/figma|sketch|design|ui\/ux|디자인/i),
        interview: text.match(/interview|question|면접/i),
    };

    let refinedIntro = "";
    if (keywords.frontend) {
        refinedIntro = `사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다. ${extractedData.skills.slice(0, 3).join(', ')} 등의 기술 스택에 능숙합니다.`;
    } else if (keywords.backend) {
        refinedIntro = `안정적이고 확장 가능한 서버 아키텍처를 설계하는 백엔드 개발자입니다. ${extractedData.skills.slice(0, 3).join(', ')} 기반 개발 경험이 있습니다.`;
    } else if (keywords.design) {
        refinedIntro = `심미성과 사용성을 겸비한 인터페이스를 설계하는 UI/UX 디자이너입니다.`;
    } else {
        if (extractedData.skills.length > 0) {
            refinedIntro = `${extractedData.skills.slice(0, 3).join(', ')} 등의 기술을 활용하여 문제를 해결하는 개발자입니다.`;
        } else {
            refinedIntro = "열정적으로 새로운 기술을 학습하며 성장하는 개발자입니다.";
        }
    }

    let analyzedCoaching = "어떤 내용을 강조할지 모르겠어요";
    if (text.length > 500) analyzedCoaching = "문장 다듬기가 어려워요";
    if (keywords.interview) analyzedCoaching = "면접 질문이 궁금해요";

    const refinedProjects = extractedData.projects.length > 0
        ? extractedData.projects
        : [
            { title: "주요 프로젝트 개발", desc: "핵심 기능을 주도적으로 구현하여 성과를 창출했습니다.", link: "" },
            { title: "데이터 최적화 및 리팩토링", desc: "기존 레거시 코드를 분석하고 최신 스택으로 전환하여 성능을 30% 개선했습니다.", link: "" },
            { title: "사용자 중심 UI/UX 개선", desc: "사용자 피드백을 기반으로 인터페이스를 고도화하여 이탈률을 감소시켰습니다.", link: "" }
        ];

    return {
        refinedIntro,
        refinedProjects,
        analyzedCoaching,
        original: text,
        extractedData
    };
};
