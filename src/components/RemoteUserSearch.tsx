import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Users,
  Globe,
  Radio,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { PublicProfile } from '../types';
import { searchPublicProfiles, searchPublicProfilesByPhone } from '../utils/remoteDirectory';
import { getFilterStyle, resolveAvatarUrl } from '../utils/avatarFilters';
import { CountryCodePicker } from './CountryCodePicker';
import { CountryCodeItem, ALL_COUNTRY_CODES } from '../utils/countryCodes';

interface RemoteUserSearchProps {
  currentUid?: string;
  selectedRecipient: PublicProfile | null;
  onSelectRecipient: (recipient: PublicProfile) => void;
  onClearRecipient: () => void;
  onOpenDirectChat?: (recipient: PublicProfile) => void;
  lang?: 'ar' | 'en';
}

type SearchMode = 'phone' | 'name';

export const RemoteUserSearch: React.FC<RemoteUserSearchProps> = ({
  currentUid,
  selectedRecipient,
  onSelectRecipient,
  onClearRecipient,
  onOpenDirectChat,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const [searchMode, setSearchMode] = useState<SearchMode>('phone');
  const [searchQuery, setSearchQuery] = useState('');

  // Phone search state
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('+965');
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>('');

  const [results, setResults] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search with debounce
  useEffect(() => {
    let isMounted = true;
    const delayDebounce = setTimeout(async () => {
      if (searchMode === 'name') {
        if (!searchQuery.trim()) {
          if (isMounted) {
            setResults([]);
            setHasSearched(false);
          }
          return;
        }

        setLoading(true);
        try {
          const users = await searchPublicProfiles(searchQuery, currentUid);
          if (isMounted) {
            setResults(users || []);
            setHasSearched(true);
          }
        } catch (err) {
          console.warn('Search error:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        // Phone search mode
        if (!phoneNumberInput.trim()) {
          if (isMounted) {
            setResults([]);
            setHasSearched(false);
          }
          return;
        }

        setLoading(true);
        try {
          const users = await searchPublicProfilesByPhone(
            selectedCountryCode,
            phoneNumberInput,
            currentUid
          );
          if (isMounted) {
            setResults(users || []);
            setHasSearched(true);
          }
        } catch (err) {
          console.warn('Phone search error:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [searchMode, searchQuery, selectedCountryCode, phoneNumberInput, currentUid]);

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-b from-[#121217] to-[#0A0A0E] rounded-2xl border-2 border-[#FF1E56]/30 shadow-xl space-y-4">
      {/* Header with Distance Concept Explanation */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF1E56]/20 text-[#FF1E56] border border-[#FF1E56]/40 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
              <span>
                {isAr
                  ? 'العثور على المستلم برقم الهاتف وفتح محادثة مباشرة'
                  : 'Find Recipient by Phone & Open Direct Chat'}
              </span>
            </h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              {isAr
                ? 'للنقل عن بُعد عبر المسافات البعيدة (مثل الكويت والسودان): ابحث برقم هاتف المستلم وتحقق من صورته وافتح محادثة مباشرة معه فوراً.'
                : 'For remote transfers across borders: search the recipient by phone number, verify their avatar, and open direct chat.'}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 text-[10px] font-mono font-bold">
          {isAr ? 'حماية من الأخطاء 100%' : 'Zero-Error E2EE'}
        </span>
      </div>

      {/* Selected Recipient Card */}
      {selectedRecipient ? (
        <div className="p-4 rounded-2xl bg-[#091811] border-2 border-[#00E599] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in zoom-in-95 duration-150 shadow-lg shadow-[#00E599]/10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#00E599] flex items-center justify-center bg-[#181820] shrink-0 shadow-md"
              style={getFilterStyle(selectedRecipient.avatarFilter || 'normal')}
            >
              {resolveAvatarUrl(selectedRecipient.avatarUrl) ? (
                <img
                  src={resolveAvatarUrl(selectedRecipient.avatarUrl)}
                  alt={selectedRecipient.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCheck className="w-7 h-7 text-[#00E599]" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#00E599] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تم التحقق البصري من المستلم بنجاح:' : 'Visually Verified Recipient:'}</span>
              </div>
              <h4 className="font-black text-base text-white truncate">
                {selectedRecipient.displayName}
              </h4>
              <div className="text-[11px] text-[#A1A1AA] flex flex-wrap items-center gap-2">
                {selectedRecipient.phoneNumber ? (
                  <span className="text-[#FF1E56] font-mono font-bold flex items-center gap-1 dir-ltr bg-[#181822] px-2 py-0.5 rounded-md border border-[#272730]">
                    <Phone className="w-3 h-3 inline" />
                    {selectedRecipient.phoneNumber}
                  </span>
                ) : (
                  <span>{selectedRecipient.deviceAlias || (isAr ? 'حساب سحابي موثق' : 'Verified Cloud Device')}</span>
                )}
                <span>•</span>
                <span className="text-emerald-400 font-mono text-[10px]">جاهز لاستلام الوسائط</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            {/* Direct Chat Action Button */}
            {onOpenDirectChat && (
              <button
                type="button"
                onClick={() => onOpenDirectChat(selectedRecipient)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF1E56] to-[#D01040] hover:from-[#FF3366] hover:to-[#FF1E56] text-white text-xs font-bold transition-all shadow-md shadow-[#FF1E56]/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isAr ? 'محادثة مباشرة' : 'Direct Chat'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClearRecipient}
              className="px-3 py-2 rounded-xl bg-[#1A1A22] hover:bg-[#272732] text-[#D4D4D8] hover:text-white text-xs font-bold transition-all border border-[#2E2E38] shrink-0 cursor-pointer"
            >
              {isAr ? 'تغيير' : 'Change'}
            </button>
          </div>
        </div>
      ) : (
        /* Search Interface */
        <div className="space-y-3">
          {/* Search Mode Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[#09090D] rounded-xl border border-[#22222A]">
            <button
              type="button"
              onClick={() => {
                setSearchMode('phone');
                setResults([]);
                setHasSearched(false);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                searchMode === 'phone'
                  ? 'bg-[#FF1E56] text-white shadow-md shadow-[#FF1E56]/20'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#14141A]'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isAr ? 'البحث برقم الهاتف (مفاتيح الدول)' : 'By Phone (Country Keys)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode('name');
                setResults([]);
                setHasSearched(false);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                searchMode === 'name'
                  ? 'bg-[#FF1E56] text-white shadow-md shadow-[#FF1E56]/20'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#14141A]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isAr ? 'البحث باسم الحساب (Username)' : 'By Username'}</span>
            </button>
          </div>

          {/* Search Inputs */}
          {searchMode === 'phone' ? (
            <div className="flex items-center gap-2">
              <CountryCodePicker
                selectedCode={selectedCountryCode}
                onSelect={(item) => setSelectedCountryCode(item.code)}
                lang={lang}
              />
              <div className="relative flex-1">
                <input
                  type="tel"
                  dir="ltr"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder={
                    ALL_COUNTRY_CODES.find((c) => c.code === selectedCountryCode)?.placeholder ||
                    '9123 4567'
                  }
                  className="w-full h-11 px-4 rounded-xl bg-[#09090C] border border-[#27272A] focus:border-[#FF1E56] focus:ring-1 focus:ring-[#FF1E56] text-white font-mono text-sm placeholder-[#61616A] transition-all outline-none shadow-inner"
                />
                {phoneNumberInput && (
                  <button
                    type="button"
                    onClick={() => setPhoneNumberInput('')}
                    className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-full text-[#71717A] hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="w-4 h-4 text-[#71717A] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب اسم حساب المستلم للبحث المباشر والتحقق البصري...'
                    : 'Type recipient username to search...'
                }
                className="w-full pl-9 pr-9 py-3 rounded-xl bg-[#09090C] border border-[#27272A] focus:border-[#FF1E56] focus:ring-1 focus:ring-[#FF1E56] text-white text-xs sm:text-sm placeholder-[#71717A] transition-all outline-none shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 -translate-y-1/2 left-3 p-1 rounded-full text-[#71717A] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Results Area */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#A1A1AA]">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF1E56]" />
                <span>{isAr ? 'جاري البحث في قاعدة البيانات السحابية...' : 'Searching cloud database...'}</span>
              </div>
            ) : results.length > 0 ? (
              results.map((profile) => (
                <div
                  key={profile.uid}
                  className="p-3 rounded-xl bg-[#101015] hover:bg-[#181820] border border-[#202028] hover:border-[#FF1E56]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  {/* Visual Profile Details */}
                  <div
                    onClick={() => onSelectRecipient(profile)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden border border-[#FF1E56]/60 flex items-center justify-center bg-[#1D1D24] shrink-0 shadow"
                      style={getFilterStyle(profile.avatarFilter || 'normal')}
                    >
                      {resolveAvatarUrl(profile.avatarUrl) ? (
                        <img
                          src={resolveAvatarUrl(profile.avatarUrl)}
                          alt={profile.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-6 h-6 text-[#FF1E56]" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">
                          {profile.displayName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
                          {isAr ? 'موثق' : 'Verified'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A1A1AA] flex items-center gap-2 truncate">
                        {profile.phoneNumber ? (
                          <span className="text-[#FF1E56] font-mono font-bold dir-ltr flex items-center gap-1">
                            <Phone className="w-3 h-3 inline" />
                            {profile.phoneNumber}
                          </span>
                        ) : (
                          <span>{profile.deviceAlias || (isAr ? 'حساب نشط' : 'Active Account')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Open Direct Chat & Select For Sending */}
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenDirectChat && (
                      <button
                        type="button"
                        onClick={() => onOpenDirectChat(profile)}
                        className="px-3 py-1.5 rounded-xl bg-[#00E599]/15 hover:bg-[#00E599] text-[#00E599] hover:text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border border-[#00E599]/30"
                        title={isAr ? 'فتح محادثة مباشرة' : 'Direct Chat'}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'محادثة' : 'Chat'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectRecipient(profile)}
                      className="px-3 py-1.5 rounded-xl bg-[#FF1E56]/15 hover:bg-[#FF1E56] text-[#FF1E56] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAr ? 'اختيار للإرسال' : 'Select'}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : hasSearched ? (
              <div className="py-6 text-center text-xs text-[#71717A] space-y-1">
                <p>
                  {isAr
                    ? searchMode === 'phone'
                      ? `لم يتم العثور على حساب مسجل برقم الهاتف (${selectedCountryCode} ${phoneNumberInput}).`
                      : `لم يتم العثور على حساب باسم "${searchQuery}".`
                    : `No registered user found.`}
                </p>
                <p className="text-[10px] text-[#555]">
                  {isAr
                    ? 'اطلب من الطرف الآخر تسجيل رقم هاتفه داخل التطبيق ليظهر حسابه فوراً هنا.'
                    : 'Ask the recipient to register their phone number in PureDrop to appear in the directory.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
