import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Film,
  Camera,
  Download,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FileMetadata } from '../types';
import { downloadBlob } from '../utils/fileUtils';
import { playSwipeTick } from '../utils/soundEffects';

export interface LightboxMediaItem {
  id: string;
  file?: File | null;
  blob?: Blob | null;
  metadata?: FileMetadata | null;
  previewUrl?: string;
  name: string;
  type: string;
  size?: number;
  width?: number;
  height?: number;
}

export interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Multi-item support
  items?: LightboxMediaItem[];
  initialIndex?: number;
  // Backwards compatibility for single item
  file?: File | null;
  metadata?: FileMetadata | null;
  blob?: Blob | null;
  title?: string;
  lang?: 'ar' | 'en';
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  onClose,
  items: propItems,
  initialIndex = 0,
  file,
  metadata,
  blob,
  title,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  // Normalize items list
  const activeItems: LightboxMediaItem[] = React.useMemo(() => {
    if (propItems && propItems.length > 0) {
      return propItems;
    }
    if (metadata) {
      return [
        {
          id: 'single-target',
          file,
          blob,
          metadata,
          previewUrl: metadata.previewUrl,
          name: title || metadata.name,
          type: metadata.type,
          size: metadata.size,
          width: metadata.width,
          height: metadata.height,
        },
      ];
    }
    return [];
  }, [propItems, file, blob, metadata, title]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 0>(0);

  // Gesture state
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isHorizontalGesture = useRef<boolean | null>(null);

  // Sync index when modal opens with new initialIndex
  useEffect(() => {
    if (isOpen) {
      const safeIndex = Math.max(0, Math.min(initialIndex, activeItems.length - 1));
      setCurrentIndex(safeIndex);
      setZoomLevel(1);
      setDragX(0);
      setIsDragging(false);
    }
  }, [isOpen, initialIndex, activeItems.length]);

  const totalItems = activeItems.length;
  const currentItem = activeItems[currentIndex] || null;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalItems - 1;

  const goToPrev = () => {
    if (currentIndex > 0) {
      playSwipeTick();
      setSlideDirection('right');
      setCurrentIndex((prev) => prev - 1);
      setZoomLevel(1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalItems - 1) {
      playSwipeTick();
      setSlideDirection('left');
      setCurrentIndex((prev) => prev + 1);
      setZoomLevel(1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        // In Arabic RTL, right arrow naturally goes to previous or next depending on visual layout
        // Providing consistent directional keys:
        if (canGoPrev) goToPrev();
      } else if (e.key === 'ArrowLeft') {
        if (canGoNext) goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canGoPrev, canGoNext, currentIndex]);

  // Touch handlers for screen swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) return; // Allow pinch/zoom panning when zoomed
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    isHorizontalGesture.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel > 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - touchStartY.current;

    // Lock gesture direction once determined
    if (isHorizontalGesture.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalGesture.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalGesture.current) {
      // Horizontal swipe in progress
      // Apply rubber band resistance if at boundaries
      const isAtLeftEdge = !canGoNext && diffX < 0;
      const isAtRightEdge = !canGoPrev && diffX > 0;
      const resistance = isAtLeftEdge || isAtRightEdge ? 0.3 : 1;
      setDragX(diffX * resistance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || zoomLevel > 1) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartX.current;
    const diffY = touch.clientY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;

    setIsDragging(false);

    if (isHorizontalGesture.current) {
      const isFastSwipe = elapsed < 350 && Math.abs(diffX) > 30;
      const isSubstantialSwipe = Math.abs(diffX) > 60;

      if ((isFastSwipe || isSubstantialSwipe) && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          // Swiped finger Left -> Next item
          if (canGoNext) {
            goToNext();
          }
        } else if (diffX > 0) {
          // Swiped finger Right -> Previous item
          if (canGoPrev) {
            goToPrev();
          }
        }
      }
    }

    setDragX(0);
    isHorizontalGesture.current = null;
  };

  // Mouse Drag handlers for desktop screen swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) return;
    // Don't drag if clicking controls
    if ((e.target as HTMLElement).closest('button, input, video')) return;

    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchStartTime.current = Date.now();
    isHorizontalGesture.current = null;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel > 1) return;
    const diffX = e.clientX - touchStartX.current;
    const diffY = e.clientY - touchStartY.current;

    if (isHorizontalGesture.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalGesture.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalGesture.current) {
      const isAtLeftEdge = !canGoNext && diffX < 0;
      const isAtRightEdge = !canGoPrev && diffX > 0;
      const resistance = isAtLeftEdge || isAtRightEdge ? 0.3 : 1;
      setDragX(diffX * resistance);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel > 1) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    const diffX = e.clientX - touchStartX.current;
    const elapsed = Date.now() - touchStartTime.current;
    setIsDragging(false);

    if (isHorizontalGesture.current) {
      const isFastSwipe = elapsed < 350 && Math.abs(diffX) > 30;
      const isSubstantialSwipe = Math.abs(diffX) > 60;

      if (isFastSwipe || isSubstantialSwipe) {
        if (diffX < 0 && canGoNext) {
          goToNext();
        } else if (diffX > 0 && canGoPrev) {
          goToPrev();
        }
      }
    }

    setDragX(0);
    isHorizontalGesture.current = null;
  };

  if (!isOpen || !currentItem) return null;

  const isVideo = currentItem.type.startsWith('video/');
  const isImage = currentItem.type.startsWith('image/');
  const mediaSrc =
    currentItem.previewUrl ||
    (currentItem.file ? URL.createObjectURL(currentItem.file) : '') ||
    (currentItem.blob ? URL.createObjectURL(currentItem.blob) : '');

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    if (currentItem.blob) {
      downloadBlob(currentItem.blob, currentItem.name);
    } else if (currentItem.file) {
      downloadBlob(currentItem.file, currentItem.name);
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg select-none animate-in fade-in duration-150 p-2 sm:p-4"
    >
      {/* Theater Stage Container */}
      <div className="relative w-full h-full max-w-6xl flex flex-col bg-[#050507] border border-[#1E1E24] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="h-14 shrink-0 px-4 sm:px-6 bg-[#09090C]/90 border-b border-[#1C1C22] flex items-center justify-between z-30">
          {/* File Title & Counter */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#FF1E56]/15 text-[#FF1E56] border border-[#FF1E56]/30 flex items-center justify-center shrink-0">
              {isVideo ? <Film className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white truncate max-w-[140px] sm:max-w-md">
                  {currentItem.name}
                </h3>
                {totalItems > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#181820] text-[#FF1E56] font-mono text-[11px] font-bold border border-[#27272A] shrink-0">
                    {currentIndex + 1} / {totalItems}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {(currentItem.blob || currentItem.file) && (
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1E1E24] text-white border border-[#27272A] hover:border-[#FF1E56]/50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title={isAr ? 'حفظ' : 'Save'}
              >
                <Download className="w-4 h-4 text-[#FF1E56]" />
                <span className="hidden sm:inline">{isAr ? 'حفظ' : 'Save'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#141418] hover:bg-[#FF1E56] text-white transition-colors cursor-pointer border border-[#27272A]"
              title={isAr ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Viewing Stage with Touch & Drag Support */}
        <div
          className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden bg-black cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Animated Media Transition Container */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentItem.id || currentIndex}
              initial={{
                opacity: 0.6,
                x: slideDirection === 'left' ? 60 : slideDirection === 'right' ? -60 : 0,
              }}
              animate={{
                opacity: 1,
                x: dragX,
              }}
              exit={{
                opacity: 0,
                x: slideDirection === 'left' ? -60 : 60,
              }}
              transition={{
                duration: isDragging ? 0 : 0.2,
                ease: 'easeOut',
              }}
              className="w-full h-full flex items-center justify-center p-2 sm:p-6"
            >
              {isImage ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-1 pointer-events-none">
                  <img
                    src={mediaSrc}
                    alt={currentItem.name}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                    }}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl origin-center pointer-events-auto"
                    draggable={false}
                  />
                </div>
              ) : isVideo ? (
                <div className="w-full h-full flex items-center justify-center">
                  <video
                    src={mediaSrc}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-xl shadow-2xl"
                  />
                </div>
              ) : (
                <div className="text-[#A1A1AA] text-center">
                  <p>{isAr ? 'تعذر عرض المعاينة' : 'Preview not available'}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Floating Navigation Controls (Previous Button) */}
          {canGoPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#0F0F14]/85 hover:bg-[#FF1E56] text-white border border-[#27272A] hover:border-[#FF1E56] shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-30"
              title={isAr ? 'العنصر السابق (أو اسحب لليمين)' : 'Previous item (or swipe right)'}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Floating Navigation Controls (Next Button) */}
          {canGoNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#0F0F14]/85 hover:bg-[#FF1E56] text-white border border-[#27272A] hover:border-[#FF1E56] shadow-2xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-30"
              title={isAr ? 'العنصر التالي (أو اسحب لليسار)' : 'Next item (or swipe left)'}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Floating Gesture Hint Pill (Visible when multiple items exist) */}
          {totalItems > 1 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0E0E12]/80 backdrop-blur-md border border-[#27272A] text-[11px] font-medium text-[#A1A1AA] flex items-center gap-1.5 shadow-lg pointer-events-none z-20">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#FF1E56] animate-pulse" />
              <span>
                {isAr
                  ? 'اسحب يميناً ويساراً على الشاشة للتنقل'
                  : 'Swipe left & right on screen to browse'}
              </span>
            </div>
          )}

          {/* Zoom Controls for Images */}
          {isImage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0F0F14]/85 backdrop-blur-md border border-[#27272A] shadow-2xl z-30">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#1C1C24] transition-colors cursor-pointer"
                title={isAr ? 'تصغير' : 'Zoom Out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-mono font-bold text-[#FF1E56] hover:bg-[#1C1C24] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title={isAr ? 'إعادة ضبط الحجم' : 'Reset'}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{Math.round(zoomLevel * 100)}%</span>
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#1C1C24] transition-colors cursor-pointer"
                title={isAr ? 'تكبير' : 'Zoom In'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Pagination Filmstrip Dots Bar */}
        {totalItems > 1 && (
          <div className="h-11 shrink-0 px-4 bg-[#09090C] border-t border-[#1C1C22] flex items-center justify-center gap-1.5 z-30 overflow-x-auto">
            {activeItems.map((it, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={it.id || idx}
                  onClick={() => {
                    playSwipeTick();
                    setSlideDirection(idx > currentIndex ? 'left' : 'right');
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'w-6 bg-[#FF1E56]'
                      : 'w-2 bg-[#27272A] hover:bg-[#444450]'
                  }`}
                  title={`${it.name} (${idx + 1}/${totalItems})`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
