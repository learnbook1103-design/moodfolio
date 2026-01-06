// pages/api/parse-resume.js
// 서버 측 파일 파싱 API (DOCX, PDF 지원) - Enhanced with project detection

import formidable from 'formidable';
import fs from 'fs';
import mammoth from 'mammoth';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper: Detect if text contains project-related keywords
function isProjectSection(text) {
    const keywords = [
        // Korean
        '프로젝트', '경력', '포트폴리오', '주요 업무', '개발 경험', '작업 경험',
        // English
        'project', 'experience', 'portfolio', 'work', 'development'
    ];

    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
}

// Helper: Parse HTML structure to extract projects with images
function parseProjectsFromHTML(html) {
    const projects = [];

    // Split by heading tags (h1, h2, h3, etc.)
    const sections = html.split(/<h[1-6][^>]*>/i);

    let currentProject = null;

    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];

        // Extract heading text
        const headingMatch = section.match(/^([^<]+)</);
        const heading = headingMatch ? headingMatch[1].trim() : '';

        // Check if this is a project section
        if (isProjectSection(heading)) {
            // Save previous project if exists
            if (currentProject) {
                projects.push(currentProject);
            }

            // Start new project
            currentProject = {
                title: heading,
                description: '',
                images: [],
                confidence: 0.8 // High confidence for keyword-matched sections
            };
        }

        // Extract content until next heading
        const contentMatch = section.match(/<\/h[1-6]>(.+?)(?=<h[1-6]|$)/is);
        const content = contentMatch ? contentMatch[1] : section;

        // Extract images from this section
        const imgRegex = /<img[^>]+src="(data:image\/[^"]+)"/g;
        let imgMatch;
        const sectionImages = [];

        while ((imgMatch = imgRegex.exec(content)) !== null) {
            sectionImages.push(imgMatch[1]);
        }

        // Extract text (remove HTML tags)
        const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        if (currentProject) {
            currentProject.description += text + ' ';
            currentProject.images.push(...sectionImages);
        }
    }

    // Add last project
    if (currentProject) {
        projects.push(currentProject);
    }

    return projects;
}

