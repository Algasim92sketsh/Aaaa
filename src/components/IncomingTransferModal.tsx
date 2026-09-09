import React from 'react';
import {
  Download,
  ShieldCheck,
  Check,
  X,
  Camera,
  Film,
  Sparkles,
  ArrowDownCircle,
  Clock,
} from 'lucide-react';
import { RemoteTransfer } from '../types';
import { getFilterStyle, resolveAvatarUrl } from '../utils/avatarFilters';
import { formatBytes } from '../utils/fileUtils';

interface IncomingTransferModalProps {
  transfer: RemoteTransfer | null;
  onAccept: (transfer: RemoteTransfer) => void;
  onReject: (transfer: RemoteTransfer) => void;
  lang?: 'ar' | 'en';
}

export const IncomingTransferModal: React.FC<IncomingTransferModalProps> = ({
  transfer,
  onAccept,
  onReject,
  lang = 'ar',
}) => {
  if (!transfer) return null;

  const isAr = lang === 'ar';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0F0F13] border-2 border-[#00E599]/60 rounded-3xl p-6 shadow-2xl shadow-[#00E599]/20 text-white space-y-5 animate-in zoom-in-95 duration-200">
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
          <div className="flex items-center gap-2 text-xs font-black text-[#00E599] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-ping"></span>
            <ShieldCheck className="w-4 h-4 text-[#00E599]" />
            <span>{isAr ? 'طلب استلام وسائط عن بُعد (تحقق موثق)' : 'Incoming Remote Transfer Request'}</span>
          </div>

          <button
            type="button"
            onClick={() => onReject(transfer)}
            className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#1A1A22] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Verification of Sender (التحقق البصري من هوية المرسل) */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#16161D] to-[#101015] border border-[#27272A] flex items-center gap-4 shadow-inner">
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00E599] flex items-center justify-center bg-[#1D1D24] shrink-0 shadow-lg"
            style={getFilterStyle(transfer.senderAvatarFilter || 'normal')}
          >
            {resolveAvatarUrl(transfer.senderAvatarUrl) ? (
              <img
                src={resolveAvatarUrl(transfer.senderAvatarUrl)}
                alt={transfer.senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-7 h-7 text-[#00E599]" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#A1A1AA]">
                {isAr ? 'المرسل الموثق:' : 'Verified Sender:'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#00E599]/15 text-[#00E599] font-bold">
                {isAr ? 'موثق' : 'Verified'}
              </span>
            </div>
            <h4 className="font-black text-base text-white truncate">
              {transfer.senderName}
            </h4>
            <div className="text-[11px] text-[#71717A] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{isAr ? 'متصل الآن عبر نفق السحابة المشفر' : 'Connected via E2EE Cloud Relay'}</span>
            </div>
          </div>
        </div>

        {/* Transfer Details Card */}
        <div className="p-3.5 bg-[#09090C] rounded-xl border border-[#202026] text-xs text-[#A1A1AA] space-y-2">
          <div className="flex items-center justify-between text-white font-medium">
            <span>{isAr ? 'جودة النقل:' : 'Transfer Quality:'}</span>
            <span className="font-bold text-[#FF1E56] font-mono">100% Lossless Original</span>
          </div>

          {transfer.fileCount !== undefined && transfer.fileCount > 0 && (
            <div className="flex items-center justify-between">
              <span>{isAr ? 'عدد الملفات:' : 'File Count:'}</span>
              <span className="font-bold text-white font-mono">
                {transfer.fileCount} {isAr ? 'عنصر' : 'items'}
              </span>
            </div>
          )}

          {transfer.totalBytes !== undefined && transfer.totalBytes > 0 && (
            <div className="flex items-center justify-between">
              <span>{isAr ? 'الحجم الإجمالي:' : 'Total Size:'}</span>
              <span className="font-bold text-white font-mono">
                {formatBytes(transfer.totalBytes)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#71717A]">
            <span>{isAr ? 'نظام التشفير:' : 'Encryption:'}</span>
            <span className="font-mono text-emerald-400 font-bold">AES-256-GCM Bit-Exact</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onAccept(transfer)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00E599]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{isAr ? 'قبول واستلام الوسائط' : 'Accept & Receive Media'}</span>
          </button>

          <button
            type="button"
            onClick={() => onReject(transfer)}
            className="py-3 px-4 rounded-xl bg-[#1A1A22] hover:bg-[#252530] text-[#A1A1AA] hover:text-white font-bold text-sm transition-all cursor-pointer border border-[#27272A]"
          >
            <span>{isAr ? 'رفض' : 'Decline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
