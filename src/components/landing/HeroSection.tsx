'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  Play,
  Sparkles,
  ArrowRight,
  Music,
  Award,
  Users,
  BookOpen,
  X,
  FileText,
  Headphones,
  Video,
} from 'lucide-react';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass, hasRichCmsMarkers } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const HeroSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const sectionData = data || cmsSections.find((s) => s.id === 'sec-hero');
  const sanitize = (str: string) =>
    str
      .replace(/Ershad Zaman/gi, adminName)
      .replace(/Guitart Academy/gi, 'Harmonic Guitar Academy')
      .replace(/Guitart/gi, 'Chord & Craft');

  const title = sanitize(
    sectionData?.title || `Master the Art of Guitar with ${adminName}`
  );
  const subtitle = sanitize(
    sectionData?.subtitle ||
      'Structured YouTube HD masterclasses, downloadable PDF tab sheets, studio backing tracks, and personalized mentorship at Harmonic Guitar Academy.'
  );
  const heroContent = sanitize(
    sectionData?.content ||
      `Acoustic & Electric Artistry with ${adminName}`
  );
  const heroImage =
    sectionData?.imageUrl && sectionData.imageUrl.trim().length > 0
      ? sectionData.imageUrl
      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80';
  const buttonText = sectionData?.buttonText || 'Explore Curriculum';
  let buttonLink = sectionData?.buttonLink || '#curriculum';

  if (
    buttonText.toLowerCase().includes('curriculum') &&
    (buttonLink === '/student/lessons' ||
      !buttonLink ||
      buttonLink === '#curriculum' ||
      buttonLink === '#process' ||
      buttonLink === '/#curriculum' ||
      buttonLink === '/#process')
  ) {
    buttonLink = '#curriculum';
  }

  const stats = [
    { icon: Users, label: 'Community', value: '500+', sub: 'Active Guitarists' },
    { icon: BookOpen, label: 'Curriculum', value: '8+ HD', sub: 'Structured Modules' },
    { icon: Music, label: 'Study Pack', value: '100%', sub: 'PDF TABs & Audio' },
    { icon: Award, label: 'Conservatory', value: '20+ Yrs', sub: `Led by ${adminName}` },
  ];

  const titleFontClass = getCmsFontClass(sectionData?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(sectionData?.bodyFont, '');
  const titleHasFormatting = hasRichCmsMarkers(title);

  return (
    <section className="relative min-h-0 lg:min-h-[88vh] flex flex-col justify-center overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      {/* Subtle architectural guitar string texture + warm radial spotlight */}
      <div className="absolute inset-0 acoustic-strings-bg opacity-60 pointer-events-none" />
      <div className="absolute -top-24 left-1/4 w-[320px] sm:w-[580px] h-[280px] sm:h-[420px] bg-amber-500/[0.08] rounded-full blur-[120px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[280px] sm:w-[460px] h-[220px] sm:h-[340px] bg-amber-600/[0.06] rounded-full blur-[110px] sm:blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10 sm:space-y-14 lg:space-y-16 z-10">
        {/* Main Editorial Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-10 items-center">
          {/* Left Editorial Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="eyebrow-pill mx-auto lg:mx-0 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Harmonic Guitar Academy • Cohort Open</span>
            </div>

            <h1 className={`${titleFontClass} text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white tracking-tight leading-[1.08] sm:leading-[1.03]`}>
              {!titleHasFormatting && title.includes(adminName) ? (
                <>
                  {title.split(adminName)[0]}
                  <span className="italic bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                    {adminName}
                  </span>
                  {title.split(adminName)[1]}
                </>
              ) : (
                <RichCmsText text={title} />
              )}
            </h1>

            <p className={`${bodyFontClass} text-sm sm:text-lg text-zinc-300/90 max-w-xl sm:max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed`}>
              <RichCmsText text={subtitle} />
            </p>

            {/* Primary & Secondary CTAs — Compact & Balanced on Mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-3.5 pt-2">
              <Link
                href={buttonLink}
                className="w-full max-w-[240px] sm:max-w-none sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 lg:py-4 rounded-xl luxury-btn-primary font-bold sm:font-extrabold text-xs sm:text-sm tracking-wide inline-flex items-center justify-center gap-2 group"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="w-full max-w-[240px] sm:max-w-none sm:w-auto px-4 sm:px-7 py-3 sm:py-3.5 lg:py-4 rounded-xl luxury-btn-ghost text-zinc-100 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer"
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                </span>
                <span>Watch Academy Showcase</span>
              </button>
            </div>

            {/* Study Material Capabilities Micro-Strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 pt-2 text-[11px] sm:text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Embedded YouTube HD
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Printable PDF TABs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Playable Studio Backing Tracks
              </span>
            </div>
          </div>

          {/* Right Studio Showcase Frame (5 cols) */}
          <div className="lg:col-span-5 relative max-w-xl mx-auto lg:max-w-none w-full">
            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 luxury-glass gold-border-glow group">
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="relative block w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-950 text-left cursor-pointer"
                aria-label="Play Harmonic Guitar Academy Showcase Video"
              >
                <img
                  src={heroImage}
                  alt="Chord & Craft Studio Masterclass Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/35 to-transparent" />

                {/* Floating top badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-2">
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#0b0a0e]/80 backdrop-blur-md border border-white/[0.12] text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider sm:tracking-widest text-amber-300">
                    Studio Showcase • HD
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#0b0a0e]/80 backdrop-blur-md border border-white/[0.12] text-[9.5px] sm:text-[10px] font-mono text-zinc-200 tabular-nums">
                    09:09
                  </span>
                </div>

                {/* Central Play Medallion */}
                <div className="absolute inset-0 flex items-center justify-center pb-10 sm:pb-12">
                  <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-full luxury-btn-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Caption Plate */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 p-2.5 sm:p-4 rounded-xl bg-[#0b0a0e]/82 backdrop-blur-xl border border-white/[0.1]">
                  <p className="text-[8.5px] sm:text-[10px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-amber-300">
                    Chord &amp; Craft Conservatory
                  </p>
                  <p className={`${getCmsFontClass(sectionData?.bodyFont, 'font-display')} text-sm sm:text-xl font-semibold text-white mt-0.5 leading-snug line-clamp-2`}>
                    <RichCmsText text={heroContent} />
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Smoked-Glass Conservatory Metrics Bar */}
        <div className="rounded-2xl sm:rounded-3xl luxury-glass p-4 sm:p-7 lg:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-0 lg:divide-x lg:divide-white/[0.08]">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="lg:px-6 first:lg:pl-2 last:lg:pr-2 space-y-0.5 sm:space-y-1.5">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-amber-300/90">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] truncate">
                      {stat.label}
                    </span>
                  </div>
                  <p className="font-display text-xl sm:text-3xl lg:text-4xl font-semibold text-white tabular-nums leading-none pt-0.5 sm:pt-1">
                    {stat.value}
                  </p>
                  <p className="text-[10.5px] sm:text-xs text-zinc-400">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom champagne hairline divider */}
      <div className="section-hairline absolute bottom-0 left-0 right-0" />

      {/* Academy Showcase Video Modal */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl luxury-glass rounded-3xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0b0a0e]/90">
              <h3 className="text-xs sm:text-sm font-bold text-white font-mono flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Chord &amp; Craft — Harmonic Guitar Academy Showcase</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                aria-label="Close video modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/_uNSC6pc910?autoplay=1&rel=0"
                title="Chord & Craft — Harmonic Guitar Academy Showcase"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
