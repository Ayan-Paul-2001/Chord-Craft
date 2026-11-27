'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Target, Headphones, Sparkles } from 'lucide-react';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const AboutSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { adminName, cmsSections } = useStore();
  const sectionData = data || cmsSections.find((s) => s.id === 'sec-about');

  const sanitize = (str: string) =>
    str
      .replace(/Ershad Zaman/gi, adminName)
      .replace(/Guitart Academy/gi, 'Harmonic Guitar Academy')
      .replace(/Guitart/gi, 'Chord & Craft');

  const imageUrl =
    sectionData?.imageUrl && sectionData.imageUrl.trim().length > 0
      ? sectionData.imageUrl
      : 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80';

  const title = sanitize(sectionData?.title || 'The Chord & Craft Philosophy');
  const rawSubtitle = sanitize(sectionData?.subtitle || '').trim();
  const isLongSubtitle = rawSubtitle.length > 36;
  const eyebrowLabel = !rawSubtitle || isLongSubtitle ? 'Academy Philosophy' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const content = sanitize(
    sectionData?.content ||
      `Chord & Craft was created at Harmonic Guitar Academy by ${adminName} to solve the fundamental flaw in online guitar instruction — disconnected videos without structural clarity or technique refinement.`
  );

  const titleFontClass = getCmsFontClass(sectionData?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(sectionData?.bodyFont, '');

  return (
    <section id="about" className="py-16 sm:py-24 lg:py-28 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Editorial Left Content */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
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
              <p className="text-sm sm:text-base text-amber-200/90 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                <RichCmsText text={leadSubtitle} />
              </p>
            )}

            <p className={`${bodyFontClass} text-sm sm:text-lg text-zinc-200/90 font-light leading-relaxed max-w-xl mx-auto lg:mx-0`}>
              <RichCmsText text={content} />
            </p>

            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Whether you are dialing in your first acoustic fingerpicking patterns or sweeping through complex 5-string neoclassical arpeggios, Chord &amp; Craft provides an exact step-by-step framework to build musical fluency, wrist mechanics, and fingerboard freedom.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-left">
              <div className="p-4 sm:p-5 rounded-2xl luxury-card flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-300 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-sm font-bold text-white">Targeted Precision</h4>
                  <p className="text-[11.5px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                    Isolate weak fingers and eliminate tension in picking wrists.
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl luxury-card flex items-start gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-300 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-sm font-bold text-white">Studio Backing Tracks</h4>
                  <p className="text-[11.5px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                    Practice along with loopable backing tracks and downloadable PDF tabs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Right */}
          <div className="lg:col-span-6 relative">
            <div className="p-2 sm:p-3 rounded-2xl sm:rounded-3xl luxury-glass">
              <div className="aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden relative group bg-zinc-950">
                <img
                  src={imageUrl}
                  alt="Chord & Craft Guitar Fretboard Technique"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/35 to-transparent" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-5 sm:left-5 sm:right-5 p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-[#0c0c10]/85 border border-white/[0.1] backdrop-blur-xl">
                  <p className="text-[9px] sm:text-[10px] font-mono text-amber-300 font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] mb-1 sm:mb-1.5">
                    Interactive Tab &amp; Video Studio
                  </p>
                  <p className="font-display text-sm sm:text-xl lg:text-2xl font-semibold text-white leading-snug">
                    Download studio PDF tabs and practice with loopable audio directly inside your portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
};
