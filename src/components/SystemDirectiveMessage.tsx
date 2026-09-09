import React, { useState, useEffect } from 'react';
import {
  Radio,
  Wifi,
  Globe,
  Bell,
  CheckCircle2,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TransferChannel } from '../types';
import { playDirectiveChime } from '../utils/soundEffects';

interface SystemDirectiveMessageProps {
  role: 'sender' | 'receiver';
  channel: TransferChannel;
  peerConnected: boolean;
  lang?: 'ar' | 'en';
}

export const SystemDirectiveMessage: React.FC<SystemDirectiveMessageProps> = ({
  role,
  channel,
  peerConnected,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const isSender = role === 'sender';
  const isRemote = channel === 'remote';

  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Trigger gentle audio chime on initial mount or mode switch
  useEffect(() => {
    playDirectiveChime();
    setIsAcknowledged(false);
  }, [role, channel]);

  // Determine message contents
  let title = '';
  let badgeLabel = '';
  let icon = null;
  let directiveBody = '';
  let checklistLabel = '';

  if (isSender) {
    if (isRemote) {
      title = isAr ? 'رسالة توجيهية: إرسال الوسائط عبر الإنترنت' : 'System Directive: Remote Cloud Transfer';
      badgeLabel = isAr ? 'أمر إرسال عالمي' : 'GLOBAL DISPATCH';
      icon = <Globe className="w-4 h-4 text-[#FF1E56] animate-pulse" />;
      directiveBody = isAr
        ? 'تم إنشاء نفق مشفر مخصص لنقل الصور ومقاطع الفيديو بدقتها الأصلية 100%. شارك رابط النقل أو رمز الغرفة مع المستلم في أي مكان في العالم لبدء التدفق الخام.'
        : 'Encrypted global tunnel created. Share your Room Link or PIN with the recipient anywhere in the world to transmit full uncompressed media.';
      checklistLabel = isAr ? 'تمت مشاركة الرابط مع المستلم' : 'Link shared with receiver';
    } else {
      title = isAr ? 'رسالة توجيهية: إرسال محلي فائق السرعة' : 'System Directive: Local Offline Transfer';
      badgeLabel = isAr ? 'أمر إرسال إلزامي' : 'HOTSPOT DISPATCH';
      icon = <Radio className="w-4 h-4 text-[#FF1E56] animate-pulse" />;
      directiveBody = isAr
        ? 'أمر نظام للمرسل: يرجى تفعيل «نقطة الاتصال» (Hotspot) في هاتفك الآن. هذا الإجراء ضروري لربط هاتف المستلم مباشرة بهاتفك لنقل الوسائط الضخمة بسرعة خارقة وبدون إنترنت.'
        : 'System order for Sender: Please enable your Personal Hotspot now so the receiver can pair directly with your device without internet.';
      checklistLabel = isAr ? 'قمت بتفعيل نقطة الاتصال (Hotspot) في هاتفي' : 'Hotspot enabled on my phone';
    }
  } else {
    // Receiver
    if (isRemote) {
      title = isAr ? 'رسالة توجيهية: استلام الوسائط عبر الإنترنت' : 'System Directive: Remote Cloud Receiver';
      badgeLabel = isAr ? 'أمر استلام عالمي' : 'REMOTE RECEIVE';
      icon = <Globe className="w-4 h-4 text-[#FF1E56] animate-pulse" />;
      directiveBody = isAr
        ? 'أمر نظام للمستلم: تأكد من اتصالك بالإنترنت وافتح رابط النقل أو أدخل رمز الغرفة. سيتم تنزيل الصور والفيديوهات بدقة الكاميرا الأصلية دون أي ضغط من السيرفرات.'
        : 'Ensure your device is connected to the internet and input the 6-digit Room PIN to receive high-definition media losslessly.';
      checklistLabel = isAr ? 'أنا متصل بالإنترنت ومستعد للاستلام' : 'Connected to internet & ready';
    } else {
      title = isAr ? 'رسالة توجيهية: استلام محلي مباشر' : 'System Directive: Local Radio Receiver';
      badgeLabel = isAr ? 'أمر استلام إلزامي' : 'WIFI DISPATCH';
      icon = <Wifi className="w-4 h-4 text-[#FF1E56] animate-pulse" />;
      directiveBody = isAr
        ? 'أمر نظام للمستلم: يرجى تشغيل «الواي فاي» (Wi-Fi) في هاتفك والاتصال بشبكة هاتف المرسل (نقطة الاتصال). بمجرد الاتصال، سيبدأ استلام الصور والفيديوهات مباشرة بأقصى سرعة.'
        : 'System order for Receiver: Enable Wi-Fi and connect to the sender’s Personal Hotspot to receive files directly at max hardware speeds.';
      checklistLabel = isAr ? 'اتصلت بنقطة اتصال هاتف المرسل' : 'Connected to Sender Hotspot';
    }
  }

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#1C0D15] via-[#14080F] to-[#0A0508] border-2 border-[#FF1E56]/70 shadow-xl shadow-[#FF1E56]/15 overflow-hidden transition-all duration-300">
      {/* Ambient Top Glow Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#FF1E56] to-transparent"></div>

      {/* Message Header */}
      <div className="p-3 sm:p-4 flex items-center justify-between gap-2 border-b border-[#FF1E56]/20 bg-[#000000]/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FF1E56]/20 border border-[#FF1E56]/40 flex items-center justify-center shrink-0 shadow-inner">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white truncate tracking-tight">{title}</span>
              <span className="w-2 h-2 rounded-full bg-[#FF1E56] animate-ping shrink-0"></span>
            </div>
            <div className="text-[10px] text-[#A1A1AA] font-mono flex items-center gap-1.5 mt-0.5">
              <span className="text-[#FF1E56] font-semibold">{badgeLabel}</span>
              <span>•</span>
              <span>{isAr ? 'وارد أمني فوري' : 'Live Directive'}</span>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => playDirectiveChime()}
            title={isAr ? 'إعادة تشغيل نغمة الإشعار' : 'Replay Chime'}
            className="p-1.5 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-[#A1A1AA] hover:text-[#FF1E56] border border-[#27272A] transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-[#141418] hover:bg-[#1C1C22] text-[#A1A1AA] hover:text-white border border-[#27272A] transition-colors"
            title={isCollapsed ? (isAr ? 'توسيع الرسالة' : 'Expand') : isAr ? 'تصغير' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Message Body Content (Expandable) */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-[#FF1E56]/20 text-[#FF1E56] mt-0.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs sm:text-sm text-[#F5F5F5] font-medium leading-relaxed">
              {directiveBody}
            </p>
          </div>

          {/* Interactive Confirmation Checkbox Bar */}
          <div className="pt-2 border-t border-[#27272A]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <button
              onClick={() => setIsAcknowledged(!isAcknowledged)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all text-right ${
                isAcknowledged
                  ? 'bg-[#FF1E56]/20 text-[#FF1E56] border-[#FF1E56]/50 shadow-md shadow-[#FF1E56]/15'
                  : 'bg-[#0E0E10] text-[#A1A1AA] hover:text-white border-[#27272A]'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 ${isAcknowledged ? 'text-[#FF1E56] fill-[#FF1E56]/20' : 'text-[#555]'}`}
              />
              <span>{checklistLabel}</span>
            </button>

            {/* Peer live connection status feedback inside the message */}
            <div className="text-[11px] font-mono">
              {peerConnected ? (
                <span className="text-[#00E599] flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></span>
                  {isAr ? 'تم اقتران الطرف الآخر بنجاح!' : 'Peer Connected!'}
                </span>
              ) : (
                <span className="text-[#888] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E56] animate-ping"></span>
                  {isAr ? 'بانتظار اكتمال الاقتران...' : 'Awaiting peer handshake...'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
