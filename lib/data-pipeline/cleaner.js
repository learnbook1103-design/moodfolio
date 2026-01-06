// lib/data-pipeline/cleaner.js
// 데이터 정제 및 정규화

export class DataCleaner {
    constructor() {
        // 기술 스택 동의어 매핑
        this.skillNormalizer = {
            // JavaScript 계열
            'javascript': 'JavaScript',
            'js': 'JavaScript',
            'reactjs': 'React',
            'react.js': 'React',
            'react native': 'React Native',
            'vuejs': 'Vue',
            'vue.js': 'Vue',
            'angularjs': 'Angular',

            // TypeScript
            'typescript': 'TypeScript',
            'ts': 'TypeScript',

            // Node.js
            'nodejs': 'Node.js',
            'node.js': 'Node.js',
            'node': 'Node.js',

            // Python
            'python': 'Python',
            'python3': 'Python',
            'py': 'Python',

            // Database
            'postgresql': 'PostgreSQL',
            'postgres': 'PostgreSQL',
            'mysql': 'MySQL',
            'mongodb': 'MongoDB',
            'mongo': 'MongoDB',

            // Cloud
            'aws': 'AWS',
            'amazon web services': 'AWS',
            'gcp': 'GCP',
            'google cloud': 'GCP',
            'azure': 'Azure',

            // Tools
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'k8s': 'Kubernetes',
            'git': 'Git',
            'github': 'GitHub',
            'gitlab': 'GitLab',

            // Design
            'figma': 'Figma',
            'sketch': 'Sketch',
            'adobe xd': 'Adobe XD',
            'xd': 'Adobe XD',
            'photoshop': 'Photoshop',
            'ps': 'Photoshop',
            'illustrator': 'Illustrator',
            'ai': 'Illustrator',

            // Marketing
            'google analytics': 'Google Analytics',
            'ga': 'Google Analytics',
            'ga4': 'GA4',
            'seo': 'SEO',
            'sem': 'SEM'
        };
    }

    // 기술 스택 정규화
    normalizeSkills(rawSkills) {
        if (!Array.isArray(rawSkills)) return [];

        const normalized = rawSkills
            .map(skill => {
                const lower = skill.toLowerCase().trim();
                return this.skillNormalizer[lower] || skill.trim();
            })
            .filter(skill => skill.length > 1); // 1글자 제외

        // 중복 제거
        return [...new Set(normalized)];
    }

    // 키워드 정규화
    normalizeKeywords(rawKeywords) {
        if (!Array.isArray(rawKeywords)) return [];

        const stopWords = ['을', '를', '이', '가', '은', '는', '의', '에', '와', '과',
            'and', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for'];

        return rawKeywords
            .map(keyword => keyword.trim())
            .filter(keyword => keyword.length > 2)
            .filter(keyword => !stopWords.includes(keyword.toLowerCase()))
            .filter((keyword, index, self) => self.indexOf(keyword) === index); // 중복 제거
    }

    // 텍스트에서 키워드 추출
    extractKeywordsFromText(text) {
        if (!text) return [];

        // 일반적인 키워드 패턴
        const keywordPatterns = [
            // 기술적 역량
            '문제 해결', '최적화', '성능 개선', '리팩토링', '아키텍처',
            '코드 리뷰', '테스트', '디버깅', '배포', '모니터링',

            // 협업
            '협업', '커뮤니케이션', '팀워크', '리더십', '멘토링',
            '애자일', '스크럼', '칸반', '프로젝트 관리',

            // 사용자 중심
            '사용자 경험', '사용자 중심', 'UX', 'UI', '접근성',
            '사용성', '인터랙션', '프로토타이핑',

            // 데이터
            '데이터 기반', '데이터 분석', '지표', 'KPI', 'A/B 테스트',
            '실험', '가설 검증', '인사이트',

            // 성과
            '성과', '개선', '증가', '감소', '효율', '생산성',
            '품질', '안정성', '확장성', '유지보수성',

            // 태도
            '빠른 학습', '자기주도', '책임감', '열정', '창의적',
            '분석적', '논리적', '체계적', '전략적'
        ];

        const found = [];
        keywordPatterns.forEach(pattern => {
            if (text.includes(pattern)) {
                found.push(pattern);
            }
        });

        return found;
    }

    // 데이터 유효성 검증
    validateJobPosting(job) {
        const errors = [];

        if (!job.job_type) {
            errors.push('job_type is required');
        }

        if (!job.job_title || job.job_title.length < 3) {
            errors.push('job_title is invalid');
        }

        if (!job.source) {
            errors.push('source is required');
        }

        if (!Array.isArray(job.required_skills) && !Array.isArray(job.preferred_skills)) {
            errors.push('at least one skill array is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // 중복 제거 (URL 기반)
    deduplicateJobs(jobs) {
        const seen = new Set();
        return jobs.filter(job => {
            if (seen.has(job.job_id)) {
                return false;
            }
            seen.add(job.job_id);
            return true;
        });
    }

    // 전체 정제 파이프라인
    cleanJobPosting(rawJob) {
        return {
            ...rawJob,
            required_skills: this.normalizeSkills(rawJob.required_skills || []),
            preferred_skills: this.normalizeSkills(rawJob.preferred_skills || []),
            keywords: this.normalizeKeywords(rawJob.keywords || []),
            job_title: rawJob.job_title?.trim(),
            company_name: rawJob.company_name?.trim(),
            description: rawJob.description?.trim()
        };
    }
}

export default DataCleaner;
