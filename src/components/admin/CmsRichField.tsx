'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Sparkles,
  Type,
  Heading3,
  List,
  Eraser,
  ChevronDown,
  Check,
} from 'lucide-react';
import { CmsFontKey } from '@/lib/types';
import { CMS_FONT_OPTIONS, stripCmsMarkers } from '@/lib/cmsFonts';

interface CmsRichFieldProps {
  id?: string;
  label: React.ReactNode;
  value: string;
  onChange: (nextValue: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  enableMarkdownBlocks?: boolean;
  helperText?: string;
  inputClassName?: string;
}

/**
 * Luxury CMS Text Input / Textarea with integrated inline rich-text toolbar:
 * Bold (**), Italic (*), Underline (__), Gold Accent (==), Inline Stylish Font,
 * optional Heading / Bullet helpers, Clear Formatting, and Ctrl/Cmd+B/I/U shortcuts.
 */
export const CmsRichField: React.FC<CmsRichFieldProps> = ({
  id,
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  placeholder,
  required = false,
  enableMarkdownBlocks = false,
  helperText,
  inputClassName = '',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fontMenuRef = useRef<HTMLDivElement | null>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);

  useEffect(() => {
    if (!fontMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setFontMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fontMenuOpen]);

  const getControl = () => (multiline ? textareaRef.current : inputRef.current);

  const applyWrap = (prefix: string, suffix: string, sampleText: string) => {
    const el = getControl();
    if (!el) return;

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end);

    let nextVal: string;
    let nextStart: number;
    let nextEnd: number;

    // Toggle off if selection is already wrapped with the exact prefix/suffix
    const before = value.slice(0, start);
    const after = value.slice(end);
    if (
      selected.length > 0 &&
      before.endsWith(prefix) &&
      after.startsWith(suffix)
    ) {
      nextVal =
        before.slice(0, before.length - prefix.length) +
        selected +
        after.slice(suffix.length);
      nextStart = start - prefix.length;
      nextEnd = nextStart + selected.length;
    } else if (
      selected.startsWith(prefix) &&
      selected.endsWith(suffix) &&
      selected.length >= prefix.length + suffix.length
    ) {
      const inner = selected.slice(prefix.length, selected.length - suffix.length);
      nextVal = before + inner + after;
      nextStart = start;
      nextEnd = start + inner.length;
    } else {
      const content = selected || sampleText;
      nextVal = before + prefix + content + suffix + after;
      nextStart = start + prefix.length;
      nextEnd = nextStart + content.length;
    }

    onChange(nextVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextStart, nextEnd);
    });
  };

  const applyLinePrefix = (linePrefix: string, sampleText: string) => {
    const el = getControl();
    if (!el) return;

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const needsLeadingNewline = start > 0 && value[start - 1] !== '\n';
    const insertBlock = `${needsLeadingNewline ? '\n' : ''}${linePrefix}${selected || sampleText}`;
    const nextVal = value.slice(0, start) + insertBlock + value.slice(end);
    const selStart = start + (needsLeadingNewline ? 1 : 0) + linePrefix.length;
    const selEnd = selStart + (selected || sampleText).length;

    onChange(nextVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  const applyClearFormatting = () => {
    const el = getControl();
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    if (end > start) {
      const selected = value.slice(start, end);
      const cleaned = stripCmsMarkers(selected);
      const nextVal = value.slice(0, start) + cleaned + value.slice(end);
      onChange(nextVal);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, start + cleaned.length);
      });
    } else {
      onChange(stripCmsMarkers(value));
      requestAnimationFrame(() => el.focus());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      applyWrap('**', '**', 'bold text');
    } else if (key === 'i') {
      e.preventDefault();
      applyWrap('*', '*', 'italic text');
    } else if (key === 'u') {
      e.preventDefault();
      applyWrap('__', '__', 'underlined text');
    }
  };

  const inlineFontChoices = CMS_FONT_OPTIONS.filter((f) => f.key !== 'default');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
          {label}
        </label>
        {helperText && (
          <span className="text-[11px] text-zinc-500 font-mono">{helperText}</span>
        )}
      </div>

      <div className="rounded-xl border border-white/[0.09] bg-[#09090d] focus-within:border-amber-400/60 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.12)] transition">
        {/* Compact Inline Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 px-2.5 py-1.5 border-b border-white/[0.07] bg-white/[0.02] rounded-t-xl">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap('**', '**', 'bold text')}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-amber-300 hover:bg-amber-500/12 transition cursor-pointer"
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap('*', '*', 'italic text')}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-amber-300 hover:bg-amber-500/12 transition cursor-pointer"
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap('__', '__', 'underlined text')}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:text-amber-300 hover:bg-amber-500/12 transition cursor-pointer"
            title="Underline (Ctrl+U)"
            aria-label="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyWrap('==', '==', 'gold accent')}
            className="h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-medium text-amber-300/90 hover:text-amber-200 hover:bg-amber-500/15 transition cursor-pointer"
            title="Gold Highlight Accent"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Gold</span>
          </button>

          <span className="w-px h-4 bg-white/[0.08] mx-0.5" />

          {/* Inline Stylish Font Dropdown */}
          <div ref={fontMenuRef} className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFontMenuOpen((o) => !o)}
              className={`h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
                fontMenuOpen
                  ? 'bg-amber-500/18 text-amber-200'
                  : 'text-zinc-300 hover:text-amber-300 hover:bg-amber-500/12'
              }`}
              title="Apply stylish font to selected words"
            >
              <Type className="w-3 h-3" />
              <span>Font</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {fontMenuOpen && (
              <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-1.5 z-40 w-56 max-w-[calc(100vw-2.5rem)] p-1.5 rounded-xl bg-[#12121a] border border-white/[0.12] shadow-2xl space-y-0.5 max-h-64 overflow-y-auto">
                <p className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Style Selected Text
                </p>
                {inlineFontChoices.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      applyWrap(`[font:${f.key}]`, '[/font]', f.label);
                      setFontMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-amber-500/15 transition flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className={`${f.className} text-sm text-white truncate`}>
                      {f.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {f.styleTag}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {enableMarkdownBlocks && (
            <>
              <span className="w-px h-4 bg-white/[0.08] mx-0.5" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyLinePrefix('### ', 'Section Heading')}
                className="h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-amber-300 hover:bg-amber-500/12 transition cursor-pointer"
                title="Insert Section Heading (###)"
              >
                <Heading3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Heading</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyLinePrefix('- ', 'List item')}
                className="h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-amber-300 hover:bg-amber-500/12 transition cursor-pointer"
                title="Insert Bullet Point"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bullet</span>
              </button>
            </>
          )}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={applyClearFormatting}
            className="ml-auto h-7 px-2 rounded-lg flex items-center gap-1 text-[11px] text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
            title="Clear formatting from selection (or whole field)"
          >
            <Eraser className="w-3 h-3" />
            <span className="hidden md:inline">Clear</span>
          </button>
        </div>

        {/* Actual Input or Textarea */}
        {multiline ? (
          <textarea
            ref={textareaRef}
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={required}
            className={`w-full p-4 bg-transparent text-white text-sm leading-relaxed border-0 rounded-b-xl focus:outline-none focus:ring-0 focus:shadow-none ${inputClassName}`}
          />
        ) : (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={required}
            className={`w-full h-11 px-4 bg-transparent text-white text-sm border-0 rounded-b-xl focus:outline-none focus:ring-0 focus:shadow-none ${inputClassName}`}
          />
        )}
      </div>
    </div>
  );
};

interface CmsFontPickerProps {
  label: string;
  value: CmsFontKey;
  onChange: (font: CmsFontKey) => void;
}

/**
 * Visual stylish font family picker for section/page Headings & Body copy.
 * Displays every option rendered in its live typeface.
 */
export const CmsFontPicker: React.FC<CmsFontPickerProps> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const current = CMS_FONT_OPTIONS.find((f) => f.key === value) || CMS_FONT_OPTIONS[0];

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <span className="block text-[11px] font-medium text-zinc-400">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-10 px-3.5 rounded-xl bg-[#09090d] border border-white/[0.09] hover:border-amber-400/40 transition flex items-center justify-between gap-2 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className={`${current.className} text-sm text-white truncate`}>
            {current.label}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 p-1.5 rounded-2xl bg-[#12121a] border border-white/[0.12] shadow-2xl max-h-64 overflow-y-auto space-y-0.5">
          {CMS_FONT_OPTIONS.map((opt) => {
            const isSelected = opt.key === value;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35'
                    : 'text-zinc-200 hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <div className="min-w-0">
                  <span className={`${opt.className} text-sm block truncate`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {opt.styleTag}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
