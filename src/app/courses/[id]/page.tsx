'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, getStudentEnrolledCourseIds } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Award,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function PublicCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { courses, lessons, currentUser, activeRole, courseEnrollments } = useStore();
  const course = courses.find((c) => c.id === courseId);

  const enrolledCourseIds = useMemo(
    () => (activeRole === 'student' && currentUser ? getStudentEnrolledCourseIds(currentUser) : []),
    [activeRole, currentUser]
  );

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-mono">Course Not Found</h2>
        <p className="text-xs text-zinc-400">
          The course you are looking for does not exist or is no longer available.
        </p>
        <Link
          href="/courses"
          className="inline-block px-5 py-2.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
        >
          Return to Courses Catalog
        </Link>
      </div>
    );
  }

  const isEnrolled = enrolledCourseIds.includes(course.id);
  const pendingEnrollment =
    activeRole === 'student' && currentUser
      ? courseEnrollments.find(
          (e) =>
            e.courseId === course.id &&
            (e.paymentStatus === 'Pending' || e.enrollmentStatus === 'Pending Verification')
        ) || null
      : null;

  const hasDiscount =
    typeof course.originalPrice === 'number' && course.originalPrice > course.price;
  const discountPct = hasDiscount
    ? Math.round(
        (((course.originalPrice as number) - course.price) / (course.originalPrice as number)) * 100
      )
    : 0;

  const courseLessons = lessons
    .filter((l) => l.courseId === course.id)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);
  const commonLessonCount = lessons.filter((l) => !l.courseId || l.courseId === 'common').length;

  let enrollHref = `/signup?course=${encodeURIComponent(course.id)}`;
  let enrollLabel = `Enroll in Course (${formatCurrency(course.price)})`;
  let variant: 'primary' | 'enrolled' | 'pending' | 'admin' = 'primary';

  if (activeRole === 'admin') {
    enrollHref = '/admin/courses';
    enrollLabel = 'Customize Course in Admin Studio';
    variant = 'admin';
  } else if (isEnrolled && currentUser?.status === 'Active') {
    enrollHref = `/student/lessons?course=${encodeURIComponent(course.id)}`;
    enrollLabel = 'Open Course Lectures in Student Portal';
    variant = 'enrolled';
  } else if (pendingEnrollment) {
    enrollHref = `/payment-lobby?course=${encodeURIComponent(course.id)}`;
    enrollLabel = 'Payment Verification Pending • Open Lobby';
    variant = 'pending';
  } else if (activeRole === 'student' && currentUser) {
    enrollHref = `/payment-lobby?course=${encodeURIComponent(course.id)}`;
    enrollLabel = `Proceed to bKash Payment (${formatCurrency(course.price)})`;
    variant = 'primary';
  }

  const otherCourses = courses
    .filter((c) => c.id !== course.id && c.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 3);

  return (
    <div className="min-h-[85vh] py-7 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-12 animate-fade-in">
      {/* Breadcrumb / Back */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses Catalog
        </Link>

        <span className="text-xs font-mono text-zinc-500">
          Level: <strong className="text-amber-400">{course.level}</strong>
        </span>
      </div>

      {/* Main 2-Col Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Cover & Syllabus Preview */}
        <div className="space-y-5 w-full">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
              <StatusBadge status={course.level} />
              {course.badge && (
                <span className="bg-amber-400 text-zinc-950 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase shadow-md">
                  {course.badge}
                </span>
              )}
            </div>
          </div>

          {/* Course Modules Preview */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Course Curriculum Preview</span>
              </h3>
              <span className="text-[11px] font-mono text-zinc-400">
                {course.totalModules || courseLessons.length} Modules
              </span>
            </div>

            {courseLessons.length > 0 ? (
              <div className="space-y-2">
                {courseLessons.map((lsn) => (
                  <div
                    key={lsn.id}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800/90 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-amber-400 font-bold shrink-0">
                        #{lsn.lessonNumber.toString().padStart(2, '0')}
                      </span>
                      <span className="text-zinc-200 font-medium truncate">{lsn.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                      {lsn.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                Structured HD modules, PDF TAB workbooks, and backing tracks are unlocked inside your Student Dashboard upon enrollment verification.
              </p>
            )}

            <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-emerald-300">
              <Layers className="w-4 h-4 shrink-0" />
              <span>
                Includes access to {commonLessonCount > 0 ? `${commonLessonCount} ` : ''}Common Academy preview classes shared across all students.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Course Details & Enrollment Action */}
        <div className="space-y-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                Chord &amp; Craft Conservatory
              </span>
              {isEnrolled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enrolled</span>
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-sm sm:text-base text-amber-200/85 font-medium">
                {course.subtitle}
              </p>
            )}

            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tabular-nums">
                {formatCurrency(course.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base font-mono text-zinc-500 line-through tabular-nums">
                    {formatCurrency(course.originalPrice as number)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    Save {discountPct}%
                  </span>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-light">{course.description}</p>

          {/* Meta Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] font-mono uppercase text-zinc-500">Duration</p>
              <p className="text-xs font-bold text-white mt-0.5">{course.duration}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
              <BookOpen className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] font-mono uppercase text-zinc-500">Modules</p>
              <p className="text-xs font-bold text-white mt-0.5">
                {course.totalModules || courseLessons.length} Lessons
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] font-mono uppercase text-zinc-500">Mentor</p>
              <p className="text-xs font-bold text-white mt-0.5 truncate">
                {course.instructorName || 'Julian Mercer'}
              </p>
            </div>
          </div>

          {/* Highlights */}
          {Array.isArray(course.highlights) && course.highlights.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                What You Will Master
              </h2>
              <ul className="space-y-2.5">
                {course.highlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary CTA */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <Link
              href={enrollHref}
              className={`w-full py-4 px-5 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-xl ${
                variant === 'enrolled'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  : variant === 'pending'
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40'
                  : variant === 'admin'
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/60'
              }`}
            >
              {variant === 'enrolled' ? (
                <PlayCircle className="w-4 h-4" />
              ) : (
                <GraduationCap className="w-4 h-4" />
              )}
              <span>{enrollLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Secure bKash verification — once approved by our academy admin, all course lectures unlock inside your Student Dashboard.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Academy Courses */}
      {otherCourses.length > 0 && (
        <div className="pt-12 border-t border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-white font-mono">Explore Other Courses</h3>
            <Link
              href="/courses"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {otherCourses.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition group space-y-3"
              >
                <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {c.level} • {c.duration}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition truncate">
                    {c.title}
                  </h4>
                  <p className="text-xs font-mono text-amber-400 font-bold">
                    {formatCurrency(c.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
