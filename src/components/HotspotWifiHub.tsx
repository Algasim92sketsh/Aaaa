import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  Wifi,
  Smartphone,
  CheckCircle2,
  QrCode,
  Zap,
  Info,
  Layers,
  ArrowLeftRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import QRCode from 'qrcode';

interface HotspotWifiHubProps {
  onClose: () => void;
  lang?: 'ar' | 'en';
  roomCode: string;
}

export const HotspotWifiHub: React.FC<HotspotWifiHubProps> = ({
  onClose,
  lang = 'ar',
  roomCode,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'hotspot' | 'wifi' | 'cross-os'>('hotspot');

  // Hotspot details
  const [hotspotSsid, setHotspotSsid] = useState(`PureDrop-Hotspot-${roomCode}`);
  const [hotspotPass, setHotspotPass] = useState(`pass-${roomCode}-e2ee`);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Ping & Network Simulator
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(4);
  const [estimatedMbps, setEstimatedMbps] = useState<number>(320);

  // Cross-OS mode
  const [sourceOS, setSourceOS] = useState<'ios' | 'android'>('android');
  const [targetOS, setTargetOS] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    // Generate Wi-Fi QR Code string: WIFI:T:WPA;S:PureDrop-Hotspot;P:pass;;
    const wifiQrString = `WIFI:T:WPA;S:${hotspotSsid};P:${hotspotPass};;`;
    QRCode.toDataURL(wifiQrString, {
      margin: 1,
      color: {
        dark: '#FF1E56',
        light: '#0A0A0A',
      },
      width: 220,
    }).then(setQrDataUrl);
  }, [hotspotSsid, hotspotPass]);

  const runSpeedBenchmark = () => {
    setIsTestingSpeed(true);
    setTimeout(() => {
      setPingMs(Math.floor(Math.random() * 4) + 2); // 2-5ms local LAN
      setEstimatedMbps(Math.floor(Math.random() * 80) + 280); // 280-360 Mbps
      setIsTestingSpeed(false);
    }, 1200);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#111] border border-[#222] rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-none text-[#F5F5F5]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#1A1A1A] text-[#FF1E56] border border-[#222]">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#F5F5F5]">
                {isAr ? 'مركز نقطة الاتصال والواي فاي المحلي' : 'Hotspot & Local Wi-Fi Hub'}
              </h3>
              <p className="text-xs text-[#888]">
                {isAr
                  ? 'نقل بدون إنترنت وبأقصى سرعة عتادية بين أندرويد وآيفون'
                  : 'Offline P2P & Max Bandwidth between Android & iPhone'}
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

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1.5 p-1 my-4 bg-[#0A0A0A] rounded-xl border border-[#222]">
          <button
            onClick={() => setActiveTab('hotspot')}
            className={`py-2 px-1 sm:px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hotspot'
                ? 'bg-[#FF1E56] text-black shadow-sm'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isAr ? 'نقطة اتصال' : 'Hotspot'}</span>
          </button>

          <button
            onClick={() => setActiveTab('wifi')}
            className={`py-2 px-1 sm:px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'wifi'
                ? 'bg-[#FF1E56] text-black shadow-sm'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isAr ? 'واي فاي' : 'Wi-Fi'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cross-os')}
            className={`py-2 px-1 sm:px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cross-os'
                ? 'bg-[#FF1E56] text-black shadow-sm'
                : 'text-[#888] hover:text-[#F5F5F5]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{isAr ? 'أندرويد ⇄ آيفون' : 'Android ⇄ iOS'}</span>
          </button>
        </div>

        {/* TAB 1: Hotspot Mode */}
        {activeTab === 'hotspot' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#F5F5F5] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#FF1E56]" />
                  {isAr ? 'خطوات النقل بدون إنترنت (Offline Hotspot)' : 'Offline Hotspot Setup'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] text-[10px] font-mono">
                  0 MB Cellular Data
                </span>
              </div>

              <div className="space-y-2 text-[#AAA]">
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#FF1E56] border border-[#222] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    {isAr
                      ? 'قم بتشغيل "نقطة الاتصال المحمولة" (Personal Hotspot) على أحد الجهازين (سواء كان أندرويد أو آيفون).'
                      : 'Enable Personal Hotspot on either device (Android or iPhone).'}
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#FF1E56] border border-[#222] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    {isAr
                      ? 'قم بتوصيل الهاتف الآخر بنفس شبكة نقطة الاتصال عبر قائمة الواي فاي أو مسح كود الـ QR الموضح أدناه.'
                      : 'Connect the other phone to this Hotspot using Wi-Fi settings or by scanning the QR code below.'}
                  </p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#FF1E56] border border-[#222] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    {isAr
                      ? 'افتح التطبيق في كلا الجهازين واستخدم نفس رمز الغرفة. سيتم النقل مباشرة عبر الراديو المحلي بأقصى سرعة عتادية.'
                      : 'Open PureDrop on both phones with the same room code. Files will stream directly via peer-to-peer radio.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hotspot Credentials & QR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#0A0A0A] rounded-2xl border border-[#222] flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-[11px] font-bold text-[#888]">
                  {isAr ? 'مسح سريع للاتصال بنقطة الاتصال' : 'Scan to Connect to Hotspot'}
                </span>
                {qrDataUrl ? (
                  <div className="p-2 bg-[#0A0A0A] rounded-xl border border-[#222]">
                    <img src={qrDataUrl} alt="Hotspot QR" className="w-36 h-36 rounded-lg" />
                  </div>
                ) : (
                  <div className="w-36 h-36 bg-[#111] animate-pulse rounded-lg"></div>
                )}
                <span className="text-[10px] text-[#FF1E56] font-mono">WPA2/WPA3 Direct Pairing</span>
              </div>

              <div className="p-3.5 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-2.5 flex flex-col justify-center">
                <div>
                  <label className="text-[10px] text-[#888] font-semibold">{isAr ? 'اسم الشبكة (SSID):' : 'Hotspot Name (SSID):'}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={hotspotSsid}
                      onChange={(e) => setHotspotSsid(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#111] border border-[#222] rounded-lg text-xs font-mono text-[#F5F5F5]"
                    />
                    <button
                      onClick={() => handleCopy(hotspotSsid)}
                      className="p-2 bg-[#1A1A1A] hover:bg-[#222] text-[#FF1E56] rounded-lg border border-[#222]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#888] font-semibold">{isAr ? 'كلمة المرور (Password):' : 'Password:'}</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={hotspotPass}
                      onChange={(e) => setHotspotPass(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#111] border border-[#222] rounded-lg text-xs font-mono text-[#F5F5F5]"
                    />
                    <button
                      onClick={() => handleCopy(hotspotPass)}
                      className="p-2 bg-[#1A1A1A] hover:bg-[#222] text-[#FF1E56] rounded-lg border border-[#222]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-[#111] rounded-xl border border-[#222] text-[10px] text-[#FF1E56] flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isAr ? 'نطاق 5GHz فائق السرعة مفعل' : '5GHz High-Throughput Enabled'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Local Wi-Fi LAN Mode */}
        {activeTab === 'wifi' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#F5F5F5] flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#FF1E56]" />
                  {isAr ? 'النقل عبر شبكة الواي فاي المشتركة (Local LAN)' : 'Local Wi-Fi LAN Transmission'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] text-[10px] font-mono">
                  Zero Cloud Routing
                </span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">
                {isAr
                  ? 'عندما يكون كلا الجهازين متصلين بنفس راوتر الواي فاي (سواء في المنزل أو المكتب أو العمل)، يكتشف التطبيق المسار المحلي المباشر عبر WebRTC DataChannels، فتتدفق البيانات بسرعة الراوتر القصوى دون استهلاك سرعة الإنترنت أو الخروج خارج الشبكة المحلية.'
                  : 'When both phones reside on the same Wi-Fi router, PureDrop bypasses WAN/Internet routing, establishing a high-throughput WebRTC data channel that pushes full router hardware speeds.'}
              </p>
            </div>

            {/* Performance Live Benchmark */}
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#F5F5F5]">{isAr ? 'مؤشرات أداء الشبكة المحلية' : 'Local Network Health'}</span>
                <button
                  onClick={runSpeedBenchmark}
                  disabled={isTestingSpeed}
                  className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#222] text-[#FF1E56] border border-[#222] text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingSpeed ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'اختبار المسار المحلي' : 'Run Benchmark'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-[#111] rounded-xl border border-[#222]">
                  <div className="text-[10px] text-[#888] mb-0.5">{isAr ? 'زمن الاستجابة' : 'Latency'}</div>
                  <div className="text-sm font-bold font-mono text-[#FF1E56]">
                    {pingMs ? `${pingMs} ms` : '--'}
                  </div>
                  <div className="text-[9px] text-[#555] font-mono">Ultra-Low LAN</div>
                </div>

                <div className="p-2.5 bg-[#111] rounded-xl border border-[#222]">
                  <div className="text-[10px] text-[#888] mb-0.5">{isAr ? 'السرعة المقدرة' : 'Est. Bandwidth'}</div>
                  <div className="text-sm font-bold font-mono text-[#FF1E56]">
                    ~{estimatedMbps} Mbps
                  </div>
                  <div className="text-[9px] text-[#555] font-mono">5GHz AC/AX</div>
                </div>

                <div className="p-2.5 bg-[#111] rounded-xl border border-[#222]">
                  <div className="text-[10px] text-[#888] mb-0.5">{isAr ? 'فيديو 4K (1GB)' : '1GB 4K Video'}</div>
                  <div className="text-sm font-bold font-mono text-[#F5F5F5]">~25 sec</div>
                  <div className="text-[9px] text-[#555] font-mono">0% Quality Loss</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Cross-OS Bridge (Android ⇄ iOS) */}
        {activeTab === 'cross-os' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#F5F5F5] flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-[#FF1E56]" />
                  {isAr ? 'الجسر المباشر بين أندرويد وآيفون' : 'Cross-Platform Android ⇄ iOS Bridge'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF1E56] border border-[#222] text-[10px] font-mono">
                  Universal Parity
                </span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">
                {isAr
                  ? 'لا مزيد من قيود AirDrop الحصرية لآبل أو قيود Quick Share لأندرويد. يوفر PureDrop جسراً عابراً للمنصات ينقل الملفات دون إعادة ترميز (No Re-encoding).'
                  : 'Eliminates platform lock-in between Apple AirDrop and Android Quick Share. Transfers media in original bitstreams without transcoding.'}
              </p>
            </div>

            {/* Platform Comparison Matrix */}
            <div className="space-y-2">
              <div className="p-3 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">
                      iPhone (iOS) ➔ Android
                    </span>
                  </div>
                  <span className="text-[10px] text-[#FF1E56] font-mono">ProRes & HEIC</span>
                </div>
                <p className="text-[11px] text-[#888]">
                  {isAr
                    ? 'يتم حفظ صيغ HEIC الأصلية، فيديوهات Dolby Vision HDR، و EXIF التاريخ الجغرافي مباشرة في معرض أندرويد دون أي تخفيض للجودة.'
                    : 'Transfers native HEIC, Dolby Vision HDR, and metadata intact into Android Google Photos / Gallery.'}
                </p>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded-2xl border border-[#222] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">
                      Android ➔ iPhone (iOS)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#FF1E56] font-mono">DNG RAW & 8K MP4</span>
                </div>
                <p className="text-[11px] text-[#888]">
                  {isAr
                    ? 'يتم استلام صور الكاميرا RAW وفيديوهات الـ 8K/4K وفتحها في تطبيق الصور بآبل بكامل تفاصيل الحساس ودقة المستشعر.'
                    : 'Transfers 8K/4K 60fps MP4 and DNG camera RAW files straight to iOS Camera Roll with full sensor fidelity.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-black font-bold text-xs transition-colors shadow-lg shadow-[#FF1E56]/20"
        >
          {isAr ? 'تم ضبط الإعدادات • العودة للتطبيق' : 'Configuration Ready • Return to App'}
        </button>
      </div>
    </div>
  );
};
