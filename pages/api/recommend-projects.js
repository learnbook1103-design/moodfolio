// AI-powered project recommendation endpoint
// Analyzes user's projects and recommends the 6 most relevant ones for a given job role

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { projects, jobType } = req.body;

        if (!projects || !Array.isArray(projects)) {
            return res.status(400).json({ error: 'Projects array is required' });
        }

        if (!jobType) {
            return res.status(400).json({ error: 'Job type is required' });
        }

        // Job-specific keywords for scoring
        const jobKeywords = {
            developer: [
                'react', 'vue', 'angular', 'node', 'python', 'java', 'api', 'backend', 'frontend',
                'database', 'sql', 'mongodb', 'typescript', 'javascript', 'aws', 'docker', 'kubernetes',
                '개발', '구현', '최적화', '성능', '알고리즘', '아키텍처', '배포'
            ],
            designer: [
                'figma', 'sketch', 'adobe', 'ui', 'ux', 'design', 'prototype', 'wireframe', 'branding',
                'visual', 'typography', 'color', 'layout', 'responsive', 'mobile', 'web',
                '디자인', '사용자', '경험', '인터페이스', '프로토타입', '브랜딩', '비주얼'
            ],
            marketer: [
                'marketing', 'campaign', 'analytics', 'ga4', 'seo', 'sem', 'social', 'content',
                'conversion', 'roi', 'ctr', 'engagement', 'funnel', 'growth', 'retention',
                '마케팅', '캠페인', '분석', '성과', '전환', '유입', '광고', '콘텐츠'
            ],
            service: [
                'planning', 'strategy', 'roadmap', 'requirements', 'stakeholder', 'agile', 'scrum',
                'jira', 'notion', 'documentation', 'process', 'workflow', 'coordination', 'analysis',
                '기획', '전략', '요구사항', '분석', '프로세스', '협업', '문서화', '로드맵'
            ]
        };

        const keywords = jobKeywords[jobType] || jobKeywords.developer;

        // Score each project based on keyword matches
        const scoredProjects = projects.map((project, index) => {
            const text = `${project.title || ''} ${project.desc || ''} ${project.description || ''}`.toLowerCase();

            let score = 0;
            keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    score += matches.length;
                }
            });

            // Bonus points for having images (more complete projects)
            if (project.image || project.file) {
                score += 2;
            }

            // Bonus for longer descriptions (more detailed projects)
            const descLength = (project.desc || project.description || '').length;
            if (descLength > 100) score += 1;
            if (descLength > 300) score += 1;

            return {
                index,
                project,
                score,
                matchedKeywords: keywords.filter(k => text.includes(k))
            };
        });

        // Sort by score (descending) and take top 6
        const topProjects = scoredProjects
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        // Return indices and metadata
        const recommendations = {
            featuredProjectIds: topProjects.map(p => p.index),
            details: topProjects.map(p => ({
                index: p.index,
                title: p.project.title,
                score: p.score,
                matchedKeywords: p.matchedKeywords.slice(0, 5) // Top 5 matched keywords
            })),
            totalProjects: projects.length,
            jobType
        };

        console.log(`[AI Recommend] ${jobType}: Selected projects ${recommendations.featuredProjectIds.join(', ')}`);

        return res.status(200).json(recommendations);

    } catch (error) {
        console.error('[AI Recommend] Error:', error);
        return res.status(500).json({ error: 'Failed to generate recommendations' });
    }
}
