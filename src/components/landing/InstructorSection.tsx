'use client';

import React from 'react';
import { Award, Music, ShieldCheck, Flame, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const InstructorSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const sectionData = data || cmsSections.find((s) => s.id === 'sec-instructor');

  const sanitize = (str: string) =>
    str
      .replace(/Ershad Zaman/gi, adminName)
      .replace(/Guitart Academy/gi, 'Harmonic Guitar Academy')
      .replace(/Guitart/gi, 'Chord & Craft');

  const imageUrl =
    sectionData?.imageUrl && sectionData.imageUrl.trim().length > 0
      ? sectionData.imageUrl
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

  const title = sanitize(sectionData?.title || `Meet Your Mentor — ${adminName}`);
  const rawSubtitle = sanitize(sectionData?.subtitle || '').trim();
  const isLongSubtitle = rawSubtitle.length > 36;
  const eyebrowLabel = !rawSubtitle || isLongSubtitle ? 'Lead Mentor Spotlight' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const content = sanitize(
    sectionData?.content ||
      `Renowned for melodic phrasing, effortless alternate picking, and rich harmonic arrangements, ${adminName} leads the curriculum at Harmonic Guitar Academy to help students develop authentic tone and stage confidence.`
  );

  const buttonText = sectionData?.buttonText;
  const buttonLink = sectionData?.buttonLink || '#testimonials';

  const titleFontClass = getCmsFontClass(sectionData?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(sectionData?.bodyFont, '');

  const pillars = [
    {
      icon: Flame,
      title: 'Signature Solos & Technique',
      desc: 'Master pentatonic phrasing, Dorian modal improvisation, and fluid sweep picking step by step.',
    },
    {
      icon: ShieldCheck,
      title: 'Personalized Progression',
      desc: 'Each student’s module access is curated carefully to build rock-solid fundamentals before advancing.',
    },
    {
      icon: Music,
      title: 'Embedded Audio & PDF Tabs',
      desc: 'Studio backing tracks and crisp downloadable PDF tab sheets built directly into every module.',
    },
    {
      icon: Award,
      title: 'Conservatory Craftsmanship',
      desc: 'Join a dedicated community of acoustic & electric guitarists performing on stage and in studios.',
    },
  ];

  return (
    <section id="instructor" className="py-16 sm:py-24 lg:py-28 relative scroll-mt-20">
      <div className="absolute top-1/2 left-0 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-amber-500/[0.05] rounded-full blur-[120px] sm:blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Magazine-Grade Portrait Left */}
          <div className="lg:col-span-5 relative max-w-sm sm:max-w-md mx-auto lg:max-w-none w-full">
            <div className="p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl luxury-glass gold-border-glow">
              <div className="aspect-[4/5] sm:aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden relative bg-zinc-950">
                <img
                  src={imageUrl}
                  alt={`${adminName} — Lead Mentor at Harmonic Guitar Academy`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/25 to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0c0c10]/85 backdrop-blur-xl border border-white/[0.1] space-y-1.5 sm:space-y-2">
                  <span className="inline-block px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider sm:tracking-widest">
                    Lead Mentor • Harmonic Guitar Academy
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-none">
                    {adminName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-mono">
                    Session Guitarist, Composer &amp; Conservatory Educator
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Credentials Right */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="eyebrow-pill mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <RichCmsText text={eyebrowLabel} />
              </span>
            </div>

            <h2 className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1] sm:leading-[1.06]`}>
              <RichCmsText text={title} />
            </h2>

            {leadSubtitle && (
              <p className="text-sm sm:text-base text-amber-200/90 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                <RichCmsText text={leadSubtitle} />
              </p>
            )}

            <p className={`${bodyFontClass} text-sm sm:text-lg text-zinc-300 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0`}>
              <RichCmsText text={content} />
            </p>

            {buttonText && buttonLink && (
              <div className="pt-1 flex justify-center lg:justify-start">
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl luxury-btn-primary font-bold text-xs tracking-wide"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>
            )}

            {/* Achievement Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-left">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-4 sm:p-5 rounded-2xl luxury-card space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2.5 text-amber-300 font-bold text-[13px] sm:text-sm">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                      <span className="text-white">{item.title}</span>
                    </div>
                    <p className="text-[11.5px] sm:text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="section-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
};
