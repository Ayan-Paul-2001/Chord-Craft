'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { ArrowRight } from 'lucide-react';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const CtaSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const sectionData = data || cmsSections.find((s) => s.id === 'sec-cta');

  const sanitize = (str: string) =>
    str
      .replace(/Ershad Zaman/gi, adminName)
      .replace(/Guitart Academy/gi, 'Harmonic Guitar Academy')
      .replace(/Guitart/gi, 'Chord & Craft');

  const title = sanitize(sectionData?.title || 'Ready to Elevate Your Guitar Craft?');
  const rawSubtitle = sanitize(sectionData?.subtitle || '').trim();
  const isLongSubtitle = rawSubtitle.length > 36;
  const eyebrowLabel = !rawSubtitle || isLongSubtitle ? 'Harmonic Guitar Academy' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const content = sanitize(
    sectionData?.content ||
      `Enroll at Harmonic Guitar Academy to get instant access to your student dashboard, YouTube HD video modules, downloadable PDF TAB sheets, and direct mentorship from ${adminName}.`
  );
  const buttonText = sanitize(sectionData?.buttonText || 'Join Harmonic Academy');
  const buttonLink = sectionData?.buttonLink || '/signup';
  const titleFontClass = getCmsFontClass(sectionData?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(sectionData?.bodyFont, '');

  return (
    <section className="py-16 sm:py-24 lg:py-28 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[780px] h-[240px] sm:h-[360px] bg-amber-500/[0.08] rounded-full blur-[110px] sm:blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-2xl sm:rounded-[2rem] luxury-glass gold-border-glow p-6 sm:p-12 lg:p-16 text-center space-y-5 sm:space-y-8 overflow-hidden">
          <div className="absolute inset-0 acoustic-strings-bg opacity-45 pointer-events-none" />
          <div className="relative z-10 space-y-5 sm:space-y-6">
            <BrandIcon className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mx-auto shadow-2xl shadow-amber-950/60" />

            <div className="eyebrow-pill mx-auto">
              <span>
                <RichCmsText text={eyebrowLabel} />
              </span>
            </div>

            <h2 className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] sm:leading-[1.06] max-w-3xl mx-auto`}>
              <RichCmsText text={title} />
            </h2>

            {leadSubtitle && (
              <p className="text-sm sm:text-base text-amber-200/85 font-medium leading-relaxed max-w-2xl mx-auto">
                <RichCmsText text={leadSubtitle} />
              </p>
            )}

            <p className={`${bodyFontClass} text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed`}>
              <RichCmsText text={content} />
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                href={buttonLink}
                className="w-full max-w-[235px] sm:max-w-none sm:w-auto px-5 sm:px-8 py-3 sm:py-4 rounded-xl luxury-btn-primary font-bold sm:font-extrabold text-xs sm:text-base tracking-wide inline-flex items-center justify-center gap-2 group"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/login"
                className="w-full max-w-[235px] sm:max-w-none sm:w-auto px-5 sm:px-8 py-3 sm:py-4 rounded-xl luxury-btn-ghost text-zinc-100 font-semibold sm:font-bold text-xs sm:text-base inline-flex items-center justify-center"
              >
                Student Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
