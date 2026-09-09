import React, { useState } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  Lock,
  ArrowDownToLine,
  Image as ImageIcon,
  Film,
  Camera,
  Eye,
  FolderDown,
} from 'lucide-react';
import { PeerInfo, SecurityFingerprint, TransferChannel, TransferProgress, ReceivedMediaItem, UserProfile } from '../types';
import { downloadBlob } from '../utils/fileUtils';
import { SystemDirectiveMessage } from './SystemDirectiveMessage';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';
import { getFilterStyle, resolveAvatarUrl } from '../utils/avatarFilters';
import { AvatarFullViewModal } from './AvatarFullViewModal';

interface ReceiveViewProps {
  roomId: string;
  transferChannel?: TransferChannel;
  onJoinRoom: (roomId: string) => void;
  peers: PeerInfo[];
  fingerprint: SecurityFingerprint | null;
  activeProgress: TransferProgress | null;
  lastReceivedFile: ReceivedMediaItem | null;
  receivedFilesList?: ReceivedMediaItem[];
  lang?: 'ar' | 'en';
  userProfile?: UserProfile | null;
}

export const ReceiveView: React.FC<ReceiveViewProps> = ({
  roomId,
  transferChannel = 'local',
  onJoinRoom,
  peers,
  fingerprint,
  activeProgress,
  lastReceivedFile,
  receivedFilesList = [],
  lang = 'ar',
  userProfile,
}) => {
  const isAr = lang === 'ar';
  const isRemote = transferChannel === 'remote';
  const [inputCode, setInputCode] = useState(roomId);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onJoinRoom(inputCode.trim());
      setIsEditingRoom(false);
    }
  };

  const allItems = receivedFilesList.length > 0 
    ? receivedFilesList 
    : lastReceivedFile 
    ? [lastReceivedFile] 
    : [];

  const handleOpenLightbox = (item: ReceivedMediaItem) => {
    const foundIdx = allItems.findIndex((it) => it.id === item.id);
    setLightboxIndex(foundIdx >= 0 ? foundIdx : 0);
    setLightboxOpen(true);
  };

  const handleDownloadAll = () => {
    receivedFilesList.forEach((item, index) => {
      setTimeout(() => {
        downloadBlob(item.blob, item.fileName);
      }, index * 250);
    });
  };

  const lightboxItems: LightboxMediaItem[] = allItems.map((item) => ({
    id: item.id,
    blob: item.blob,
    previewUrl: item.previewUrl,
    name: item.fileName,
    type: item.mimeType,
    size: item.fileSize,
    width: item.width,
    height: item.height,
  }));

  return (
    <div className="w-full space-y-4">
      {/* LUXURY SYSTEM DIRECTIVE MESSAGE */}
      <SystemDirectiveMessage
        role="receiver"
        channel={transferChannel}
        peerConnected={peers.length > 0}
        lang={lang}
      />

      {/* REMOTE USERNAME IDENTITY CARD (For receiving across distances without room codes) */}
      {isRemote && userProfile && (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#121217] to-[#0A0A0E] border-2 border-[#00E599]/40 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#00E599] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></span>
              {isAr ? 'حسابك جاهز للاستلام عن بُعد' : 'Ready for Remote Transfers'}
            </span>
          </div>

          <div className="p-3 bg-[#0A0A0D] rounded-xl border border-[#22222A] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                onClick={() => {
                  if (resolveAvatarUrl(userProfile.avatarUrl)) {
                    setAvatarModalOpen(true);
                  }
                }}
                className={`w-11 h-11 rounded-xl overflow-hidden border-2 border-[#00E599] flex items-center justify-center bg-[#181820] shrink-0 transition-all ${
                  resolveAvatarUrl(userProfile.avatarUrl)
                    ? 'cursor-pointer hover:border-white hover:scale-105 active:scale-95'
                    : ''
                }`}
                style={getFilterStyle(userProfile.avatarFilter || 'normal')}
                title={
                  resolveAvatarUrl(userProfile.avatarUrl)
                    ? isAr
                      ? 'اضغط لعرض الصورة كاملة'
                      : 'Click to view full photo'
                    : undefined
                }
              >
                {resolveAvatarUrl(userProfile.avatarUrl) ? (
                  <img
                    src={resolveAvatarUrl(userProfile.avatarUrl)}
                    alt={userProfile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-[#00E599]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[#71717A]">
                  {isAr ? 'اسم حسابك للبحث المباشر:' : 'Your Searchable Username:'}
                </div>
                <div className="text-sm font-black text-white truncate">
                  {userProfile.displayName}
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 text-xs font-bold shrink-0">
              {isAr ? 'معرّف معتمد' : 'Verified'}
            </span>
          </div>

          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
            {isAr
              ? 'يمكن لأي مرسل (في الكويت أو السودان أو أي مكان) كتابة اسم حسابك أعلاه للتحقق من صورتك وإرسال الوسائط إليك مباشرة وسحابياً فوراً.'
              : 'Any sender worldwide can type your username above to visually verify your avatar and send lossless media directly.'}
          </p>
        </div>
      )}

      {/* Room Connection Card */}
      <div className="p-4 sm:p-5 bg-[#0E0E10] rounded-2xl border border-[#27272A] space-y-3.5 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A1A1AA] font-semibold">
            {isAr ? 'رمز غرفة الاستلام المباشر:' : 'Receiver Room Code:'}
          </span>
          <button
            onClick={() => setIsEditingRoom(!isEditingRoom)}
            className="text-xs text-[#FF1E56] hover:underline font-bold cursor-pointer"
          >
            {isEditingRoom ? (isAr ? 'إلغاء' : 'Cancel') : isAr ? 'تغيير الرمز' : 'Change Code'}
          </button>
        </div>

        {isEditingRoom ? (
          <form onSubmit={handleJoinSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="مثال: 492-184"
              className="flex-1 px-3.5 py-3 bg-[#0A0A0C] border border-[#27272A] rounded-xl text-sm font-mono text-[#FF1E56] focus:outline-none focus:border-[#FF1E56]"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-[#FF1E56] hover:bg-[#FF3366] text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-[#FF1E56]/20 cursor-pointer"
            >
              {isAr ? 'تأكيد الرمز' : 'Connect'}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-[#0A0A0C] p-3.5 rounded-xl border border-[#27272A]">
            <div>
              <div className="text-[10px] text-[#71717A] mb-0.5">{isAr ? 'الرمز المسجل حالياً' : 'Active Room'}</div>
              <span className="font-mono text-xl font-black text-[#FF1E56] tracking-widest">
                {roomId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#71717A] mb-0.5 block">{isAr ? 'حالة النفق' : 'Tunnel'}</span>
              <div className="flex items-center gap-1.5 text-xs text-[#FF1E56] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FF1E56] animate-pulse"></span>
                <span>{isAr ? 'مشفر وجاهز' : 'E2EE Ready'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Receiver Status Indicator */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1C1C20]">
          <span className="text-[#71717A]">{isAr ? 'المرسل المتصل:' : 'Connected Sender:'}</span>
          <span className="font-bold text-xs">
            {peers.length > 0 ? (
              <span className="text-[#00E599] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E599]"></span>
                <span>{peers[0].deviceName}</span>
              </span>
            ) : (
              <span className="text-[#71717A]">{isAr ? 'في انتظار اتصال المرسل...' : 'Waiting for sender...'}</span>
            )}
          </span>
        </div>
      </div>

      {/* Receiver State: Empty Waiting or Received Items List */}
      {allItems.length === 0 ? (
        /* Standby State */
        <div className="p-8 sm:p-10 bg-[#0E0E10] rounded-2xl border-2 border-dashed border-[#27272A] flex flex-col items-center justify-center text-center space-y-3.5">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A1E] text-[#FF1E56] flex items-center justify-center border border-[#27272A]">
            <DownloadCloud className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg text-white mb-1">
              {isAr ? 'جاهز لاستلام الصور ومقاطع الفيديو' : 'Ready to Receive Media'}
            </h4>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-sm leading-relaxed">
              {transferChannel === 'remote'
                ? isAr
                  ? 'بمجرد أن يضغط المرسل على زر الإرسال، ستصل الصور والفيديوهات فوراً عبر النفق المشفر.'
                  : 'Media streams over encrypted tunnel as soon as sender taps send.'
                : isAr
                ? 'بمجرد أن يضغط المرسل على زر الإرسال، ستصلك الصور ومقاطع الفيديو مباشرة وبأقصى سرعة.'
                : 'Direct high-speed stream begins immediately when sender transmits.'}
            </p>
          </div>
        </div>
      ) : (
        /* Received Items Section */
        <div className="space-y-3">
          {/* Header with Save All if multiple */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00E599]" />
              <span className="text-xs sm:text-sm font-bold text-white">
                {isAr
                  ? `الوسائط المستلمة (${allItems.length}):`
                  : `Received Media (${allItems.length}):`}
              </span>
            </div>

            {allItems.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="px-3 py-1.5 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-white text-xs font-bold transition-all shadow-md shadow-[#FF1E56]/20 flex items-center gap-1.5 cursor-pointer"
              >
                <FolderDown className="w-4 h-4" />
                <span>{isAr ? 'حفظ جميع العناصر' : 'Save All'}</span>
              </button>
            )}
          </div>

          {/* Cards for each received item */}
          <div className="space-y-3">
            {allItems.map((item) => {
              const isVideo = item.mimeType.startsWith('video/');
              return (
                <div
                  key={item.id}
                  className="p-4 bg-[#0E0E10] rounded-2xl border border-[#27272A] hover:border-[#FF1E56]/40 transition-all space-y-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail with quick preview on click */}
                    <div
                      onClick={() => handleOpenLightbox(item)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-black border border-[#27272A] shrink-0 cursor-pointer group"
                      title={isAr ? 'معاينة بشاشة كاملة' : 'Preview Fullscreen'}
                    >
                      {item.previewUrl && !isVideo ? (
                        <img
                          src={item.previewUrl}
                          alt={item.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : item.previewUrl && isVideo ? (
                        <video
                          src={item.previewUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FF1E56]">
                          {isVideo ? <Film className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Clean File Title */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-white truncate">{item.fileName}</h5>
                      <span className="text-[11px] text-[#00E599] font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isAr ? 'تم الاستلام بنجاح' : 'Received successfully'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions: Full Clean Preview + Save to Device */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleOpenLightbox(item)}
                      className="py-2.5 px-3 rounded-xl bg-[#141418] hover:bg-[#1E1E26] text-white border border-[#27272A] hover:border-[#FF1E56]/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#FF1E56]" />
                      <span>{isAr ? 'معاينة كاملة' : 'Full Preview'}</span>
                    </button>

                    <button
                      onClick={() => downloadBlob(item.blob, item.fileName)}
                      className="py-2.5 px-3 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#FF1E56]/20 cursor-pointer"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>{isAr ? 'حفظ' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal (Supports swiping between all received media) */}
      <MediaLightboxModal
        isOpen={lightboxOpen}
        onClose={() => {
          setLightboxOpen(false);
        }}
        items={lightboxItems}
        initialIndex={lightboxIndex}
        lang={lang}
      />

      {/* User Avatar Full View Modal */}
      {userProfile && (
        <AvatarFullViewModal
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          avatarUrl={userProfile.avatarUrl}
          filter={userProfile.avatarFilter}
          userName={userProfile.displayName}
          lang={lang}
        />
      )}
    </div>
  );
};
