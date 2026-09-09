import React from 'react';
import { X, Settings } from 'lucide-react';
import { SettingsView } from './SettingsView';
import { DeviceSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DeviceSettings;
  onUpdateSettings: (newSettings: Partial<DeviceSettings>) => void;
  onOpenSecurityModal?: () => void;
  lang?: 'ar' | 'en';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenSecurityModal,
  lang = 'ar',
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0A0A0E] border border-[#27272A] rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#FF1E56]/10 text-white overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1E1E24] flex items-center justify-between bg-[#0F0F14]/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1E56] to-[#A00B30] flex items-center justify-center text-white shadow-md shadow-[#FF1E56]/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'إعدادات PureDrop' : 'PureDrop Settings'}
              </h2>
              <span className="text-[11px] text-[#A1A1AA] block">
                {isAr ? 'التحكم في المؤثرات الصوتية، الشبكة، والتشفير' : 'Manage audio chimes, networking & encryption'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#71717A] hover:text-white hover:bg-[#1A1A22] transition-all cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <SettingsView
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onOpenSecurityModal={onOpenSecurityModal}
            lang={lang}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#1C1C22] bg-[#0C0C10] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-white text-xs font-bold transition-all shadow-md shadow-[#FF1E56]/20 cursor-pointer"
          >
            {isAr ? 'تم وحفظ' : 'Done & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
