'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

const SITE_TAB_TITLE = 'Chord & Craft — Harmonic Guitar Academy';

/**
 * Dynamically synchronizes the browser tab title and favicon in real-time,
 * ensuring the browser tab always displays the brand title (never raw route URLs)
 * and the admin-configured Cloudinary favicon (or default Chord & Craft icon).
 */
export function DynamicFavicon() {
  const pathname = usePathname();
  const { platformSettings, isPlatformLoading } = useStore();

  // Keep browser tab title consistently set to the academy name across all route transitions
  useEffect(() => {
    if (typeof document !== 'undefined' && document.title !== SITE_TAB_TITLE) {
      document.title = SITE_TAB_TITLE;
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isPlatformLoading) return;

    const rawUrl =
      platformSettings?.faviconUrl && platformSettings.faviconUrl !== '/favicon.ico'
        ? platformSettings.faviconUrl
        : '/chord-craft-icon.svg';

    const faviconUrl = rawUrl.startsWith('http')
      ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
      : rawUrl;

    let linkElements: HTMLLinkElement[] = Array.from(
      document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']")
    );

    if (linkElements.length === 0) {
      const newIcon = document.createElement('link');
      newIcon.rel = 'icon';
      document.head.appendChild(newIcon);

      const newShortcut = document.createElement('link');
      newShortcut.rel = 'shortcut icon';
      document.head.appendChild(newShortcut);

      linkElements = [newIcon, newShortcut];
    }

    linkElements.forEach((link) => {
      if (faviconUrl.endsWith('.svg')) {
        link.type = 'image/svg+xml';
      }
      link.href = faviconUrl;
    });
  }, [platformSettings?.faviconUrl, isPlatformLoading]);

  return null;
}
