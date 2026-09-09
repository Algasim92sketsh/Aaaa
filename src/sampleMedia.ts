/**
 * PureDrop - Lossless Encrypted Media Transfer
 * Sample High-Resolution Lossless Media Generator
 * For 1-click testing of pristine quality and bit-for-bit SHA-256 verification
 */

export interface SampleMediaItem {
  id: string;
  name: string;
  category: 'image' | 'video' | 'raw';
  descriptionAr: string;
  descriptionEn: string;
  sizeEstimate: string;
  resolution: string;
  generateFile: () => Promise<File>;
}

export async function createSample4KImage(name = 'PureDrop_Studio_4K_Lossless.png'): Promise<File> {
  const canvas = document.createElement('canvas');
  // High-res canvas (2560x1440 QHD / 4K simulation)
  canvas.width = 2560;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d')!;

  // 1. Rich dark gradient background
  const bgGrad = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    100,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.7
  );
  bgGrad.addColorStop(0, '#091528');
  bgGrad.addColorStop(0.5, '#040914');
  bgGrad.addColorStop(1, '#02040a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. High frequency grid & calibration bars (to prove zero compression artifacts)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 3. Spectral color calibration band (shows color gamut retention)
  const colorBands = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
  const bandWidth = canvas.width / colorBands.length;
  for (let i = 0; i < colorBands.length; i++) {
    const bandGrad = ctx.createLinearGradient(i * bandWidth, 0, (i + 1) * bandWidth, 0);
    bandGrad.addColorStop(0, colorBands[i]);
    bandGrad.addColorStop(1, colorBands[(i + 1) % colorBands.length]);
    ctx.fillStyle = bandGrad;
    ctx.fillRect(i * bandWidth, canvas.height - 80, bandWidth, 60);
  }

  // 4. Central decorative cryptographic badge
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2 - 60);
  
  // Outer glowing ring
  ctx.beginPath();
  ctx.arc(0, 0, 260, 0, Math.PI * 2);
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Subtle inner geometric ring
  ctx.beginPath();
  ctx.arc(0, 0, 230, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 12]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Title Typography
  ctx.font = 'bold 84px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('PureDrop Lossless 4K', 0, -20);

  ctx.font = '36px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Zero Compression • AES-256-GCM End-to-End Encrypted', 0, 40);

  ctx.font = '28px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`TIMESTAMP: ${new Date().toISOString()} • SHA-256 VERIFIED BITSTREAM`, 0, 100);

  ctx.restore();

  // Micro-details (to stress test compression algorithms: lossy JPEG would create ringing/macroblocking here)
  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 12; i++) {
    const text = `TEST-PIXEL-FREQUENCY-LINE-${i}: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
    ctx.fillText(text, 60, 120 + i * 26);
  }

  // Convert to lossless PNG blob (PNG is 100% lossless format)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], name, { type: 'image/png', lastModified: Date.now() }));
      }
    }, 'image/png');
  });
}

export async function createSampleMacroRawImage(): Promise<File> {
  return createSample4KImage('PureDrop_Macro_ProRAW_Lossless.png');
}
