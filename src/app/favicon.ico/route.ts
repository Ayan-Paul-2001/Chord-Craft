import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BillingSettings from '@/models/BillingSettings';

export const dynamic = 'force-dynamic';

const CHORD_CRAFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
  <defs>
    <linearGradient id="cc-bg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="55%" stop-color="#111114"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="cc-gold" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="cc-pick" x1="18" y1="14" x2="48" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="55%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#cc-bg)"/>
  <rect x="3" y="3" width="58" height="58" rx="15" stroke="url(#cc-gold)" stroke-width="2" stroke-opacity="0.9"/>
  <path d="M32 10C21.5 10 14 14.4 14 23.4C14 35.8 23.8 48.8 32 54.5C40.2 48.8 50 35.8 50 23.4C50 14.4 42.5 10 32 10Z" fill="url(#cc-pick)" fill-opacity="0.16" stroke="url(#cc-gold)" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M40.2 21.8A11.4 11.4 0 1 0 40.2 37.2" stroke="url(#cc-gold)" stroke-width="3.2" stroke-linecap="round"/>
  <line x1="27" y1="14.5" x2="27" y2="48" stroke="#fef3c7" stroke-width="1.35" stroke-opacity="0.75" stroke-linecap="round"/>
  <line x1="32" y1="13" x2="32" y2="51" stroke="#fde68a" stroke-width="1.65" stroke-linecap="round"/>
  <line x1="37" y1="14.5" x2="37" y2="48" stroke="#fef3c7" stroke-width="1.35" stroke-opacity="0.75" stroke-linecap="round"/>
  <path d="M32 24.8L36.2 29.5L32 34.2L27.8 29.5Z" fill="#09090b" stroke="#fde68a" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="32" cy="29.5" r="1.4" fill="#fbbf24"/>
</svg>`;

export async function GET() {
  try {
    await connectToDatabase();
    const settings = (await BillingSettings.findOne().lean()) as any;
    if (
      settings?.faviconUrl &&
      settings.faviconUrl !== '/favicon.ico' &&
      settings.faviconUrl !== '/chord-craft-icon.svg' &&
      settings.faviconUrl.startsWith('http')
    ) {
      return NextResponse.redirect(settings.faviconUrl, {
        status: 307,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }
  } catch (e) {
    console.warn('Favicon route DB lookup notice:', e);
  }

  return new NextResponse(CHORD_CRAFT_SVG, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
