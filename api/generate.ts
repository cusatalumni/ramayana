
import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This function is the Vercel serverless handler.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests for this endpoint
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set on the server.");
        return res.status(500).json({ error: { message: "Server configuration error: The API key is missing." } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        // Step 1: Define schema and generate Sloka and Image Prompt
        const slokaAndPromptSchema = {
            type: Type.OBJECT,
            properties: {
                sanskrit_sloka: { type: Type.STRING, description: "An original four-line sloka from the Ramayana in Sanskrit (Devanagari script)." },
                malayalam_transliteration: { type: Type.STRING, description: "The transliteration of the above Sanskrit sloka in Malayalam script." },
                malayalam_meaning: { type: Type.STRING, description: "The meaning of the sloka in Malayalam." },
                english_meaning: { type: Type.STRING, description: "The meaning of the sloka in English." },
                visual_prompt: { type: Type.STRING, description: "A detailed, vivid, artistic description for an image generator to create a picture that visually represents the sloka's theme and mood." },
            },
            required: ["sanskrit_sloka", "malayalam_transliteration", "malayalam_meaning", "english_meaning", "visual_prompt"],
        };
        
        const slokaResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate an original four-line sloka from the epic Ramayana. Provide the sloka in Sanskrit (Devanagari script), its transliteration in Malayalam script, its meaning in Malayalam, and its meaning in English. Also create a visual prompt for an AI image generator to illustrate this sloka's theme. Return only the JSON object.",
            config: {
                responseMimeType: "application/json",
                responseSchema: slokaAndPromptSchema,
            },
        });

        const slokaData = JSON.parse(slokaResponse.text);

        // Step 2: Generate Image from Prompt
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `${slokaData.visual_prompt}, 8k, high detail, cinematic lighting, epic`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error("Image generation failed or produced no images.");
        }

        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        const rawImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        
        // Step 3: Combine and send the response to the client
        const postData = {
            sanskrit_sloka: slokaData.sanskrit_sloka,
            malayalam_transliteration: slokaData.malayalam_transliteration,
            malayalam_meaning: slokaData.malayalam_meaning,
            english_meaning: slokaData.english_meaning,
            rawImageUrl: rawImageUrl, // Send raw base64 image to client for watermarking
        };

        res.status(200).json(postData);

    } catch (error) {
        console.error("Error in /api/generate:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        res.status(500).json({ error: { message: `An error occurred while generating the post: ${errorMessage}` } });
    }
}
