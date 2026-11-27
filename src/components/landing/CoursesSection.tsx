'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, getStudentEnrolledCourseIds } from '@/lib/utils';
import { HomepageSection } from '@/lib/types';
import { getCmsFontClass } from '@/lib/cmsFonts';
import { RichCmsText } from '@/components/shared/RichCmsText';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  Award,
} from 'lucide-react';

export const CoursesSection: React.FC<{ data?: HomepageSection }> = ({ data }) => {
  const { courses, lessons, currentUser, activeRole, courseEnrollments } = useStore();

  const sectionTitle = data?.title?.trim() || 'Conservatory Guitar Courses';
  const rawSubtitle = data?.subtitle?.trim() || '';
  const isLongSubtitle = rawSubtitle.length > 36;
  const sectionEyebrow = !rawSubtitle || isLongSubtitle ? 'Academy Courses' : rawSubtitle;
  const leadSubtitle = isLongSubtitle ? rawSubtitle : '';
  const sectionBody =
    data?.content?.trim() ||
    'Explore structured conservatory guitar tracks with HD video masterclasses, printable PDF TABs, studio backing tracks, and personalized mentorship.';
  const ctaText =
    data?.buttonText?.trim() && data.buttonText.trim() !== 'Enroll Now'
      ? data.buttonText.trim()
      : 'Browse All Courses';
  const ctaLink =
    data?.buttonLink?.trim() && data.buttonLink.trim() !== '/signup'
      ? data.buttonLink.trim()
      : '/courses';
  const titleFontClass = getCmsFontClass(data?.titleFont, 'font-display');
  const bodyFontClass = getCmsFontClass(data?.bodyFont, '');

  // Homepage strictly previews ONLY courses marked for Homepage Preview (isFeatured === true), max 3 cards (mirroring MerchSection)
  const previewCourses = useMemo(
    () =>
      [...courses]
        .filter((c) => c.isActive !== false && c.isFeatured === true)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .slice(0, 3),
    [courses]
  );

  const enrolledCourseIds = useMemo(
    () => (activeRole === 'student' && currentUser ? getStudentEnrolledCourseIds(currentUser) : []),
    [activeRole, currentUser]
  );

  const getPendingEnrollmentForCourse = (courseId: string) => {
    if (activeRole !== 'student' || !currentUser) return null;
    return (
      courseEnrollments.find(
        (e) =>
          e.courseId === courseId &&
          (e.paymentStatus === 'Pending' || e.enrollmentStatus === 'Pending Verification')
      ) || null
    );
  };

  return (
    <section id="courses" className="py-16 sm:py-24 lg:py-28 scroll-mt-20 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] sm:w-[640px] h-[240px] sm:h-[320px] bg-amber-500/[0.045] rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Row (mirrors MerchSection) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-5 sm:gap-6 text-center md:text-left">
          <div className="space-y-4 max-w-2xl mx-auto md:mx-0">
            <div className="eyebrow-pill mx-auto md:mx-0">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                <RichCmsText text={sectionEyebrow} />
              </span>
            </div>
            <h2
              className={`${titleFontClass} text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.1]`}
            >
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
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl luxury-btn-ghost text-amber-300 font-bold text-xs tracking-wide self-center md:self-auto shrink-0"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Curated Homepage Preview Grid (up to 3 featured courses) */}
        {previewCourses.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl luxury-glass text-center space-y-4">
            <p className="text-sm text-zinc-400">
              Explore our complete guitar curriculum in the dedicated Courses catalog.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl luxury-btn-primary text-xs font-bold"
            >
              <span>Browse All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div
            className={`grid gap-5 sm:gap-6 lg:gap-8 ${
              previewCourses.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : previewCourses.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {previewCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const pendingEnrollment = getPendingEnrollmentForCourse(course.id);
              const hasDiscount =
                typeof course.originalPrice === 'number' && course.originalPrice > course.price;
              const linkedCount = lessons.filter((l) => l.courseId === course.id).length;

              let enrollHref = `/signup?course=${encodeURIComponent(course.id)}`;
              let enrollLabel = 'Enroll';
              let variant: 'primary' | 'enrolled' | 'pending' | 'admin' = 'primary';

              if (activeRole === 'admin') {
                enrollHref = '/admin/courses';
                enrollLabel = 'Manage';
                variant = 'admin';
              } else if (isEnrolled && currentUser?.status === 'Active') {
                enrollHref = `/student/lessons?course=${encodeURIComponent(course.id)}`;
                enrollLabel = 'Lectures';
                variant = 'enrolled';
              } else if (pendingEnrollment) {
                enrollHref = `/payment-lobby?course=${encodeURIComponent(course.id)}`;
                enrollLabel = 'Pending';
                variant = 'pending';
              } else if (activeRole === 'student' && currentUser) {
                enrollHref = `/payment-lobby?course=${encodeURIComponent(course.id)}`;
                enrollLabel = 'Enroll';
                variant = 'primary';
              }

              return (
                <article
                  key={course.id}
                  className="group rounded-2xl sm:rounded-3xl luxury-card overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] relative overflow-hidden bg-zinc-950">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12]/80 via-[#0d0d12]/20 to-transparent" />

                      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={course.level} size="sm" />
                        {course.badge && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/95 text-zinc-950">
                            {course.badge}
                          </span>
                        )}
                      </div>

                      {isEnrolled && (
                        <div className="absolute top-3.5 right-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-md inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Enrolled</span>
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 text-[10.5px] font-mono text-zinc-200">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md border border-white/[0.08]">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{course.duration}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md border border-white/[0.08]">
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span>{course.totalModules || linkedCount} Modules</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-2 sm:space-y-2.5">
                      <p className="text-[10.5px] font-mono text-amber-300/85 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 shrink-0" />
                        <span className="truncate">{course.instructorName || 'Julian Mercer'}</span>
                      </p>
                      <h3 className="text-[15px] sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                        {course.description}
                      </p>
                      <div className="flex items-baseline gap-2 pt-1.5">
                        <span className="font-display text-xl sm:text-2xl font-bold text-amber-300 tabular-nums">
                          {formatCurrency(course.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-mono text-zinc-500 line-through tabular-nums">
                            {formatCurrency(course.originalPrice as number)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 pt-0 flex items-center gap-2.5 sm:gap-3">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex-1 py-2 sm:py-2.5 rounded-xl luxury-btn-ghost text-zinc-200 text-center font-semibold text-[11.5px] sm:text-xs whitespace-nowrap"
                    >
                      View Details
                    </Link>

                    <Link
                      href={enrollHref}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[11.5px] sm:text-xs transition inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                        variant === 'enrolled'
                          ? 'bg-emerald-500/18 hover:bg-emerald-500/28 text-emerald-200 border border-emerald-400/40'
                          : variant === 'pending'
                          ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/40'
                          : variant === 'admin'
                          ? 'luxury-btn-ghost text-amber-300'
                          : 'luxury-btn-primary'
                      }`}
                    >
                      {variant === 'enrolled' ? (
                        <PlayCircle className="w-3.5 h-3.5" />
                      ) : (
                        <GraduationCap className="w-3.5 h-3.5" />
                      )}
                      <span>{enrollLabel}</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="section-hairline absolute bottom-0 left-0 right-0" />
    </section>
  );
};
