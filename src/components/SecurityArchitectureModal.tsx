import React from 'react';
import { X, Shield, Lock, Zap, KeyRound, ServerOff, CheckCircle } from 'lucide-react';

interface SecurityArchitectureModalProps {
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const SecurityArchitectureModal: React.FC<SecurityArchitectureModalProps> = ({
  onClose,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#111] border border-[#222] rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-none text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#F5F5F5]">
                {isAr ? 'الهندسة الأمنية وبروتوكول التشفير الفائق' : 'Security & Cryptographic Architecture'}
              </h3>
              <p className="text-xs text-[#888]">
                {isAr
                  ? 'شرح هندسي من مطور أول: كيف نضمن الخصوصية التامة والسرعة القصوى'
                  : 'Senior Engineer Specs: How we guarantee 100% privacy and peak velocity'}
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

        {/* 4 Pillars of PureDrop Architecture */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* Pillar 1: AES-256-GCM */}
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222] shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#F5F5F5] mb-1 flex items-center gap-2">
                <span>{isAr ? 'تشفير عسكري من طرف إلى طرف (AES-256-GCM)' : 'Authenticated E2EE (AES-256-GCM)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] font-mono">
                  E2EE
                </span>
              </h4>
              <p className="text-[#888] text-xs leading-relaxed">
                {isAr
                  ? 'يتم تشفير كل حزمة بيانات (Chunk) محلياً داخل معالج هاتف المرسل باستخدام معيار التشفير المتقدم Galois/Counter Mode مع مفتاح 256 بت وناقل تهيئة فريد (IV) 96 بت لكل حزمة. حتى لو تم اعتراض البيانات على الشبكة، يستحيل فك تشفيرها بدون المفتاح المحلي.'
                  : 'Each chunk is encrypted locally on the sender device using AES-256-GCM with a unique 96-bit IV and 128-bit authentication tag, making interception mathematically impossible.'}
              </p>
            </div>
          </div>

          {/* Pillar 2: Zero-Knowledge Relay */}
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222] shrink-0 mt-0.5">
              <ServerOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#F5F5F5] mb-1 flex items-center gap-2">
                <span>{isAr ? 'بنية الصفر معرفة (Zero-Knowledge Architecture)' : 'Zero-Knowledge Relay'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] font-mono">
                  No Cloud Storage
                </span>
              </h4>
              <p className="text-[#888] text-xs leading-relaxed">
                {isAr
                  ? 'الخادم لا يخزن أي ملف على الإطلاق (Zero File Retention). يعمل الخادم كجسر إشارات مؤقت (Signaling Broker) ولا يملك المفاتيح أبداً ولا يمكنه قراءة أو فك تشفير البيانات المارة عبره.'
                  : 'The server acts solely as an ephemeral signaling broker. Keys never leave the user devices, and zero file bytes are ever persisted on disk.'}
              </p>
            </div>
          </div>

          {/* Pillar 3: WebRTC P2P Direct Velocity */}
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222] shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#F5F5F5] mb-1 flex items-center gap-2">
                <span>{isAr ? 'نقل مباشر بين الأجهزة بسرعة الشبكة المحلية (WebRTC P2P)' : 'Direct P2P Speed (WebRTC)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] font-mono">
                  Peer-to-Peer
                </span>
              </h4>
              <p className="text-[#888] text-xs leading-relaxed">
                {isAr
                  ? 'عندما يكون الهاتفان على نفس شبكة الـ Wi-Fi أو مسار مباشر، يتم فتح قناة WebRTC DataChannel موثوقة (Ordered Lossless)، فيتدفق النقل بسرعة الشبكة القصوى (قد تتجاوز 100-300 ميجابت/ثانية) دون المرور بالخادم إطلاقاً.'
                  : 'Direct device-to-device transport via WebRTC DataChannel avoids cloud bottlenecks, streaming at maximum local Wi-Fi / direct bandwidth.'}
              </p>
            </div>
          </div>

          {/* Pillar 4: SHA-256 Bit-for-Bit Lossless Parity */}
          <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] flex gap-3.5 items-start">
            <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222] shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-[#F5F5F5] mb-1 flex items-center gap-2">
                <span>{isAr ? 'ضمان مطابقة الجودة 100% عبر SHA-256' : '100% Lossless Parity Audit (SHA-256)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] font-mono">
                  Bit-Exact
                </span>
              </h4>
              <p className="text-[#888] text-xs leading-relaxed">
                {isAr
                  ? 'على عكس واتساب الذي يعيد ضغط الصور وتغيير البكسلات، يقوم تطبيقنا بنقل دفق البايتات الخام (Raw Bitstream). بعد فك التشفير، يتم حساب تجزئة SHA-256 المستلمة ومقارنتها بالأصلية للتأكد من عدم تغير أي بكسل أو بايت واحد.'
                  : 'Unlike standard messengers that compress and transcode, we transmit raw binary streams. Decrypted files are mathematically audited via SHA-256 to prove zero degradation.'}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Fingerprints info */}
        <div className="mt-5 p-3.5 bg-[#0A0A0A] rounded-2xl border border-[#222] text-xs text-[#888] flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-[#FF1E56] shrink-0" />
          <p>
            {isAr
              ? 'تعتمد الغرفة على رموز التحقق المرئية (Visual Safety Fingerprints) وبصمات الإيموجي للتأكد من عدم وجود طرف وسيط متطفل (Man-In-The-Middle).'
              : 'Rooms feature visual emoji fingerprints and hex verification codes to verify zero Man-In-The-Middle interference.'}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-black font-bold text-sm transition-colors shadow-lg shadow-[#FF1E56]/20"
        >
          {isAr ? 'فهمت المعايير الأمنية' : 'Close Architecture Overview'}
        </button>
      </div>
    </div>
  );
};
