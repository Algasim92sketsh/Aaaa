import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  text: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ text, size = 180, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(
        canvasRef.current,
        text,
        {
          width: size,
          margin: 1.5,
          color: {
            dark: '#0e1726',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [text, size]);

  return (
    <div className={`flex flex-col items-center justify-center p-2 bg-white rounded-2xl shadow-md ${className}`}>
      <canvas ref={canvasRef} className="rounded-xl" />
    </div>
  );
};
