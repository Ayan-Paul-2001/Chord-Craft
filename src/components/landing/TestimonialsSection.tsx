'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  Star,
  Quote,
  CheckCircle2,
  Sparkles,
  MessageSquarePlus,
} from 'lucide-react';
import { StudentReviewModal } from '@/components/shared/StudentReviewModal';
import { HomepageSection, StudentReview } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';

interface ReviewCardProps {
  review: StudentReview;
  isMarquee?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, isMarquee = false }) => {
  const { adminName } = useStore();
  const formattedComment = (review.comment || '')
    .replace(/Ershad Zaman/gi, adminName)
    .replace(/Ershad bhai/gi, `Mentor ${adminName}`)
    .replace(/Guitart Academy/gi, 'Harmonic Guitar Academy')
    .replace(/Guitart/gi, 'Chord & Craft');

  return (
    <div
      className={`${
        isMarquee ? 'w-[265px] sm:w-[360px] lg:w-[400px] shrink-0' : 'w-full'
      } p-4 sm:p-7 rounded-2xl sm:rounded-3xl luxury-card flex flex-col justify-between space-y-4 sm:space-y-6 group relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-24 sm:w-28 h-24 sm:h-28 bg-amber-500/[0.04] rounded-bl-full group-hover:bg-amber-500/[0.08] transition-colors pointer-events-none" />

      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 sm:gap-1 text-amber-400">
            {[...Array(review.rating || 5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]"
              />
            ))}
          </div>
          <Quote className="w-6 h-6 sm:w-7 sm:h-7 text-white/[0.08] group-hover:text-amber-400/25 transition-colors" />
        </div>

        <p className="font-display text-base sm:text-[1.22rem] text-zinc-200 italic leading-relaxed line-clamp-4">
          &ldquo;{formattedComment}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-3.5 pt-3 sm:pt-4 border-t border-white/[0.07]">
        <img
          src={
            review.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
          }
          alt={review.name}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-amber-400/40 group-hover:border-amber-300 transition shadow-md shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
            {review.name} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </h4>
          <p className="text-[10.5px] sm:text-[11px] text-amber-300/90 font-mono font-medium truncate">
            {review.level}
          </p>
        </div>
      </div>
    </div>
  );
};

export const TestimonialsSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { reviews, currentUser, adminName } = useStore();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const sectionTitle = data?.title?.trim() || 'Hear From Our Guitarists';
  const rawSubtitle = data?.subtitle?.trim() || '';
  const isLongSubtitle = rawSubtitle.length > 36;
  const sectionEyebrow = !rawSubtitle || isLongSubtitle ? 'Student Reviews' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const sectionBody =
    data?.content?.trim() ||
    `Over 500+ aspiring & performing guitarists have refined their technique, tone, and musicality with ${adminName} at Harmonic Guitar Academy.`;
  const titleFontClass = getCmsFontClass(data?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(data?.bodyFont, '');

  const displayReviews = reviews && reviews.length > 0 ? reviews : [];
  const isAnimated = displayReviews.length >= 4;
  const marqueeItems = isAnimated ? [...displayReviews, ...displayReviews] : [];

  return (
    <section id="testimonials" className="py-16 sm:py-24 lg:py-28 relative overflow-hidden scroll-mt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[820px] h-[260px] sm:h-[360px] bg-amber-500/[0.045] blur-[110px] sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-10 sm:mb-14 text-center md:text-left">
          <div className="space-y-4 max-w-2xl mx-auto md:mx-0">
            <div className="eyebrow-pill mx-auto md:mx-0">
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

          <div className="flex items-center justify-center md:justify-end">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl luxury-btn-primary font-bold sm:font-extrabold text-xs tracking-wide flex items-center gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{currentUser?.role === 'student' ? 'Share Your Review' : 'Give a Review'}</span>
            </button>
          </div>
        </div>
      </div>

      {isAnimated ? (
        <div className="relative w-full overflow-hidden pt-4 pb-8">
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 lg:w-36 bg-gradient-to-r from-[#0a0a0c] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 lg:w-36 bg-gradient-to-l from-[#0a0a0c] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4 sm:gap-6 animate-marquee">
            {marqueeItems.map((t: StudentReview, idx: number) => (
              <ReviewCard key={`${t.id}-${idx}`} review={t} isMarquee={true} />
            ))}
          </div>
        </div>
      ) : displayReviews.length > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
          <div
            className={`grid gap-5 sm:gap-6 ${
              displayReviews.length === 1
                ? 'grid-cols-1 max-w-lg mx-auto'
                : displayReviews.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {displayReviews.map((t: StudentReview) => (
              <ReviewCard key={t.id} review={t} isMarquee={false} />
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 text-center py-12">
          <div className="p-8 rounded-3xl luxury-glass space-y-4">
            <Quote className="w-8 h-8 text-amber-500/40 mx-auto" />
            <p className="text-sm text-zinc-300">
              Be the first to share your learning experience with {adminName} at Harmonic Guitar Academy!
            </p>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 rounded-xl luxury-btn-primary font-bold text-xs cursor-pointer"
            >
              Write a Review
            </button>
          </div>
        </div>
      )}

      <div className="section-hairline absolute bottom-0 left-0 right-0" />

      <StudentReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </section>
  );
};
