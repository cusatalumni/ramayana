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
        console.log("Step 1: Generating sloka and visual prompt...");
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
            contents: "Generate an original four-line sloka from the Ramayana, along with its translations and a visual prompt.",
            config: {
                systemInstruction: "You are an expert on the Ramayana. Your task is to generate a four-line Sanskrit sloka, provide its Malayalam transliteration and meaning, its English meaning, and a creative visual prompt for an image generator. You must respond strictly in the provided JSON schema format.",
                responseMimeType: "application/json",
                responseSchema: slokaAndPromptSchema,
            },
        });

        let slokaData;
        try {
            slokaData = JSON.parse(slokaResponse.text);
        } catch (e) {
            console.error("Failed to parse JSON from sloka generation:", slokaResponse.text);
            throw new Error("The model did not return valid JSON for the sloka data.");
        }
        console.log("Step 1 SUCCESS. Visual prompt received.");


        // Step 2: Generate Image from Prompt
        console.log("Step 2: Generating image...");
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `cinematic photo, epic, high detail of: ${slokaData.visual_prompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (!imageResponse.generatedImages?.[0]?.image?.imageBytes) {
            throw new Error("Image generation failed or produced no images.");
        }
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        const rawImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        console.log("Step 2 SUCCESS. Image generated.");
        
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
        console.error("Full error in /api/generate:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        res.status(500).json({ error: { message: `An error occurred during post generation: ${errorMessage}` } });
    }
}