// pages/api/simple-test.js
export default async function handler(req, res) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Say hello in one word" }] }]
                })
            }
        );

        const text = await response.text();

        return res.status(response.status).json({
            status: response.status,
            ok: response.ok,
            response: text
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
