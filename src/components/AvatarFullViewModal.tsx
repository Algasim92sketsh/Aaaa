import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarFilterId } from '../types';
import { getFilterStyle, resolveAvatarUrl } from '../utils/avatarFilters';

interface AvatarFullViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
  filter?: AvatarFilterId | string;
  userName?: string;
  lang?: 'ar' | 'en';
}

export const AvatarFullViewModal: React.FC<AvatarFullViewModalProps> = ({
  isOpen,
  onClose,
  avatarUrl,
  filter = 'normal',
}) => {
  const resolvedUrl = resolveAvatarUrl(avatarUrl);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !resolvedUrl) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] w-screen h-screen bg-black flex items-center justify-center p-0 m-0 overflow-hidden cursor-pointer select-none"
        onClick={onClose}
      >
        {/* Minimalist Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="fixed top-5 right-5 z-[210] p-3 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all cursor-pointer shadow-2xl backdrop-blur-md border border-white/10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Profile Picture Displayed Across Full Screen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full flex items-center justify-center"
          onClick={onClose}
        >
          <img
            src={resolvedUrl}
            alt="Profile"
            style={getFilterStyle(filter)}
            className="w-full h-full object-contain block select-none"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
