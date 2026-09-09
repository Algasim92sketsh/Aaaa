import React from 'react';
import {
  Settings,
  Smartphone,
  Sliders,
  Zap,
  Globe,
  Shield,
  Volume2,
  VolumeX,
  Bell,
  MousePointerClick,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { DeviceSettings } from '../types';
import {
  playTransferCompleteSound,
  playConnectionErrorSound,
  playButtonClickSound,
} from '../utils/soundEffects';

interface SettingsViewProps {
  settings: DeviceSettings;
  onUpdateSettings: (newSettings: Partial<DeviceSettings>) => void;
  onOpenSecurityModal?: () => void;
  lang?: 'ar' | 'en';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenSecurityModal,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-4 text-[#F5F5F5]" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 pb-2 border-b border-[#222]">
        <Settings className="w-4 h-4 text-[#FF1E56]" />
        <h3 className="font-bold text-sm text-white">
          {isAr ? 'إعدادات الأداء والأصوات والأمان' : 'Performance, Audio & Security Settings'}
        </h3>
      </div>

      {/* Audio Settings Group - Highlighted & Elegant */}
      <div className="p-4 bg-[#111116] rounded-2xl border border-[#272732] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E1E26]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF1E56]/15 border border-[#FF1E56]/30 flex items-center justify-center text-[#FF1E56]">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'التأثيرات الصوتية الذكية (Audio Feedback)' : 'Smart Audio Effects'}
              </h4>
              <p className="text-[10px] text-[#A1A1AA]">
                {isAr
                  ? 'نغمات أنيقة بدون أية ملفات خارجية بتقنية Web Audio'
                  : 'Synthesized low-latency audio via native Web Audio'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FF1E56]/10 text-[#FF1E56] border border-[#FF1E56]/20 font-semibold">
            {settings.soundEffectsEnabled || settings.buttonClicksSoundEnabled
              ? isAr
                ? 'مفعل'
                : 'ACTIVE'
              : isAr
              ? 'صامت'
              : 'MUTED'}
          </span>
        </div>

        {/* Setting 1: Transfer completion & Connection Error sounds */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 max-w-[240px] sm:max-w-[300px]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
                <Bell className="w-3.5 h-3.5 text-[#FF1E56]" />
                <span>
                  {isAr ? 'نغمات اكتمال النقل وأخطاء الاتصال' : 'Transfer & Connection Audio'}
                </span>
              </div>
              <p className="text-[11px] text-[#888] leading-tight">
                {isAr
                  ? 'تشغيل نغمة لحنية فاخرة عند اكتمال الإرسال/الاستلام، ونغمة تنبيه لطيفة عند حدوث خطأ أو انقطاع في الاتصال.'
                  : 'Play a luxurious melodic chime upon transfer success and a warm warning chime on network disconnects.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !settings.soundEffectsEnabled;
                onUpdateSettings({ soundEffectsEnabled: nextVal });
                if (nextVal) playTransferCompleteSound(true);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                settings.soundEffectsEnabled ? 'bg-[#FF1E56]' : 'bg-[#27272A]'
              }`}
              title={isAr ? 'تبديل أصوات الأحداث' : 'Toggle Event Sounds'}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform bg-white ${
                  settings.soundEffectsEnabled
                    ? isAr
                      ? '-translate-x-5'
                      : 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test buttons for Event Sounds */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => playTransferCompleteSound(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#22222E] border border-[#2E2E3A] hover:border-[#FF1E56]/40 text-[11px] font-medium text-[#E4E4E7] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>{isAr ? 'تجربة نغمة الاكتمال' : 'Test Success Chime'}</span>
            </button>

            <button
              type="button"
              onClick={() => playConnectionErrorSound(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#22222E] border border-[#2E2E3A] hover:border-[#FF1E56]/40 text-[11px] font-medium text-[#E4E4E7] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{isAr ? 'تجربة نغمة التنبيه/الخطأ' : 'Test Error Tone'}</span>
            </button>
          </div>
        </div>

        {/* Setting 2: Button clicks sound */}
        <div className="pt-2 border-t border-[#1C1C24] space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 max-w-[240px] sm:max-w-[300px]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
                <MousePointerClick className="w-3.5 h-3.5 text-[#FF1E56]" />
                <span>
                  {isAr ? 'صوت النقر عند الضغط على أي زر' : 'Button Click Audio Feedback'}
                </span>
              </div>
              <p className="text-[11px] text-[#888] leading-tight">
                {isAr
                  ? 'نقرة ميكانيكية فائقة النعومة وتكتيلية خفيفة وأنيقة مع كل ضغطة زر في كامل أرجاء التطبيق.'
                  : 'Delightful, subtle tactile audio click when pressing any button or interactive element.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !settings.buttonClicksSoundEnabled;
                onUpdateSettings({ buttonClicksSoundEnabled: nextVal });
                if (nextVal) playButtonClickSound(true);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                settings.buttonClicksSoundEnabled ? 'bg-[#FF1E56]' : 'bg-[#27272A]'
              }`}
              title={isAr ? 'تبديل صوت نقر الأزرار' : 'Toggle Button Clicks'}
            >
              <div
                className={`w-5 h-5 rounded-full transition-transform bg-white ${
                  settings.buttonClicksSoundEnabled
                    ? isAr
                      ? '-translate-x-5'
                      : 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => playButtonClickSound(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#22222E] border border-[#2E2E3A] hover:border-[#FF1E56]/40 text-[11px] font-medium text-[#E4E4E7] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-3 h-3 text-[#FF1E56] fill-[#FF1E56]" />
              <span>{isAr ? 'تجربة نقرة الزر' : 'Test Button Click'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Device Name setting */}
      <div className="p-3.5 bg-[#111] rounded-2xl border border-[#222] space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#888]">
          <Smartphone className="w-4 h-4 text-[#FF1E56]" />
          <span>{isAr ? 'اسم الهاتف الظاهر للأجهزة الأخرى' : 'Device Display Name'}</span>
        </div>
        <input
          type="text"
          value={settings.deviceName}
          onChange={(e) => onUpdateSettings({ deviceName: e.target.value })}
          className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#222] rounded-xl text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF1E56]"
        />
      </div>

      {/* Chunk Size Optimization */}
      <div className="p-3.5 bg-[#111] rounded-2xl border border-[#222] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#888]">
            <Sliders className="w-4 h-4 text-[#FF1E56]" />
            <span>{isAr ? 'حجم الحزمة المشفرة (Chunk Size)' : 'Encrypted Chunk Size'}</span>
          </div>
          <span className="text-[11px] font-mono text-[#FF1E56]">{settings.chunkSizeKb} KB</span>
        </div>
        <p className="text-[11px] text-[#888]">
          {isAr
            ? 'التحكم في حجم الحزم المشفرة عبر AES-256؛ الحجم الأكبر يسرع النقل في الشبكات السريعة.'
            : 'Controls AES-256 chunk slicing. Larger chunks increase throughput on fast Wi-Fi.'}
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[64, 128, 256].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onUpdateSettings({ chunkSizeKb: size })}
              className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                settings.chunkSizeKb === size
                  ? 'bg-[#FF1E56] text-white shadow-md shadow-[#FF1E56]/30'
                  : 'bg-[#0A0A0A] text-[#888] hover:text-[#F5F5F5] border border-[#222]'
              }`}
            >
              {size} KB
            </button>
          ))}
        </div>
      </div>

      {/* P2P Preference */}
      <div className="p-3.5 bg-[#111] rounded-2xl border border-[#222] flex items-center justify-between">
        <div className="space-y-0.5 max-w-[220px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
            <Zap className="w-3.5 h-3.5 text-[#FF1E56]" />
            <span>{isAr ? 'تفضيل النقل المباشر (P2P WebRTC)' : 'Prefer Direct P2P'}</span>
          </div>
          <p className="text-[10px] text-[#888]">
            {isAr ? 'نقل مباشر بين الجهازين دون المرور بالخادم' : 'Bypasses server for device-to-device streaming'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdateSettings({ preferP2P: !settings.preferP2P })}
          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
            settings.preferP2P ? 'bg-[#FF1E56]' : 'bg-[#222]'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full transition-transform bg-white ${
              settings.preferP2P
                ? isAr
                  ? '-translate-x-5'
                  : 'translate-x-5'
                : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Language Switch */}
      <div className="p-3.5 bg-[#111] rounded-2xl border border-[#222] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F5]">
          <Globe className="w-4 h-4 text-[#FF1E56]" />
          <span>{isAr ? 'اللغة / Language' : 'Language'}</span>
        </div>
        <div className="flex gap-1 bg-[#0A0A0A] p-1 rounded-xl border border-[#222] text-xs">
          <button
            type="button"
            onClick={() => onUpdateSettings({ language: 'ar' })}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              settings.language === 'ar' ? 'bg-[#FF1E56] text-white font-bold' : 'text-[#888]'
            }`}
          >
            العربية
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ language: 'en' })}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              settings.language === 'en' ? 'bg-[#FF1E56] text-white font-bold' : 'text-[#888]'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Security Architecture Link */}
      {onOpenSecurityModal && (
        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="w-full p-3 bg-[#111] hover:bg-[#1A1A1A] rounded-2xl border border-[#222] text-xs text-[#F5F5F5] flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF1E56]" />
            <span>{isAr ? 'معمارية التشفير والخصوصية (E2EE)' : 'View Cryptographic Specs'}</span>
          </div>
          <span className="text-[10px] text-[#FF1E56] font-mono font-bold">AES-256-GCM</span>
        </button>
      )}
    </div>
  );
};
