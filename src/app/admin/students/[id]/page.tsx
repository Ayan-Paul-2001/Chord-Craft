'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { StudentLevel } from '@/lib/types';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, isLessonUnlockedForStudent, getStudentEnrolledCourseIds } from '@/lib/utils';
import { Lock, Unlock, ArrowLeft, CheckSquare, Square, ShieldCheck, ChevronDown, Loader2, GraduationCap, Layers, Check } from 'lucide-react';

export default function StudentAccessMatrixPage() {
  const params = useParams();
  const studentId = params.id as string;

  const { users, courses, lessons, lessonAccess, toggleLessonAccess, bulkSetLessonAccess, updateUserStatus, updateUser } = useStore();

  const student = users.find((u) => u.id === studentId);

  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  if (!student) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Student Not Found</h2>
        <Link href="/admin/students" className="inline-block px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl">
          Return to Student Roster
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'Active' | 'Inactive') => {
    setIsUpdatingStatus(true);
    try {
      await updateUserStatus(student.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const enrolledCourseIds = getStudentEnrolledCourseIds(student, users);

  const handleToggleStudentCourse = async (courseId: string) => {
    setUpdatingCourseId(courseId);
    try {
      const next = enrolledCourseIds.includes(courseId)
        ? enrolledCourseIds.filter((id) => id !== courseId)
        : [...enrolledCourseIds, courseId];
      await updateUser(student.id, { enrolledCourseIds: next });
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const visibleLessons = lessons.filter((lesson) => {
    if (courseFilter === 'All') return true;
    const cid = lesson.courseId || 'common';
    return cid === courseFilter;
  });

  const handleLevelChange = async (newLevel: StudentLevel) => {
    setIsUpdatingLevel(true);
    try {
      await updateUser(student.id, { level: newLevel });
    } finally {
      setIsUpdatingLevel(false);
    }
  };

  const handleToggleSelect = (lessonId: string) => {
    if (selectedLessonIds.includes(lessonId)) {
      setSelectedLessonIds(selectedLessonIds.filter((id) => id !== lessonId));
    } else {
      setSelectedLessonIds([...selectedLessonIds, lessonId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLessonIds.length === lessons.length) {
      setSelectedLessonIds([]);
    } else {
      setSelectedLessonIds(lessons.map((l) => l.id));
    }
  };

  const handleBulkUnlock = () => {
    if (!selectedLessonIds.length) return;
    bulkSetLessonAccess(student.id, selectedLessonIds, true);
    setSelectedLessonIds([]);
  };

  const handleBulkLock = () => {
    if (!selectedLessonIds.length) return;
    bulkSetLessonAccess(student.id, selectedLessonIds, false);
    setSelectedLessonIds([]);
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={`Access Permissions Matrix — ${student.fullName}`}
        subtitle={`Level: ${student.level} • Enrolled: ${formatDate(student.registrationDate)}`}
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Student Roster
        </Link>

        {/* Student Overview Info Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-xl">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 w-full">
            <img
              src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
              alt={student.fullName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-amber-500/40 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{student.fullName}</h2>
              <p className="text-xs text-zinc-400 font-mono break-all">{student.email} • {student.mobile}</p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {/* Interactive Student Level Control */}
                <div className="inline-flex items-center">
                  {isUpdatingLevel ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-amber-400 border border-amber-500/30">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Level...</span>
                    </div>
                  ) : (
                    <div className="relative inline-flex items-center group">
                      <select
                        value={student.level || 'Beginner'}
                        onChange={(e) => handleLevelChange(e.target.value as StudentLevel)}
                        title="Change student level (syncs live to database)"
                        className={`appearance-none cursor-pointer pl-6 pr-7 py-0.5 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
                          student.level === 'Advanced'
                            ? 'bg-purple-950/70 text-purple-300 border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/60'
                            : student.level === 'Intermediate'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:bg-amber-900/60'
                            : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60'
                        }`}
                      >
                        <option value="Beginner" className="bg-zinc-950 text-emerald-400 font-semibold py-1">
                          Beginner
                        </option>
                        <option value="Intermediate" className="bg-zinc-950 text-amber-400 font-semibold py-1">
                          Intermediate
                        </option>
                        <option value="Advanced" className="bg-zinc-950 text-purple-400 font-semibold py-1">
                          Advanced
                        </option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                          student.level === 'Advanced'
                            ? 'bg-purple-400'
                            : student.level === 'Intermediate'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition" />
                    </div>
                  )}
                </div>

                {/* Interactive Status Control */}
                <div className="inline-flex items-center">
                  {isUpdatingStatus ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-amber-400 border border-amber-500/30">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Syncing...</span>
                    </div>
                  ) : (
                    <div className="relative inline-flex items-center group">
                      <select
                        value={student.status}
                        onChange={(e) => handleStatusChange(e.target.value as 'Active' | 'Inactive')}
                        className={`appearance-none cursor-pointer pl-6 pr-7 py-0.5 rounded-full text-xs font-semibold border transition outline-none shadow-sm ${
                          student.status === 'Active'
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/60'
                            : 'bg-rose-950/70 text-rose-300 border-rose-500/40 hover:border-rose-400 hover:bg-rose-900/60'
                        }`}
                      >
                        <option value="Active" className="bg-zinc-950 text-emerald-400 font-semibold py-1">
                          Active
                        </option>
                        <option value="Inactive" className="bg-zinc-950 text-rose-400 font-semibold py-1">
                          Inactive
                        </option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                          student.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-white transition" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Management Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Enrolled Courses ({enrolledCourseIds.length})</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Toggle courses to grant or revoke all lectures assigned to that course. Common classes stay accessible to all active students.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {courses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const isBusy = updatingCourseId === course.id;
              return (
                <button
                  key={course.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleToggleStudentCourse(course.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                    isEnrolled
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-amber-500/40'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate">{course.title}</p>
                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {course.level} • {course.duration}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 ${
                      isEnrolled
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isEnrolled ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : null}
                    <span>{isEnrolled ? 'Enrolled' : 'Add Course'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Access Control Toolbar */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-zinc-300 hover:text-amber-400 flex items-center gap-2 cursor-pointer"
          >
            {selectedLessonIds.length === lessons.length ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-zinc-500" />
            )}
            <span>Select All Lessons ({selectedLessonIds.length} selected)</span>
          </button>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleBulkUnlock}
              disabled={!selectedLessonIds.length}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Selected</span>
            </button>

            <button
              onClick={handleBulkLock}
              disabled={!selectedLessonIds.length}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Selected</span>
            </button>
          </div>
        </div>

        {/* Lesson Access Matrix List */}
        <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Curriculum Modules Lock / Unlock Matrix ({visibleLessons.length})</span>
            </h3>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-9 bg-zinc-950 border border-zinc-800 text-white rounded-xl px-3 text-xs cursor-pointer"
            >
              <option value="All">All Courses &amp; Common</option>
              <option value="common">Common Classes (All Students)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y divide-zinc-800/80 text-xs">
            {visibleLessons.map((lesson) => {
              const isUnlocked = isLessonUnlockedForStudent(lesson, student, users, lessonAccess);
              const isSelected = selectedLessonIds.includes(lesson.id);
              const lessonCourse =
                lesson.courseId && lesson.courseId !== 'common'
                  ? courses.find((c) => c.id === lesson.courseId)
                  : null;

              return (
                <div
                  key={lesson.id}
                  className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-2 sm:px-3 rounded-xl transition ${
                    isSelected ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleSelect(lesson.id)}
                      className="text-zinc-400 hover:text-amber-400 mt-0.5 sm:mt-0 shrink-0 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-600" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-zinc-400">
                          Lesson #{lesson.lessonNumber.toString().padStart(2, '0')}
                        </span>
                        <StatusBadge status={lesson.level} size="sm" />
                        {lessonCourse ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/12 text-amber-200 border border-amber-400/30">
                            <GraduationCap className="w-3 h-3 text-amber-400" />
                            <span>{lessonCourse.title}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/12 text-emerald-300 border border-emerald-500/30">
                            <Layers className="w-3 h-3" />
                            <span>Common Class</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">{lesson.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-7 sm:pl-0 shrink-0">
                    <StatusBadge status={isUnlocked ? 'Unlocked' : 'Locked'} />

                    <button
                      onClick={() => toggleLessonAccess(student.id, lesson.id)}
                      className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap ${
                        isUnlocked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Access</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Access</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
