import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  User as UserIcon,
  X,
  Upload,
  Check,
  Shield,
  Zap,
  Radio,
  Sparkles,
  Globe,
  Lock,
  LogOut,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Layers,
  Maximize2,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarFilterId } from '../types';
import {
  AVATAR_FILTERS,
  PRESET_AVATARS,
  getFilterStyle,
  optimizeAvatarImage,
  getPresetAvatarDataUrl,
  resolveAvatarUrl,
} from '../utils/avatarFilters';
import { AvatarFullViewModal } from './AvatarFullViewModal';
import { CountryCodePicker } from './CountryCodePicker';
import { ALL_COUNTRY_CODES, formatFullPhoneNumber } from '../utils/countryCodes';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';
  const {
    user,
    userProfile,
    isDbConnected,
    loginWithGoogle,
    loginAsGuest,
    registerWithPhone,
    logout,
    saveProfile,
  } = useAuth();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [deviceAlias, setDeviceAlias] = useState('');
  const [countryCode, setCountryCode] = useState('+965');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState<AvatarFilterId>('normal');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<'phone' | 'social'>('phone');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when userProfile loads or changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setDeviceAlias(userProfile.deviceAlias || 'PureDrop Device');
      setSelectedAvatarUrl(userProfile.avatarUrl);
      setSelectedFilter(userProfile.avatarFilter || 'normal');
      if (userProfile.countryCode) {
        setCountryCode(userProfile.countryCode);
      }
      if (userProfile.phoneNumber) {
        const prefix = userProfile.countryCode || '';
        if (prefix && userProfile.phoneNumber.startsWith(prefix)) {
          setPhoneNumber(userProfile.phoneNumber.slice(prefix.length).trim());
        } else {
          setPhoneNumber(userProfile.phoneNumber);
        }
      }
    } else if (user) {
      setDisplayName(user.displayName || (user.isAnonymous ? 'مستخدم ضيف' : ''));
      setDeviceAlias('PureDrop Device');
      setSelectedAvatarUrl(user.photoURL || undefined);
      setSelectedFilter('normal');
    }
    setJustSaved(false);
  }, [userProfile, user, isOpen]);

  // Check if current form inputs have unsaved changes compared to stored userProfile
  const hasUnsavedChanges = useMemo(() => {
    if (!userProfile) return true;
    const currentName = displayName.trim();
    const savedName = (userProfile.displayName || '').trim();
    const currentAlias = deviceAlias.trim();
    const savedAlias = (userProfile.deviceAlias || '').trim();
    const currentAvatar = selectedAvatarUrl || '';
    const savedAvatar = userProfile.avatarUrl || '';
    const currentFilter = selectedFilter || 'normal';
    const savedFilter = userProfile.avatarFilter || 'normal';
    const currentPhone = phoneNumber.trim();
    const savedPhone = (userProfile.phoneNumber || '').trim();
    const currentCode = countryCode.trim();
    const savedCode = (userProfile.countryCode || '').trim();

    const formatted = currentPhone ? formatFullPhoneNumber(currentCode, currentPhone) : '';

    return (
      currentName !== savedName ||
      currentAlias !== savedAlias ||
      currentAvatar !== savedAvatar ||
      currentFilter !== savedFilter ||
      formatted !== savedPhone ||
      currentCode !== savedCode
    );
  }, [displayName, deviceAlias, selectedAvatarUrl, selectedFilter, phoneNumber, countryCode, userProfile]);

  const isProfileSaved = (!hasUnsavedChanges && !!userProfile?.displayName) || justSaved;

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
        return;
      }

      setIsUploading(true);
      setErrorMessage(null);
      setJustSaved(false);
      try {
        const optimizedDataUrl = await optimizeAvatarImage(file);
        setSelectedAvatarUrl(optimizedDataUrl);
      } catch (err: any) {
        setErrorMessage(
          isAr
            ? 'تعذر معالجة الصورة، يرجى المحاولة مرة أخرى'
            : 'Could not process image, please try again'
        );
      } finally {
        setIsUploading(false);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage(isAr ? 'يرجى كتابة اسم للحساب' : 'Please enter a display name');
      return;
    }

    const formattedPhone = phoneNumber.trim()
      ? formatFullPhoneNumber(countryCode, phoneNumber.trim())
      : undefined;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveProfile({
        displayName: displayName.trim(),
        deviceAlias: deviceAlias.trim(),
        avatarUrl: selectedAvatarUrl,
        avatarFilter: selectedFilter,
        phoneNumber: formattedPhone,
        countryCode: countryCode.trim(),
      });
      setJustSaved(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || (isAr ? 'حدث خطأ أثناء حفظ البيانات' : 'Error saving profile')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage(isAr ? 'يرجى كتابة اسم الحساب' : 'Please enter your account name');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await registerWithPhone({
        dialCode: countryCode,
        nationalNumber: phoneNumber.trim(),
        displayName: displayName.trim(),
        deviceAlias: deviceAlias.trim() || undefined,
        avatarUrl: selectedAvatarUrl,
        avatarFilter: selectedFilter,
      });
      setJustSaved(true);
    } catch (err: any) {
      setErrorMessage(
        err.message || (isAr ? 'فشل تسجيل الحساب، يرجى المحاولة مرة أخرى' : 'Failed to register account')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-6 h-6 text-white" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-white" />;
      case 'Radio':
        return <Radio className="w-6 h-6 text-white" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-white" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-white" />;
      case 'Lock':
        return <Lock className="w-6 h-6 text-white" />;
      default:
        return <UserIcon className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#0A0A0E] border border-[#27272A] rounded-2xl sm:rounded-3xl shadow-2xl shadow-[#FF1E56]/10 text-white overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1E1E24] flex items-center justify-between bg-[#0F0F14]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1E56] to-[#A00B30] flex items-center justify-center text-white shadow-md shadow-[#FF1E56]/20">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'إدارة الحساب والهوية الرقمية' : 'Account & Digital Identity'}
              </h2>
              {user && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {user.isAnonymous
                      ? isAr
                        ? 'حساب نشط'
                        : 'Active Account'
                      : user.displayName || user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#71717A] hover:text-white hover:bg-[#1A1A22] transition-all cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* If NOT Logged In: Sign-In / Registration Screen */}
          {!user ? (
            <div className="space-y-5 py-1">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#141418] border border-[#27272A] flex items-center justify-center text-[#FF1E56] shadow-inner">
                  <Database className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'تسجيل البيانات والحساب في PureDrop' : 'Register & Setup Account'}
                </h3>
                <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                  {isAr
                    ? 'سجّل برقم هاتفك مع مفتاح دولتك لتتمكن من استقبال الصور والفيديوهات عن بُعد والتواصل عبر المحادثات المباشرة.'
                    : 'Register with your phone number and country code to receive lossless media remotely and chat directly.'}
                </p>
              </div>

              {/* Registration Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#09090D] rounded-xl border border-[#22222A]">
                <button
                  type="button"
                  onClick={() => setAuthTab('phone')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authTab === 'phone'
                      ? 'bg-[#FF1E56] text-white shadow-md shadow-[#FF1E56]/20'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#14141A]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isAr ? 'التسجيل برقم الهاتف (مفاتيح الدول)' : 'Phone Registration'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthTab('social')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    authTab === 'social'
                      ? 'bg-[#FF1E56] text-white shadow-md shadow-[#FF1E56]/20'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#14141A]'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'Google أو كضيف' : 'Google / Guest'}</span>
                </button>
              </div>

              {/* Tab 1: Phone Registration Form */}
              {authTab === 'phone' ? (
                <form onSubmit={handlePhoneRegister} className="space-y-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-[#D4D4D8] mb-1.5 block">
                      {isAr ? 'اسم صاحب الحساب:' : 'Account Name:'}
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                      placeholder={isAr ? 'مثال: محمد السعيد' : 'e.g. Mohammed'}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#282832] focus:border-[#FF1E56] text-white text-xs sm:text-sm outline-none transition-all placeholder:text-[#52525B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#D4D4D8] mb-1.5 flex items-center justify-between">
                      <span>{isAr ? 'رقم الهاتف مع مفتاح الدولة:' : 'Phone Number & Country Key:'}</span>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {isAr ? 'يدعم جميع مفاتيح العالم' : 'All country codes supported'}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <CountryCodePicker
                        selectedCode={countryCode}
                        onSelect={(item) => setCountryCode(item.code)}
                        lang={lang}
                      />
                      <input
                        type="tel"
                        dir="ltr"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.slice(0, 20))}
                        placeholder={
                          ALL_COUNTRY_CODES.find((c) => c.code === countryCode)?.placeholder ||
                          '9123 4567'
                        }
                        required
                        className="flex-1 h-11 px-3.5 rounded-xl bg-[#121217] border border-[#282832] focus:border-[#FF1E56] text-white font-mono text-xs sm:text-sm outline-none transition-all placeholder:text-[#52525B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#D4D4D8] mb-1.5 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#A1A1AA]" />
                      <span>{isAr ? 'لقب الجهاز (اختياري):' : 'Device Alias (Optional):'}</span>
                    </label>
                    <input
                      type="text"
                      value={deviceAlias}
                      onChange={(e) => setDeviceAlias(e.target.value.slice(0, 60))}
                      placeholder={isAr ? 'مثال: iPhone 15 Pro' : 'e.g. Galaxy S24'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#282832] focus:border-[#FF1E56] text-white text-xs sm:text-sm outline-none transition-all placeholder:text-[#52525B]"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF1E56] to-[#D01040] hover:from-[#FF3366] hover:to-[#FF1E56] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF1E56]/25 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isAr ? 'جاري التسجيل...' : 'Registering...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isAr ? 'تسجيل وتفعيل الحساب برقم الهاتف' : 'Register Account with Phone'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Tab 2: Social / Guest Login Actions */
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>{isAr ? 'تسجيل الدخول عبر Google' : 'Sign In with Google'}</span>
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#22222A]"></div>
                    <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-[#71717A] font-semibold">
                      {isAr ? 'أو' : 'OR'}
                    </span>
                    <div className="flex-grow border-t border-[#22222A]"></div>
                  </div>

                  <button
                    type="button"
                    onClick={loginAsGuest}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#181820] hover:bg-[#20202A] text-[#E4E4E7] border border-[#2E2E38] hover:border-[#FF1E56]/40 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-[#A1A1AA]" />
                    <span>{isAr ? 'دخول فوري كضيف وتخصيص الحساب' : 'Quick Guest Sign In & Setup'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged In: Profile Editor & Filter Studio */
            <form onSubmit={handleSave} className="space-y-6">
              {/* Top User Status Banner */}
              <div className="p-3.5 rounded-xl bg-[#121217] border border-[#22222A] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {user.isAnonymous
                        ? isAr
                          ? 'حساب ضيف نشط'
                          : 'Guest Account'
                        : user.email || user.displayName || 'Google User'}
                    </span>
                    <span className="text-[11px] text-[#A1A1AA] block">
                      {displayName.trim() || userProfile?.displayName || (isAr ? 'معرّف معتمد' : 'Verified')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-[#71717A] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAr ? 'خروج' : 'Sign Out'}</span>
                </button>
              </div>

              {/* Live Filtered Avatar Preview Section */}
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="relative group">
                  <div
                    onClick={() => {
                      if (resolveAvatarUrl(selectedAvatarUrl)) {
                        setIsFullViewOpen(true);
                      }
                    }}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#FF1E56] shadow-xl shadow-[#FF1E56]/20 flex items-center justify-center bg-[#181820] transition-all relative ${
                      resolveAvatarUrl(selectedAvatarUrl)
                        ? 'cursor-pointer hover:border-white hover:scale-105 active:scale-95'
                        : ''
                    }`}
                    style={getFilterStyle(selectedFilter)}
                    title={
                      resolveAvatarUrl(selectedAvatarUrl)
                        ? isAr
                          ? 'اضغط لعرض الصورة كاملة'
                          : 'Click to view full photo'
                        : undefined
                    }
                  >
                    {resolveAvatarUrl(selectedAvatarUrl) ? (
                      <>
                        <img
                          src={resolveAvatarUrl(selectedAvatarUrl)}
                          alt="Profile Avatar"
                          className="w-full h-full object-cover"
                        />
                        {/* Hover Overlay with Maximize icon */}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white select-none pointer-events-none">
                          <Maximize2 className="w-5 h-5 drop-shadow-md text-white" />
                          <span className="text-[10px] font-bold drop-shadow-md">
                            {isAr ? 'عرض كامل' : 'View Full'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF1E56] to-[#700620] flex items-center justify-center text-white">
                        <Shield className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Active Filter Indicator Badge */}
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F0F14] border border-[#FF1E56] text-white shadow-md pointer-events-none">
                    {AVATAR_FILTERS.find((f) => f.id === selectedFilter)?.nameAr}
                  </span>
                </div>

                {/* Username Displayed Directly Under Profile Picture */}
                <div className="text-center space-y-0.5">
                  <div className="text-base sm:text-lg font-black text-white tracking-wide">
                    {displayName.trim() || userProfile?.displayName || (isAr ? 'اسم المستخدم' : 'Username')}
                  </div>
                  {(deviceAlias.trim() || userProfile?.deviceAlias) && (
                    <div className="text-xs text-[#A1A1AA]">
                      {deviceAlias.trim() || userProfile?.deviceAlias}
                    </div>
                  )}
                </div>

                {/* Action Buttons: Upload Image & View Full Picture */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#242430] border border-[#2E2E3A] hover:border-[#FF1E56]/50 text-xs font-medium text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FF1E56]" />
                    <span>{isUploading ? (isAr ? 'جاري المعالجة...' : 'Processing...') : (isAr ? 'رفع صورة من جهازك' : 'Upload Avatar Image')}</span>
                  </button>

                  {resolveAvatarUrl(selectedAvatarUrl) && (
                    <button
                      type="button"
                      onClick={() => setIsFullViewOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#1A1A22] hover:bg-[#242430] border border-[#2E2E3A] hover:border-white/40 text-xs font-medium text-[#D4D4D8] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title={isAr ? 'عرض الصورة كاملة' : 'View Full Picture'}
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#00E599]" />
                      <span>{isAr ? 'عرض كامل' : 'View Full'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Badges Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A1A1AA] block">
                  {isAr ? 'أو اختر درع الهوية الرقمية:' : 'Or Select a Digital Badge Avatar:'}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((preset) => {
                    const presetDataUrl = getPresetAvatarDataUrl(preset.id);
                    const isSelected =
                      selectedAvatarUrl === preset.id ||
                      selectedAvatarUrl === presetDataUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatarUrl(presetDataUrl);
                          setJustSaved(false);
                        }}
                        className={`h-11 rounded-xl bg-gradient-to-br ${preset.gradient} flex items-center justify-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'ring-2 ring-white scale-105 shadow-md shadow-[#FF1E56]/30'
                            : 'opacity-70 hover:opacity-100 hover:scale-102'
                        }`}
                        title={isAr ? preset.nameAr : preset.nameEn}
                      >
                        {renderPresetIcon(preset.svgIcon)}
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Creative Photo Filters Carousel / Studio */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#FF1E56]" />
                    <span>{isAr ? 'فلاتر الصورة البصرية (Live Filters):' : 'Visual Photo Filters (Live Studio):'}</span>
                  </label>
                  <span className="text-[11px] text-[#71717A]">
                    {AVATAR_FILTERS.length} {isAr ? 'فلاتر متاحة' : 'Filters'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVATAR_FILTERS.map((filter) => {
                    const isCurrent = selectedFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => {
                          setSelectedFilter(filter.id);
                          setJustSaved(false);
                        }}
                        className={`p-2.5 rounded-xl text-right transition-all cursor-pointer border flex flex-col justify-between h-20 ${
                          isCurrent
                            ? 'bg-[#181822] border-[#FF1E56] shadow-md shadow-[#FF1E56]/15'
                            : 'bg-[#111116] border-[#22222A] hover:border-[#383844] hover:bg-[#15151B]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className="w-4 h-4 rounded-full border shrink-0"
                            style={getFilterStyle(filter.id)}
                          >
                            <span className="block w-full h-full rounded-full bg-gradient-to-br from-[#FF1E56] to-amber-500" />
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-[#FF1E56]" />}
                        </div>

                        <div>
                          <span
                            className={`text-xs font-bold block leading-tight ${
                              isCurrent ? 'text-white' : 'text-[#D4D4D8]'
                            }`}
                          >
                            {isAr ? filter.nameAr : filter.nameEn}
                          </span>
                          <span className="text-[10px] text-[#71717A] truncate block mt-0.5">
                            {isAr ? filter.descriptionAr : filter.descriptionEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Username & Device Alias Inputs */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-[#D4D4D8] mb-1.5 block">
                    {isAr ? 'اسم الحساب المستعار (Username):' : 'Account Display Name:'}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value.slice(0, 50));
                      setJustSaved(false);
                    }}
                    placeholder={isAr ? 'مثال: أحمد - استوديو المونتاج' : 'e.g. Alex Studio'}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#282832] focus:border-[#FF1E56] text-white text-xs sm:text-sm outline-none transition-all placeholder:text-[#52525B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#D4D4D8] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#FF1E56]" />
                      <span>{isAr ? 'رقم الهاتف المعتمد (للعثور عليك عن بُعد):' : 'Phone Number (For Remote Discovery):'}</span>
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">
                      {isAr ? 'كل مفاتيح الدول' : 'All country codes'}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <CountryCodePicker
                      selectedCode={countryCode}
                      onSelect={(item) => {
                        setCountryCode(item.code);
                        setJustSaved(false);
                      }}
                      lang={lang}
                    />
                    <input
                      type="tel"
                      dir="ltr"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.slice(0, 20));
                        setJustSaved(false);
                      }}
                      placeholder={
                        ALL_COUNTRY_CODES.find((c) => c.code === countryCode)?.placeholder ||
                        '9123 4567'
                      }
                      className="flex-1 h-11 px-3.5 rounded-xl bg-[#121217] border border-[#282832] focus:border-[#FF1E56] text-white font-mono text-xs sm:text-sm outline-none transition-all placeholder:text-[#52525B]"
                    />
                  </div>
                  <p className="text-[10px] text-[#71717A] mt-1 leading-normal">
                    {isAr
                      ? 'يتيح للمرسلين في أي دولة (الكويت، السودان، الخليج، العالم) العثور عليك فوراً برقم هاتفك وفتح محادثة مباشرة.'
                      : 'Allows senders worldwide to find you instantly by phone number and start direct chat.'}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#D4D4D8] mb-1.5 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#A1A1AA]" />
                    <span>{isAr ? 'لقب الجهاز للنقل (Device Alias):' : 'Transfer Device Alias:'}</span>
                  </label>
                  <input
                    type="text"
                    value={deviceAlias}
                    onChange={(e) => {
                      setDeviceAlias(e.target.value.slice(0, 60));
                      setJustSaved(false);
                    }}
                    placeholder={isAr ? 'مثال: iPhone 15 Pro Max' : 'e.g. MacBook Pro'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121217] border border-[#282832] focus:border-[#FF1E56] text-white text-xs sm:text-sm outline-none transition-all placeholder:text-[#52525B]"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Area: When profile is saved, do NOT show the save button */}
              {isProfileSaved ? (
                <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 select-none">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isAr ? 'تم حفظ البيانات' : 'Data Saved'}</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-xl bg-[#FF1E56] hover:bg-[#FF3366] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF1E56]/25 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isAr ? 'حفظ' : 'Save'}</span>
                    </>
                  )}
                </button>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Avatar Full-Screen Lightbox Modal */}
      <AvatarFullViewModal
        isOpen={isFullViewOpen}
        onClose={() => setIsFullViewOpen(false)}
        avatarUrl={selectedAvatarUrl}
        filter={selectedFilter}
        userName={displayName.trim() || userProfile?.displayName}
        lang={lang}
      />
    </div>
  );
};
