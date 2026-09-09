import React, { useRef, useState } from 'react';
import {
  FolderOpen,
  Camera,
  Film,
  Zap,
  Copy,
  Check,
  QrCode,
  Globe,
  Share2,
  Trash2,
  Plus,
  Eye,
  Layers,
  Sparkles,
  X,
  Send as SendIcon,
} from 'lucide-react';
import { PeerInfo, SecurityFingerprint, TransferChannel, FileMetadata, PublicProfile } from '../types';
import { analyzeMediaFile, isMediaFile } from '../utils/fileUtils';
import { createSample4KImage } from '../sampleMedia';
import { QRCodeDisplay } from './QRCodeDisplay';
import { SystemDirectiveMessage } from './SystemDirectiveMessage';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';
import { SentItemsGallery, SentMediaRecord } from './SentItemsGallery';
import { RemoteUserSearch } from './RemoteUserSearch';
import { playSelectChime } from '../utils/soundEffects';

export interface SelectedMediaQueueItem {
  id: string;
  file: File;
  meta: FileMetadata;
}

interface SendViewProps {
  roomId: string;
  transferChannel?: TransferChannel;
  selectedItems: SelectedMediaQueueItem[];
  onAddItems: (items: SelectedMediaQueueItem[]) => void;
  onRemoveItem: (id: string) => void;
  onClearItems: () => void;
  onStartTransfer: () => void;
  peers: PeerInfo[];
  fingerprint: SecurityFingerprint | null;
  isTransferring: boolean;
  batchTransferState?: { currentIndex: number; totalCount: number; currentFileName: string } | null;
  sentItems?: SentMediaRecord[];
  onResendItem?: (item: SentMediaRecord) => void;
  onClearHistory?: () => void;
  lang?: 'ar' | 'en';
  currentUid?: string;
  selectedRecipient?: PublicProfile | null;
  onSelectRecipient?: (recipient: PublicProfile) => void;
  onClearRecipient?: () => void;
  onOpenDirectChat?: (recipient: PublicProfile) => void;
}

