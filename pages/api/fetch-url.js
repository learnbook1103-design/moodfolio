// pages/api/fetch-url.js
// URL에서 텍스트 추출 API

import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url || !url.trim()) {
        return res.status(400).json({ error: 'URL이 필요합니다.' });
    }

    try {
        console.log('Fetching URL:', url);

        // URL 유효성 검사
        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (e) {
            return res.status(400).json({ error: '유효하지 않은 URL입니다.' });
        }

        // 노션 페이지 확인
        const isNotion = validUrl.hostname.includes('notion.so') || validUrl.hostname.includes('notion.site');

        // HTML 가져오기
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            return res.status(400).json({ error: `페이지를 불러올 수 없습니다. (${response.status})` });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        let extractedText = '';

        if (isNotion) {
            // 노션 페이지 파싱
            // 노션은 주로 <div class="notion-page-content"> 안에 내용이 있음
            $('script, style, nav, header, footer').remove();

            // 본문 텍스트 추출
            const mainContent = $('.notion-page-content, [class*="notion"], main, article, body').first();
            extractedText = mainContent.text().trim();

            // 줄바꿈 정리
            extractedText = extractedText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');
        } else {
            // 일반 웹페이지 파싱
            $('script, style, nav, header, footer, iframe').remove();

            const mainContent = $('main, article, [role="main"], .content, #content, body').first();
            extractedText = mainContent.text().trim();

            extractedText = extractedText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');
        }

        if (!extractedText || extractedText.length < 50) {
            return res.status(400).json({
                error: '페이지에서 충분한 텍스트를 추출할 수 없습니다.',
                hint: '공개 페이지인지 확인하거나, 텍스트를 직접 복사해주세요.'
            });
        }

        console.log('Extracted text length:', extractedText.length);
        return res.status(200).json({ text: extractedText });

    } catch (error) {
        console.error('URL fetch error:', error);
        return res.status(500).json({
            error: 'URL에서 내용을 가져오는 중 오류가 발생했습니다.',
            details: error.message
        });
    }
}
