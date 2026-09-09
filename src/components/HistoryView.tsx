import React from 'react';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Download,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { TransferHistoryItem } from '../types';
import { downloadBlob, formatBytes } from '../utils/fileUtils';

interface HistoryViewProps {
  history: TransferHistoryItem[];
  onClearHistory: () => void;
  lang?: 'ar' | 'en';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#FF1E56]" />
          <h3 className="font-bold text-sm text-[#F5F5F5]">
            {isAr ? 'سجل النقل والتحقق الأمني' : 'Transfer & Audit Log'}
          </h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>{isAr ? 'مسح السجل' : 'Clear'}</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#888] space-y-2">
          <FileCheck className="w-10 h-10 text-[#444]" />
          <p className="text-xs">{isAr ? 'لا توجد عمليات نقل سابقة في هذه الجلسة' : 'No transfers yet'}</p>
          <p className="text-[11px] text-[#888] max-w-[200px]">
            {isAr
              ? 'يتم تسجيل كل عملية نقل مشفرة والتحقق من بصمة SHA-256 الخاصة بها هنا'
              : 'Transfers with cryptographic proof are logged here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-[#111] rounded-2xl border border-[#222] space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border border-[#222] ${
                      item.direction === 'sent'
                        ? 'bg-[#1A1A1A] text-[#FF1E56]'
                        : 'bg-[#1A1A1A] text-[#FF1E56]'
                    }`}
                  >
                    {item.direction === 'sent' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="font-bold text-[#F5F5F5] truncate max-w-[160px]">
                    {item.fileName}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#FF1E56] font-medium">
                  {formatBytes(item.fileSize)}
                </span>
              </div>

              {/* Parity confirmation */}
              <div className="flex items-center justify-between text-[10px] text-[#888] bg-[#0A0A0A] p-2 rounded-xl border border-[#222]">
                <div className="flex items-center gap-1 text-[#FF1E56] font-bold">
                  <CheckCircle className="w-3 h-3" />
                  <span>{isAr ? 'تطابق بايتات 100% (Lossless)' : '100% Bit-Identical'}</span>
                </div>
                <span className="font-mono text-[#888] truncate max-w-[120px]">
                  {item.sha256.substring(0, 14)}...
                </span>
              </div>

              {/* Timestamp and Device */}
              <div className="flex items-center justify-between text-[10px] text-[#888] pt-1">
                <span>
                  {new Date(item.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{item.peerDevice}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
