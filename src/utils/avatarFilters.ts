import type { CSSProperties } from 'react';
import { AvatarFilterId } from '../types';

export interface AvatarFilterConfig {
  id: AvatarFilterId;
  nameAr: string;
  nameEn: string;
  cssFilter: string;
  badgeColor: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const AVATAR_FILTERS: AvatarFilterConfig[] = [
  {
    id: 'normal',
    nameAr: 'الأصلي (طبيعي)',
    nameEn: 'Original Natural',
    cssFilter: 'none',
    badgeColor: 'border-[#3F3F46] text-[#A1A1AA]',
    descriptionAr: 'الألوان الطبيعية بدون أي تعديل أو مؤثرات',
    descriptionEn: 'True natural tones without modification',
  },
  {
    id: 'crimson',
    nameAr: 'قرمزي PureDrop',
    nameEn: 'Pure Crimson',
    cssFilter: 'sepia(35%) saturate(220%) hue-rotate(315deg) contrast(125%)',
    badgeColor: 'border-[#FF1E56] text-[#FF1E56]',
    descriptionAr: 'وهج أحمر ناري مطابق لهوية نفق PureDrop الأسطورية',
    descriptionEn: 'Vibrant signature PureDrop crimson aesthetic',
  },
  {
    id: 'cyberpunk',
    nameAr: 'نيون سايبر',
    nameEn: 'Cyberpunk Neon',
    cssFilter: 'contrast(135%) saturate(180%) hue-rotate(185deg) brightness(105%)',
    badgeColor: 'border-cyan-500 text-cyan-400',
    descriptionAr: 'طابع مستقبلي بألوان سايبربانك مشبعة وفائقة التباين',
    descriptionEn: 'Futuristic high-saturation cyan & magenta electric style',
  },
  {
    id: 'noir',
    nameAr: 'مونوكروم سينمائي',
    nameEn: 'Cinematic Noir',
    cssFilter: 'grayscale(100%) contrast(155%) brightness(95%)',
    badgeColor: 'border-white/50 text-white',
    descriptionAr: 'أبيض وأسود عالي التباين بظلال سينمائية كلاسيكية فاخرة',
    descriptionEn: 'High contrast black & white with deep film shadows',
  },
  {
    id: 'vintage',
    nameAr: 'كلاسيكي دافئ',
    nameEn: 'Warm Vintage',
    cssFilter: 'sepia(65%) contrast(115%) brightness(102%) hue-rotate(-15deg)',
    badgeColor: 'border-amber-500 text-amber-400',
    descriptionAr: 'درجات ألوان عنبرية وذهبية ناعمة من حقبة السبعينات',
    descriptionEn: 'Warm golden amber retro film aesthetic',
  },
  {
    id: 'matrix',
    nameAr: 'زمردي مصفوفة',
    nameEn: 'Emerald Matrix',
    cssFilter: 'sepia(50%) hue-rotate(85deg) saturate(220%) contrast(130%)',
    badgeColor: 'border-emerald-500 text-emerald-400',
    descriptionAr: 'تأثير إلكتروني باللون الأخضر الزمردي الرقمي',
    descriptionEn: 'Cybernetic matrix green phosphorescent glow',
  },
  {
    id: 'dramatic',
    nameAr: 'تباين درامي',
    nameEn: 'Dramatic Punch',
    cssFilter: 'contrast(165%) brightness(95%) saturate(135%)',
    badgeColor: 'border-orange-500 text-orange-400',
    descriptionAr: 'حدة وإبراز عميق للتفاصيل والملامح بجاذبية عالية',
    descriptionEn: 'Sharp striking contours and dynamic contrast',
  },
  {
    id: 'violet',
    nameAr: 'حلم بنفسجي',
    nameEn: 'Violet Dream',
    cssFilter: 'hue-rotate(245deg) saturate(180%) contrast(125%)',
    badgeColor: 'border-purple-500 text-purple-400',
    descriptionAr: 'أجواء بنفسجية ساحرة ومتميزة بهدوء ليلي عميق',
    descriptionEn: 'Moody deep purple & ultraviolet atmosphere',
  },
];

export interface PresetAvatar {
  id: string;
  nameAr: string;
  nameEn: string;
  svgIcon: string;
  gradient: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'cyber-shield',
    nameAr: 'درع الحماية',
    nameEn: 'Cyber Shield',
    svgIcon: 'Shield',
    gradient: 'from-[#FF1E56] to-[#800A25]',
  },
  {
    id: 'quantum-core',
    nameAr: 'نواة الكوانتم',
    nameEn: 'Quantum Core',
    svgIcon: 'Zap',
    gradient: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'matrix-node',
    nameAr: 'عقدة المصفوفة',
    nameEn: 'Matrix Node',
    svgIcon: 'Radio',
    gradient: 'from-emerald-500 to-teal-800',
  },
  {
    id: 'solar-spark',
    nameAr: 'الشرارة الذهبية',
    nameEn: 'Solar Spark',
    svgIcon: 'Sparkles',
    gradient: 'from-amber-400 to-orange-600',
  },
  {
    id: 'dark-nebula',
    nameAr: 'سديم النجوم',
    nameEn: 'Dark Nebula',
    svgIcon: 'Globe',
    gradient: 'from-purple-500 to-indigo-800',
  },
  {
    id: 'phantom-lock',
    nameAr: 'القفل الفانتوم',
    nameEn: 'Phantom Lock',
    svgIcon: 'Lock',
    gradient: 'from-rose-500 to-pink-700',
  },
];

