import React from 'react';
import {
  Eye,
  CheckCircle2,
  Film,
  Camera,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { FileMetadata } from '../types';
import { formatBytes, getResolutionLabel } from '../utils/fileUtils';

export interface SentMediaRecord {
  id: string;
  file: File;
  metadata: FileMetadata;
  sentAt: number;
  status: 'sent' | 'transferring';
}

interface SentItemsGalleryProps {
  items: SentMediaRecord[];
  onPreviewItem: (item: SentMediaRecord) => void;
  onResendItem: (item: SentMediaRecord) => void;
  onClearHistory: () => void;
  lang?: 'ar' | 'en';
}

export const SentItemsGallery: React.FC<SentItemsGalleryProps> = ({
  items,
  onPreviewItem,
  onResendItem,
  onClearHistory,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  if (items.length === 0) return null;

  return (
    <div className="w-full p-4 sm:p-5 bg-[#0E0E10] rounded-2xl border border-[#27272A] space-y-3.5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FF1E56]/20 text-[#FF1E56] flex items-center justify-center">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white">
              {isAr ? 'العناصر المرسلة (معاينة وتدقيق الجودة)' : 'Sent Media Items'}
            </h4>
            <span className="text-[10px] text-[#A1A1AA]">
              {isAr
                ? `${items.length} عنصر تم إرساله بدقة 100% دون ضغط`
                : `${items.length} uncompressed item(s) sent`}
            </span>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="text-[11px] text-[#71717A] hover:text-[#FF1E56] transition-colors flex items-center gap-1 cursor-pointer font-semibold"
          title={isAr ? 'مسح السجل' : 'Clear history'}
        >
          <Trash2 className="w-3 h-3" />
          <span>{isAr ? 'مسح' : 'Clear'}</span>
        </button>
      </div>

      {/* Grid of Sent Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((item) => {
          const isVideo = item.metadata.type.startsWith('video/');
          const resolution = getResolutionLabel(item.metadata.width, item.metadata.height);

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#08080B] border border-[#222228] hover:border-[#FF1E56]/50 transition-all flex items-center gap-3 group shadow-inner"
            >
              {/* Thumbnail with overlay preview trigger */}
              <div
                onClick={() => onPreviewItem(item)}
                className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#141418] shrink-0 border border-[#27272A] cursor-pointer group-hover:scale-105 transition-transform"
              >
                {item.metadata.previewUrl && !isVideo ? (
                  <img
                    src={item.metadata.previewUrl}
                    alt={item.metadata.name}
                    className="w-full h-full object-cover"
                  />
                ) : item.metadata.previewUrl && isVideo ? (
                  <video
                    src={item.metadata.previewUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#FF1E56]">
                    {isVideo ? <Film className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                  </div>
                )}

                {/* Hover Eye Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#FF1E56]">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              {/* Info & Quick Actions */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate max-w-[150px] sm:max-w-[180px]">
                    {item.metadata.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onPreviewItem(item)}
                    className="px-2.5 py-1 rounded-md bg-[#FF1E56]/15 hover:bg-[#FF1E56]/30 text-[#FF1E56] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معاينة' : 'Preview'}</span>
                  </button>

                  <button
                    onClick={() => onResendItem(item)}
                    className="px-2 py-0.5 rounded-md bg-[#181820] hover:bg-[#22222C] text-[#A1A1AA] hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title={isAr ? 'إعادة الإرسال' : 'Resend'}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isAr ? 'إعادة' : 'Resend'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
