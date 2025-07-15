import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const { visual_prompt } = req.body;

    if (!visual_prompt) {
        return res.status(400).json({ message: "Missing 'visual_prompt' in the request body." });
    }

    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return res.status(500).json({ message: "Server configuration error: API key is missing." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        console.log("Generating image with prompt:", visual_prompt);
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `Epic, cinematic, high detail photo of: ${visual_prompt}. The style should be reminiscent of classical Indian art, with rich colors and dramatic lighting.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (!base64ImageBytes) {
            throw new Error("Image generation failed to produce an image.");
        }
        
        const rawImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        console.log("Image generated successfully.");
        
        return res.status(200).json({ rawImageUrl });

    } catch (error) {
        console.error("Error in /api/generate-image:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return res.status(500).json({ message: `Failed to generate image: ${errorMessage}` });
    }
}
