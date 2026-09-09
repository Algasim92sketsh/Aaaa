import React, { useState, useMemo } from 'react';
import { Search, Globe, ChevronDown, Check, X } from 'lucide-react';
import { ALL_COUNTRY_CODES, CountryCodeItem, searchCountries } from '../utils/countryCodes';

interface CountryCodePickerProps {
  selectedCode: string; // e.g. "+965"
  onSelect: (item: CountryCodeItem) => void;
  lang?: 'ar' | 'en';
  disabled?: boolean;
}

export const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  selectedCode,
  onSelect,
  lang = 'ar',
  disabled = false,
}) => {
  const isAr = lang === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentCountry = useMemo(() => {
    return (
      ALL_COUNTRY_CODES.find((c) => c.code === selectedCode) ||
      ALL_COUNTRY_CODES[0]
    );
  }, [selectedCode]);

  const filteredList = useMemo(() => {
    return searchCountries(searchQuery);
  }, [searchQuery]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 px-3 rounded-xl bg-[#14141A] hover:bg-[#1A1A24] border border-[#27272A] hover:border-[#FF1E56]/50 transition-all flex items-center gap-2 cursor-pointer text-white text-xs sm:text-sm shadow-sm select-none"
      >
        <span className="text-base leading-none">{currentCountry.flag}</span>
        <span className="font-mono font-bold text-white dir-ltr">{currentCountry.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selector Dropdown Modal */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 bg-[#0E0E14] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-[#1E1E24] bg-[#121218] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FF1E56]" />
                <h4 className="text-sm font-bold text-white">
                  {isAr ? 'اختر مفتاح الدولة' : 'Select Country Code'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#1C1C24] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-[#1E1E24] bg-[#0A0A0E]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#71717A] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث باسم الدولة أو كود الاتصال (مثال: الكويت، +965)...'
                      : 'Search by country name or dial code...'
                  }
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-[#14141A] border border-[#27272A] focus:border-[#FF1E56] text-white text-xs outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#1A1A22] max-h-80 scrollbar-thin">
              {filteredList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#71717A]">
                  {isAr ? 'لم يتم العثور على نتائج' : 'No countries found'}
                </div>
              ) : (
                filteredList.map((item) => {
                  const isSelected = item.code === selectedCode;
                  return (
                    <div
                      key={`${item.iso}-${item.code}`}
                      onClick={() => {
                        onSelect(item);
                        setIsOpen(false);
                      }}
                      className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#FF1E56]/15 border border-[#FF1E56]/40 text-white'
                          : 'hover:bg-[#181822] text-[#D4D4D8]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl leading-none shrink-0">{item.flag}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">
                            {isAr ? item.nameAr : item.nameEn}
                          </span>
                          <span className="text-[10px] text-[#71717A] block">
                            {isAr ? item.nameEn : item.nameAr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-[#FF1E56] dir-ltr bg-[#14141A] px-2 py-0.5 rounded-md border border-[#27272A]">
                          {item.code}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#FF1E56]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
