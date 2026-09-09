import React from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Lock,
  Radio,
} from 'lucide-react';
import { TransferProgress } from '../types';
import { formatBytes, formatDuration, formatSpeed } from '../utils/fileUtils';

interface TransferProgressModalProps {
  progress: TransferProgress | null;
  batchInfo?: { currentIndex: number; totalCount: number } | null;
  onCancel: () => void;
  onDownload?: () => void;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const TransferProgressModal: React.FC<TransferProgressModalProps> = ({
  progress,
  batchInfo,
  onCancel,
  onDownload,
  onClose,
  lang = 'ar',
}) => {
  if (!progress) return null;

  const isAr = lang === 'ar';
  const speed = formatSpeed(progress.speedBps);
  const isCompleted = progress.status === 'completed';
  const isError = progress.status === 'error';
  const isTransferring = progress.status === 'transferring' || progress.status === 'verifying';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F0F12] border border-[#27272A] rounded-3xl p-5 sm:p-6 shadow-2xl text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isCompleted
                  ? 'bg-[#FF1E56]/10 text-[#FF1E56] border-[#FF1E56]/30'
                  : isError
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-[#1A1A1E] text-[#FF1E56] border-[#27272A]'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#FF1E56]" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Radio className="w-5 h-5 animate-pulse text-[#FF1E56]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isCompleted
                  ? isAr
                    ? 'اكتمل النقل بنجاح'
                    : 'Transfer Completed'
                  : isError
                  ? isAr
                    ? 'حدث خطأ في النقل'
                    : 'Transfer Error'
                  : isAr
                  ? 'نقل مشفر قيد التنفيذ'
                  : 'Encrypted Stream Active'}
              </h3>
              <p className="text-[11px] text-[#A1A1AA] truncate max-w-[220px]">{progress.fileName}</p>
            </div>
          </div>
          {(isCompleted || isError) && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#1A1A1E] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Batch item counter banner */}
        {batchInfo && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-[#FF1E56]/15 border border-[#FF1E56]/40 text-[#FF1E56] text-xs font-black text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF1E56] animate-pulse"></span>
            <span>
              {isAr
                ? `إرسال دفعة عناصر: العنصر (${batchInfo.currentIndex}) من (${batchInfo.totalCount})`
                : `Batch Transfer: Item ${batchInfo.currentIndex} of ${batchInfo.totalCount}`}
            </span>
          </div>
        )}

        {/* Protocol & Security Badges */}
        <div className="flex items-center justify-between gap-2 mt-4 px-3 py-2 bg-[#0A0A0C] rounded-xl border border-[#27272A] text-xs">
          <div className="flex items-center gap-1.5 text-[#FF1E56] font-mono font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256-GCM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FF1E56]" />
            <span className="text-[11px] font-medium text-[#A1A1AA]">
              {isAr ? 'نقل مباشر P2P' : 'Direct P2P'}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="my-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[#FF1E56] text-sm">
              {progress.progressPercent}%
            </span>
            <span className="text-[#A1A1AA] font-mono text-[11px]">
              {formatBytes(progress.bytesTransferred)} / {formatBytes(progress.fileSize)}
            </span>
          </div>
          <div className="w-full h-3 bg-[#0A0A0C] rounded-full overflow-hidden border border-[#27272A] p-0.5">
            <div
              className="h-full rounded-full transition-all duration-300 bg-[#FF1E56] shadow-[0_0_12px_rgba(255,30,86,0.6)]"
              style={{ width: `${progress.progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-[#A1A1AA] text-center font-medium">
            {progress.statusText}
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="p-2.5 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
            <div className="text-[10px] text-[#71717A] mb-0.5">{isAr ? 'السرعة' : 'Speed'}</div>
            <div className="text-xs font-bold text-[#FF1E56] font-mono">
              {speed.mbPerSec}
            </div>
            <div className="text-[9px] text-[#71717A] font-mono">{speed.mbps}</div>
          </div>

          <div className="p-2.5 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
            <div className="text-[10px] text-[#71717A] mb-0.5">{isAr ? 'المتبقي' : 'ETA'}</div>
            <div className="text-xs font-bold text-white font-mono">
              {isCompleted ? '00:00' : formatDuration(progress.etaSeconds)}
            </div>
            <div className="text-[9px] text-[#71717A] font-mono">
              {formatDuration(progress.elapsedSeconds)} {isAr ? 'مضت' : 'elapsed'}
            </div>
          </div>

          <div className="p-2.5 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
            <div className="text-[10px] text-[#71717A] mb-0.5">{isAr ? 'الحزم' : 'Chunks'}</div>
            <div className="text-xs font-bold text-white font-mono">
              {progress.currentChunk} / {progress.totalChunks}
            </div>
            <div className="text-[9px] text-[#71717A]">
              {isAr ? '128KB' : '128KB ea'}
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Match Audit Badge (When completed) */}
        {isCompleted && (
          <div className="p-3 bg-[#0A0A0C] rounded-2xl border border-[#FF1E56]/30 mb-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FF1E56] text-xs font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {isAr
                  ? 'تم التحقق: مطابقة تامة للبايتات 100% (Bit-Identical)'
                  : 'Audit Passed: 100% Bit-Identical Integrity'}
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1AA] leading-normal">
              {isAr
                ? 'بصمة SHA-256 للملف بعد فك التشفير مطابقة تماماً للملف الأصلي قبل الإرسال دون أي ضغط.'
                : 'Decrypted SHA-256 checksum matches the sender file bit-for-bit.'}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2">
          {isTransferring && (
            <button
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#27272A] text-white font-medium text-xs transition-colors border border-[#27272A]"
            >
              {isAr ? 'إلغاء النقل' : 'Cancel Transfer'}
            </button>
          )}

          {isCompleted && progress.downloadBlob && onDownload && (
            <button
              onClick={onDownload}
              className="flex-1 py-3.5 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF1E56]/30"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isAr ? 'حفظ بالجودة الأصلية' : 'Save Original Quality'}</span>
            </button>
          )}

          {(isCompleted || isError) && (
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-[#1A1A1E] hover:bg-[#27272A] text-white border border-[#27272A] font-medium text-xs transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
