
import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This function is the serverless function handler
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (!process.env.API_KEY) {
    return response.status(500).json({ error: "API_KEY environment variable not set on the server." });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const verseAndPromptSchema = {
    type: Type.OBJECT,
    properties: {
      sanskrit_sloka: {
        type: Type.STRING,
        description: "A 4-line sloka from the Ramayana in original Devanagari Sanskrit script. The lines should be separated by newline characters.",
      },
      malayalam_translation: {
          type: Type.STRING,
          description: "The faithful Malayalam translation of the Sanskrit sloka, in Malayalam script."
      },
      english_translation: {
          type: Type.STRING,
          description: "The faithful English translation of the Sanskrit sloka."
      },
      visual_prompt: {
        type: Type.STRING,
        description: "A detailed, vivid, and artistic description for an image generator to create a picture that visually represents the sloka's theme and mood. Describe characters, setting, colors, and style (e.g., 'divine digital painting', 'epic art style', 'serene landscape').",
      },
    },
    required: ["sanskrit_sloka", "malayalam_translation", "english_translation", "visual_prompt"],
  };
  
  try {
    // 1. Generate the text and the image prompt
    const verseResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a 4-line sloka from the epic Ramayana. Provide the original sloka in Devanagari Sanskrit script. Also provide its translation in Malayalam script, and a separate English translation. Finally, create a visual prompt for an AI image generator to illustrate this sloka. Return only the JSON object.",
      config: {
        responseMimeType: "application/json",
        responseSchema: verseAndPromptSchema,
      },
    });

    const jsonText = verseResponse.text.trim();
    const verseData = JSON.parse(jsonText);

    // 2. Generate the image from the prompt
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `${verseData.visual_prompt}, 8k, high detail, cinematic lighting, epic`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
    const baseImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    // 3. Send all the data to the client
    response.status(200).json({
      sanskrit_sloka: verseData.sanskrit_sloka,
      malayalam_translation: verseData.malayalam_translation,
      english_translation: verseData.english_translation,
      baseImageUrl: baseImageUrl,
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Failed to generate content from the API.' });
  }
}
