export const drawMemeToCanvas = (
  canvas: HTMLCanvasElement,
  imageUrl: string,
  topText: string,
  bottomText: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw Image
      ctx.drawImage(img, 0, 0);

      // Configure Text Styles
      const fontSize = Math.floor(canvas.height * 0.1); // Dynamic font size based on height
      ctx.font = `900 ${fontSize}px "Anton", "Impact", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = Math.floor(fontSize / 8);
      ctx.lineJoin = 'round';
      ctx.textBaseline = 'top';

      // Draw Top Text
      // Split long text if necessary (basic wrapping)
      drawText(ctx, topText, canvas.width / 2, fontSize * 0.5, canvas.width * 0.9, fontSize);

      // Draw Bottom Text
      ctx.textBaseline = 'bottom';
      drawText(ctx, bottomText, canvas.width / 2, canvas.height - (fontSize * 0.5), canvas.width * 0.9, fontSize);

      resolve();
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
};

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const words = text.toUpperCase().split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // If baseline is bottom, we need to draw lines upwards
  if (ctx.textBaseline === 'bottom') {
    lines.reverse();
    for (let i = 0; i < lines.length; i++) {
        const lineY = y - (i * lineHeight);
        ctx.strokeText(lines[i], x, lineY);
        ctx.fillText(lines[i], x, lineY);
    }
  } else {
    for (let i = 0; i < lines.length; i++) {
        const lineY = y + (i * lineHeight);
        ctx.strokeText(lines[i], x, lineY);
        ctx.fillText(lines[i], x, lineY);
    }
  }
};

export const downloadMeme = async (
  imageUrl: string,
  topText: string,
  bottomText: string,
  fileName: string = 'dev-meme.png'
) => {
  const canvas = document.createElement('canvas');
  await drawMemeToCanvas(canvas, imageUrl, topText, bottomText);
  
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};