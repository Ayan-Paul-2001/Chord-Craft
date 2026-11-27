'use client';

import React, { useState, useMemo, useSyncExternalStore, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Search,
  BookOpen,
  Play,
  Clock,
  Headphones,
  FileText,
  Phone,
  GraduationCap,
  Layers,
  Plus,
} from 'lucide-react';
import {
  isValidMobile,
  isLessonUnlockedForStudent,
  findLessonProgressForStudent,
  getStudentEnrolledCourseIds,
} from '@/lib/utils';

const emptySubscribe = () => () => {};

function StudentLessonsContent() {
  const { lessons, courses, users, currentUser, lessonAccess, lessonProgress } = useStore();
  const searchParams = useSearchParams();
  const filterType = searchParams.get('type');
  const queryCourse = searchParams.get('course') || '';
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const hasValidMobile = mounted ? isValidMobile(currentUser?.mobile || '') : true;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [pickedCourseTab, setPickedCourseTab] = useState<string>('');

  const enrolledCourseIds = useMemo(
    () => getStudentEnrolledCourseIds(currentUser, users),
    [currentUser, users]
  );

  // Unlocked lessons strictly available to this student
  const unlockedLessons = useMemo(
    () =>
      lessons.filter((lesson) =>
        isLessonUnlockedForStudent(lesson, currentUser, users, lessonAccess)
      ),
    [lessons, currentUser, users, lessonAccess]
  );

  // Strictly show enrolled courses + any course containing explicitly Admin-permitted lectures
  const studentCourseTabs = useMemo(() => {
    const enrolledSet = new Set<string>(enrolledCourseIds);
    const permittedCourseIds = new Set<string>();

    unlockedLessons.forEach((l) => {
      if (l.courseId && l.courseId !== 'common' && !enrolledSet.has(l.courseId)) {
        permittedCourseIds.add(l.courseId);
      }
    });

    const visibleIds = new Set<string>([...enrolledSet, ...permittedCourseIds]);

    return courses
      .filter((c) => visibleIds.has(c.id))
      .sort((a, b) => {
        const aEnrolled = enrolledSet.has(a.id) ? 0 : 1;
        const bEnrolled = enrolledSet.has(b.id) ? 0 : 1;
        if (aEnrolled !== bEnrolled) return aEnrolled - bEnrolled;
        return (a.order || 0) - (b.order || 0);
      });
  }, [courses, enrolledCourseIds, unlockedLessons]);

  const activeCourseTab = useMemo(() => {
    if (pickedCourseTab) {
      if (
        pickedCourseTab === 'all' ||
        pickedCourseTab === 'common' ||
        studentCourseTabs.some((c) => c.id === pickedCourseTab)
      ) {
        return pickedCourseTab;
      }
    }
    if (queryCourse === 'common') return 'common';
    if (queryCourse && studentCourseTabs.some((c) => c.id === queryCourse)) {
      return queryCourse;
    }
    return 'all';
  }, [pickedCourseTab, queryCourse, studentCourseTabs]);

  const commonCount = useMemo(
    () => unlockedLessons.filter((l) => !l.courseId || l.courseId === 'common').length,
    [unlockedLessons]
  );

  const filteredLessons = useMemo(() => {
    return unlockedLessons.filter((lesson) => {
      const lessonCourseKey = lesson.courseId || 'common';
      const matchesCourse =
        activeCourseTab === 'all'
          ? true
          : activeCourseTab === 'common'
          ? lessonCourseKey === 'common'
          : lessonCourseKey === activeCourseTab;

      if (!matchesCourse) return false;

      const matchesSearch =
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || lesson.level === selectedLevel;

      if (filterType === 'video') {
        return matchesSearch && matchesLevel && Boolean(lesson.videoUrl);
      }
      if (filterType === 'audio') {
        return matchesSearch && matchesLevel && Boolean(lesson.audioUrl);
      }
      if (filterType === 'tabs') {
        return matchesSearch && matchesLevel && Boolean(lesson.tabFileUrl);
      }

      return matchesSearch && matchesLevel;
    });
  }, [unlockedLessons, activeCourseTab, searchQuery, selectedLevel, filterType]);

  const activeCourseObj =
    activeCourseTab !== 'all' && activeCourseTab !== 'common'
      ? courses.find((c) => c.id === activeCourseTab) || null
      : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-5 sm:space-y-6">
      {/* Missing Mobile Number Warning Banner */}
      {!hasValidMobile && currentUser?.role === 'student' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                <span>11-Digit Mobile Contact Number Required</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-mono text-[10px] font-black uppercase">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                You must update your 11-digit mobile number in your profile before you can visit and practice lessons.
              </p>
            </div>
          </div>

          <Link
            href="/student/profile"
            className="w-full sm:w-auto text-center px-4 py-2.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shrink-0 whitespace-nowrap shadow-md"
          >
            Update Mobile in Profile →
          </Link>
        </div>
      )}

      {/* Course-Separated Tabs Bar + Common Preview Option */}
      <div className="p-3.5 sm:p-4 rounded-2xl luxury-glass space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-zinc-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Course Track or Common Classes</span>
          </span>
          <Link
            href="/payment-lobby"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enroll in Another Course</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setPickedCourseTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCourseTab === 'all'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                : 'bg-[#09090c] text-zinc-400 border-white/[0.08] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>All My Classes ({unlockedLessons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPickedCourseTab('common')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCourseTab === 'common'
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50'
                : 'bg-[#09090c] text-zinc-400 border-white/[0.08] hover:text-emerald-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Common Preview Classes ({commonCount})</span>
          </button>

          {studentCourseTabs.map((course) => {
            const count = unlockedLessons.filter((l) => l.courseId === course.id).length;
            const active = activeCourseTab === course.id;
            const isEnrolledTab = enrolledCourseIds.includes(course.id);
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setPickedCourseTab(course.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
                    : 'bg-[#09090c] text-zinc-400 border-white/[0.08] hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {course.title} ({count})
                </span>
                {!isEnrolledTab && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono uppercase">
                    Permitted
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Course / Common Context Banner */}
        {activeCourseTab === 'common' && (
          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/25 text-xs text-emerald-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Common Academy Classes:</strong> Open preview lectures shared with all students across every enrolled course.
            </span>
          </div>
        )}
        {activeCourseObj && (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/[0.08] border border-amber-400/25 text-xs text-amber-100 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {enrolledCourseIds.includes(activeCourseObj.id) ? (
                  <>
                    Showing enrolled course lectures for <strong>{activeCourseObj.title}</strong> ({activeCourseObj.level})
                  </>
                ) : (
                  <>
                    Showing Admin-permitted lectures for <strong>{activeCourseObj.title}</strong> ({activeCourseObj.level})
                  </>
                )}
              </span>
            </span>
            <span className="font-mono text-[11px] text-amber-300">
              {activeCourseObj.duration}
            </span>
          </div>
        )}
      </div>

      {/* Search & Level Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 p-4 rounded-2xl luxury-glass">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search unlocked lessons by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090c] border border-white/[0.08] text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto text-xs pb-0.5 lg:pb-0">
          <span className="text-zinc-400 font-mono text-[11px] shrink-0 mr-1">Level:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl border font-semibold transition shrink-0 cursor-pointer ${
                selectedLevel === lvl
                  ? 'luxury-btn-primary border-transparent'
                  : 'bg-[#09090c] text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/[0.18]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No Unlocked Lessons Found"
          description="No lessons match this course tab or filter criteria yet."
          actionText="Show All My Classes"
          onAction={() => {
            setSearchQuery('');
            setSelectedLevel('All');
            setPickedCourseTab('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredLessons.map((lesson) => {
            const prog = findLessonProgressForStudent(lesson, currentUser, users, lessonProgress);
            const lessonStatus = prog?.status || 'Unlocked';
            const lessonCourse =
              lesson.courseId && lesson.courseId !== 'common'
                ? courses.find((c) => c.id === lesson.courseId)
                : null;

            return (
              <div
                key={lesson.id}
                className="group rounded-3xl luxury-card overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    <img
                      src={lesson.thumbnail}
                      alt={lesson.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a0e] via-black/25 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <StatusBadge status={lesson.level} />
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={lessonStatus} />
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full luxury-btn-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {lesson.durationMinutes} mins
                      </span>
                    </div>

                    {/* Course / Common Pill */}
                    <div>
                      {lessonCourse ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/12 text-amber-200 border border-amber-400/30">
                          <GraduationCap className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[220px]">{lessonCourse.title}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/12 text-emerald-300 border border-emerald-500/30">
                          <Layers className="w-3 h-3 shrink-0" />
                          <span>Common Class (All Students)</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{lesson.title}</h3>

                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>

                    {/* Media Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {lesson.videoUrl && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 text-amber-400" /> Video
                        </span>
                      )}
                      {lesson.audioUrl && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1">
                          <Headphones className="w-2.5 h-2.5 text-amber-400" /> Audio Track
                        </span>
                      )}
                      {lesson.tabFileUrl && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5 text-amber-400" /> TAB Sheet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  {!hasValidMobile && currentUser?.role === 'student' ? (
                    <Link
                      href="/student/profile"
                      className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Add Mobile to Visit Lesson →</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/student/lessons/${lesson.id}`}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs text-center transition block shadow-md shadow-amber-950/40"
                    >
                      Watch &amp; Practice Lesson →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentLessonsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Course Lectures & Common Classes"
        subtitle="Switch between your enrolled course tracks or preview Common Academy classes with HD videos, backing tracks & PDF TABs."
      />
      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading lessons...</div>}>
        <StudentLessonsContent />
      </Suspense>
    </div>
  );
}
