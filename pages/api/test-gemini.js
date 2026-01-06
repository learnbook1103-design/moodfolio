// pages/api/test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'No API key' });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Say hello in JSON format: {\"message\": \"your message\"}");
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({
            success: true,
            geminiResponse: text
        });
    } catch (error) {
        console.error('Test Gemini Error:', error);
        return res.status(500).json({
            error: error.message,
            name: error.name,
            stack: error.stack
        });
    }
}
