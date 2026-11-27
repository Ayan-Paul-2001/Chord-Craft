'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, getStudentEnrolledCourseIds } from '@/lib/utils';
import { CourseLevel } from '@/lib/types';
import {
  GraduationCap,
  Search,
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Award,
} from 'lucide-react';

const LEVEL_TABS: ('All' | CourseLevel)[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
  'All Levels',
];

export default function PublicCoursesCatalogPage() {
  const { courses, lessons, currentUser, activeRole, courseEnrollments } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | CourseLevel>('All');

  const activeCourses = useMemo(
    () =>
      [...courses]
        .filter((c) => c.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeCourses.filter((course) => {
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        (course.subtitle || '').toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q);
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [activeCourses, searchQuery, selectedLevel]);

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
    <div className="min-h-[85vh] py-7 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-7 sm:space-y-10 animate-fade-in">
      {/* Header Banner (mirrors /merchandise) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 border-b border-zinc-800/80 pb-6 sm:pb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Official Conservatory Programs</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
            Chord &amp; Craft <span className="italic text-amber-400">Courses</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Structured guitar tracks tailored to every stage — complete with HD video masterclasses, printable PDF TABs, studio backing tracks, and shared Common preview classes.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition self-start md:self-auto px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Search & Level Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guitar courses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          <span className="text-zinc-400 font-mono text-[11px] shrink-0 mr-1">Level:</span>
          {LEVEL_TABS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl border font-semibold transition shrink-0 cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-md shadow-amber-950/40'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-8 sm:p-16 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Courses Found</h3>
          <p className="text-xs text-zinc-400">
            No courses matched your current search or level filter. Try clearing filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedLevel('All');
            }}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-xs font-bold transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const pendingEnrollment = getPendingEnrollmentForCourse(course.id);
            const hasDiscount =
              typeof course.originalPrice === 'number' && course.originalPrice > course.price;
            const discountPct = hasDiscount
              ? Math.round(
                  (((course.originalPrice as number) - course.price) /
                    (course.originalPrice as number)) *
                    100
                )
              : 0;
            const linkedCount = lessons.filter((l) => l.courseId === course.id).length;

            let enrollHref = `/signup?course=${encodeURIComponent(course.id)}`;
            let enrollLabel = 'Enroll Now';
            let variant: 'primary' | 'enrolled' | 'pending' | 'admin' = 'primary';

            if (activeRole === 'admin') {
              enrollHref = '/admin/courses';
              enrollLabel = 'Manage';
              variant = 'admin';
            } else if (isEnrolled && currentUser?.status === 'Active') {
              enrollHref = `/student/lessons?course=${encodeURIComponent(course.id)}`;
              enrollLabel = 'Open Lectures';
              variant = 'enrolled';
            } else if (pendingEnrollment) {
              enrollHref = `/payment-lobby?course=${encodeURIComponent(course.id)}`;
              enrollLabel = 'Pending';
              variant = 'pending';
            } else if (activeRole === 'student' && currentUser) {
              enrollHref = `/payment-lobby?course=${encodeURIComponent(course.id)}`;
              enrollLabel = 'Enroll Now';
              variant = 'primary';
            }

            return (
              <div
                key={course.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-amber-500/40 transition flex flex-col justify-between group shadow-2xl"
              >
                <div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-950">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent" />

                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 flex-wrap">
                      <StatusBadge status={course.level} size="sm" />
                      {course.badge && (
                        <span className="bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
                          {course.badge}
                        </span>
                      )}
                    </div>

                    {isEnrolled && (
                      <div className="absolute top-3.5 right-3.5 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enrolled</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[10.5px] font-mono text-zinc-200">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950/80 border border-zinc-800">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{course.duration}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950/80 border border-zinc-800">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>{course.totalModules || linkedCount} Modules</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <p className="text-[10.5px] font-mono text-amber-300/90 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3 h-3 shrink-0" />
                      <span className="truncate">Mentor: {course.instructorName || 'Julian Mercer'}</span>
                    </p>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition leading-snug">
                      {course.title}
                    </h3>
                    {course.subtitle && (
                      <p className="text-xs text-amber-200/80 font-medium line-clamp-1">
                        {course.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                      {course.description}
                    </p>

                    <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                        {formatCurrency(course.price)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="text-xs font-mono text-zinc-500 line-through tabular-nums">
                            {formatCurrency(course.originalPrice as number)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex items-center gap-2.5 sm:gap-3">
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex-1 py-3 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-center font-bold text-xs transition whitespace-nowrap"
                  >
                    View Details
                  </Link>

                  <Link
                    href={enrollHref}
                    className={`px-3.5 sm:px-4 py-3 rounded-xl font-bold text-xs transition inline-flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap ${
                      variant === 'enrolled'
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                        : variant === 'pending'
                        ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/40'
                        : variant === 'admin'
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700'
                        : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/40'
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
