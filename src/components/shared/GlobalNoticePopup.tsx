'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { NoticeBadgeIcon } from '@/lib/types';
import { hexToRgba, resolveNoticeTheme } from '@/lib/noticeTheme';
import {
  Megaphone,
  X,
  Sparkles,
  AlertCircle,
  Info,
  Music,
  Bell,
  Calendar,
  Flame,
  Gift,
} from 'lucide-react';

export function renderNoticeBadgeIcon(
  icon: NoticeBadgeIcon,
  className = 'w-6 h-6',
  color?: string
) {
  const style = color ? { color } : undefined;
  switch (icon) {
    case 'sparkles':
      return <Sparkles className={className} style={style} />;
    case 'alert':
      return <AlertCircle className={className} style={style} />;
    case 'info':
      return <Info className={className} style={style} />;
    case 'music':
      return <Music className={className} style={style} />;
    case 'bell':
      return <Bell className={className} style={style} />;
    case 'calendar':
      return <Calendar className={className} style={style} />;
    case 'flame':
      return <Flame className={className} style={style} />;
    case 'gift':
      return <Gift className={className} style={style} />;
    case 'megaphone':
    default:
      return <Megaphone className={className} style={style} />;
  }
}

export const GlobalNoticePopup: React.FC = () => {
  const { noticeBoard } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !noticeBoard?.isActive || !noticeBoard?.title?.trim()) {
      setIsOpen(false);
      return;
    }

    // Check if current version was already dismissed by user in this session
    try {
      const noticeKey = `chordandcraft_notice_dismissed_${noticeBoard.updatedAt || 'v1'}`;
      const dismissed = sessionStorage.getItem(noticeKey);
      if (!dismissed) {
        // Small 800ms delay so the initial page render is smooth before popup appears
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('sessionStorage notice check notice:', e);
    }
  }, [mounted, noticeBoard]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      const noticeKey = `chordandcraft_notice_dismissed_${noticeBoard?.updatedAt || 'v1'}`;
      sessionStorage.setItem(noticeKey, 'true');
    } catch (e) {
      console.warn('Could not save notice dismissal', e);
    }
  };

  if (!isOpen || !noticeBoard?.isActive || !noticeBoard?.title?.trim()) {
    return null;
  }

  const theme = resolveNoticeTheme(noticeBoard);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="w-full max-w-md rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative animate-scale-up border max-h-[90dvh] overflow-y-auto my-auto"
        style={{
          backgroundColor: theme.backgroundColor,
          borderColor: hexToRgba(theme.accentColor, 0.45),
          boxShadow: `inset 0 1px 0 ${hexToRgba(theme.accentColor, 0.18)}, 0 24px 56px -16px ${hexToRgba(theme.accentColor, 0.25)}, 0 24px 48px -18px rgba(0, 0, 0, 0.85)`,
        }}
      >
        {/* Close (X) button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-xl transition cursor-pointer hover:bg-white/10"
          style={{ color: hexToRgba(theme.textColor, 0.65, '#ffffff') }}
          aria-label="Close announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="space-y-4 text-center">
          <div
            className="w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-xl"
            style={{
              backgroundColor: hexToRgba(theme.accentColor, 0.15),
              borderColor: hexToRgba(theme.accentColor, 0.35),
              boxShadow: `0 12px 28px -10px ${hexToRgba(theme.accentColor, 0.45)}`,
            }}
          >
            {renderNoticeBadgeIcon(theme.badgeIcon, 'w-6 h-6', theme.accentColor)}
          </div>

          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{
              backgroundColor: hexToRgba(theme.accentColor, 0.14),
              borderColor: hexToRgba(theme.accentColor, 0.35),
              color: theme.accentColor,
            }}
          >
            <span>{theme.badgeLabel}</span>
          </div>

          <h3
            className="text-xl sm:text-2xl font-black leading-tight tracking-tight"
            style={{ color: theme.textColor }}
          >
            {noticeBoard.title}
          </h3>

          <p
            className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
            style={{ color: hexToRgba(theme.textColor, 0.8, '#ffffff') }}
          >
            {noticeBoard.message}
          </p>
        </div>
      </div>
    </div>
  );
};
