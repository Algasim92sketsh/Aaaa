import React from 'react';
import { Wifi, Battery, Signal, ShieldCheck } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  phoneTitle?: string;
  deviceName?: string;
  isSender?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  phoneTitle,
  deviceName = 'هاتف ذكي مشفر',
  isSender,
}) => {
  const currentTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full">
      {/* Phone device outer shell - Luminous Crimson & Luxury Dark */}
      <div className="relative w-full max-w-[390px] h-[780px] bg-[#050507] border-[5px] border-[#222226] rounded-[48px] shadow-2xl shadow-black flex flex-col overflow-hidden ring-1 ring-[#FF1E56]/20">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-3 h-6 w-32 bg-[#141418] rounded-full border border-[#27272A] pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#050505] ring-1 ring-[#333]"></div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E56] animate-pulse"></span>
            <span className="text-[9px] font-mono text-[#FF1E56] font-bold tracking-tighter">E2EE</span>
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="relative z-30 flex items-center justify-between px-6 pt-3.5 pb-2 text-xs text-[#71717A] font-medium select-none bg-[#0A0A0C] border-b border-[#1C1C20]">
          <span className="font-mono text-xs text-white">{currentTime}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-[#71717A]" />
            <Wifi className="w-3.5 h-3.5 text-[#FF1E56]" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#71717A]">100%</span>
              <Battery className="w-4 h-4 text-[#FF1E56] fill-[#FF1E56]" />
            </div>
          </div>
        </div>

        {/* Device Header Banner */}
        <div className="px-4 py-2 bg-[#0A0A0C] border-b border-[#222226] flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0 bg-[#FF1E56] shadow-sm shadow-[#FF1E56]/50"></span>
            <span className="font-bold text-white truncate">{phoneTitle || 'PUREDROP'}</span>
          </div>
          <span className="text-[11px] text-[#FF1E56] font-semibold truncate shrink-0 max-w-[160px]">
            {deviceName}
          </span>
        </div>

        {/* Screen Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#070709] text-white scrollbar-none relative">
          {children}
        </div>

        {/* Bottom Home Indicator Gesture Bar */}
        <div className="relative z-30 py-2.5 flex items-center justify-center bg-[#0A0A0C] border-t border-[#1C1C20]">
          <div className="w-32 h-1 bg-[#27272A] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
