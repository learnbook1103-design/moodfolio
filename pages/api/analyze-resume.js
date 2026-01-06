// pages/api/analyze-resume.js
// Regex 기반 이력서 분석 (Gemini API 폴백 포함)

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
        return res.status(400).json({ error: '이력서 내용이 비어있습니다.' });
    }

    try {
        // Regex 기반 추출 (항상 작동)
        console.log('[Regex Mode] Extracting resume data');

        const emailMatch = resumeText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const phoneMatch = resumeText.match(/(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/);
        const githubMatch = resumeText.match(/(https?:\/\/)?(github\.com\/[a-zA-Z0-9_-]+)/i);
        const nameMatch = resumeText.match(/이름[:\s]+([가-힣a-zA-Z0-9]{2,10})/);

        const skills = [];
        // Developer skills
        const devSkills = ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java', 'Next.js', 'Tailwind', 'CSS', 'Recoil', 'Query', 'HTML', 'C++', 'C#', 'Swift', 'Kotlin', 'Flutter', 'Django', 'Spring', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure'];
        // Designer skills
        const designSkills = ['Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere', 'Zeplin', 'Framer', 'Principle', 'ProtoPie'];
        // Marketer skills
        const marketingSkills = ['GA', 'Google Analytics', 'SEO', 'SEM', 'Facebook Ads', 'Google Ads', 'Instagram', 'Marketing', 'Branding', 'Content', 'Social Media'];
        // Service/Business skills
        const serviceSkills = ['Jira', 'Notion', 'Confluence', 'Slack', 'Trello', 'Asana', 'Excel', 'PowerPoint', 'SQL', 'Tableau', 'Data Analysis'];

        const allSkills = [...devSkills, ...designSkills, ...marketingSkills, ...serviceSkills];
        allSkills.forEach(skill => {
            // Escape special regex characters in skill name
            const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`\\b${escapedSkill}\\b`, 'i').test(resumeText)) skills.push(skill);
        });

        // 프로젝트 추출 개선 - 여러 패턴 지원
        // 프로젝트 추출 개선 - 여러 패턴 지원 (순서 중요: 구체적인 패턴부터)
        const projectMatches = [];

        // Priority 1: Numbered List ("1. Title", "1) Title") - 가장 명확한 구조
        // Handles leading whitespace/tabs
        const commonHeaders = [
            'Education', 'Skill', 'Experience', 'Contact', 'Profile', 'Intro', 'About',
            '학력', '기술', '자격증', '어학', '수상', '경력', '활동', '소개',
            '자기소개', '자기소개서', '지원동기', '성장과정', '성격', '장단점', '포부',
            'Self Introduction', 'Motivation', 'Personality', 'Aspiration', 'Growth'
        ];

        // START CHANGE: Section-aware parsing
        // If we find "[주요 프로젝트]" or "[Projects]", slice the text from there.
        let targetText = resumeText;
        const projectSectionMatch = resumeText.match(/(?:\[|■|●|^)\s*(?:주요)?\s*(?:프로젝트|Projects?|경험|[A-Za-z\s]+Experience)\s*(?:\]|:|\n)/i);

        if (projectSectionMatch && projectSectionMatch.index !== undefined) { // Check for undefined index
            console.log(`[Regex] Found project section header at index ${projectSectionMatch.index}`);
            // Use text only AFTER this header
            targetText = resumeText.slice(projectSectionMatch.index);
        }

        const numberedListProjects = [...targetText.matchAll(/(?:^|\n)\s*\d+[\.\)\s]\s*([^\n]+)/g)];
        console.log(`[Regex] Numbered projects found (in section): ${numberedListProjects.length}`);

        numberedListProjects.forEach((match, index) => {
            let title = match[1].trim();
            let inlineDesc = '';
            let duration = null;

            // Extract duration from title (e.g., "Project A (2023.01 - 2023.05)" or "Project B (6개월)")
            const durationInTitle = title.match(/\(([^)]*(?:\d{4}[.\/-]\d{1,2}[^)]*|\d+\s*개월|\d+\s*months?)[^)]*)\)/);
            if (durationInTitle) {
                duration = durationInTitle[1].trim();
                title = title.replace(durationInTitle[0], '').trim();
            }

            // Handle "Title 'English Name' "Description"" format
            // Extract text in double quotes at the end of the line as description
            const quoteMatch = title.match(/^(.+?)\s*["“]([^"”]+)["”]\s*$/);
            if (quoteMatch) {
                title = quoteMatch[1].trim();
                inlineDesc = quoteMatch[2].trim();
            }
            // Handle "Title - Description" or "Title : Description" pattern if title is long
            else if ((title.includes(' - ') || title.includes(': ')) && title.length > 20) {
                const separators = [' - ', ': '];
                for (const sep of separators) {
                    if (title.includes(sep)) {
                        const parts = title.split(sep);
                        if (parts[0].length < parts[1].length || parts[1].length > 10) {
                            title = parts[0].trim();
                            inlineDesc = parts.slice(1).join(sep).trim();
                            break;
                        }
                    }
                }
            }

            // Remove any remaining date patterns
            title = title.replace(/\s*\(?\d{4}[.\/-].*$/, '').trim();

            // Filter out short meaningless lines, dates, or common headers
            const lowerTitle = title.toLowerCase();
            const isHeader = commonHeaders.some(h =>
                lowerTitle === h.toLowerCase() ||
                lowerTitle.startsWith(h.toLowerCase()) ||
                lowerTitle.endsWith(h.toLowerCase()) ||
                (h.length > 2 && lowerTitle.includes(h.toLowerCase()))
            );
            const isDate = title.match(/^[\d.\-\s~]+$/);

            if (title.length > 2 && !title.match(/^\d{4}/) && !isHeader && !isDate) {
                // Extract Description (Text between this match and the next match)
                const startDescIndex = match.index + match[0].length;
                const nextMatch = numberedListProjects[index + 1];
                const endDescIndex = nextMatch ? nextMatch.index : targetText.length;

                let desc = targetText.slice(startDescIndex, endDescIndex).trim();

                // Extract duration from description if not found in title
                if (!duration) {
                    const durationPatterns = [
                        /(?:기간|period|duration)\s*[:：]?\s*([\d.\/-]+\s*[-~]\s*[\d.\/-]+|\d+\s*개월|\d+\s*months?)/i,
                        /(\d{4}[.\/-]\d{1,2}\s*[-~]\s*\d{4}[.\/-]\d{1,2})/,
                        /(\d{4}[.\/-]\d{1,2}\s*[-~]\s*(?:현재|present|진행중))/i,
                        /(\d+\s*개월)/,
                        /(\d+\s*months?)/i
                    ];

                    for (const pattern of durationPatterns) {
                        const durationMatch = desc.match(pattern);
                        if (durationMatch) {
                            duration = durationMatch[1].trim();
                            // Remove the matched duration text from description
                            desc = desc.replace(durationMatch[0], '').trim();
                            break;
                        }
                    }
                }

                // Remove trailing month count in parentheses (e.g., "(6개월)", "(3 months)")
                desc = desc.replace(/\s*\(\s*\d+\s*개월\s*\)/gi, '').replace(/\s*\(\s*\d+\s*months?\s*\)/gi, '');

                // Content Cleaning: Remove bullets and labels
                desc = desc
                    .replace(/^(■|-|●|\*)\s*/gm, '') // Remove bullets
                    .replace(/(?:내용|상세\s?활동|기간|비고|역할)[:]/g, '') // Remove labels
                    .replace(/\s+/g, ' ') // Collapse formatting to clean paragraph
                    .trim();

                // Merge inline description (from title line) with body description
                if (inlineDesc) {
                    desc = inlineDesc + (desc ? ' ' + desc : '');
                }

                // If description is empty or looks like just dates, add safe fallback
                if (desc.length < 5) desc = '프로젝트에 대한 설명이 이력서에 상세히 명시되지 않았습니다.';

                projectMatches.push({
                    title: title,
                    desc: desc.slice(0, 300), // Limit length for UI safety
                    duration: duration
                });
            }
        });

        // Priority 2: Work Experience Section Parsing (NEW)
        if (projectMatches.length < 6) {
            console.log('[Regex] Extracting Work Experience');
            const workExpMatch = resumeText.match(/(?:Work Experience|경력|Career)([\s\S]{0,2000}?)(?:Education|학력|Skill|기술|Core Competencies|$)/i);
            if (workExpMatch) {
                const workText = workExpMatch[1];
                const datePattern = /(\d{4}\.\d{2}\s*-\s*(?:Present|\d{4}\.\d{2}))[\s\S]{0,100}?\n([^\n]+)\n([^\n]+)/g;
                const entries = [...workText.matchAll(datePattern)];
                console.log(`[Regex] Found ${entries.length} work entries`);
                entries.forEach((m, i) => {
                    if (projectMatches.length >= 6) return;
                    const company = m[2].replace(/\([^)]+\)/, '').trim();
                    const position = m[3].trim();
                    if (company.match(/^\(\d+/) || position.match(/^\(\d+/)) return;
                    const title = `${company} - ${position}`;
                    const startIdx = m.index + m[0].length;
                    const endIdx = entries[i + 1] ? entries[i + 1].index : workText.length;
                    let desc = workText.slice(startIdx, endIdx).trim();
                    const bullets = desc.match(/[•●\-]\s*([^\n]+)/g);
                    desc = bullets ? bullets.map(b => b.replace(/^[•●\-]\s*/, '').trim()).join(' | ').slice(0, 200) : desc.slice(0, 200);
                    if (title.length > 5) projectMatches.push({ title: title.slice(0, 80), desc: desc || '업무 경험' });
                });
            }
        }

        // Priority 3: Bullet points with description ("- Title (Info): Desc")
        if (projectMatches.length === 0) {
            const bulletProjects = [...resumeText.matchAll(/[-•]\s*([A-Za-z가-힣0-9\s]+)\s*\(([^)]+)\):\s*([^\n]+)/g)];
            bulletProjects.forEach(match => {
                projectMatches.push({
                    title: match[1].trim(),
                    desc: `${match[2]} - ${match[3]}`.slice(0, 100)
                });
            });
        }

        // Priority 3: Simple "Project:" lines
        if (projectMatches.length === 0) {
            const simpleProjects = [...resumeText.matchAll(/프로젝트[:\s]*([^\n]{10,50})/g)];
            simpleProjects.forEach(match => {
                projectMatches.push({
                    title: match[1].trim(),
                    desc: '프로젝트를 성공적으로 완수했습니다.'
                });
            });
        }

        // Priority 4: "Projects" Section Parsing
        if (projectMatches.length === 0) {
            const projectSection = resumeText.match(/(?:\[?\s*(?:주요)?\s*(?:프로젝트|Projects?|경험|Experience)\s*\]?)\s*[:\n]([\s\S]{50,1000})/i);
            if (projectSection) {
                const lines = projectSection[1].split('\n').filter(line => line.trim().length > 10);
                lines.forEach((line) => {
                    const cleaned = line.trim().replace(/^[-•*\d.()\s]+/, '');
                    if (cleaned.length > 5) {
                        projectMatches.push({
                            title: cleaned.slice(0, 50),
                            desc: '프로젝트 경험'
                        });
                    }
                });
            }
        }

        // Helper to extract section content
        const extractSection = (headers) => {
            // Sort headers by length descending to match longest first (e.g. "자기소개서" before "자기소개")
            const sortedHeaders = [...headers].sort((a, b) => b.length - a.length);
            const headerPattern = sortedHeaders.join('|');

            // Match header line: e.g. "● [자기소개서]" or "■ 경력" or "자기소개"
            // Ensure we match the closing bracket/char if present
            const regex = new RegExp(`(?:^|\\n)(?:[\\s\\t]*[●■\\*\\[\\-]*\\s*)?(?:${headerPattern})(?:[\\s\\t]*[\\]\\)\\:]*)`, 'i');
            const match = resumeText.match(regex);

            if (!match) return null;

            const startIdx = match.index + match[0].length;
            const rest = resumeText.slice(startIdx);

            // Stop at next major section (Heading style)
            // Looking for lines starting with "●", "[", or "■" followed by text
            const nextSectionMatch = rest.match(/(?:^|\n)\s*[●\[■]/);

            let content = nextSectionMatch ? rest.slice(0, nextSectionMatch.index) : rest;
            return content.replace(/^\s*[:\-]\s*/, '').trim(); // Remove leading colon/dash
        };

        const introHeaders = ['자기소개서', '자기소개', 'Self Introduction', 'Intro', 'About Me', '소개', '인사말'];
        const careerHeaders = ['경력 기술서', '경력', 'Work Experience', 'Career', 'Experience', '이력', '업무 경험'];

        let extractedIntro = extractSection(introHeaders);
        let extractedCareer = extractSection(careerHeaders);

        // Fallbacks if extraction fails
        if (!extractedIntro) {
            extractedIntro = skills.length > 0
                ? `${skills.slice(0, 3).join(', ')} 등의 기술을 보유한 ${nameMatch ? nameMatch[1] : '열정적인'} 개발자입니다.`
                : (resumeText.slice(0, 50) + '...');
        }

        if (!extractedCareer) {
            extractedCareer = resumeText.length > 100 ? resumeText.slice(0, 150) + '...' : '신입 개발자로서의 첫 걸음을 준비하고 있습니다.';
        }

        // Clean up newlines for summary fields
        extractedIntro = extractedIntro.replace(/\s+/g, ' ').slice(0, 500);
        extractedCareer = extractedCareer.replace(/\s+/g, ' ').slice(0, 1000);

        const result = {
            name: nameMatch ? nameMatch[1] : null,
            email: emailMatch ? emailMatch[1] : null,
            phone: phoneMatch ? phoneMatch[1].replace(/\s/g, '-') : null,
            github: githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : null,
            intro: extractedIntro,
            link: githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '',
            career_summary: extractedCareer,
            // Return projects as array (no limit)
            projects: projectMatches.map((proj, idx) => ({
                id: idx + 1,
                title: proj.title,
                desc: proj.desc,
                duration: proj.duration || null
            })),
            // Keep old format for backward compatibility
            project1_title: projectMatches[0] ? projectMatches[0].title : '',
            project1_desc: projectMatches[0] ? projectMatches[0].desc : '',
            project1_link: '',
            project2_title: projectMatches[1] ? projectMatches[1].title : '',
            project2_desc: projectMatches[1] ? projectMatches[1].desc : '',
            project2_link: '',
            project3_title: projectMatches[2] ? projectMatches[2].title : '',
            project3_desc: projectMatches[2] ? projectMatches[2].desc : '',
            project3_link: '',
            skills: skills,
            original: resumeText
        };

        // Infer job type from skills
        const designKeywords = ['Figma', 'Photoshop', 'Illustrator', 'Sketch', 'XD'];
        const devKeywords = ['React', 'JavaScript', 'Python', 'Java', 'Node.js'];
        const marketingKeywords = ['GA', 'Analytics', 'SEO', 'Marketing'];

        const hasDesign = skills.some(s => designKeywords.some(k => s.includes(k)));
        const hasDev = skills.some(s => devKeywords.some(k => s.includes(k)));
        const hasMarketing = skills.some(s => marketingKeywords.some(k => s.includes(k)));

        let inferredJob = 'developer';
        if (hasDesign) inferredJob = 'designer';
        else if (hasMarketing) inferredJob = 'marketer';
        else if (hasDev) inferredJob = 'developer';

        // Separate numbered projects from work experience
        const numberedProjects = projectMatches.filter(p => !p.title.includes(' - '));
        const workExpProjects = projectMatches.filter(p => p.title.includes(' - '));

        // Reorder based on job type
        let finalProjects = [];
        if (inferredJob === 'developer' || inferredJob === 'designer') {
            // Developers/Designers: Projects first, then work experience
            finalProjects = [...numberedProjects, ...workExpProjects].slice(0, 6);
        } else {
            // Marketers/Service: Work experience first, then projects
            finalProjects = [...workExpProjects, ...numberedProjects].slice(0, 6);
        }

        console.log(`[Job Inference] ${inferredJob} - Reordered ${finalProjects.length} projects`);

        // Update result with reordered projects
        result.projects = finalProjects.map((proj, idx) => ({
            id: idx + 1,
            title: proj.title,
            desc: proj.desc,
            duration: proj.duration || null
        }));

        // Update backward compatibility fields
        result.project1_title = finalProjects[0] ? finalProjects[0].title : '';
        result.project1_desc = finalProjects[0] ? finalProjects[0].desc : '';
        result.project2_title = finalProjects[1] ? finalProjects[1].title : '';
        result.project2_desc = finalProjects[1] ? finalProjects[1].desc : '';
        result.project3_title = finalProjects[2] ? finalProjects[2].title : '';
        result.project3_desc = finalProjects[2] ? finalProjects[2].desc : '';

        return res.status(200).json(result);

    } catch (error) {
        console.error('Resume Analysis Error:', error.message);

        return res.status(500).json({
            error: '이력서 분석 중 오류가 발생했습니다.',
            details: error.message
        });
    }
}
