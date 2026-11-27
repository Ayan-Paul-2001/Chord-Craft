import React from 'react';
import { Pickaxe, Music2, Flame, Trophy, Sparkles } from 'lucide-react';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

export const ProcessSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const title = data?.title?.trim() || 'The 4-Stage Path to Guitar Virtuosity';
  const rawSubtitle = data?.subtitle?.trim() || '';
  const isLongSubtitle = rawSubtitle.length > 36;
  const eyebrow = !rawSubtitle || isLongSubtitle ? 'Curriculum Roadmap' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const description =
    data?.content?.trim() ||
    'Every Harmonic Guitar Academy module builds systematically upon the last. Clear conservatory benchmarks keep your practice focused and rewarding.';
  const titleFontClass = getCmsFontClass(data?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(data?.bodyFont, '');
  const steps = [
    {
      number: '01',
      title: 'Foundational Mechanics',
      description:
        'Master ergonomic posture, wrist relaxation, strict alternate picking, and resonant acoustic fingerpicking.',
      icon: Pickaxe,
      level: 'Beginner',
    },
    {
      number: '02',
      title: 'CAGED & Pentatonic Phrasing',
      description:
        'Unlock fretboard visualization, minor pentatonic scale shapes, pitch-accurate bending, and expressive vibrato.',
      icon: Music2,
      level: 'Intermediate',
    },
    {
      number: '03',
      title: 'Legato & Expressive Lead',
      description:
        'Develop fluid hammer-ons, pull-offs, pro triad embellishments, and Dorian/Mixolydian modal soloing.',
      icon: Flame,
      level: 'Intermediate – Advanced',
    },
    {
      number: '04',
      title: 'Virtuosity & Composition',
      description:
        'Master 5-string sweep arpeggios, studio tone crafting, dynamic phrasing, and stage-ready performance.',
      icon: Trophy,
      level: 'Advanced',
    },
  ];

  return (
    <section id="curriculum" className="py-16 sm:py-24 lg:py-28 scroll-mt-20 relative">
      <div id="process" className="absolute -top-24 left-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <div className="eyebrow-pill mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <RichCmsText text={eyebrow} />
            </span>
          </div>
          <h2 className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1]`}>
            <RichCmsText text={title} />
          </h2>
          {leadSubtitle && (
            <p className="text-sm sm:text-base text-amber-200/85 font-medium leading-relaxed max-w-2xl mx-auto">
              <RichCmsText text={leadSubtitle} />
            </p>
          )}
          <p className={`${bodyFontClass} text-zinc-400 text-sm sm:text-base leading-relaxed`}>
            <RichCmsText text={description} />
          </p>
        </div>

        <div className="relative">
          {/* Subtle desktop luminous connector line */}
          <div
            className="hidden lg:block absolute top-11 left-12 right-12 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl luxury-card group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-7">
                      <span className="font-display text-3xl sm:text-4xl italic font-semibold text-amber-400/50 group-hover:text-amber-300 transition-colors tabular-nums">
                        {step.number}
                      </span>
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2.5 group-hover:text-amber-300 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-light mb-4 sm:mb-7">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-white/[0.07]">
                    <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9.5px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/25">
                      {step.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
};
