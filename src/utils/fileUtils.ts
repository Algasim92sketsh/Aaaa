/**
 * PureDrop - Lossless Encrypted Media Transfer
 * File & Metadata Utilities (Lossless Bitstream & Format Inspector)
 */

import { FileMetadata } from '../types';
import { calculateFileSha256 } from './crypto';

export function formatBytes(bytes: number, includeExact = false): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  const mainStr = `${val} ${sizes[i]}`;
  
  if (includeExact && bytes > 1024) {
    return `${mainStr} (${bytes.toLocaleString()} بايت)`;
  }
  return mainStr;
}

export function formatSpeed(bytesPerSec: number): { mbps: string; mbPerSec: string } {
  const mbPerSecVal = bytesPerSec / (1024 * 1024);
  const mbpsVal = (bytesPerSec * 8) / (1000 * 1000);
  return {
    mbPerSec: `${mbPerSecVal.toFixed(2)} MB/s`,
    mbps: `${mbpsVal.toFixed(1)} Mbps`,
  };
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Infer correct MIME type for raw and high-res camera media if browser returns generic type
 */
export function inferMediaMimeType(fileName: string, currentType?: string): string {
  if (currentType && currentType !== '' && currentType !== 'application/octet-stream') {
    return currentType;
  }
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    avif: 'image/avif',
    dng: 'image/x-adobe-dng',
    raw: 'image/x-raw',
    cr2: 'image/x-canon-cr2',
    cr3: 'image/x-canon-cr3',
    nef: 'image/x-nikon-nef',
    arw: 'image/x-sony-arw',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    m4v: 'video/mp4',
    mkv: 'video/x-matroska',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    '3gp': 'video/3gpp',
    prores: 'video/quicktime',
    ts: 'video/mp2t',
    mts: 'video/mp2t',
    m2ts: 'video/mp2t',
  };
  return mimeMap[ext] || currentType || 'application/octet-stream';
}

/**
 * Validates that the file is an image or video, including uncompressed RAW / ProRes formats
 */
export function isMediaFile(file: File): boolean {
  if (file.type && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
    return true;
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mediaExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif', 'bmp', 'tiff', 'tif', 'svg',
    'dng', 'raw', 'cr2', 'cr3', 'nef', 'arw', 'rw2', 'orf', 'pef', 'psd',
    'mp4', 'mov', 'm4v', 'mkv', 'avi', 'webm', '3gp', 'wmv', 'flv', 'mts', 'm2ts', 'ts', 'prores'
  ];
  return mediaExtensions.includes(ext);
}

/**
 * Extracts dimensions, video duration, and SHA-256 for a media file
 * without altering, re-encoding, or compressing the file in any way
 */
export async function analyzeMediaFile(file: File): Promise<FileMetadata> {
  const mimeType = inferMediaMimeType(file.name, file.type);
  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const previewUrl = URL.createObjectURL(file);
  const sha256 = await calculateFileSha256(file);

  let width: number | undefined;
  let height: number | undefined;
  let duration: number | undefined;

  if (isImage) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        width = img.naturalWidth;
        height = img.naturalHeight;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = previewUrl;
    });
  } else if (isVideo) {
    await new Promise<void>((resolve) => {
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        width = vid.videoWidth;
        height = vid.videoHeight;
        duration = vid.duration;
        resolve();
      };
      vid.onerror = () => resolve();
      vid.src = previewUrl;
    });
  }

  return {
    name: file.name,
    size: file.size,
    type: mimeType,
    lastModified: file.lastModified,
    width,
    height,
    duration,
    sha256,
    previewUrl,
  };
}

/**
 * Assemble decrypted chunks into a download Blob
 */
export function assembleChunksToBlob(chunks: ArrayBuffer[], mimeType: string): Blob {
  return new Blob(chunks, { type: mimeType });
}

/**
 * Trigger file download to mobile device or browser
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Categorize media resolution (e.g. 4K, 1080p, High-Res RAW)
 */
export function getResolutionLabel(width?: number, height?: number): string {
  if (!width || !height) return '';
  const totalPixels = width * height;
  if (totalPixels >= 3840 * 2160 * 0.9) return `${width} × ${height} (4K UHD)`;
  if (totalPixels >= 2560 * 1440 * 0.9) return `${width} × ${height} (2K QHD)`;
  if (totalPixels >= 1920 * 1080 * 0.9) return `${width} × ${height} (Full HD 1080p)`;
  if (totalPixels >= 1280 * 720 * 0.9) return `${width} × ${height} (HD 720p)`;
  return `${width} × ${height}`;
}
