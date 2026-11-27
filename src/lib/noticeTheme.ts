import { NoticeBadgeIcon, NoticeBoard, NoticeThemeType } from '@/lib/types';

export interface NoticePresetConfig {
  id: NoticeThemeType;
  label: string;
  badgeLabel: string;
  badgeIcon: NoticeBadgeIcon;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export const NOTICE_PRESETS: NoticePresetConfig[] = [
  {
    id: 'announcement',
    label: 'Announcement',
    badgeLabel: 'Announcement',
    badgeIcon: 'megaphone',
    accentColor: '#f59e0b',
    backgroundColor: '#141419',
    textColor: '#ffffff',
  },
  {
    id: 'event',
    label: 'Event / Masterclass',
    badgeLabel: 'Event / Masterclass',
    badgeIcon: 'sparkles',
    accentColor: '#a855f7',
    backgroundColor: '#161221',
    textColor: '#ffffff',
  },
  {
    id: 'warning',
    label: 'Important Alert',
    badgeLabel: 'Important Alert',
    badgeIcon: 'alert',
    accentColor: '#f43f5e',
    backgroundColor: '#1c1115',
    textColor: '#ffffff',
  },
  {
    id: 'info',
    label: 'Information',
    badgeLabel: 'Information',
    badgeIcon: 'info',
    accentColor: '#3b82f6',
    backgroundColor: '#101622',
    textColor: '#ffffff',
  },
  {
    id: 'custom',
    label: 'Custom',
    badgeLabel: 'Special Notice',
    badgeIcon: 'bell',
    accentColor: '#10b981',
    backgroundColor: '#101916',
    textColor: '#ffffff',
  },
];

export const ACCENT_COLOR_SWATCHES = [
  { name: 'Champagne Gold', hex: '#f59e0b' },
  { name: 'Royal Violet', hex: '#a855f7' },
  { name: 'Crimson Rose', hex: '#f43f5e' },
  { name: 'Cobalt Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Cyan Glow', hex: '#06b6d4' },
  { name: 'Sunset Coral', hex: '#f97316' },
  { name: 'Warm Ivory', hex: '#fde68a' },
];

export const SURFACE_COLOR_SWATCHES = [
  { name: 'Obsidian', hex: '#141419' },
  { name: 'Pitch Black', hex: '#0a0a0d' },
  { name: 'Midnight', hex: '#101622' },
  { name: 'Deep Plum', hex: '#161221' },
  { name: 'Velvet Rose', hex: '#1c1115' },
  { name: 'Forest Night', hex: '#101916' },
];

export const TEXT_COLOR_SWATCHES = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Warm Cream', hex: '#fef3c7' },
  { name: 'Silver Mist', hex: '#e4e4e7' },
  { name: 'Cool Ice', hex: '#e0f2fe' },
];

export const NOTICE_ICON_OPTIONS: { id: NoticeBadgeIcon; label: string }[] = [
  { id: 'megaphone', label: 'Megaphone' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'alert', label: 'Alert' },
  { id: 'info', label: 'Info' },
  { id: 'music', label: 'Music' },
  { id: 'bell', label: 'Bell' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'flame', label: 'Featured' },
  { id: 'gift', label: 'Offer' },
];

export function isValidHexColor(value?: string): boolean {
  if (!value) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

export function normalizeHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

export function hexToRgba(hex: string, alpha: number, fallback = '#f59e0b'): string {
  const safeHex = normalizeHexColor(hex, fallback).slice(1);
  const r = parseInt(safeHex.slice(0, 2), 16);
  const g = parseInt(safeHex.slice(2, 4), 16);
  const b = parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getNoticePreset(type?: NoticeThemeType): NoticePresetConfig {
  return NOTICE_PRESETS.find((p) => p.id === type) || NOTICE_PRESETS[0];
}

export interface ResolvedNoticeTheme {
  type: NoticeThemeType;
  badgeLabel: string;
  badgeIcon: NoticeBadgeIcon;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export function resolveNoticeTheme(notice?: Partial<NoticeBoard> | null): ResolvedNoticeTheme {
  const preset = getNoticePreset(notice?.type);
  return {
    type: preset.id,
    badgeLabel: notice?.badgeLabel?.trim() || preset.badgeLabel,
    badgeIcon: notice?.badgeIcon || preset.badgeIcon,
    accentColor: normalizeHexColor(notice?.accentColor, preset.accentColor),
    backgroundColor: normalizeHexColor(notice?.backgroundColor, preset.backgroundColor),
    textColor: normalizeHexColor(notice?.textColor, preset.textColor),
  };
}
