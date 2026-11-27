'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatYouTubeEmbedUrl } from '@/lib/utils';
import { HomepageSection, Lesson } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';
import {
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  Video,
  FileText,
  Headphones,
  X,
  ArrowRight,
} from 'lucide-react';

export const FeaturedLessonsSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { lessons } = useStore();
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const sectionTitle = data?.title?.trim() || 'Featured Academy Lessons';
  const rawSubtitle = data?.subtitle?.trim() || '';
  const isLongSubtitle = rawSubtitle.length > 36;
  const sectionEyebrow = !rawSubtitle || isLongSubtitle ? 'Demo Masterclasses' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const sectionBody =
    data?.content?.trim() ||
    'Explore publicly unlocked Chord & Craft modules. Watch embedded HD YouTube video breakdowns instantly, jam with studio backing tracks, and download printable PDF TAB sheets.';
  const ctaText = data?.buttonText?.trim() || 'Unlock Full 8-Module Library';
  const ctaLink = data?.buttonLink?.trim() || '/signup';
  const titleFontClass = getCmsFontClass(data?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(data?.bodyFont, '');

  const publicLessons = lessons.filter((l) => l.isPublic);
  const featured = publicLessons.length > 0 ? publicLessons : lessons.slice(0, 3);

  return (
    <section id="lessons" className="py-16 sm:py-24 lg:py-28 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-10 sm:mb-14 text-center lg:text-left">
          <div className="space-y-4 max-w-2xl mx-auto lg:mx-0">
            <div className="eyebrow-pill mx-auto lg:mx-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <RichCmsText text={sectionEyebrow} />
              </span>
            </div>
            <h2 className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1]`}>
              <RichCmsText text={sectionTitle} />
            </h2>
            {leadSubtitle && (
              <p className="text-sm sm:text-base text-amber-200/85 font-medium leading-relaxed">
                <RichCmsText text={leadSubtitle} />
              </p>
            )}
            <p className={`${bodyFontClass} text-zinc-400 text-sm sm:text-base leading-relaxed`}>
              <RichCmsText text={sectionBody} />
            </p>
          </div>

          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl luxury-btn-ghost text-amber-300 font-bold text-xs tracking-wide self-center lg:self-auto"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl luxury-glass text-center space-y-3">
            <p className="text-sm text-zinc-400">No public lessons are currently published on the homepage.</p>
          </div>
        ) : (
          <div
            className={`grid gap-5 sm:gap-7 lg:gap-8 ${
              featured.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : featured.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {featured.map((lesson) => (
              <div
                key={lesson.id}
                className="group rounded-2xl sm:rounded-3xl luxury-card overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Container with Instant YouTube Quick-Play */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a0e] via-[#0b0a0e]/25 to-transparent" />

                    <div className="absolute top-3.5 left-3.5">
                      <StatusBadge status={lesson.level} />
                    </div>

                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 backdrop-blur-md font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Free Preview</span>
                      </span>
                    </div>

                    {/* Instant Quick-Play Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewLesson(lesson)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      aria-label={`Quick play ${lesson.title}`}
                    >
                      <span className="w-14 h-14 rounded-full flex items-center justify-center luxury-btn-primary group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3.5">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 font-mono">
                      <span>Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {lesson.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>

                    {/* Included Materials Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {lesson.videoUrl && (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9.5px] sm:text-[10px] font-mono text-zinc-300">
                          <Video className="w-3 h-3 text-amber-400" /> YouTube HD
                        </span>
                      )}
                      {lesson.tabFileUrl && (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9.5px] sm:text-[10px] font-mono text-zinc-300">
                          <FileText className="w-3 h-3 text-amber-400" /> PDF TAB
                        </span>
                      )}
                      {lesson.audioUrl && (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9.5px] sm:text-[10px] font-mono text-zinc-300">
                          <Headphones className="w-3 h-3 text-amber-400" /> Backing Audio
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 pt-0 flex items-center gap-2.5">
                  <Link
                    href={`/lessons/${lesson.id}`}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-[11.5px] sm:text-xs transition flex items-center justify-center gap-2 luxury-btn-primary"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open Lesson Studio</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-hairline absolute bottom-0 left-0 right-0" />

      {/* Quick-Play YouTube Theater Modal */}
      {previewLesson && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewLesson(null)}
        >
          <div
            className="relative w-full max-w-4xl luxury-glass rounded-3xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/[0.08] bg-[#0b0a0e]/90 gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
                  Lesson #{previewLesson.lessonNumber.toString().padStart(2, '0')} • {previewLesson.level}
                </span>
                <h3 className="text-sm font-bold text-white truncate">{previewLesson.title}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/lessons/${previewLesson.id}`}
                  className="px-3 sm:px-3.5 py-2 rounded-xl luxury-btn-primary text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>TABs &amp; Audio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewLesson(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
                  aria-label="Close lesson preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`${formatYouTubeEmbedUrl(previewLesson.videoUrl)}?autoplay=1&rel=0&modestbranding=1`}
                title={previewLesson.title}
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
