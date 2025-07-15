
export async function addWatermark(imageUrl: string, watermarkText: string): Promise<string> {
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

      // Enhanced watermark style for better visibility
      const fontSize = Math.max(24, Math.floor(canvas.width / 30));
      ctx.font = `700 ${fontSize}px Lora, serif`; // Bolder font
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Slightly less transparent
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; // Stronger shadow
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotate the watermark for a more professional look
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-0.349); // ~20 degrees rotation
      ctx.fillText(watermarkText, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = (err) => {
      console.error("Image loading failed for watermarking", err);
      reject(new Error("Image failed to load for watermarking."));
    };
    img.src = imageUrl;
  });
}