export const SendView: React.FC<SendViewProps> = ({
  roomId,
  transferChannel = 'local',
  selectedItems,
  onAddItems,
  onRemoveItem,
  onClearItems,
  onStartTransfer,
  peers,
  fingerprint,
  isTransferring,
  batchTransferState,
  sentItems = [],
  onResendItem,
  onClearHistory,
  lang = 'ar',
  currentUid,
  selectedRecipient,
  onSelectRecipient,
  onClearRecipient,
  onOpenDirectChat,
}) => {
  const isAr = lang === 'ar';
  const isRemote = transferChannel === 'remote';

  // Dedicated inputs strictly configured for direct Photo & Video Gallery access
  const generalGalleryInputRef = useRef<HTMLInputElement>(null);
  const photosOnlyInputRef = useRef<HTMLInputElement>(null);
  const videosOnlyInputRef = useRef<HTMLInputElement>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  // Lightbox Preview Modal State (Clean, no technical descriptions, supports swipe between items)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<LightboxMediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const globalShareUrl = `${window.location.origin}?room=${roomId}&channel=${transferChannel}`;

  const handleMediaSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      // Validate: strictly images and videos (including uncompressed RAW, DNG, HEIC, ProRes)
      const validFiles = files.filter(isMediaFile);

      if (validFiles.length === 0) {
        alert(isAr ? 'يرجى اختيار صور أو مقاطع فيديو فقط' : 'Please select images or videos only');
        return;
      }

      playSelectChime();

      const newQueueItems: SelectedMediaQueueItem[] = [];
      for (const file of validFiles) {
        const meta = await analyzeMediaFile(file);
        newQueueItems.push({
          id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          file,
          meta,
        });
      }

      onAddItems(newQueueItems);
      // Reset inputs so the same files can be re-selected if desired
      if (e.target) e.target.value = '';
    }
  };

  const handleGenerateSample = async () => {
    setIsGeneratingSample(true);
    try {
      const sample = await createSample4KImage();
      const meta = await analyzeMediaFile(sample);
      onAddItems([
        {
          id: `queue-sample-${Date.now()}`,
          file: sample,
          meta,
        },
      ]);
      playSelectChime();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleOpenPreviewItem = (targetItem: SelectedMediaQueueItem) => {
    const mappedItems: LightboxMediaItem[] = selectedItems.map((it) => ({
      id: it.id,
      file: it.file,
      metadata: it.meta,
      previewUrl: it.meta.previewUrl,
      name: it.meta.name,
      type: it.meta.type,
      size: it.meta.size,
      width: it.meta.width,
      height: it.meta.height,
    }));
    const foundIdx = selectedItems.findIndex((it) => it.id === targetItem.id);
    setLightboxItems(mappedItems);
    setLightboxIndex(foundIdx >= 0 ? foundIdx : 0);
    setLightboxOpen(true);
  };

  const handleOpenPreviewSentRecord = (targetItem: SentMediaRecord) => {
    const mappedItems: LightboxMediaItem[] = sentItems.map((it) => ({
      id: it.id,
      file: it.file,
      metadata: it.metadata,
      previewUrl: it.metadata.previewUrl,
      name: it.metadata.name,
      type: it.metadata.type,
      size: it.metadata.size,
      width: it.metadata.width,
      height: it.metadata.height,
    }));
    const foundIdx = sentItems.findIndex((it) => it.id === targetItem.id);
    setLightboxItems(mappedItems);
    setLightboxIndex(foundIdx >= 0 ? foundIdx : 0);
    setLightboxOpen(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(globalShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PureDrop - استلام صور وفيديوهات بالجودة الأصلية',
          text: `افتح الرابط لاستلام الصور والفيديوهات بدقتها الأصلية 100% عبر نفق PureDrop:`,
          url: globalShareUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden Native Gallery Inputs (Strictly Photos & Videos with Multiple Selection, Pure Direct Gallery Opening) */}
      <input
        type="file"
        ref={generalGalleryInputRef}
        onChange={handleMediaSelected}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={photosOnlyInputRef}
        onChange={handleMediaSelected}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={videosOnlyInputRef}
        onChange={handleMediaSelected}
        accept="video/*"
        multiple
        className="hidden"
      />

      {/* REMOTE USERNAME SEARCH & VISUAL IDENTIFICATION (Distance Transfer) */}
      {isRemote && (
        <RemoteUserSearch
          currentUid={currentUid}
          selectedRecipient={selectedRecipient || null}
          onSelectRecipient={(rec) => {
            onSelectRecipient?.(rec);
            if (selectedItems.length === 0) {
              generalGalleryInputRef.current?.click();
            }
          }}
          onClearRecipient={() => onClearRecipient?.()}
          onOpenDirectChat={onOpenDirectChat}
          lang={lang}
        />
      )}

      {/* LUXURY SYSTEM DIRECTIVE MESSAGE */}
      <SystemDirectiveMessage
        role="sender"
        channel={transferChannel}
        peerConnected={peers.length > 0}
        lang={lang}
      />

      {/* GALLERY SELECTION INTERFACE */}
      {selectedItems.length === 0 ? (
        <div className="space-y-3">
          {/* Main Direct Gallery Launcher Button */}
          <div
            onClick={() => generalGalleryInputRef.current?.click()}
            className="group cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed border-[#27272A] hover:border-[#FF1E56] bg-gradient-to-b from-[#101014] to-[#0A0A0D] hover:bg-[#141418] transition-all flex flex-col items-center justify-center text-center space-y-3 shadow-md hover:shadow-2xl hover:shadow-[#FF1E56]/15"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#18181D] text-[#FF1E56] flex items-center justify-center border border-[#27272A] group-hover:scale-105 group-hover:border-[#FF1E56]/60 transition-all shadow-inner">
              <FolderOpen className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-black text-base sm:text-lg text-white mb-1">
                {isAr ? 'فتح المعرض واختيار الصور أو الفيديوهات' : 'Open Gallery (Photos & Videos)'}
              </h4>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-sm leading-relaxed">
                {isAr
                  ? 'انقر هنا لفتح معرض الصور والفيديوهات مباشرة في هاتفك. يمكنك تحديد عنصر واحد أو عدة عناصر معاً للإرسال بالجودة الكاملة.'
                  : 'Tap here to open device photo & video gallery. You can select one or multiple items for lossless transfer.'}
              </p>
            </div>

            {/* Quick Dual Sub-Buttons for Direct Gallery Filtering */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  photosOnlyInputRef.current?.click();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#16161C] hover:bg-[#202028] text-white border border-[#27272A] hover:border-[#FF1E56]/50 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5 text-[#FF1E56]" />
                <span>{isAr ? 'معرض الصور' : 'Photos Only'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  videosOnlyInputRef.current?.click();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#16161C] hover:bg-[#202028] text-white border border-[#27272A] hover:border-[#FF1E56]/50 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Film className="w-3.5 h-3.5 text-[#FF1E56]" />
                <span>{isAr ? 'معرض الفيديو' : 'Videos Only'}</span>
              </button>
            </div>
          </div>

          {/* Quick 4K Benchmark Sample Media Button */}
          <button
            onClick={handleGenerateSample}
            disabled={isGeneratingSample}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101014] hover:bg-[#15151B] border border-[#27272A] hover:border-[#FF1E56]/40 text-[#A1A1AA] hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF1E56]" />
            <span>
              {isGeneratingSample
                ? isAr
                  ? 'جاري توليد صورة 4K حقيقية فحصية...'
                  : 'Generating 4K Ultra-HD sample...'
                : isAr
                ? 'تجربة إرسال عينة صورة 4K بدون ضغط'
                : 'Test with 4K Lossless Photo Sample'}
            </span>
          </button>
        </div>
      ) : (
        /* Selected Media Queue (Single or Multiple Items) */
        <div className="p-4 sm:p-5 bg-[#0E0E10] rounded-2xl border border-[#27272A] space-y-3.5 shadow-md">
          {/* Header with Counter and Add More action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF1E56]" />
              <span className="text-xs sm:text-sm font-black text-white">
                {isAr
                  ? `العناصر المحددة للإرسال (${selectedItems.length}):`
                  : `Selected Items (${selectedItems.length}):`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generalGalleryInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-[#FF1E56]/15 hover:bg-[#FF1E56]/25 text-[#FF1E56] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title={isAr ? 'إضافة عناصر أخرى من المعرض' : 'Add more'}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة المزيد' : 'Add More'}</span>
              </button>

              <button
                onClick={onClearItems}
                className="text-xs text-[#71717A] hover:text-[#FF1E56] transition-colors p-1 cursor-pointer font-bold"
                title={isAr ? 'إفراغ القائمة' : 'Clear all'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List of Selected Items */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
            {selectedItems.map((item, index) => {
              const isVideo = item.meta.type.startsWith('video/');
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 bg-[#08080B] rounded-xl border border-[#222228] hover:border-[#FF1E56]/30 transition-all"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => handleOpenPreviewItem(item)}
                    className="relative w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-[#27272A] cursor-pointer group"
                    title={isAr ? 'انقر للمعاينة الكاملة' : 'Tap to preview'}
                  >
                    {item.meta.previewUrl && !isVideo ? (
                      <img
                        src={item.meta.previewUrl}
                        alt={item.meta.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : item.meta.previewUrl && isVideo ? (
                      <video
                        src={item.meta.previewUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#FF1E56]">
                        {isVideo ? <Film className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-white truncate">
                      {item.meta.name}
                    </h5>
                    <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1 font-mono mt-0.5">
                      <span>#{index + 1}</span>
                      <span>•</span>
                      <span className="text-[#FF1E56] font-bold">
                        {isVideo ? (isAr ? 'فيديو' : 'Video') : (isAr ? 'صورة' : 'Photo')}
                      </span>
                    </span>
                  </div>

                  {/* Actions: Preview & Remove */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenPreviewItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1E1E24] text-[#FF1E56] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#27272A]"
                      title={isAr ? 'معاينة كاملة' : 'Preview'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isAr ? 'معاينة' : 'Preview'}</span>
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF1E56] hover:bg-[#1A1A20] transition-colors cursor-pointer"
                      title={isAr ? 'حذف من القائمة' : 'Remove'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SENT ITEMS HISTORY GALLERY */}
      {sentItems.length > 0 && (
        <SentItemsGallery
          items={sentItems}
          onPreviewItem={handleOpenPreviewSentRecord}
          onResendItem={(item) => {
            if (onResendItem) {
              onResendItem(item);
            }
          }}
          onClearHistory={onClearHistory || (() => {})}
          lang={lang}
        />
      )}

      {/* Room Connection & Pairing Section */}
      <div className="p-4 sm:p-5 bg-[#0E0E10] rounded-2xl border border-[#27272A] space-y-4">
        {/* Remote Internet Link Sharing */}
        {isRemote && (
          <div className="space-y-2.5 pb-3 border-b border-[#1C1C20]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#FF1E56]" />
                <span>{isAr ? 'رابط المشاركة السحابية للصور والفيديوهات:' : 'Global Cloud Share Link:'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0A0A0C] px-3 py-2.5 rounded-xl border border-[#27272A] text-xs font-mono text-[#A1A1AA] truncate">
                {globalShareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 rounded-xl bg-[#1A1A1E] hover:bg-[#27272A] text-white transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#FF1E56]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرابط' : 'Copy'}</span>
              </button>
              <button
                onClick={handleNativeShare}
                className="p-2.5 rounded-xl bg-[#FF1E56]/15 hover:bg-[#FF1E56]/25 text-[#FF1E56] border border-[#FF1E56]/30 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title={isAr ? 'مشاركة عبر التطبيقات' : 'Share'}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Room Code Header */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A1A1AA] font-semibold">
            {isRemote
              ? isAr
                ? 'رمز الغرفة (PIN) للمستلم:'
                : 'Receiver Room PIN:'
              : isAr
              ? 'رمز الاقتران بهاتف المستلم:'
              : 'Receiver Pairing Code:'}
          </span>
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex items-center gap-1 text-xs text-[#FF1E56] hover:text-white font-medium cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQr ? (isAr ? 'إخفاء الرمز' : 'Hide QR') : isAr ? 'عرض رمز QR' : 'Show QR'}</span>
          </button>
        </div>

        {/* Big Clean Code Display */}
        <div className="flex items-center justify-between bg-[#0A0A0C] p-3.5 rounded-xl border border-[#27272A]">
          <span className="font-mono text-xl font-black text-[#FF1E56] tracking-widest px-2">
            {roomId}
          </span>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-[#1A1A1E] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#FF1E56]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الرمز' : 'Copy'}</span>
          </button>
        </div>

        {/* QR Code if toggled */}
        {showQr && (
          <div className="p-5 bg-[#0A0A0C] rounded-xl border border-[#27272A] flex flex-col items-center space-y-2.5 animate-in fade-in">
            <QRCodeDisplay text={globalShareUrl} size={180} />
            <p className="text-xs text-[#A1A1AA] text-center max-w-xs">
              {isAr
                ? 'امسح الرمز بكاميرا هاتف المستلم للاقتران الفوري وبدء استلام الصور والفيديوهات'
                : 'Scan with receiver camera for instant pairing'}
            </p>
          </div>
        )}

        {/* Peer Connection Status */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1C1C20]">
          <span className="text-[#71717A]">{isAr ? 'حالة هاتف المستلم:' : 'Receiver Status:'}</span>
          <span className="font-bold text-xs">
            {peers.length > 0 ? (
              <span className="text-[#00E599] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping"></span>
                {isAr ? 'المستلم متصل وجاهز للاستلام!' : 'Receiver Connected & Ready!'}
              </span>
            ) : (
              <span className="text-[#71717A]">
                {isRemote
                  ? isAr
                    ? 'في انتظار دخول المستلم عبر الإنترنت...'
                    : 'Waiting for receiver to join via internet...'
                  : isAr
                  ? 'في انتظار اتصال المستلم...'
                  : 'Waiting for receiver...'}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main Single Action Button: SEND */}
      <div className="pt-2">
        <button
          onClick={onStartTransfer}
          disabled={selectedItems.length === 0 || isTransferring}
          className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all ${
            selectedItems.length > 0 && !isTransferring
              ? 'bg-[#FF1E56] hover:bg-[#FF3366] text-white shadow-xl shadow-[#FF1E56]/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-[#1A1A1E] text-[#555] cursor-not-allowed border border-[#27272A]'
          }`}
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>
            {isTransferring
              ? batchTransferState
                ? isAr
                  ? `جاري إرسال العنصر (${batchTransferState.currentIndex}) من (${batchTransferState.totalCount})...`
                  : `Sending item ${batchTransferState.currentIndex} of ${batchTransferState.totalCount}...`
                : isAr
                ? 'جاري النقل...'
                : 'Transferring...'
              : selectedRecipient
              ? isAr
                ? `إرسال فوري إلى ${selectedRecipient.displayName} (${selectedItems.length})`
                : `Send to ${selectedRecipient.displayName} (${selectedItems.length})`
              : selectedItems.length > 1
              ? isAr
                ? `إرسال (${selectedItems.length} عناصر)`
                : `Send (${selectedItems.length} items)`
              : isAr
              ? 'إرسال'
              : 'Send'}
          </span>
        </button>
      </div>

      {/* Fullscreen Media Lightbox Preview Modal (Supports swiping between items) */}
      <MediaLightboxModal
        isOpen={lightboxOpen}
        onClose={() => {
          setLightboxOpen(false);
        }}
        items={lightboxItems}
        initialIndex={lightboxIndex}
        lang={lang}
      />
    </div>
  );
};
