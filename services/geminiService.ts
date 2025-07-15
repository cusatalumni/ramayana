
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const slokaAndPromptSchema = {
  type: Type.OBJECT,
  properties: {
    sanskrit_sloka: {
      type: Type.STRING,
      description: "An original four-line sloka from the Ramayana in Sanskrit (Devanagari script).",
    },
    malayalam_transliteration: {
        type: Type.STRING,
        description: "The transliteration of the above Sanskrit sloka in Malayalam script."
    },
    malayalam_meaning: {
        type: Type.STRING,
        description: "The meaning of the sloka in Malayalam."
    },
    english_meaning: {
      type: Type.STRING,
      description: "The meaning of the sloka in English.",
    },
    visual_prompt: {
      type: Type.STRING,
      description: "A detailed, vivid, and artistic description for an image generator to create a picture that visually represents the sloka's theme and mood. Describe characters, setting, colors, and style (e.g., 'divine digital painting', 'epic art style', 'serene landscape').",
    },
  },
  required: ["sanskrit_sloka", "malayalam_transliteration", "malayalam_meaning", "english_meaning", "visual_prompt"],
};

async function generateSlokaAndImagePrompt(): Promise<{ sanskrit_sloka: string; malayalam_transliteration: string; malayalam_meaning: string; english_meaning: string; visual_prompt: string; }> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Generate an original four-line sloka from the epic Ramayana. Provide the sloka in Sanskrit (Devanagari script), its transliteration in Malayalam script, its meaning in Malayalam, and its meaning in English. Also create a visual prompt for an AI image generator to illustrate this sloka's theme. Return only the JSON object.",
    config: {
      responseMimeType: "application/json",
      responseSchema: slokaAndPromptSchema,
    },
  });

  const jsonText = response.text.trim();
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse JSON from sloka generation:", jsonText);
    throw new Error("Could not parse the response from the text model.");
  }
}

async function addWatermark(imageUrl: string, watermarkText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error("Could not get canvas context"));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(24, Math.floor(canvas.width / 25));
      ctx.font = `bold ${fontSize}px Lora, serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = (err) => {
      console.error("Image loading failed for watermarking", err);
      reject(new Error("Image failed to load for watermarking."));
    };
    img.src = imageUrl;
  });
}

async function generateImageFromPrompt(prompt: string): Promise<string> {
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: `${prompt}, 8k, high detail, cinematic lighting, epic`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
  
  throw new Error("Image generation failed or produced no images.");
}

export async function generateRamayanaPost(): Promise<{ sanskrit_sloka: string; malayalam_transliteration: string; malayalam_meaning: string; english_meaning: string; imageUrl: string; }> {
  const { sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, visual_prompt } = await generateSlokaAndImagePrompt();
  const rawImageUrl = await generateImageFromPrompt(visual_prompt);
  const imageUrl = await addWatermark(rawImageUrl, "www.annapoornainfo.com");
  
  if (!sanskrit_sloka || !malayalam_transliteration || !malayalam_meaning || !english_meaning || !imageUrl) {
    throw new Error("Failed to generate complete post data.");
  }

  return { sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, imageUrl };
}
