import type { Metadata } from 'next';
import '@fontsource/plus-jakarta-sans/latin-300.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-800.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/cormorant-garamond/latin-700-italic.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-400-italic.css';
import '@fontsource/playfair-display/latin-600-italic.css';
import '@fontsource/cinzel/latin-400.css';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/great-vibes/latin-400.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/latin-700.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { DynamicFavicon } from '@/components/shared/DynamicFavicon';
import { GlobalNoticePopup } from '@/components/shared/GlobalNoticePopup';
import { connectToDatabase } from '@/lib/mongodb';
import BillingSettings from '@/models/BillingSettings';
import CmsSectionModel from '@/models/CmsSection';
import { PlatformSettings, HomepageSection, LegalPolicies } from '@/lib/types';
import { MOCK_CMS_SECTIONS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chord & Craft — Harmonic Guitar Academy',
  description:
    'Premium guitar conservatory at Harmonic Guitar Academy, led by guitarist & mentor Julian Mercer. Master acoustic & electric guitar with HD YouTube lessons, downloadable PDF tabs, studio backing tracks, and personalized mentorship.',
  icons: {
    icon: [
      {
        url: '/chord-craft-icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
      },
    ],
    shortcut: ['/chord-craft-icon.svg'],
    apple: ['/chord-craft-icon.svg'],
  },
  openGraph: {
    title: 'Chord & Craft — Harmonic Guitar Academy',
    description:
      'Master acoustic & electric guitar with Julian Mercer at Harmonic Guitar Academy. Structured lessons, downloadable PDF tabs, studio backing tracks, & student portal.',
    url: 'https://chordandcraft.com',
    siteName: 'Chord & Craft — Harmonic Guitar Academy',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Chord & Craft — Harmonic Guitar Academy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialPlatformSettings: PlatformSettings | undefined = undefined;
  let initialCmsSections: HomepageSection[] | undefined = undefined;
  let initialLegalPolicies: Partial<LegalPolicies> | undefined = undefined;

  try {
    await connectToDatabase();
    const [settings, sections] = await Promise.all([
      BillingSettings.findOne().lean() as any,
      CmsSectionModel.find().sort({ order: 1 }).lean(),
    ]);

    if (settings) {
      initialPlatformSettings = {
        bKashNumber: settings.bKashNumber || '01711-000000',
        faviconUrl:
          settings.faviconUrl && settings.faviconUrl !== '/favicon.ico'
            ? settings.faviconUrl
            : '/chord-craft-icon.svg',
        directorName:
          settings.directorName && !/ershad\s*zaman/i.test(settings.directorName)
            ? settings.directorName
            : 'Julian Mercer',
        academyEmail:
          settings.academyEmail && !/guitart|ershad/i.test(settings.academyEmail)
            ? settings.academyEmail
            : 'support@chordandcraft.com',
        academyPhone: settings.academyPhone || '+880 1711-000000',
        address: settings.address || 'Banani, Dhaka-1213, Bangladesh',
        socialLinks: Array.isArray(settings.socialLinks) ? settings.socialLinks : [],
      };
      if (settings.legalPolicies && typeof settings.legalPolicies === 'object') {
        initialLegalPolicies = settings.legalPolicies;
      }
    }

    if (sections && sections.length > 0) {
      const mapped: HomepageSection[] = sections.map((s: any) => ({
        id: s.sectionKey,
        title: s.title,
        subtitle: s.subtitle || '',
        content: s.content,
        imageUrl: s.imageUrl || '',
        buttonText: s.buttonText || '',
        buttonLink: s.buttonLink || '',
        titleFont: s.titleFont || 'default',
        bodyFont: s.bodyFont || 'default',
        enabled: s.enabled,
        order: s.order,
      }));
      const existingKeys = new Set(mapped.map((s) => s.id));
      for (const fallback of MOCK_CMS_SECTIONS) {
        if (!existingKeys.has(fallback.id)) {
          mapped.push(fallback);
        }
      }
      mapped.sort((a, b) => a.order - b.order);
      initialCmsSections = mapped;
    }
  } catch (e) {
    console.warn('RootLayout SSR data fetch notice:', e);
  }

  return (
    <html
      lang="en"
      className="dark scroll-smooth"
      suppressHydrationWarning
    >
      <body
        className="bg-[#0a0a0c] text-zinc-100 font-sans antialiased min-h-screen flex flex-col selection:bg-amber-400 selection:text-zinc-950"
        suppressHydrationWarning
      >
        <StoreProvider
          initialPlatformSettings={initialPlatformSettings}
          initialCmsSections={initialCmsSections}
          initialLegalPolicies={initialLegalPolicies}
        >
          <DynamicFavicon />
          <PublicNavbar />
          {children}
          <GlobalNoticePopup />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
