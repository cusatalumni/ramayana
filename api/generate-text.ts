import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

const slokaAndPromptSchema = {
    type: Type.OBJECT,
    properties: {
        sanskrit_sloka: { type: Type.STRING, description: "An original four-line sloka from the Ramayana in Sanskrit (Devanagari script)." },
        malayalam_transliteration: { type: Type.STRING, description: "The transliteration of the above Sanskrit sloka in Malayalam script." },
        malayalam_meaning: { type: Type.STRING, description: "The meaning of the sloka in Malayalam." },
        english_meaning: { type: Type.STRING, description: "The meaning of the sloka in English." },
        visual_prompt: { type: Type.STRING, description: "A detailed, vivid, artistic description for an image generator to create a picture that visually represents the sloka's theme, mood, and characters." },
    },
    required: ["sanskrit_sloka", "malayalam_transliteration", "malayalam_meaning", "english_meaning", "visual_prompt"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return res.status(500).json({ message: "Server configuration error: API key is missing." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        console.log("Generating text content...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate an original four-line sloka from the Ramayana, along with its translations and a creative visual prompt for an image generator.",
            config: {
                systemInstruction: "You are an expert on the Ramayana. Your task is to generate a four-line Sanskrit sloka, provide its Malayalam transliteration and meaning, its English meaning, and a creative visual prompt. You must respond strictly in the provided JSON schema format.",
                responseMimeType: "application/json",
                responseSchema: slokaAndPromptSchema,
            },
        });

        const textData = JSON.parse(response.text);
        console.log("Text content generated successfully.");
        return res.status(200).json(textData);

    } catch (error) {
        console.error("Error in /api/generate-text:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return res.status(500).json({ message: `Failed to generate text: ${errorMessage}` });
    }
}