// Fallback: Sequential assignment if no projects detected
function fallbackSequentialAssignment(images, projectCount = 3) {
    const projects = [];
    const imagesPerProject = Math.ceil(images.length / projectCount);

    for (let i = 0; i < projectCount; i++) {
        const start = i * imagesPerProject;
        const end = Math.min(start + imagesPerProject, images.length);

        projects.push({
            title: `프로젝트 ${i + 1}`,
            description: '',
            images: images.slice(start, end),
            confidence: 0.5 // Medium confidence for fallback
        });
    }

    return projects.filter(p => p.images.length > 0);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({
            maxFileSize: 10 * 1024 * 1024, // 10MB
            keepExtensions: true,
        });

        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const file = files.file?.[0] || files.file;
        if (!file) {
            return res.status(400).json({ error: '파일이 없습니다.' });
        }

        console.log('Processing file:', file.originalFilename, 'Type:', file.mimetype);

        let extractedText = '';
        let extractedImages = [];
        let projects = [];

        // DOCX 파일만 처리
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.originalFilename?.endsWith('.docx')) {
            // Convert to HTML with embedded images as base64
            const result = await mammoth.convertToHtml({
                path: file.filepath,
                convertImage: mammoth.images.imgElement(function (image) {
                    return image.read("base64").then(function (imageBuffer) {
                        return {
                            src: "data:" + image.contentType + ";base64," + imageBuffer
                        };
                    });
                })
            });

            const html = result.value;
            console.log('DOCX converted to HTML, length:', html.length);

            // Extract plain text from HTML (preserve newlines for block elements)
            extractedText = html
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n')
                .replace(/<\/div>/gi, '\n')
                .replace(/<\/li>/gi, '\n')
                .replace(/<\/h[1-6]>/gi, '\n')
                .replace(/<[^>]+>/g, ' ') // Replace other tags with space
                .replace(/&nbsp;/g, ' ')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/\n\s*\n/g, '\n') // Collapse multiple newlines
                .trim();

            // Extract all image data URLs from HTML
            const imgRegex = /<img[^>]+src="(data:image\/[^"]+)"/g;
            let match;
            while ((match = imgRegex.exec(html)) !== null) {
                extractedImages.push(match[1]);
            }

            // Parse projects from HTML structure
            projects = parseProjectsFromHTML(html);

            // Fallback if no projects detected
            if (projects.length === 0 && extractedImages.length > 0) {
                console.log('No project sections detected, skipping sequential fallback to allow text analysis to take over');
                // projects = fallbackSequentialAssignment(extractedImages);
            }

            console.log('DOCX parsed - text:', extractedText.length, 'chars, images:', extractedImages.length, 'projects:', projects.length);
        }
        // PDF 파일 처리
        else if (file.mimetype === 'application/pdf' || file.originalFilename?.endsWith('.pdf')) {
            console.log('Processing PDF file...');
            try {
                // pdf-parse 모듈 로드
                let pdfParse;
                try {
                    // CommonJS require 시도
                    const pdfModule = require('pdf-parse');
                    console.log('pdf-parse module type:', typeof pdfModule);
                    console.log('pdf-parse module keys:', Object.keys(pdfModule).slice(0, 5));

                    // pdf-parse가 함수인 경우 직접 사용
                    if (typeof pdfModule === 'function') {
                        pdfParse = pdfModule;
                    }
                    // pdf-parse가 객체인 경우 PDFParse 클래스 사용
                    else if (pdfModule.PDFParse) {
                        // PDFParse를 함수처럼 사용 (static method일 수 있음)
                        pdfParse = pdfModule.PDFParse;
                    }
                    else {
                        throw new Error('pdf-parse 모듈을 로드할 수 없습니다.');
                    }
                } catch (importError) {
                    console.error('pdf-parse import error:', importError);
                    throw new Error(`PDF 파싱 라이브러리 로드 실패: ${importError.message}`);
                }

                const dataBuffer = fs.readFileSync(file.filepath);
                console.log('PDF buffer size:', dataBuffer.length, 'bytes');

                const pdfData = await pdfParse(dataBuffer);
                console.log('PDF data:', {
                    numpages: pdfData.numpages,
                    numrender: pdfData.numrender,
                    info: pdfData.info,
                    metadata: pdfData.metadata,
                    textLength: pdfData.text?.length || 0
                });

                extractedText = pdfData.text.trim();
                // PDF는 이미지 추출을 지원하지 않음
                extractedImages = [];
                projects = [];

                console.log('PDF parsed successfully - text:', extractedText.length, 'chars');
                console.log('First 200 chars:', extractedText.substring(0, 200));
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                fs.unlinkSync(file.filepath);
                return res.status(500).json({
                    error: 'PDF 파일 파싱 중 오류가 발생했습니다.',
                    details: pdfError.message
                });
            }
        }
        else {
            fs.unlinkSync(file.filepath);
            return res.status(400).json({ error: `지원하지 않는 파일 형식입니다. DOCX 또는 PDF 파일만 지원합니다.` });
        }

        // 임시 파일 삭제
        fs.unlinkSync(file.filepath);

        if (!extractedText || extractedText.trim().length === 0) {
            const fileType = file.originalFilename?.endsWith('.pdf') ? 'PDF' : 'DOCX';
            return res.status(400).json({
                error: `${fileType} 파일에서 텍스트를 추출할 수 없습니다.`,
                suggestion: fileType === 'PDF'
                    ? 'PDF가 이미지로만 구성되어 있거나 텍스트 레이어가 없을 수 있습니다. 텍스트가 포함된 PDF를 사용하거나 DOCX 형식으로 변환해주세요.'
                    : '파일이 비어있거나 읽을 수 없습니다. 다른 파일을 시도해주세요.'
            });
        }

        return res.status(200).json({
            text: extractedText,
            images: extractedImages, // All images (backward compatibility)
            projects: projects // Structured project data with matched images
        });

    } catch (error) {
        console.error('File parsing error:', error);
        return res.status(500).json({
            error: '파일 파싱 중 오류가 발생했습니다.',
            details: error.message
        });
    }
}
