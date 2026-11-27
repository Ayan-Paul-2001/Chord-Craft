'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Video, FileText, Headphones, Lock, RefreshCw, ShoppingBag, Sparkles } from 'lucide-react';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const WhyUsSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName } = useStore();
  const sectionTitle = data?.title?.trim() || 'Why Learn With Chord & Craft?';
  const rawSubtitle = data?.subtitle?.trim() || '';
  const isLongSubtitle = rawSubtitle.length > 36;
  const sectionEyebrow = !rawSubtitle || isLongSubtitle ? 'Platform Benefits' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const sectionBody =
    data?.content?.trim() ||
    'Built for serious guitarists at Harmonic Guitar Academy with seamless local payments & conservatory-grade study tools.';
  const titleFontClass = getCmsFontClass(data?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(data?.bodyFont, '');

  const features = [
    {
      icon: Video,
      title: 'YouTube HD Masterclasses',
      description:
        'Curated multi-angle HD guitar tutorials embedded directly inside an uncluttered dark conservatory player.',
    },
    {
      icon: FileText,
      title: 'Downloadable PDF & TAB Sheets',
      description: `Printable PDF notation sheets and interactive ASCII tabs curated by ${adminName} for every exercise and solo.`,
    },
    {
      icon: Headphones,
      title: 'Loopable Studio Backing Tracks',
      description:
        'Jam along with built-in chord progression audio tracks with adjustable tempo speed and seamless loop controls.',
    },
    {
      icon: Lock,
      title: 'Curated Module Progression',
      description:
        'Mentors unlock modules sequentially so you lock in clean ergonomics and tone before tackling advanced speed riffs.',
    },
    {
      icon: RefreshCw,
      title: 'Attendance & Progress Analytics',
      description:
        'Monitor completed curriculum modules, live clinic attendance rates, and your skill tier from one dashboard.',
    },
    {
      icon: ShoppingBag,
      title: 'Official Chord & Craft Gear',
      description:
        'Shop signature beveled pick packs, heritage leather straps, academy hoodies, and hardcover notation workbooks.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <div className="eyebrow-pill mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <RichCmsText text={sectionEyebrow} />
            </span>
          </div>
          <h2 className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1]`}>
            <RichCmsText text={sectionTitle} />
          </h2>
          {leadSubtitle && (
            <p className="text-sm sm:text-base text-amber-200/85 font-medium leading-relaxed max-w-2xl mx-auto">
              <RichCmsText text={leadSubtitle} />
            </p>
          )}
          <p className={`${bodyFontClass} text-zinc-400 text-sm sm:text-base leading-relaxed`}>
            <RichCmsText text={sectionBody} />
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl luxury-card group space-y-3 sm:space-y-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
};
