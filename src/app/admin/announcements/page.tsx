'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { renderNoticeBadgeIcon } from '@/components/shared/GlobalNoticePopup';
import { NoticeBadgeIcon, NoticeThemeType } from '@/lib/types';
import {
  NOTICE_PRESETS,
  NOTICE_ICON_OPTIONS,
  ACCENT_COLOR_SWATCHES,
  SURFACE_COLOR_SWATCHES,
  TEXT_COLOR_SWATCHES,
  getNoticePreset,
  hexToRgba,
  normalizeHexColor,
  resolveNoticeTheme,
} from '@/lib/noticeTheme';
import {
  Megaphone,
  CheckCircle2,
  Save,
  Info,
  X,
  Eye,
  Radio,
  Palette,
  RotateCcw,
  Tag,
} from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const { noticeBoard, updateNoticeBoard } = useStore();

  const initialTheme = resolveNoticeTheme(noticeBoard);

  const [noticeActive, setNoticeActive] = useState<boolean>(noticeBoard?.isActive ?? false);
  const [noticeTitle, setNoticeTitle] = useState<string>(noticeBoard?.title || '');
  const [noticeMessage, setNoticeMessage] = useState<string>(noticeBoard?.message || '');
  const [noticeType, setNoticeType] = useState<NoticeThemeType>(initialTheme.type);
  const [badgeLabel, setBadgeLabel] = useState<string>(initialTheme.badgeLabel);
  const [badgeIcon, setBadgeIcon] = useState<NoticeBadgeIcon>(initialTheme.badgeIcon);
  const [accentColor, setAccentColor] = useState<string>(initialTheme.accentColor);
  const [backgroundColor, setBackgroundColor] = useState<string>(initialTheme.backgroundColor);
  const [textColor, setTextColor] = useState<string>(initialTheme.textColor);

  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeSavedSuccess, setNoticeSavedSuccess] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  useEffect(() => {
    if (noticeBoard) {
      const resolved = resolveNoticeTheme(noticeBoard);
      setNoticeActive(noticeBoard.isActive);
      setNoticeTitle(noticeBoard.title);
      setNoticeMessage(noticeBoard.message);
      setNoticeType(resolved.type);
      setBadgeLabel(resolved.badgeLabel);
      setBadgeIcon(resolved.badgeIcon);
      setAccentColor(resolved.accentColor);
      setBackgroundColor(resolved.backgroundColor);
      setTextColor(resolved.textColor);
    }
  }, [noticeBoard]);

  const handleSelectPreset = (typeId: NoticeThemeType) => {
    const preset = getNoticePreset(typeId);
    setNoticeType(preset.id);
    setBadgeLabel(preset.badgeLabel);
    setBadgeIcon(preset.badgeIcon);
    setAccentColor(preset.accentColor);
    setBackgroundColor(preset.backgroundColor);
    setTextColor(preset.textColor);
  };

  const handleResetTheme = () => {
    const preset = getNoticePreset(noticeType);
    setBadgeLabel(preset.badgeLabel);
    setBadgeIcon(preset.badgeIcon);
    setAccentColor(preset.accentColor);
    setBackgroundColor(preset.backgroundColor);
    setTextColor(preset.textColor);
  };

  const safeAccent = normalizeHexColor(accentColor, '#f59e0b');
  const safeBackground = normalizeHexColor(backgroundColor, '#141419');
  const safeText = normalizeHexColor(textColor, '#ffffff');
  const displayBadgeLabel = badgeLabel.trim() || getNoticePreset(noticeType).badgeLabel;

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotice(true);
    setNoticeSavedSuccess(false);

    await updateNoticeBoard({
      isActive: noticeActive,
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      type: noticeType,
      badgeLabel: displayBadgeLabel,
      badgeIcon,
      accentColor: safeAccent,
      backgroundColor: safeBackground,
      textColor: safeText,
      linkLabel: undefined,
      linkUrl: undefined,
    });

    setIsSavingNotice(false);
    setNoticeSavedSuccess(true);
    setTimeout(() => setNoticeSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-8 pb-12">
      <DashboardHeader
        title="Announcements"
        subtitle="Manage global academy popup notices, customizable badge themes, colors, and live visitor broadcasts."
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <section
          id="section-notice-board"
          className="p-4 sm:p-6 lg:p-9 rounded-3xl portal-surface space-y-6 sm:space-y-7 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-6 relative z-10">
            <div className="space-y-1.5">
              <div className="eyebrow-pill">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Global Website Popup</span>
              </div>
              <h2 className="portal-heading text-2xl sm:text-3xl text-white">
                Academy Notice Board &amp; Popup Manager
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                Broadcast announcements, masterclass alerts, or custom-styled notifications that appear as a dismissable popup modal for visitors.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLivePreviewModal(true)}
                className="h-10 px-4 rounded-xl luxury-btn-ghost text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Preview Popup</span>
              </button>

              <label className="h-10 flex items-center gap-2.5 cursor-pointer select-none px-4 rounded-xl bg-[#09090d] border border-white/[0.09] hover:border-white/[0.18] transition">
                <input
                  type="checkbox"
                  checked={noticeActive}
                  onChange={(e) => setNoticeActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/20 accent-amber-500 cursor-pointer"
                />
                <span
                  className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                    noticeActive ? 'text-emerald-400' : 'text-zinc-400'
                  }`}
                >
                  {noticeActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  <span>
                    {noticeActive ? 'Live Broadcasting Active' : 'Broadcast Disabled'}
                  </span>
                </span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSaveNotice} className="space-y-7 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form Inputs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label
                    htmlFor="notice-title"
                    className="block text-xs text-zinc-200 font-semibold"
                  >
                    Notice Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="notice-title"
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Live Masterclass with Mentor Julian Mercer!"
                    className="w-full h-11 px-4 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="notice-message"
                    className="block text-xs text-zinc-200 font-semibold"
                  >
                    Notice Message / Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    id="notice-message"
                    rows={4}
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Enter detailed notice content, schedule, or instructions for students..."
                    className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                    required
                  />
                </div>

                {/* Badge Theme & Color Customization Studio */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/75 border border-zinc-800 space-y-5 sm:space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                        Notice Badge Theme &amp; Colors
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetTheme}
                      className="text-[11px] font-medium text-zinc-400 hover:text-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                      title="Reset badge label, icon, and colors to preset defaults"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Preset</span>
                    </button>
                  </div>

                  {/* Quick Theme Presets */}
                  <div className="space-y-2">
                    <label className="block text-xs text-zinc-300 font-medium">
                      Theme Presets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {NOTICE_PRESETS.map((preset) => {
                        const isSelected = noticeType === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.id)}
                            className="px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
                            style={
                              isSelected
                                ? {
                                    backgroundColor: hexToRgba(preset.accentColor, 0.16),
                                    borderColor: hexToRgba(preset.accentColor, 0.55),
                                    color: preset.accentColor,
                                  }
                                : {
                                    backgroundColor: '#09090c',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    color: '#a1a1aa',
                                  }
                            }
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Badge Text & Icon */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-6 space-y-2">
                      <label
                        htmlFor="notice-badge-label"
                        className="block text-xs text-zinc-300 font-medium"
                      >
                        Custom Badge Text
                      </label>
                      <div className="relative">
                        <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="notice-badge-label"
                          type="text"
                          value={badgeLabel}
                          onChange={(e) => setBadgeLabel(e.target.value)}
                          maxLength={32}
                          placeholder="e.g. Live Clinic, Flash Sale..."
                          className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#09090c] border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6 space-y-2">
                      <label className="block text-xs text-zinc-300 font-medium">
                        Badge Icon
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {NOTICE_ICON_OPTIONS.map((opt) => {
                          const active = badgeIcon === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setBadgeIcon(opt.id)}
                              title={opt.label}
                              aria-label={`Select ${opt.label} icon`}
                              className="w-9 h-9 rounded-xl border flex items-center justify-center transition cursor-pointer"
                              style={
                                active
                                  ? {
                                      backgroundColor: hexToRgba(safeAccent, 0.16),
                                      borderColor: hexToRgba(safeAccent, 0.6),
                                      color: safeAccent,
                                    }
                                  : {
                                      backgroundColor: '#09090c',
                                      borderColor: 'rgba(255,255,255,0.08)',
                                      color: '#a1a1aa',
                                    }
                              }
                            >
                              {renderNoticeBadgeIcon(opt.id, 'w-4 h-4')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/80">
                    {/* Accent / Badge Color */}
                    <div className="space-y-2.5">
                      <label
                        htmlFor="accent-color-hex"
                        className="block text-xs text-zinc-300 font-medium"
                      >
                        Accent &amp; Badge Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={safeAccent}
                          onChange={(e) => setAccentColor(e.target.value)}
                          aria-label="Pick accent color"
                          className="w-10 h-10 rounded-xl bg-[#09090c] border border-zinc-700 p-1 cursor-pointer shrink-0"
                        />
                        <input
                          id="accent-color-hex"
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          placeholder="#f59e0b"
                          maxLength={7}
                          className="w-full h-10 px-3 rounded-xl bg-[#09090c] border border-zinc-800 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ACCENT_COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setAccentColor(swatch.hex)}
                            title={swatch.name}
                            aria-label={`Set accent color to ${swatch.name}`}
                            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                              safeAccent === swatch.hex
                                ? 'border-white ring-2 ring-white/30 scale-110'
                                : 'border-white/20'
                            }`}
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Popup Background Color */}
                    <div className="space-y-2.5">
                      <label
                        htmlFor="bg-color-hex"
                        className="block text-xs text-zinc-300 font-medium"
                      >
                        Popup Background
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={safeBackground}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          aria-label="Pick popup background color"
                          className="w-10 h-10 rounded-xl bg-[#09090c] border border-zinc-700 p-1 cursor-pointer shrink-0"
                        />
                        <input
                          id="bg-color-hex"
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#141419"
                          maxLength={7}
                          className="w-full h-10 px-3 rounded-xl bg-[#09090c] border border-zinc-800 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {SURFACE_COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setBackgroundColor(swatch.hex)}
                            title={swatch.name}
                            aria-label={`Set background color to ${swatch.name}`}
                            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                              safeBackground === swatch.hex
                                ? 'border-white ring-2 ring-white/30 scale-110'
                                : 'border-white/25'
                            }`}
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Color */}
                    <div className="space-y-2.5">
                      <label
                        htmlFor="text-color-hex"
                        className="block text-xs text-zinc-300 font-medium"
                      >
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={safeText}
                          onChange={(e) => setTextColor(e.target.value)}
                          aria-label="Pick text color"
                          className="w-10 h-10 rounded-xl bg-[#09090c] border border-zinc-700 p-1 cursor-pointer shrink-0"
                        />
                        <input
                          id="text-color-hex"
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          placeholder="#ffffff"
                          maxLength={7}
                          className="w-full h-10 px-3 rounded-xl bg-[#09090c] border border-zinc-800 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TEXT_COLOR_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.hex}
                            type="button"
                            onClick={() => setTextColor(swatch.hex)}
                            title={swatch.name}
                            aria-label={`Set text color to ${swatch.name}`}
                            className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                              safeText === swatch.hex
                                ? 'border-amber-400 ring-2 ring-amber-400/40 scale-110'
                                : 'border-zinc-500/60'
                            }`}
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Preview Box */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
                <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Modal Visual Preview</span>
                  <span style={{ color: safeAccent }}>Visitor Perspective</span>
                </div>

                <div
                  className="p-6 rounded-2xl border space-y-4 shadow-2xl relative transition-colors"
                  style={{
                    backgroundColor: safeBackground,
                    borderColor: hexToRgba(safeAccent, 0.45),
                    boxShadow: `inset 0 1px 0 ${hexToRgba(safeAccent, 0.16)}, 0 18px 42px -18px ${hexToRgba(safeAccent, 0.25)}`,
                  }}
                >
                  <div
                    className="flex items-center justify-between border-b pb-3.5"
                    style={{ borderColor: hexToRgba(safeText, 0.1, '#ffffff') }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="p-1.5 rounded-lg border"
                        style={{
                          backgroundColor: hexToRgba(safeAccent, 0.15),
                          borderColor: hexToRgba(safeAccent, 0.35),
                        }}
                      >
                        {renderNoticeBadgeIcon(badgeIcon, 'w-4 h-4', safeAccent)}
                      </div>
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: safeAccent }}
                      >
                        CHORD &amp; CRAFT ACADEMY NOTICE
                      </span>
                    </div>
                    <div
                      className="w-6 h-6 rounded-lg text-xs flex items-center justify-center"
                      style={{
                        backgroundColor: hexToRgba(safeText, 0.08, '#ffffff'),
                        color: hexToRgba(safeText, 0.65, '#ffffff'),
                      }}
                    >
                      ✕
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: hexToRgba(safeAccent, 0.14),
                        borderColor: hexToRgba(safeAccent, 0.35),
                        color: safeAccent,
                      }}
                    >
                      {displayBadgeLabel}
                    </span>
                    <h4
                      className="text-base font-bold leading-snug"
                      style={{ color: safeText }}
                    >
                      {noticeTitle || 'Notice Title Will Appear Here'}
                    </h4>
                    <p
                      className="text-xs leading-relaxed whitespace-pre-line line-clamp-5"
                      style={{ color: hexToRgba(safeText, 0.78, '#ffffff') }}
                    >
                      {noticeMessage ||
                        'Detailed notice message text will be displayed here for website visitors.'}
                    </p>
                  </div>

                  <div
                    className="pt-3 border-t flex items-center justify-between text-[11px] font-mono"
                    style={{ borderColor: hexToRgba(safeText, 0.1, '#ffffff') }}
                  >
                    <span
                      className="flex items-center gap-1.5"
                      style={{ color: hexToRgba(safeText, 0.6, '#ffffff') }}
                    >
                      <Radio
                        className={`w-3.5 h-3.5 ${
                          noticeActive ? 'text-emerald-400' : 'text-zinc-500'
                        }`}
                      />
                      <span>{noticeActive ? 'Visible to visitors' : 'Hidden from visitors'}</span>
                    </span>
                    {noticeBoard?.updatedAt && (
                      <span style={{ color: hexToRgba(safeText, 0.5, '#ffffff') }}>
                        Updated {new Date(noticeBoard.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Active Palette Chip Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Accent', value: safeAccent },
                    { label: 'Surface', value: safeBackground },
                    { label: 'Text', value: safeText },
                  ].map((chip) => (
                    <div
                      key={chip.label}
                      className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/25 shrink-0"
                        style={{ backgroundColor: chip.value }}
                      />
                      <div className="min-w-0">
                        <p className="text-[9px] text-zinc-500 uppercase font-mono leading-none">
                          {chip.label}
                        </p>
                        <p className="text-[11px] text-zinc-200 font-mono uppercase mt-0.5 truncate">
                          {chip.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Notice Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-zinc-800">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  When enabled, visitors will see this announcement modal once per session with a close cross (✕) button.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                {noticeSavedSuccess && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Announcement Saved!
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSavingNotice}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSavingNotice ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save &amp; Broadcast Notice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>

      {/* Live Preview Popup Modal */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto animate-scale-up border"
            style={{
              backgroundColor: safeBackground,
              borderColor: hexToRgba(safeAccent, 0.45),
              boxShadow: `inset 0 1px 0 ${hexToRgba(safeAccent, 0.18)}, 0 24px 56px -16px ${hexToRgba(safeAccent, 0.28)}, 0 24px 48px -18px rgba(0, 0, 0, 0.85)`,
            }}
          >
            <button
              type="button"
              onClick={() => setShowLivePreviewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl transition cursor-pointer hover:bg-white/10"
              style={{ color: hexToRgba(safeText, 0.65, '#ffffff') }}
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 text-center">
              <div
                className="w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-xl"
                style={{
                  backgroundColor: hexToRgba(safeAccent, 0.15),
                  borderColor: hexToRgba(safeAccent, 0.35),
                  boxShadow: `0 12px 28px -10px ${hexToRgba(safeAccent, 0.45)}`,
                }}
              >
                {renderNoticeBadgeIcon(badgeIcon, 'w-6 h-6', safeAccent)}
              </div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: hexToRgba(safeAccent, 0.14),
                  borderColor: hexToRgba(safeAccent, 0.35),
                  color: safeAccent,
                }}
              >
                <span>{displayBadgeLabel}</span>
              </div>
              <h3
                className="text-xl sm:text-2xl font-black leading-tight tracking-tight"
                style={{ color: safeText }}
              >
                {noticeTitle || 'Academy Announcement'}
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                style={{ color: hexToRgba(safeText, 0.8, '#ffffff') }}
              >
                {noticeMessage || 'Notice message body will appear here for visitors.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
