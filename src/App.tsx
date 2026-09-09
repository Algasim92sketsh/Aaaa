/**
 * PureDrop - Lossless Encrypted Media Transfer
 * Dedicated to Photos & 4K Videos (Zero-Compression Engine)
 * Architected by: Eng. Abualgasim Motasim Alkheir Ahmed
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Download,
  Lock,
  Info,
  Radio,
  Globe,
  Camera,
  ShieldCheck,
  User as UserIcon,
  Settings,
} from 'lucide-react';
import { SendView, SelectedMediaQueueItem } from './components/SendView';
import { ReceiveView } from './components/ReceiveView';
import { AboutView } from './components/AboutView';
import { TransferProgressModal } from './components/TransferProgressModal';
import { SentMediaRecord } from './components/SentItemsGallery';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal';
import { IncomingTransferModal } from './components/IncomingTransferModal';
import { DirectChatModal } from './components/DirectChatModal';
import { useAuth } from './context/AuthContext';
import { getFilterStyle, resolveAvatarUrl } from './utils/avatarFilters';
import { PureDropClient } from './utils/transferClient';
import {
  createRemoteTransferSession,
  listenToIncomingTransfers,
  updateTransferSessionStatus,
} from './utils/remoteDirectory';
import {
  deriveKeyFromSecret,
  generateRoomCode,
  generateSalt,
  generateSecurityFingerprint,
} from './utils/crypto';
import {
  DeviceSettings,
  FileMetadata,
  PeerInfo,
  ReceivedMediaItem,
  SecurityFingerprint,
  TransferChannel,
  TransferProgress,
  PublicProfile,
  RemoteTransfer,
} from './types';
import { downloadBlob } from './utils/fileUtils';
import {
  getSoundConfig,
  updateSoundConfig,
  playTransferCompleteSound,
  playConnectionErrorSound,
  playButtonClickSound,
} from './utils/soundEffects';

type ActiveTab = 'send' | 'receive';

export default function App() {
  // Read parameters from URL (room code & channel)
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoom = urlParams.get('room') || generateRoomCode();
  const initialChannel: TransferChannel =
    urlParams.get('channel') === 'remote' ? 'remote' : 'local';

  const [roomId, setRoomId] = useState(initialRoom);
  const [transferChannel, setTransferChannel] = useState<TransferChannel>(initialChannel);
  const [activeTab, setActiveTab] = useState<ActiveTab>('send');
  const [isAboutPageOpen, setIsAboutPageOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // User Profile & Authentication from Firebase
  const { user, userProfile, isDbConnected } = useAuth();

  // Remote user transfer states (Username search & visual confirmation)
  const [selectedRecipient, setSelectedRecipient] = useState<PublicProfile | null>(null);
  const [incomingTransfer, setIncomingTransfer] = useState<RemoteTransfer | null>(null);
  const [directChatRecipient, setDirectChatRecipient] = useState<PublicProfile | null>(null);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  // Listen for incoming remote transfers targeted at current user
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = listenToIncomingTransfers(user.uid, (transfers) => {
      const pending = transfers.find((t) => t.status === 'pending');
      if (pending) {
        setIncomingTransfer(pending);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const handleAcceptIncomingTransfer = async (transfer: RemoteTransfer) => {
    try {
      await updateTransferSessionStatus(transfer.transferId, 'accepted');
      setRoomId(transfer.roomId);
      setTransferChannel('remote');
      setActiveTab('receive');
      setIncomingTransfer(null);
    } catch (err) {
      console.error('Failed to accept remote transfer:', err);
    }
  };

  const handleRejectIncomingTransfer = async (transfer: RemoteTransfer) => {
    try {
      await updateTransferSessionStatus(transfer.transferId, 'rejected');
      setIncomingTransfer(null);
    } catch (err) {
      console.error('Failed to reject remote transfer:', err);
    }
  };

  const initialSoundConfig = getSoundConfig();
  const [settings, setSettings] = useState<DeviceSettings>({
    deviceName: 'محطة نقل الصور والفيديوهات',
    chunkSizeKb: 128,
    preferP2P: true,
    darkOledMode: true,
    autoSaveToDevice: true,
    language: 'ar',
    hapticFeedback: true,
    soundEffectsEnabled: initialSoundConfig.soundEffectsEnabled,
    buttonClicksSoundEnabled: initialSoundConfig.buttonClicksSoundEnabled,
  });

  const handleUpdateSettings = (newSettings: Partial<DeviceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (
        newSettings.soundEffectsEnabled !== undefined ||
        newSettings.buttonClicksSoundEnabled !== undefined
      ) {
        updateSoundConfig({
          soundEffectsEnabled: updated.soundEffectsEnabled,
          buttonClicksSoundEnabled: updated.buttonClicksSoundEnabled,
        });
      }
      return updated;
    });
  };

  // Tactile audio feedback on pressing any button or interactive element
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        'button, [role="button"], a, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select, label'
      );
      if (interactive) {
        playButtonClickSound();
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  // Keep device name in sync with authenticated user identity
  useEffect(() => {
    if (userProfile?.displayName) {
      setSettings((prev) => ({
        ...prev,
        deviceName: userProfile.displayName,
      }));
    }
  }, [userProfile?.displayName]);

  const isAr = settings.language === 'ar';

  // Sender state (supports multiple photos and videos)
  const [selectedItems, setSelectedItems] = useState<SelectedMediaQueueItem[]>([]);
  const [batchTransferState, setBatchTransferState] = useState<{
    currentIndex: number;
    totalCount: number;
    currentFileName: string;
  } | null>(null);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [fingerprint, setFingerprint] = useState<SecurityFingerprint | null>(null);
  const [transferProgress, setTransferProgress] = useState<TransferProgress | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [sentItems, setSentItems] = useState<SentMediaRecord[]>([]);

  // Receiver state (supports multiple received files)
  const [lastReceivedFile, setLastReceivedFile] = useState<ReceivedMediaItem | null>(null);
  const [receivedFilesList, setReceivedFilesList] = useState<ReceivedMediaItem[]>([]);

  const clientRef = useRef<PureDropClient | null>(null);

  // Connect to room & derive AES-256 key
  useEffect(() => {
    let isMounted = true;

    async function initClient() {
      const salt = generateSalt();
      const key = await deriveKeyFromSecret(roomId, salt);
      const fp = await generateSecurityFingerprint(key);

      if (!isMounted) return;
      setFingerprint(fp);

      clientRef.current?.disconnect();

      const client = new PureDropClient(
        `peer-${Math.random().toString(36).substr(2, 6)}`,
        settings.deviceName,
        activeTab === 'send',
        {
          onPeersUpdated: (updatedPeers) => {
            if (isMounted) setPeers(updatedPeers);
          },
          onError: (errMsg) => {
            console.warn('PureDrop Client error:', errMsg);
            playConnectionErrorSound();
          },
          onStatusChange: (status) => {
            if (status.includes('قطع') || status.includes('خطأ') || status.includes('فشل')) {
              playConnectionErrorSound();
            }
          },
          onProgress: (p) => {
            if (isMounted) {
              setTransferProgress(p);
              if (p.status === 'completed' || p.status === 'error') {
                setIsTransferring(false);
                if (p.status === 'error') {
                  playConnectionErrorSound();
                }
              }
            }
          },
          onTransferCompleted: (blob, header, verified) => {
            if (isMounted) {
              // Play elegant transfer completion chime
              playTransferCompleteSound();

              const previewUrl = URL.createObjectURL(blob);
              const newItem: ReceivedMediaItem = {
                id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                blob,
                fileName: header.fileName,
                fileSize: header.fileSize,
                mimeType: header.mimeType,
                width: header.width,
                height: header.height,
                originalSha256: header.originalSha256,
                receivedSha256: header.originalSha256,
                verified,
                previewUrl,
                receivedAt: Date.now(),
              };
              setLastReceivedFile(newItem);
              setReceivedFilesList((prev) => [newItem, ...prev]);
              if (settings.autoSaveToDevice) {
                downloadBlob(blob, header.fileName);
              }
            }
          },
        }
      );

      client.chunkSize = settings.chunkSizeKb * 1024;
      client.preferP2P = settings.preferP2P;
      client.setEncryptionKey(key);
      clientRef.current = client;

      try {
        await client.connect(roomId);
      } catch (err) {
        console.warn('Failed to connect to room:', err);
        playConnectionErrorSound();
      }
    }

    initClient();

    return () => {
      isMounted = false;
      clientRef.current?.disconnect();
    };
  }, [roomId, settings.chunkSizeKb, settings.preferP2P, settings.deviceName, activeTab, settings.autoSaveToDevice]);

  // Batch / Multi-item transfer handler
  const handleStartTransfer = async () => {
    if (selectedItems.length === 0 || !clientRef.current) return;
    setIsTransferring(true);
    try {
      // If remote transfer to a verified recipient is active, announce session to Firebase
      if (transferChannel === 'remote' && selectedRecipient && user) {
        const totalBytes = selectedItems.reduce((acc, it) => acc + it.file.size, 0);
        await createRemoteTransferSession({
          senderUid: user.uid,
          senderName: userProfile?.displayName || user.displayName || 'مستخدم PureDrop',
          senderAvatarUrl: userProfile?.avatarUrl,
          senderAvatarFilter: userProfile?.avatarFilter || 'normal',
          receiver: selectedRecipient,
          roomId: roomId,
          fileCount: selectedItems.length,
          totalBytes,
        });
      }

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        setBatchTransferState({
          currentIndex: i + 1,
          totalCount: selectedItems.length,
          currentFileName: item.meta.name,
        });

        await clientRef.current.sendFile(
          item.file,
          item.meta.sha256 || '',
          item.meta.width,
          item.meta.height,
          item.meta.duration
        );

        // Record each sent item in history for instant preview
        setSentItems((prev) => [
          {
            id: `sent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            file: item.file,
            metadata: item.meta,
            sentAt: Date.now(),
            status: 'sent',
          },
          ...prev.filter((p) => p.metadata.name !== item.meta.name),
        ]);
      }
      setSelectedItems([]);
      // Play celebratory sound on sender completion
      playTransferCompleteSound();
    } catch (err) {
      console.error('Batch transfer error:', err);
      playConnectionErrorSound();
    } finally {
      setIsTransferring(false);
      setBatchTransferState(null);
    }
  };

  // Dedicated Full About Page
  if (isAboutPageOpen) {
    return (
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#050507] text-white flex flex-col font-sans select-none"
      >
        <header className="h-16 shrink-0 border-b border-[#1C1C20] flex items-center justify-between px-4 sm:px-8 bg-[#0A0A0C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF1E56] to-[#C90E3E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF1E56]/25 shrink-0">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                PURE<span className="text-[#FF1E56]">DROP</span>
              </span>
              <span className="text-[11px] text-[#A1A1AA] block -mt-1 font-semibold">
                {isAr ? 'التوثيق الفني والهندسي' : 'Technical Documentation'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAboutPageOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] text-white text-xs font-bold transition-all shadow-md shadow-[#FF1E56]/25 cursor-pointer"
          >
            {isAr ? 'العودة إلى نافذة النقل' : 'Back to Transfer'}
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <AboutView lang={settings.language} onBack={() => setIsAboutPageOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col bg-[#050507] text-white font-sans select-none touch-manipulation overscroll-none"
    >
      {/* TOP APPLICATION STATUS BAR - Spacious, Uncluttered & Clear */}
      <header className="h-16 shrink-0 border-b border-[#1C1C22] flex items-center justify-between px-4 sm:px-8 bg-[#0A0A0C] z-30 shadow-md">
        {/* Brand & Lossless Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FF1E56] to-[#C90E3E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF1E56]/25 shrink-0">
            <Camera className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                PURE<span className="text-[#FF1E56]">DROP</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FF1E56]/15 text-[#FF1E56] border border-[#FF1E56]/30 text-[10px] font-mono font-bold uppercase">
                100% LOSSLESS
              </span>
            </div>
            <div className="text-[10px] text-[#71717A] hidden sm:block">
              {isAr ? 'منظومة نقل الصور ومقاطع الفيديو الخام' : 'Lossless Photo & 4K Video Tunnel'}
            </div>
          </div>
        </div>

        {/* Security & Room Badge Status & Profile Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings & Audio Controls Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#141418] hover:bg-[#1A1A22] border border-[#27272A] hover:border-[#FF1E56]/50 transition-all cursor-pointer text-white flex items-center gap-1.5 shadow-sm"
            title={isAr ? 'إعدادات التطبيق والتأثيرات الصوتية' : 'Settings & Sound Effects'}
          >
            <Settings className="w-4 h-4 text-[#FF1E56]" />
            <span className="text-xs font-bold hidden sm:inline">
              {isAr ? 'الإعدادات والأصوات' : 'Settings & Audio'}
            </span>
          </button>

          {/* User Account Button */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#141418] hover:bg-[#1A1A22] border border-[#27272A] hover:border-[#FF1E56]/50 transition-all cursor-pointer group shadow-sm"
            title={isAr ? 'إدارة الحساب والهوية الرقمية' : 'User Account & Profile'}
          >
            <div
              className="w-7 h-7 rounded-lg overflow-hidden border border-[#FF1E56] flex items-center justify-center bg-[#1D1D24] shrink-0"
              style={getFilterStyle(userProfile?.avatarFilter || 'normal')}
            >
              {resolveAvatarUrl(userProfile?.avatarUrl) ? (
                <img
                  src={resolveAvatarUrl(userProfile?.avatarUrl)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-[#FF1E56]" />
              )}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-white group-hover:text-[#FF1E56] transition-colors truncate max-w-[90px] sm:max-w-[140px]">
                {userProfile?.displayName ||
                  (user
                    ? user.isAnonymous
                      ? isAr
                        ? 'مستخدم ضيف'
                        : 'Guest User'
                      : user.displayName || (isAr ? 'مستخدم' : 'User')
                    : isAr
                    ? 'تسجيل الدخول'
                    : 'Sign In')}
              </span>
              {userProfile?.deviceAlias && (
                <span className="text-[10px] text-[#A1A1AA] truncate max-w-[90px] sm:max-w-[140px] hidden xs:block">
                  {userProfile.deviceAlias}
                </span>
              )}
            </div>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141418] border border-[#27272A] text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
            <span className="text-[#A1A1AA] text-[11px] font-mono hidden sm:inline">
              {isAr ? 'نفق مشفر: ' : 'Tunnel: '}
            </span>
            <span className="text-white font-bold font-mono">{roomId}</span>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT WORKSPACE (Fixed, Non-Movable) */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-8 bg-[#050507]">
        <div className="w-full max-w-2xl mx-auto space-y-4 pb-4">
          {/* TRANSFER CHANNEL SELECTOR (Local Hotspot vs Global Remote Internet) */}
          <div className="bg-[#0E0E10] p-1.5 rounded-2xl border border-[#27272A] shadow-lg">
            <div className="text-[11px] font-bold text-[#71717A] px-3 pt-1 pb-1.5 uppercase tracking-wider">
              {isAr ? 'اختر مسار نقل الصور والفيديوهات:' : 'Select Media Transfer Channel:'}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Channel 1: Local Hotspot / Wi-Fi */}
              <button
                onClick={() => setTransferChannel('local')}
                className={`p-3 rounded-xl flex flex-col items-center sm:items-start text-center sm:text-right gap-1 transition-all cursor-pointer ${
                  transferChannel === 'local'
                    ? 'bg-[#1C0F13] text-white border-2 border-[#FF1E56] shadow-lg shadow-[#FF1E56]/15'
                    : 'bg-[#121215] text-[#A1A1AA] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio
                    className={`w-4 h-4 ${
                      transferChannel === 'local' ? 'text-[#FF1E56]' : 'text-[#71717A]'
                    }`}
                  />
                  <span className="font-bold text-xs sm:text-sm">
                    {isAr ? 'نقل محلي مباشر' : 'Local Radio (P2P)'}
                  </span>
                </div>
                <span className="text-[11px] text-[#888] pr-0 sm:pr-6">
                  {isAr ? 'نقطة اتصال / بدون إنترنت (أقصى سرعة)' : 'Personal Hotspot / Offline'}
                </span>
              </button>

              {/* Channel 2: Global Remote Internet */}
              <button
                onClick={() => setTransferChannel('remote')}
                className={`p-3 rounded-xl flex flex-col items-center sm:items-start text-center sm:text-right gap-1 transition-all cursor-pointer ${
                  transferChannel === 'remote'
                    ? 'bg-[#1C0F13] text-white border-2 border-[#FF1E56] shadow-lg shadow-[#FF1E56]/15'
                    : 'bg-[#121215] text-[#A1A1AA] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe
                    className={`w-4 h-4 ${
                      transferChannel === 'remote' ? 'text-[#FF1E56]' : 'text-[#71717A]'
                    }`}
                  />
                  <span className="font-bold text-xs sm:text-sm">
                    {isAr ? 'نقل عالمي عن بُعد' : 'Global Remote Cloud'}
                  </span>
                </div>
                <span className="text-[11px] text-[#888] pr-0 sm:pr-6">
                  {isAr ? 'عبر الإنترنت لأي مكان (بجودة خام 100%)' : 'Lossless Over Internet'}
                </span>
              </button>
            </div>
          </div>

          {/* Active Workspace: SendView or ReceiveView */}
          {activeTab === 'send' ? (
            <SendView
              roomId={roomId}
              transferChannel={transferChannel}
              selectedItems={selectedItems}
              onAddItems={(items) => setSelectedItems((prev) => [...prev, ...items])}
              onRemoveItem={(id) => setSelectedItems((prev) => prev.filter((it) => it.id !== id))}
              onClearItems={() => setSelectedItems([])}
              onStartTransfer={handleStartTransfer}
              peers={peers}
              fingerprint={fingerprint}
              isTransferring={isTransferring}
              batchTransferState={batchTransferState}
              sentItems={sentItems}
              onResendItem={(item) => {
                setSelectedItems((prev) => [
                  ...prev,
                  {
                    id: `resend-${Date.now()}`,
                    file: item.file,
                    meta: item.metadata,
                  },
                ]);
              }}
              onClearHistory={() => setSentItems([])}
              lang={settings.language}
              currentUid={user?.uid}
              selectedRecipient={selectedRecipient}
              onSelectRecipient={setSelectedRecipient}
              onClearRecipient={() => setSelectedRecipient(null)}
              onOpenDirectChat={(recipient) => {
                setDirectChatRecipient(recipient);
                setIsDirectChatOpen(true);
              }}
            />
          ) : (
            <ReceiveView
              roomId={roomId}
              transferChannel={transferChannel}
              onJoinRoom={(newRoom) => setRoomId(newRoom)}
              peers={peers}
              fingerprint={fingerprint}
              activeProgress={transferProgress}
              lastReceivedFile={lastReceivedFile}
              receivedFilesList={receivedFilesList}
              lang={settings.language}
              userProfile={userProfile}
            />
          )}
        </div>
      </main>

      {/* DEDICATED LUXURY TASKBAR - 3 Clean, Highly Legible Tabs */}
      <nav className="h-16 shrink-0 bg-gradient-to-t from-[#08080B] to-[#0D0D12] border-t-2 border-[#1E1E26] px-4 sm:px-8 flex items-center justify-around z-30 shadow-2xl shadow-black">
        {/* Tab 1: SEND (إرسال) */}
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 max-w-[160px] sm:max-w-[200px] py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'send'
              ? 'bg-[#FF1E56] text-white shadow-lg shadow-[#FF1E56]/30 scale-105'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#15151B]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            {isAr ? 'إرسال' : 'Send'}
          </span>
        </button>

        {/* Tab 2: RECEIVE (إستلام) */}
        <button
          onClick={() => setActiveTab('receive')}
          className={`flex-1 max-w-[160px] sm:max-w-[200px] py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
            activeTab === 'receive'
              ? 'bg-[#FF1E56] text-white shadow-lg shadow-[#FF1E56]/30 scale-105'
              : 'text-[#A1A1AA] hover:text-white hover:bg-[#15151B]'
          }`}
        >
          <div className="relative">
            <Download className="w-4 h-4" />
            {lastReceivedFile && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00E599] border-2 border-[#0D0D12] animate-ping"></span>
            )}
          </div>
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            {isAr ? 'إستلام' : 'Receive'}
          </span>
        </button>

        {/* Tab 3: ABOUT (حول) */}
        <button
          onClick={() => setIsAboutPageOpen(true)}
          className="flex-1 max-w-[120px] sm:max-w-[160px] py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[#A1A1AA] hover:text-[#FF1E56] hover:bg-[#15151B] cursor-pointer"
        >
          <Info className="w-4 h-4 text-[#FF1E56]" />
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            {isAr ? 'حول' : 'About'}
          </span>
        </button>

        {/* Tab 4: ACCOUNT (حسابي) */}
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex-1 max-w-[120px] sm:max-w-[160px] py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[#A1A1AA] hover:text-white hover:bg-[#15151B] cursor-pointer relative"
        >
          <div
            className="w-4 h-4 rounded-full overflow-hidden border border-[#FF1E56] flex items-center justify-center"
            style={getFilterStyle(userProfile?.avatarFilter || 'normal')}
          >
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-3 h-3 text-[#FF1E56]" />
            )}
          </div>
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            {isAr ? 'حسابي' : 'Account'}
          </span>
          {user && (
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          )}
        </button>
        {/* Tab 5: SETTINGS (الإعدادات) */}
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex-1 max-w-[120px] sm:max-w-[160px] py-2 px-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-[#A1A1AA] hover:text-[#FF1E56] hover:bg-[#15151B] cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#FF1E56]" />
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            {isAr ? 'الإعدادات' : 'Settings'}
          </span>
        </button>
      </nav>

      {/* Settings & Audio Effects Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSecurityModal={() => {
          setIsSettingsModalOpen(false);
          setIsSecurityModalOpen(true);
        }}
        lang={settings.language}
      />

      {/* Security Architecture Modal */}
      {isSecurityModalOpen && (
        <SecurityArchitectureModal
          onClose={() => setIsSecurityModalOpen(false)}
          lang={settings.language}
        />
      )}

      {/* User Profile & Photo Filter Studio Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        lang={settings.language}
      />

      {/* Transfer Progress HUD Modal */}
      {transferProgress && isTransferring && (
        <TransferProgressModal
          progress={transferProgress}
          onCancel={() => clientRef.current?.cancelTransfer()}
          onDownload={() => {
            if (transferProgress.downloadBlob) {
              downloadBlob(transferProgress.downloadBlob, transferProgress.fileName);
            }
          }}
          onClose={() => setTransferProgress(null)}
          lang={settings.language}
        />
      )}

      {/* Incoming Remote Transfer Notification Modal */}
      <IncomingTransferModal
        transfer={incomingTransfer}
        onAccept={handleAcceptIncomingTransfer}
        onReject={handleRejectIncomingTransfer}
        lang={settings.language}
      />

      {/* Direct Chat Modal for Remote Photo & Video Coordination */}
      <DirectChatModal
        isOpen={isDirectChatOpen}
        onClose={() => setIsDirectChatOpen(false)}
        recipient={directChatRecipient}
        currentProfile={userProfile}
        onSendMediaInitiate={(recipient) => {
          setIsDirectChatOpen(false);
          setSelectedRecipient(recipient);
          setActiveTab('send');
          setTransferChannel('remote');
        }}
        lang={settings.language}
      />
    </div>
  );
}
