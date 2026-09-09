import React from 'react';
import {
  Shield,
  Lock,
  Radio,
  Award,
  Zap,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface AboutViewProps {
  lang?: 'ar' | 'en';
  onBack?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang = 'ar', onBack }) => {
  const isAr = lang === 'ar';

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div className="w-full min-h-full flex flex-col bg-[#050507] text-[#F5F5F5] select-text">
      {/* Main Spacious Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 pb-20 space-y-8">
        {/* App Identity Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-[#141418] to-[#0A0A0C] rounded-2xl border border-[#FF1E56]/30 overflow-hidden shadow-xl shadow-[#FF1E56]/5">
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#FF1E56]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FF1E56] flex items-center justify-center text-white font-black shadow-xl shadow-[#FF1E56]/30 shrink-0">
                <Lock className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-white">
                    PURE<span className="text-[#FF1E56]">DROP</span>
                  </h1>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FF1E56]/20 text-[#FF1E56] border border-[#FF1E56]/40">
                    100% LOSSLESS ORIGINAL
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
                  {isAr
                    ? 'منظومة نقل الوسائط والملفات الضخمة غير المضغوطة محلياً وعبر الإنترنت'
                    : 'Universal Zero-Compression Lossless Transfer Engine (Local Radio & Global Cloud E2EE)'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed pt-4 border-t border-[#27272A]">
            {isAr
              ? 'صُممت هذه المنظومة لحل معضلة الضغط التلقائي وفقدان جودة الصور ومقاطع الفيديو التي تفرضها تطبيقات المراسلة والتواصل الاجتماعي. يتيح PureDrop نقل الملفات بدقتها الخام الأصلية (Bit-for-Bit) سواءً بين هاتفين متجاورين عبر نقطة الاتصال اللاسلكية دون إنترنت، أو بين قارات العالم عن بُعد عبر نفق الإنترنت المشفر، مع ضمان تطابق كل بايت بنسبة 100% ودون المساس ببيانات الكاميرا الوصفية (Metadata).'
              : 'Engineered to defeat aggressive media re-compression and downscaling. PureDrop facilitates byte-identical transfers across mobile operating systems locally without internet, as well as remotely across the globe through end-to-end encrypted streams.'}
          </p>
        </div>

        {/* Developer Official Attribution Card - Text & Prestigious Styling */}
        <div className="p-6 sm:p-7 bg-gradient-to-b from-[#18181D] to-[#0D0D11] rounded-2xl border-2 border-[#FF1E56]/40 shadow-2xl shadow-[#FF1E56]/10 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF1E56] uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#FF1E56]" />
              <span>{isAr ? 'المطور والمشرف الهندسي للمنظومة' : 'Lead Systems Architect & Developer'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#FF1E56]/15 text-[#FF1E56] border border-[#FF1E56]/30">
              Verified Lead Engineer
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-[#0A0A0C] border-2 border-[#FF1E56] flex items-center justify-center text-[#FF1E56] font-black text-2xl shadow-xl shadow-[#FF1E56]/20 shrink-0">
              أ.م
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="text-xs text-[#A1A1AA] font-mono uppercase tracking-wider">
                {isAr ? 'المهندس المطور والمؤسس:' : 'Lead Systems & Security Engineer:'}
              </div>
              <h2 className="font-black text-xl sm:text-2xl text-white tracking-tight text-[#FF1E56]">
                {isAr ? 'المهندس: أبوالقاسم معتصم الخير أحمد' : 'Eng. Abolgasim Mutasim Elkheir Ahmed'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E4E4E7] font-medium">
                {isAr
                  ? 'مهندس برمجيات'
                  : 'Software Engineer'}
              </p>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pt-2">
                {isAr
                  ? 'قام بتطوير وهندسة وتصميم كامل البنية التحتية لمنظومة PureDrop لتكون حلاً مستقلاً وعالمياً يمنح المستخدم حرية نقل وسائطه وصوره وفيديوهاته الضخمة بدقتها الكاملة وألوانها الحقيقية، مع كسر العزلة بين مختلف أنظمة التشغيل (أندرويد وآيفون) وتأمين تدفق البيانات برياضيات التشفير العسكري.'
                  : 'Architected and engineered PureDrop to eliminate device ecosystem barriers, allowing users to freely transmit raw high-definition visual assets without third-party surveillance, cloud caching, or destructive compression algorithms.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#27272A] text-center">
            <div className="p-3 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
              <div className="text-[10px] text-[#71717A] mb-1">{isAr ? 'نسبة الجودة' : 'Quality Ratio'}</div>
              <div className="text-sm font-black text-[#FF1E56]">100% Lossless</div>
            </div>
            <div className="p-3 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
              <div className="text-[10px] text-[#71717A] mb-1">{isAr ? 'خوارزمية التشفير' : 'Encryption Cipher'}</div>
              <div className="text-sm font-black text-[#FF1E56]">AES-256-GCM</div>
            </div>
            <div className="p-3 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
              <div className="text-[10px] text-[#71717A] mb-1">{isAr ? 'التحقق البايتي' : 'Bit-Verification'}</div>
              <div className="text-sm font-black text-[#FF1E56]">SHA-256 Match</div>
            </div>
            <div className="p-3 bg-[#0A0A0C] rounded-xl border border-[#27272A]">
              <div className="text-[10px] text-[#71717A] mb-1">{isAr ? 'الخصوصية التامة' : 'Zero Tracking'}</div>
              <div className="text-sm font-black text-[#FF1E56]">0% Logs/Storage</div>
            </div>
          </div>
        </div>

        {/* Section 1: How The System Works (Two Universal Modes) */}
        <div className="p-6 sm:p-7 bg-[#101014] rounded-2xl border border-[#27272A] space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#FF1E56] uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>{isAr ? 'مسارات النقل المدعومة في المنظومة' : 'Supported Transfer Channels'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {/* Mode A: Local Radio Hotspot */}
            <div className="p-5 bg-[#0A0A0C] rounded-xl border border-[#27272A] space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <div className="w-6 h-6 rounded-lg bg-[#FF1E56]/20 text-[#FF1E56] flex items-center justify-center font-mono text-xs">
                  1
                </div>
                <Radio className="w-4 h-4 text-[#FF1E56]" />
                <span>{isAr ? 'النقل المحلي المباشر (نقطة اتصال / بدون إنترنت)' : 'Direct Local Radio (Offline Hotspot)'}</span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-xs">
                {isAr
                  ? 'مخصص للأجهزة المتواجدة في نفس المكان؛ يقوم المرسل بتفعيل «نقطة الاتصال» (Hotspot) ويقوم المستلم بالاتصال بها عبر «الواي فاي». تنتقل البيانات مباشرة عبر هوائيات الهاتفين بسرعة فائقة دون استهلاك أي باقة بيانات.'
                  : 'For devices nearby. The sender activates Personal Hotspot, receiver connects via Wi-Fi. Files travel over local hardware radios at top speeds with 0% data consumption.'}
              </p>
            </div>

            {/* Mode B: Global Internet Remote Transfer */}
            <div className="p-5 bg-[#0A0A0C] rounded-xl border border-[#27272A] space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <div className="w-6 h-6 rounded-lg bg-[#FF1E56]/20 text-[#FF1E56] flex items-center justify-center font-mono text-xs">
                  2
                </div>
                <Globe className="w-4 h-4 text-[#FF1E56]" />
                <span>{isAr ? 'النقل العالمي عن بُعد (عبر الإنترنت بأقصى جودة)' : 'Global Remote Transfer (Lossless Over Internet)'}</span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-xs">
                {isAr
                  ? 'مخصص لنقل الفيديوهات والملفات الضخمة لأي شخص في أي دولة حول العالم. يتم إنشاء رابط مشاركة عالمي مشفر أو رمز PIN مؤلف من 6 أرقام. يستلم الطرف الآخر الملف بجودته الخام ودون أي ضغط عبر نفق WebRTC/Relay المشفر.'
                  : 'Enables transmitting full-resolution 4K video or photo archives to any recipient worldwide. Generates a secure global link or 6-digit room PIN, streaming lossless packets end-to-end.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Zero Compression & Technical Standards */}
        <div className="p-6 sm:p-7 bg-[#101014] rounded-2xl border border-[#27272A] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF1E56] uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>{isAr ? 'المعايير التقنية والأمنية المطبقة' : 'Technical & Cryptographic Standards'}</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF1E56] shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? 'تشفير متماثل فائق القوة AES-256-GCM يعمل على تشفير كل شريحة بيانات محلياً على الهاتف قبل إرسالها بالهواء أو بالإنترنت، مع مصادقة سلامة الحزم ضد التلاعب.'
                  : 'AES-256-GCM authenticated cipher encrypting every chunk locally on device hardware prior to transmission.'}
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF1E56] shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? 'بصمة رياضية SHA-256 Bit-Exact للتحقق التلقائي بعد انتهاء النقل من أن الملف المستلم متطابق 100% مع الملف الأصلي دون نقصان أي بايت واحد.'
                  : 'Automated SHA-256 bit-exact hash verification proving 100% lossless parity between source and destination.'}
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF1E56] shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? 'معمارية خالية من السيرفرات التخزينية (Zero-Knowledge Architecture): خادم الإشارات لا يملك مفاتيح التشفير ولا يخزن أي وسائط أو سجلات على الإطلاق.'
                  : 'Zero-knowledge relay: signaling servers hold zero cryptographic keys and retain zero files or metadata.'}
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF1E56] shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? 'توافق كامل وسلس بين آيفون وأندرويد والكمبيوتر، مع حفظ كامل لملفات ProRes وRAW وDNG وHEIC وملفات الفيديو السينمائي 4K و8K بألوانها الطبيعية.'
                  : 'Full cross-platform fidelity for ProRes, RAW, DNG, HEIC, 4K/8K HDR video maintaining native color profiles and EXIF metadata.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center py-6 border-t border-[#1C1C20] text-xs text-[#71717A] space-y-1">
          <div>
            {isAr
              ? 'منظومة PureDrop • تطوير وهندسة: المهندس أبوالقاسم معتصم الخير أحمد'
              : 'PureDrop Engine • Developed & Engineered by Eng. Abolgasim Mutasim Elkheir Ahmed'}
          </div>
          <div className="text-[10px] text-[#555]">
            {isAr
              ? 'جميع الحقوق محفوظة لمنظومة النقل المشفر الفائق PureDrop'
              : 'All rights reserved • Lossless P2P & Remote Media Transmission'}
          </div>
        </div>
      </div>
    </div>
  );
};