export function getFilterStyle(filterId?: AvatarFilterId | string): CSSProperties {
  const filter = AVATAR_FILTERS.find((f) => f.id === filterId);
  return {
    filter: filter ? filter.cssFilter : 'none',
    WebkitFilter: filter ? filter.cssFilter : 'none',
    transition: 'filter 0.25s ease-in-out',
  };
}

/**
 * Returns a high-resolution SVG Data URL for any preset avatar shield
 * so it renders flawlessly in any <img> tag without network requests.
 */
export function getPresetAvatarDataUrl(presetId: string): string {
  switch (presetId) {
    case 'cyber-shield':
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g_shield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E56"/>
      <stop offset="100%" stop-color="#800A25"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#g_shield)"/>
  <path d="M60 92s24-12 24-30V41l-24-9-24 9v21c0 18 24 30 24 30z" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)}`;

    case 'quantum-core':
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g_zap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#g_zap)"/>
  <polygon points="63 24 33 60 60 60 57 96 87 50 60 50 63 24" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)}`;

    case 'matrix-node':
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g_matrix" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#115E59"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#g_matrix)"/>
  <circle cx="60" cy="60" r="8" fill="#FFFFFF"/>
  <path d="M72.7 47.3a18 18 0 0 1 0 25.4m-25.4 0a18 18 0 0 1 0-25.4m34-8.5a30 30 0 0 1 0 42.4m-42.4 0a30 30 0 0 1 0-42.4" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)}`;

    case 'solar-spark':
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g_solar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#g_solar)"/>
  <path d="M60 26l-6.5 22.5a6 6 0 0 1-5 5L26 60l22.5 6.5a6 6 0 0 1 5 5L60 94l6.5-22.5a6 6 0 0 1 5-5L94 60l-22.5-6.5a6 6 0 0 1-5-5L60 26Z" fill="#FFFFFF"/>
</svg>`)}`;

    case 'dark-nebula':
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g_nebula" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#3730A3"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#g_nebula)"/>
  <circle cx="60" cy="60" r="30" fill="none" stroke="#FFFFFF" stroke-width="6"/>
  <line x1="30" y1="60" x2="90" y2="60" stroke="#FFFFFF" stroke-width="6"/>
  <path d="M60 30a46 46 0 0 1 12 30 46 46 0 0 1-12 30 46 46 0 0 1-12-30 46 46 0 0 1 12-30z" fill="none" stroke="#FFFFFF" stroke-width="6"/>
</svg>`)}`;

    case 'phantom-lock':
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g_lock" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="100%" stop-color="#BE185D"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#g_lock)"/>
  <rect x="34" y="55" width="52" height="36" rx="8" ry="8" fill="#FFFFFF"/>
  <path d="M46 55V43a14 14 0 0 1 28 0v12" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)}`;

    default:
      return '';
  }
}

/**
 * Resolves any avatar URL. If it is a preset ID (or previous preset identifier),
 * it returns the real SVG Data URL. Otherwise, it returns the URL unchanged.
 */
export function resolveAvatarUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const presetDataUrl = getPresetAvatarDataUrl(url);
  if (presetDataUrl) return presetDataUrl;

  return url;
}

/**
 * Resizes an uploaded image to a compact avatar data URL (<= 256px, <= 45KB)
 * to safely conform to Firestore string limits.
 */
export async function optimizeAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 256;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG compressed to ~30-40KB
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for avatar optimization'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
