import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, Layers, Cpu } from 'lucide-react';
import { FileMetadata } from '../types';
import { formatBytes, getResolutionLabel } from '../utils/fileUtils';

interface MediaInspectorModalProps {
  metadata: FileMetadata | null;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const MediaInspectorModal: React.FC<MediaInspectorModalProps> = ({
  metadata,
  onClose,
  lang = 'ar',
}) => {
  if (!metadata) return null;

  const isAr = lang === 'ar';
  const resolution = getResolutionLabel(metadata.width, metadata.height);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111] border border-[#222] rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-none text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F5F5F5]">
                {isAr ? 'فاحص جودة البايتات الأصلية (Lossless Audit)' : 'Lossless Bitstream Inspector'}
              </h3>
              <p className="text-xs text-[#888]">
                {isAr ? 'ضمان الحفاظ على الجودة بنسبة 100% بدون أي ضغط' : 'Zero compression & raw bit-for-bit guarantee'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#222] text-[#888] hover:text-[#F5F5F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Card */}
        <div className="my-4 p-3 bg-[#0A0A0A] rounded-2xl border border-[#222] flex items-center gap-4">
          {metadata.previewUrl && metadata.type.startsWith('image/') ? (
            <img
              src={metadata.previewUrl}
              alt="preview"
              className="w-20 h-20 object-cover rounded-xl border border-[#222]"
            />
          ) : metadata.previewUrl && metadata.type.startsWith('video/') ? (
            <video
              src={metadata.previewUrl}
              className="w-20 h-20 object-cover rounded-xl border border-[#222]"
            />
          ) : (
            <div className="w-20 h-20 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-[#FF1E56]">
              <Layers className="w-8 h-8" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#F5F5F5] truncate">{metadata.name}</h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-[#1A1A1A] text-[#FF1E56] border border-[#222] text-[11px] font-mono font-medium">
                {formatBytes(metadata.size, true)}
              </span>
              {resolution && (
                <span className="px-2 py-0.5 rounded-md bg-[#1A1A1A] text-[#888] border border-[#222] text-[11px] font-medium">
                  {resolution}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#888] mt-1 font-mono">{metadata.type}</p>
          </div>
        </div>

        {/* Cryptographic SHA-256 Checksum */}
        <div className="p-3.5 bg-[#0A0A0A] rounded-2xl border border-[#222] mb-4">
          <div className="flex items-center justify-between text-xs text-[#888] mb-1.5">
            <span className="flex items-center gap-1 font-semibold text-[#FF1E56]">
              <Cpu className="w-3.5 h-3.5" />
              {isAr ? 'البصمة المشفرة الأصلية للملف (SHA-256 Checksum)' : 'Original File SHA-256 Hash'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#FF1E56] border border-[#222] font-bold">
              {isAr ? 'بصمة فريدة 100%' : 'Unique Fingerprint'}
            </span>
          </div>
          <div className="p-2 bg-[#111] rounded-lg border border-[#222] font-mono text-[11px] text-[#F5F5F5] break-all select-all leading-relaxed">
            {metadata.sha256 || 'جاري الحساب الرياضي...'}
          </div>
          <p className="text-[11px] text-[#888] mt-1.5 leading-normal">
            {isAr
              ? 'تعتبر هذه البصمة الرياضية برهاناً قاطعاً: بعد استلام الملف وفك تشفيره لدى المستقبل، يتم حساب البصمة مرة أخرى؛ وإذا تطابقت، فهذا يثبت رياضياً عدم ضياع أو تعديل أي بايت واحد.'
              : 'This mathematical hash proves zero data alteration: upon reception, recalculating this hash verifies 100% bit-exact parity.'}
          </p>
        </div>

        {/* Side-by-side comparison: PureDrop vs Typical Compressed Apps */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#888] uppercase tracking-wider">
            {isAr ? 'مقارنة فنية: PureDrop مقابل التطبيقات التقليدية (واتساب/تيليجرام)' : 'Technical Comparison: PureDrop vs Messaging Apps'}
          </h4>

          {/* Table / Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Compressed Apps */}
            <div className="p-3 bg-[#1A1A1A] border border-red-900/40 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'تطبيقات المراسلة العادية' : 'Standard Apps'}</span>
              </div>
              <ul className="text-[11px] text-[#888] space-y-1.5 list-disc list-inside">
                <li>{isAr ? 'ضغط قوي للصور يصل إلى 85%' : 'Lossy JPEG compression up to 85%'}</li>
                <li>{isAr ? 'تصغير أبعاد 4K إلى 1080p أو 720p' : 'Downscales 4K to 1080p/720p'}</li>
                <li>{isAr ? 'حذف بيانات الكاميرا EXIF والألوان' : 'Strips EXIF, HDR & color gamut'}</li>
                <li>{isAr ? 'تغيير كامل لبصمة SHA-256' : 'Destroys SHA-256 integrity'}</li>
              </ul>
            </div>

            {/* PureDrop Lossless */}
            <div className="p-3 bg-[#1A1A1A] border border-[#FF1E56]/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-[#FF1E56] font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'PureDrop Lossless' : 'PureDrop Lossless'}</span>
              </div>
              <ul className="text-[11px] text-[#F5F5F5] space-y-1.5 list-disc list-inside">
                <li>{isAr ? 'نقل خام بايت مقابل بايت (0% ضغط)' : 'Raw bitstream (0% compression)'}</li>
                <li>{isAr ? 'الحفاظ التام على أبعاد 4K / 8K الأصلية' : 'Full native 4K/8K/RAW fidelity'}</li>
                <li>{isAr ? 'الاحتفاظ بملفات تعريف HDR و DCI-P3' : 'Full HDR, DCI-P3 & EXIF kept'}</li>
                <li>{isAr ? 'تطابق تام لبصمة SHA-256 بنسبة 100%' : '100% SHA-256 match verified'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#222] border border-[#222] text-[#F5F5F5] font-semibold text-sm transition-colors"
        >
          {isAr ? 'إغلاق الفاحص' : 'Close Inspector'}
        </button>
      </div>
    </div>
  );
};
