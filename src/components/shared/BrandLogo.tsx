'use client';

import React, { useState, useId } from 'react';
import { useStore } from '@/context/StoreContext';

interface BrandIconProps {
  className?: string;
  iconClassName?: string;
}

/**
 * Bespoke geometric emblem for Chord & Craft — Harmonic Guitar Academy.
 * Combines a sculpted guitar pick frame, an acoustic rosette "C" arc,
 * three precision strings, and a luthier fretboard diamond inlay.
 * Uses unique per-instance gradient IDs so hidden desktop sidebars never
 * break SVG gradient paints inside mobile drawers.
 */
export const ChordCraftMark: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const bgId = `cc-mark-bg-${uid}`;
  const goldId = `cc-mark-gold-${uid}`;
  const pickId = `cc-mark-pick-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      fill="none"
      className={`${className} block shrink-0`}
      aria-label="Chord & Craft Logo"
    >
      <defs>
        <linearGradient id={bgId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="55%" stopColor="#111114" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id={goldId} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={pickId} x1="18" y1="14" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${bgId})`} />
      <rect x="3" y="3" width="58" height="58" rx="15" stroke={`url(#${goldId})`} strokeWidth="2" strokeOpacity="0.9" />

      <path
        d="M32 10C21.5 10 14 14.4 14 23.4C14 35.8 23.8 48.8 32 54.5C40.2 48.8 50 35.8 50 23.4C50 14.4 42.5 10 32 10Z"
        fill={`url(#${pickId})`}
        fillOpacity="0.16"
        stroke={`url(#${goldId})`}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      <path
        d="M40.2 21.8A11.4 11.4 0 1 0 40.2 37.2"
        stroke={`url(#${goldId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      <line x1="27" y1="14.5" x2="27" y2="48" stroke="#fef3c7" strokeWidth="1.35" strokeOpacity="0.75" strokeLinecap="round" />
      <line x1="32" y1="13" x2="32" y2="51" stroke="#fde68a" strokeWidth="1.65" strokeLinecap="round" />
      <line x1="37" y1="14.5" x2="37" y2="48" stroke="#fef3c7" strokeWidth="1.35" strokeOpacity="0.75" strokeLinecap="round" />

      <path
        d="M32 24.8L36.2 29.5L32 34.2L27.8 29.5Z"
        fill="#09090b"
        stroke="#fde68a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="29.5" r="1.4" fill="#fbbf24" />
    </svg>
  );
};

export const BrandIcon: React.FC<BrandIconProps> = ({
  className = 'w-10 h-10',
}) => {
  const { platformSettings, isPlatformLoading } = useStore();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const faviconUrl = platformSettings?.faviconUrl;
  const isCustomLogo = Boolean(
    faviconUrl &&
      faviconUrl !== '/favicon.ico' &&
      faviconUrl !== '/chord-craft-icon.svg' &&
      (faviconUrl.startsWith('http') || faviconUrl.startsWith('/') || faviconUrl.startsWith('data:'))
  );
  const hasError = Boolean(faviconUrl && failedUrl === faviconUrl);

  // ── While MongoDB fetch is still loading, render the crisp Chord & Craft mark immediately ──
  if (isPlatformLoading) {
    return (
      <div
        className={`${className} flex items-center justify-center shrink-0 relative transition-transform select-none rounded-xl overflow-hidden shadow-lg shadow-amber-950/40`}
      >
        <ChordCraftMark className="w-full h-full" />
      </div>
    );
  }

  // ── Custom uploaded logo from Cloudinary ──
  if (isCustomLogo && !hasError && faviconUrl) {
    return (
      <div
        className={`${className} flex items-center justify-center shrink-0 relative transition-transform select-none bg-transparent overflow-hidden`}
      >
        <img
          key={faviconUrl}
          src={faviconUrl}
          alt="Chord & Craft Brand Logo"
          onError={() => setFailedUrl(faviconUrl)}
          className="w-full h-full object-contain filter drop-shadow-sm"
          style={{ background: 'transparent' }}
        />
      </div>
    );
  }

  // ── Default official Chord & Craft emblem ──
  return (
    <div
      className={`${className} flex items-center justify-center shrink-0 relative transition-transform select-none rounded-xl overflow-hidden shadow-lg shadow-amber-950/50`}
    >
      <ChordCraftMark className="w-full h-full" />
    </div>
  );
};
