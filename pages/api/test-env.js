// pages/api/test-env.js
export default function handler(req, res) {
    const hasKey = !!process.env.GEMINI_API_KEY;
    const keyPreview = process.env.GEMINI_API_KEY ?
        process.env.GEMINI_API_KEY.substring(0, 10) + '...' :
        'NOT_FOUND';

    res.status(200).json({
        hasKey,
        keyPreview,
        nodeEnv: process.env.NODE_ENV
    });
}
