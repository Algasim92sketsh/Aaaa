import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  UserCheck,
  Paperclip,
  Zap,
} from 'lucide-react';
import { DirectChatMessage, PublicProfile, UserProfile } from '../types';
import {
  getChatId,
  getOrCreateDirectChat,
  listenToDirectChatMessages,
  sendDirectChatMessage,
} from '../utils/directChat';
import { getFilterStyle, resolveAvatarUrl } from '../utils/avatarFilters';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  recipient: PublicProfile;
  onInitiateTransfer?: () => void;
  lang?: 'ar' | 'en';
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  recipient,
  onInitiateTransfer,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loadingChat, setLoadingChat] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch the direct chat room
  useEffect(() => {
    if (!isOpen || !currentUser || !recipient) return;

    let isMounted = true;
    setLoadingChat(true);

    getOrCreateDirectChat(currentUser, recipient)
      .then((id) => {
        if (isMounted && id) {
          setChatId(id);
        }
      })
      .catch((err) => console.error('Error creating direct chat:', err))
      .finally(() => {
        if (isMounted) setLoadingChat(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser, recipient]);

  // Real-time messages listener
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToDirectChatMessages(chatId, (newMsgs) => {
      setMessages(newMsgs);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !chatId || !currentUser || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendDirectChatMessage({
        chatId,
        senderUid: currentUser.uid,
        senderName: currentUser.displayName,
        senderAvatarUrl: currentUser.avatarUrl,
        senderAvatarFilter: currentUser.avatarFilter,
        text: textToSend,
        type: 'text',
      });
    } catch (err) {
      console.error('Failed to send direct message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTransferInvite = async () => {
    if (!chatId || !currentUser) return;
    try {
      await sendDirectChatMessage({
        chatId,
        senderUid: currentUser.uid,
        senderName: currentUser.displayName,
        senderAvatarUrl: currentUser.avatarUrl,
        senderAvatarFilter: currentUser.avatarFilter,
        text: isAr
          ? '🚀 أود إرسال صور وفيديوهات إليك بالجودة الأصلية 100% الآن عبر PureDrop.'
          : '🚀 I would like to send lossless photos and videos to you via PureDrop.',
        type: 'transfer_notice',
      });
      onInitiateTransfer?.();
    } catch (err) {
      console.error('Failed to send transfer notice:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-xl h-[88vh] flex flex-col bg-[#0A0A0E] border border-[#27272A] rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#FF1E56]/15 text-white overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#1E1E24] bg-[#0E0E14] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Recipient Avatar */}
            <div
              className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-[#00E599] flex items-center justify-center bg-[#181820] shrink-0 shadow-md"
              style={getFilterStyle(recipient.avatarFilter || 'normal')}
            >
              {resolveAvatarUrl(recipient.avatarUrl) ? (
                <img
                  src={resolveAvatarUrl(recipient.avatarUrl)}
                  alt={recipient.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCheck className="w-5 h-5 text-[#00E599]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white truncate">
                  {recipient.displayName}
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
                  {isAr ? 'محادثة مشفرة' : 'E2EE Chat'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                {recipient.phoneNumber ? (
                  <span className="text-[#FF1E56] font-mono font-bold flex items-center gap-1 dir-ltr">
                    <Phone className="w-3 h-3 inline" />
                    {recipient.phoneNumber}
                  </span>
                ) : (
                  <span>{recipient.deviceAlias || (isAr ? 'حساب نشط' : 'Active')}</span>
                )}
                <span>•</span>
                <span className="text-emerald-400 font-bold">{isAr ? 'متصل الآن' : 'Online'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Send Media Trigger */}
            <button
              type="button"
              onClick={handleSendTransferInvite}
              className="px-3 py-1.5 rounded-xl bg-[#FF1E56]/20 hover:bg-[#FF1E56] text-[#FF1E56] hover:text-white border border-[#FF1E56]/40 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={isAr ? 'إرسال صور وفيديوهات للمستلم' : 'Send media to recipient'}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'إرسال وسائط' : 'Send Media'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#71717A] hover:text-white hover:bg-[#1A1A22] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#09090C] to-[#0D0D12] scrollbar-thin">
          {loadingChat ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-[#A1A1AA]">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF1E56]" />
              <span>{isAr ? 'جاري فتح المحادثة المشفرة...' : 'Connecting encrypted chat...'}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-xs text-[#71717A]">
              <div className="w-14 h-14 rounded-2xl bg-[#14141A] border border-[#27272A] flex items-center justify-center text-[#FF1E56] shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <p className="font-bold text-white text-sm">
                {isAr ? 'محادثة فورية مباشرة بينك وبين المستلم' : 'Direct encrypted communication'}
              </p>
              <p className="max-w-xs text-[11px] leading-relaxed text-[#8E8E98]">
                {isAr
                  ? 'يمكنكما التنسيق وتبادل الرسائل الفورية والتأكد من فتح نفق الإرسال الآمن للصور والفيديوهات بالجودة الأصلية.'
                  : 'Coordinate and exchange messages before or during lossless media transmission.'}
              </p>
              <button
                type="button"
                onClick={handleSendTransferInvite}
                className="px-4 py-2 rounded-xl bg-[#FF1E56] hover:bg-[#E0184A] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF1E56]/20"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isAr ? 'طلب إرسال صور وفيديوهات الآن' : 'Request media transfer now'}</span>
              </button>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUser && msg.senderUid === currentUser.uid;
              const isNotice = msg.type === 'transfer_notice' || msg.type === 'media_invite';

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div
                      className="w-7 h-7 rounded-lg overflow-hidden border border-[#27272A] bg-[#141418] shrink-0 mb-1"
                      style={getFilterStyle(msg.senderAvatarFilter || 'normal')}
                    >
                      {resolveAvatarUrl(msg.senderAvatarUrl) ? (
                        <img
                          src={resolveAvatarUrl(msg.senderAvatarUrl)}
                          alt={msg.senderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-bold">
                          {msg.senderName.slice(0, 1)}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl p-3 shadow-md ${
                      isNotice
                        ? 'bg-gradient-to-br from-[#1F1015] to-[#12080B] border border-[#FF1E56]/50 text-white'
                        : isMe
                        ? 'bg-gradient-to-r from-[#FF1E56] to-[#E01448] text-white rounded-br-xs'
                        : 'bg-[#181822] text-[#EDEDED] border border-[#272730] rounded-bl-xs'
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-[#A1A1AA] block mb-1">
                        {msg.senderName}
                      </span>
                    )}

                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </p>

                    <div
                      className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-white/70' : 'text-[#71717A]'
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCircle2 className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-[#1E1E24] bg-[#0E0E14] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isAr
                ? 'اكتب رسالة فورية للمستلم...'
                : 'Type a message to recipient...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#14141A] border border-[#27272A] focus:border-[#FF1E56] text-white text-xs sm:text-sm placeholder-[#71717A] outline-none transition-all shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-[#FF1E56] hover:bg-[#E0184A] disabled:opacity-40 disabled:hover:bg-[#FF1E56] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md shadow-[#FF1E56]/20"
            title={isAr ? 'إرسال' : 'Send'}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
