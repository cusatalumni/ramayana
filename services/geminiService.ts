
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

export async function generateRamayanaPost(): Promise<{ sanskrit_sloka: string; malayalam_transliteration: string; malayalam_meaning: string; english_meaning: string; imageUrl: string; }> {
  // Call our new serverless API endpoint instead of using the Gemini SDK on the client
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: "An unknown server error occurred." }}));
    throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  const { sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, rawImageUrl } = data;
  
  // The watermarking is still done on the client-side for performance
  const imageUrl = await addWatermark(rawImageUrl, "www.annapoornainfo.com");
  
  if (!sanskrit_sloka || !malayalam_transliteration || !malayalam_meaning || !english_meaning || !imageUrl) {
    throw new Error("Failed to generate complete post data from the server response.");
  }

  return { sanskrit_sloka, malayalam_transliteration, malayalam_meaning, english_meaning, imageUrl };
}