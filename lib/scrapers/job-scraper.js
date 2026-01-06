// lib/scrapers/job-scraper.js
// 채용공고 스크래퍼 (Cheerio 기반 - Puppeteer 불필요)

import * as cheerio from 'cheerio';

export class JobScraper {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    // 원티드 채용공고 스크래핑
    async scrapeWanted(jobType, limit = 50) {
        const jobs = [];
        const searchKeywords = {
            developer: '개발자',
            designer: '디자이너',
            marketer: '마케터',
            service: '서비스기획자'
        };

        const keyword = searchKeywords[jobType] || '개발자';

        try {
            // 원티드 검색 API (공개 API)
            const response = await fetch(
                `https://www.wanted.co.kr/api/v4/jobs?country=kr&job_sort=job.latest_order&search=${encodeURIComponent(keyword)}&limit=${limit}`,
                {
                    headers: {
                        'User-Agent': this.userAgent,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Wanted API error: ${response.status}`);
            }

            const data = await response.json();

            for (const job of data.data || []) {
                // 상세 페이지 가져오기
                const detailResponse = await fetch(
                    `https://www.wanted.co.kr/api/v4/jobs/${job.id}`,
                    {
                        headers: {
                            'User-Agent': this.userAgent,
                            'Accept': 'application/json'
                        }
                    }
                );

                if (detailResponse.ok) {
                    const detail = await detailResponse.json();

                    jobs.push({
                        source: 'wanted',
                        source_url: `https://www.wanted.co.kr/wd/${job.id}`,
                        job_id: `wanted_${job.id}`,
                        job_type: jobType,
                        job_title: job.position,
                        company_name: job.company.name,
                        required_skills: this.extractSkills(detail.job?.detail?.requirements || '', jobType),
                        preferred_skills: this.extractSkills(detail.job?.detail?.preferred || '', jobType),
                        description: detail.job?.detail?.main_tasks || '',
                        keywords: this.extractKeywords(detail.job?.detail?.intro || ''),
                        posted_at: new Date(job.created_at)
                    });
                }

                // Rate limiting
                await this.sleep(500);
            }

            console.log(`✅ Scraped ${jobs.length} jobs from Wanted for ${jobType}`);
            return jobs;

        } catch (error) {
            console.error('Wanted scraping error:', error);
            return [];
        }
    }

    // 사람인 채용공고 스크래핑 (HTML 파싱)
    async scrapeSaramin(jobType, limit = 50) {
        const jobs = [];
        const searchKeywords = {
            developer: '개발',
            designer: '디자인',
            marketer: '마케팅',
            service: '기획'
        };

        const keyword = searchKeywords[jobType] || '개발';

        try {
            const response = await fetch(
                `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${encodeURIComponent(keyword)}&recruitPage=1&recruitPageCount=${limit}`,
                {
                    headers: {
                        'User-Agent': this.userAgent
                    }
                }
            );

            const html = await response.text();
            const $ = cheerio.load(html);

            $('.item_recruit').each((i, element) => {
                const $elem = $(element);

                const title = $elem.find('.job_tit a').text().trim();
                const company = $elem.find('.corp_name a').text().trim();
                const link = $elem.find('.job_tit a').attr('href');
                const conditions = $elem.find('.job_condition span').text();

                if (title && link) {
                    jobs.push({
                        source: 'saramin',
                        source_url: `https://www.saramin.co.kr${link}`,
                        job_id: `saramin_${link.match(/\d+/)?.[0]}`,
                        job_type: jobType,
                        job_title: title,
                        company_name: company,
                        required_skills: this.extractSkills(conditions, jobType),
                        description: conditions,
                        keywords: this.extractKeywords(title + ' ' + conditions)
                    });
                }
            });

            console.log(`✅ Scraped ${jobs.length} jobs from Saramin for ${jobType}`);
            return jobs;

        } catch (error) {
            console.error('Saramin scraping error:', error);
            return [];
        }
    }

    // 기술 스택 추출
    extractSkills(text, jobType = 'developer') {
        if (!text) return [];

        const skillPatterns = {
            developer: [
                'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python',
                'Java', 'Spring', 'Django', 'FastAPI', 'Go', 'Rust', 'C#', '.NET',
                'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
                'AWS', 'GCP', 'Azure', 'Git', 'CI/CD', 'REST API', 'GraphQL', 'Next.js',
                'Express', 'NestJS', 'Flask', 'Kotlin', 'Swift', 'Flutter', 'React Native'
            ],
            designer: [
                'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects',
                'Premiere Pro', 'InDesign', 'Framer', 'Principle', 'ProtoPie', 'Zeplin',
                'UI/UX', '프로토타이핑', '디자인 시스템', '타이포그래피', '컬러 시스템'
            ],
            marketer: [
                'Google Analytics', 'GA4', 'Google Ads', 'Meta Ads', 'Facebook Ads',
                'Instagram', 'SEO', 'SEM', 'ASO', 'SQL', 'Python', 'Tableau', 'Excel',
                'PowerPoint', 'Notion', 'Slack', 'Jira', 'Asana', 'Mixpanel', 'Amplitude'
            ],
            service: [
                'Notion', 'Figma', 'Jira', 'Confluence', 'SQL', 'Excel', 'PowerPoint',
                'Google Analytics', 'Tableau', 'Miro', 'Slack', 'Asana', 'Monday',
                '사용자 리서치', 'A/B 테스트', '데이터 분석', '프로젝트 관리'
            ]
        };

        // 해당 직군의 기술만 검색
        const relevantSkills = skillPatterns[jobType] || skillPatterns.developer;
        const found = [];

        relevantSkills.forEach(skill => {
            const regex = new RegExp(skill, 'i');
            if (regex.test(text)) {
                found.push(skill);
            }
        });

        return [...new Set(found)]; // 중복 제거
    }

    // 키워드 추출
    extractKeywords(text) {
        if (!text) return [];

        const keywords = [
            '사용자 경험', '사용자 중심', 'UX', 'UI', '협업', '커뮤니케이션',
            '문제 해결', '데이터 기반', '성과 지향', '빠른 학습', '자기주도',
            '애자일', '스크럼', '린', '그로스', '최적화', '개선', '혁신',
            '창의적', '분석적', '논리적', '체계적', '전략적', '실행력'
        ];

        const found = [];
        keywords.forEach(keyword => {
            if (text.includes(keyword)) {
                found.push(keyword);
            }
        });

        return found;
    }

    // Sleep 유틸리티
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default JobScraper;
