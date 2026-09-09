export interface CountryCodeItem {
  code: string;       // e.g. "+965"
  nameAr: string;     // e.g. "الكويت"
  nameEn: string;     // e.g. "Kuwait"
  flag: string;       // e.g. "🇰🇼"
  iso: string;        // e.g. "KW"
  placeholder: string; // e.g. "9123 4567"
}

export const ALL_COUNTRY_CODES: CountryCodeItem[] = [
  // Arab Countries (البلدان العربية)
  { code: '+965', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', iso: 'KW', placeholder: '9123 4567' },
  { code: '+249', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩', iso: 'SD', placeholder: '912 345 678' },
  { code: '+966', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA', placeholder: '51 234 5678' },
  { code: '+971', nameAr: 'الإمارات', nameEn: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE', placeholder: '50 123 4567' },
  { code: '+20', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', iso: 'EG', placeholder: '101 234 5678' },
  { code: '+974', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', iso: 'QA', placeholder: '5512 3456' },
  { code: '+973', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', iso: 'BH', placeholder: '3612 3456' },
  { code: '+968', nameAr: 'عُمان', nameEn: 'Oman', flag: '🇴🇲', iso: 'OM', placeholder: '9123 4567' },
  { code: '+962', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', iso: 'JO', placeholder: '7 9123 4567' },
  { code: '+964', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', iso: 'IQ', placeholder: '770 123 4567' },
  { code: '+961', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧', iso: 'LB', placeholder: '71 123 456' },
  { code: '+963', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾', iso: 'SY', placeholder: '944 123 456' },
  { code: '+970', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸', iso: 'PS', placeholder: '59 123 4567' },
  { code: '+967', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪', iso: 'YE', placeholder: '771 234 567' },
  { code: '+212', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', iso: 'MA', placeholder: '612 345 678' },
  { code: '+213', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', iso: 'DZ', placeholder: '551 234 567' },
  { code: '+216', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', iso: 'TN', placeholder: '98 123 456' },
  { code: '+218', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', iso: 'LY', placeholder: '91 234 5678' },
  { code: '+222', nameAr: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷', iso: 'MR', placeholder: '46 123 456' },
  { code: '+252', nameAr: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴', iso: 'SO', placeholder: '61 234 5678' },
  { code: '+253', nameAr: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯', iso: 'DJ', placeholder: '77 12 34 56' },
  { code: '+269', nameAr: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲', iso: 'KM', placeholder: '321 23 45' },

  // World Countries (بقية دول العالم)
  { code: '+1', nameAr: 'الولايات المتحدة / كندا', nameEn: 'USA / Canada', flag: '🇺🇸', iso: 'US', placeholder: '202 555 0123' },
  { code: '+44', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧', iso: 'GB', placeholder: '7911 123456' },
  { code: '+90', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', iso: 'TR', placeholder: '501 234 5678' },
  { code: '+49', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', iso: 'DE', placeholder: '151 23456789' },
  { code: '+33', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷', iso: 'FR', placeholder: '6 12 34 56 78' },
  { code: '+39', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹', iso: 'IT', placeholder: '320 123 4567' },
  { code: '+34', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸', iso: 'ES', placeholder: '612 34 56 78' },
  { code: '+7', nameAr: 'روسيا / كازاخستان', nameEn: 'Russia / Kazakhstan', flag: '🇷🇺', iso: 'RU', placeholder: '912 345-67-89' },
  { code: '+86', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳', iso: 'CN', placeholder: '138 0013 8000' },
  { code: '+91', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳', iso: 'IN', placeholder: '98765 43210' },
  { code: '+92', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰', iso: 'PK', placeholder: '301 2345678' },
  { code: '+880', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', flag: '🇧🇩', iso: 'BD', placeholder: '1712 345678' },
  { code: '+62', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩', iso: 'ID', placeholder: '812 3456 7890' },
  { code: '+60', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾', iso: 'MY', placeholder: '12 345 6789' },
  { code: '+63', nameAr: 'الفلبين', nameEn: 'Philippines', flag: '🇵🇭', iso: 'PH', placeholder: '917 123 4567' },
  { code: '+81', nameAr: 'اليابان', nameEn: 'Japan', flag: '🇯🇵', iso: 'JP', placeholder: '90 1234 5678' },
  { code: '+82', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', flag: '🇰🇷', iso: 'KR', placeholder: '10 1234 5678' },
  { code: '+65', nameAr: 'سنغافورة', nameEn: 'Singapore', flag: '🇸🇬', iso: 'SG', placeholder: '8123 4567' },
  { code: '+61', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺', iso: 'AU', placeholder: '412 345 678' },
  { code: '+64', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', flag: '🇳🇿', iso: 'NZ', placeholder: '21 123 4567' },
  { code: '+55', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷', iso: 'BR', placeholder: '11 91234-5678' },
  { code: '+52', nameAr: 'المكسيك', nameEn: 'Mexico', flag: '🇲🇽', iso: 'MX', placeholder: '55 1234 5678' },
  { code: '+54', nameAr: 'الأرجنتين', nameEn: 'Argentina', flag: '🇦🇷', iso: 'AR', placeholder: '11 1234-5678' },
  { code: '+27', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', flag: '🇿🇦', iso: 'ZA', placeholder: '71 123 4567' },
  { code: '+234', nameAr: 'نيجيريا', nameEn: 'Nigeria', flag: '🇳🇬', iso: 'NG', placeholder: '802 123 4567' },
  { code: '+254', nameAr: 'كينيا', nameEn: 'Kenya', flag: '🇰🇪', iso: 'KE', placeholder: '712 345678' },
  { code: '+251', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', flag: '🇪🇹', iso: 'ET', placeholder: '91 123 4567' },
  { code: '+31', nameAr: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱', iso: 'NL', placeholder: '6 12345678' },
  { code: '+32', nameAr: 'بلجيكا', nameEn: 'Belgium', flag: '🇧🇪', iso: 'BE', placeholder: '470 12 34 56' },
  { code: '+41', nameAr: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭', iso: 'CH', placeholder: '78 123 45 67' },
  { code: '+46', nameAr: 'السويد', nameEn: 'Sweden', flag: '🇸🇪', iso: 'SE', placeholder: '70 123 45 67' },
  { code: '+47', nameAr: 'النرويج', nameEn: 'Norway', flag: '🇳🇴', iso: 'NO', placeholder: '412 34 567' },
  { code: '+43', nameAr: 'النمسا', nameEn: 'Austria', flag: '🇦🇹', iso: 'AT', placeholder: '664 1234567' },
  { code: '+48', nameAr: 'بولندا', nameEn: 'Poland', flag: '🇵🇱', iso: 'PL', placeholder: '512 345 678' },
  { code: '+351', nameAr: 'البرتغال', nameEn: 'Portugal', flag: '🇵🇹', iso: 'PT', placeholder: '912 345 678' },
  { code: '+30', nameAr: 'اليونان', nameEn: 'Greece', flag: '🇬🇷', iso: 'GR', placeholder: '691 234 5678' },
  { code: '+353', nameAr: 'أيرلندا', nameEn: 'Ireland', flag: '🇮🇪', iso: 'IE', placeholder: '85 123 4567' },
];

/**
 * Normalizes phone number into clean digits only (e.g. "+965 9123-4567" -> "96591234567")
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove any non-digit character
  return phone.replace(/\D/g, '');
}

/**
 * Formats a dial code and national number into display format (e.g. "+965 91234567")
 */
export function formatFullPhoneNumber(dialCode: string, nationalNumber: string): string {
  const cleanDial = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  const cleanNum = nationalNumber.replace(/\D/g, '').replace(/^0+/, ''); // strip leading zeroes
  return `${cleanDial} ${cleanNum}`.trim();
}

/**
 * Searches country codes list by query string (matching name in Ar/En or code)
 */
export function searchCountries(query: string): CountryCodeItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return ALL_COUNTRY_CODES;

  return ALL_COUNTRY_CODES.filter((item) => {
    return (
      item.code.includes(normalized) ||
      item.nameAr.toLowerCase().includes(normalized) ||
      item.nameEn.toLowerCase().includes(normalized) ||
      item.iso.toLowerCase().includes(normalized)
    );
  });
}
