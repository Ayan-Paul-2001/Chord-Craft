'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  CalendarCheck,
  Play,
  ArrowRight,
  Sparkles,
  Star,
  MessageSquarePlus,
  Edit3,
  Trash2,
  Award,
  GraduationCap,
  Layers,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { StudentReviewModal } from '@/components/shared/StudentReviewModal';
import {
  isLessonUnlockedForStudent,
  findLessonProgressForStudent,
  getStudentEnrolledCourseIds,
} from '@/lib/utils';

interface MasteryTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: {
      percentage: number;
      completed: number;
      unlocked: number;
    };
  }>;
  label?: string;
}

const MasteryTooltip = ({ active, payload, label }: MasteryTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="px-4 py-3 rounded-2xl bg-[#111116]/95 border border-amber-400/30 shadow-2xl backdrop-blur-xl">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400">
        {label} Tier
      </p>
      <p className="font-display text-2xl font-semibold text-white mt-0.5 tabular-nums">
        {row.percentage}% Mastery
      </p>
      <p className="text-[11px] text-amber-300/90 mt-0.5 font-mono">
        {row.completed} of {row.unlocked} unlocked lessons completed
      </p>
    </div>
  );
};

export default function StudentDashboardPage() {
  const { currentUser, users, courses, lessons, lessonAccess, lessonProgress, attendance, reviews, deleteReview, adminName } = useStore();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const studentId = currentUser?.id || '';
  const enrolledCourseIds = getStudentEnrolledCourseIds(currentUser, users);
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  const studentInRoster = currentUser
    ? users.find(
      (u) =>
        u.id === currentUser.id ||
        (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
    )
    : null;
  const currentSkillLevel = studentInRoster?.level || currentUser?.level || 'Beginner';

  const myReview = reviews.find(
    (r) =>
      (currentUser?.email && r.studentEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.id && r.studentId === currentUser.id)
  );

  // Unlocked lessons for this student across all categories
  const unlockedLessons = lessons.filter((l) =>
    isLessonUnlockedForStudent(l, currentUser, users, lessonAccess)
  );
  const unlockedCount = unlockedLessons.length;

  // Completed lessons strictly among unlocked modules
  const completedList = unlockedLessons.filter((l) => {
    const lp = findLessonProgressForStudent(l, currentUser, users, lessonProgress);
    return lp?.status === 'Completed';
  });
  const completedCount = completedList.length;

  const progressPercentage = unlockedCount > 0 ? Math.round((completedCount / unlockedCount) * 100) : 0;

  // Attendance stats for student (match across all linked IDs; never fabricate 100% when 0 sessions exist)
  const ownStudentIds = new Set(
    [
      studentId,
      currentUser?.firebaseUid,
      studentInRoster?.id,
      studentInRoster?.firebaseUid,
    ].filter((v): v is string => Boolean(v))
  );
  const studentAtt =
    ownStudentIds.size > 0
      ? attendance.filter((a) => ownStudentIds.has(a.studentId))
      : [];
  const presentCount = studentAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate =
    studentAtt.length > 0 ? Math.round((presentCount / studentAtt.length) * 100) : null;

  // Animated mastery chart data per guitar tier
  const masteryByLevel = useMemo(() => {
    const tiers: { level: string; color: string }[] = [
      { level: 'Beginner', color: '#34d399' },
      { level: 'Intermediate', color: '#fbbf24' },
      { level: 'Advanced', color: '#a855f7' },
    ];

    return tiers.map((t) => {
      const tierLessons = unlockedLessons.filter((l) => l.level === t.level);
      const tierCompleted = tierLessons.filter((l) => {
        const lp = findLessonProgressForStudent(l, currentUser, users, lessonProgress);
        return lp?.status === 'Completed';
      }).length;
      const pct = tierLessons.length > 0 ? Math.round((tierCompleted / tierLessons.length) * 100) : 0;
      return {
        level: t.level,
        unlocked: tierLessons.length,
        completed: tierCompleted,
        percentage: pct,
        color: t.color,
      };
    });
  }, [unlockedLessons, lessonProgress, currentUser, users]);

  // SVG progress ring geometry
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercentage / 100) * ringCircumference;

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title={`Welcome back, ${currentUser?.fullName || 'Student'}`}
        subtitle="Track your guitar conservatory mastery, resume unlocked lessons, and review session attendance."
      />

      <div className="px-3.5 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Conservatory Hero Banner with Animated Mastery Ring */}
        <section className="p-4 sm:p-7 lg:p-9 rounded-2xl sm:rounded-3xl luxury-glass gold-border-glow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-7 relative overflow-hidden">
          <div className="absolute inset-0 acoustic-strings-bg opacity-35 pointer-events-none" />
          <div className="space-y-2 sm:space-y-3.5 max-w-xl relative z-10">
            <div className="eyebrow-pill">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>{currentSkillLevel} Level • Harmonic Guitar Academy</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl lg:text-[2.6rem] font-semibold text-white leading-[1.12] sm:leading-[1.08] tracking-tight">
              Ready to Refine Your Technique &amp; Phrasing?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
              You have completed{' '}
              <span className="text-amber-300 font-semibold tabular-nums">{completedCount}</span> out of{' '}
              <span className="text-white font-semibold tabular-nums">{unlockedCount}</span> unlocked curriculum
              lessons (<span className="tabular-nums font-medium">{progressPercentage}%</span>). Keep your studio
              practice momentum strong.
            </p>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-6 relative z-10 w-full lg:w-auto justify-between sm:justify-start shrink-0">
            {/* Animated Circular Mastery Gauge */}
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  stroke="url(#studentRingGold)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="studentRingGold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="portal-kpi-num text-base sm:text-2xl text-white">{progressPercentage}%</span>
                <span className="text-[7.5px] sm:text-[9px] font-mono uppercase tracking-widest text-amber-300/85 mt-0.5">
                  Mastery
                </span>
              </div>
            </div>

            <Link
              href="/student/lessons"
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl luxury-btn-primary font-bold sm:font-extrabold text-xs sm:text-sm tracking-wide inline-flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span>Resume Lesson</span>
            </Link>
          </div>
        </section>

        {/* 4 Staggered KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl portal-kpi-card animate-stagger space-y-2 sm:space-y-3.5" style={{ animationDelay: '40ms' }}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10.5px] font-mono font-semibold text-zinc-400 uppercase tracking-[0.09em] sm:tracking-[0.16em] truncate">
                Unlocked Modules
              </span>
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/12 text-emerald-300 border border-emerald-400/25 shrink-0">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-2xl sm:text-[2.75rem] text-white">{unlockedCount}</p>
            <p className="text-[10px] sm:text-xs text-zinc-400 truncate">Curated by {adminName}</p>
          </div>

          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl portal-kpi-card animate-stagger space-y-2 sm:space-y-3.5" style={{ animationDelay: '90ms' }}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10.5px] font-mono font-semibold text-zinc-400 uppercase tracking-[0.09em] sm:tracking-[0.16em] truncate">
                Completed
              </span>
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/12 text-amber-300 border border-amber-400/25 shrink-0">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-2xl sm:text-[2.75rem] text-white">{completedCount}</p>
            <p className="text-[10px] sm:text-xs text-emerald-400 font-medium">100% Validated</p>
          </div>

          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl portal-kpi-card animate-stagger space-y-2 sm:space-y-3.5" style={{ animationDelay: '140ms' }}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10.5px] font-mono font-semibold text-zinc-400 uppercase tracking-[0.09em] sm:tracking-[0.16em] truncate">
                Progress
              </span>
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-violet-500/12 text-violet-300 border border-violet-400/25 shrink-0">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-2xl sm:text-[2.75rem] text-white">{progressPercentage}%</p>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl portal-kpi-card animate-stagger space-y-2 sm:space-y-3.5" style={{ animationDelay: '190ms' }}>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10.5px] font-mono font-semibold text-zinc-400 uppercase tracking-[0.09em] sm:tracking-[0.16em] truncate">
                Attendance
              </span>
              <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-sky-500/12 text-sky-300 border border-sky-400/25 shrink-0">
                <CalendarCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-2xl sm:text-[2.75rem] text-white">
              {attendanceRate !== null ? `${attendanceRate}%` : '—'}
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
              {studentAtt.length > 0 ? `${studentAtt.length} Recorded Sessions` : 'No sessions recorded yet'}
            </p>
          </div>
        </div>

        {/* Animated Curriculum Mastery Graph + Tier Progress */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6">
          <div className="lg:col-span-7 p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl portal-surface space-y-3.5 sm:space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div>
                <h3 className="portal-heading text-base sm:text-2xl text-white flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span>Tier Mastery Overview</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                  Live completion percentage across Beginner, Intermediate &amp; Advanced modules
                </p>
              </div>
              <Link
                href="/student/progress"
                className="text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 shrink-0"
              >
                <span>Full Analytics</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            <div className="h-44 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={masteryByLevel} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="level"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<MasteryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
                  <Bar
                    dataKey="percentage"
                    radius={[10, 10, 3, 3]}
                    maxBarSize={48}
                    isAnimationActive={true}
                    animationDuration={950}
                    animationEasing="ease-out"
                  >
                    {masteryByLevel.map((entry) => (
                      <Cell key={entry.level} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 p-3.5 sm:p-7 rounded-2xl sm:rounded-3xl portal-surface flex flex-col justify-between space-y-3.5 sm:space-y-5">
            <div>
              <h3 className="portal-heading text-base sm:text-2xl text-white flex items-center gap-2">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span>Curriculum Milestones</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Unlocked vs completed breakdown per conservatory tier
              </p>
            </div>

            <div className="space-y-3.5 sm:space-y-5">
              {masteryByLevel.map((tier) => (
                <div key={tier.level} className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={tier.level} size="sm" />
                      <span className="text-zinc-300 font-medium">{tier.level}</span>
                    </div>
                    <span className="font-mono text-zinc-300 tabular-nums">
                      <strong className="text-white">{tier.completed}</strong>/{tier.unlocked} ({tier.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 rounded-full bg-[#09090d] border border-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${tier.percentage}%`,
                        backgroundColor: tier.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* My Enrolled Courses & Common Preview Classes */}
        <section className="space-y-3.5 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div>
              <h3 className="portal-heading text-base sm:text-2xl text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <span>My Enrolled Courses ({enrolledCourses.length})</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Access course-separated lectures or preview Common Academy classes available to all students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/student/lessons?course=common"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/12 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold inline-flex items-center gap-1.5 transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Common Classes</span>
              </Link>
              <Link
                href="/payment-lobby"
                className="px-3 py-1.5 rounded-lg luxury-btn-primary text-[11px] font-bold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Course</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {enrolledCourses.map((course) => {
              const cLessons = unlockedLessons.filter((l) => l.courseId === course.id);
              const cDone = cLessons.filter((l) => {
                const lp = findLessonProgressForStudent(l, currentUser, users, lessonProgress);
                return lp?.status === 'Completed';
              }).length;
              const cPct = cLessons.length > 0 ? Math.round((cDone / cLessons.length) * 100) : 0;

              return (
                <Link
                  key={course.id}
                  href={`/student/lessons?course=${encodeURIComponent(course.id)}`}
                  className="p-3.5 sm:p-5 rounded-2xl portal-surface border border-white/[0.08] hover:border-amber-400/45 transition flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-14 h-14 rounded-xl object-cover border border-white/[0.08] shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <StatusBadge status={course.level} size="sm" />
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition leading-snug line-clamp-2">
                        {course.title}
                      </h4>
                      <p className="text-[10.5px] font-mono text-zinc-400">
                        {cDone}/{cLessons.length} Lectures Done • {course.duration}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
                        style={{ width: `${cPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 inline-flex items-center gap-1">
                      <span>Open Course Lectures</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* Always-visible Common Classes Preview Card */}
            <Link
              href="/student/lessons?course=common"
              className="p-3.5 sm:p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/25 hover:border-emerald-400/50 transition flex flex-col justify-between gap-3 group"
            >
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                  <Layers className="w-3 h-3" />
                  <span>Open To All Students</span>
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition">
                  Common Academy Preview Classes
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Shared warmups, picking mechanics, and academy announcements previewable across every enrolled course.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 inline-flex items-center gap-1">
                <span>
                  Preview {unlockedLessons.filter((l) => !l.courseId || l.courseId === 'common').length} Common Classes
                </span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </section>

        {/* Available Curriculum Lessons */}
        <section className="space-y-3.5 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div>
              <h3 className="portal-heading text-base sm:text-2xl text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                <span>Available Curriculum Lessons</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Stream HD video masterclasses, practice with backing tracks &amp; download PDF tabs
              </p>
            </div>
            <Link
              href="/student/lessons"
              className="text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {unlockedLessons.map((lesson) => {
              const prog = findLessonProgressForStudent(lesson, currentUser, users, lessonProgress);
              const lessonStatus = prog?.status || 'Unlocked';
              const lessonCourse =
                lesson.courseId && lesson.courseId !== 'common'
                  ? courses.find((c) => c.id === lesson.courseId)
                  : null;

              return (
                <div
                  key={lesson.id}
                  className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl luxury-card flex flex-col justify-between space-y-3 sm:space-y-5 group"
                >
                  <div className="space-y-2.5 sm:space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={lesson.level} size="sm" />
                      <StatusBadge status={lessonStatus} size="sm" />
                    </div>

                    <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden relative border border-white/[0.07]">
                      <img
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex items-center justify-center">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full luxury-btn-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-mono text-amber-300/85 tabular-nums">
                          Module #{lesson.lessonNumber.toString().padStart(2, '0')} • {lesson.durationMinutes} mins
                        </span>
                        <span
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border truncate max-w-[155px] ${lessonCourse
                            ? 'bg-amber-500/12 text-amber-200 border-amber-400/25'
                            : 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25'
                            }`}
                        >
                          {lessonCourse ? lessonCourse.title : 'Common Class'}
                        </span>
                      </div>
                      <h4 className="font-display text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-1 group-hover:text-amber-200 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-[11.5px] sm:text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/student/lessons/${lesson.id}`}
                    className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl luxury-btn-ghost text-amber-300 font-semibold text-[11px] sm:text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Open Lesson Studio</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Student Review & Feedback Section */}
        <section className="space-y-3.5 sm:space-y-5 pt-4 sm:pt-6 border-t border-white/[0.07]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="portal-heading text-lg sm:text-2xl text-white flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
                <span>Academy Experience &amp; Student Review</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                Share your journey with {adminName} and inspire fellow guitarists across the community
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {myReview ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete your review?')) {
                        await deleteReview(myReview.id);
                      }
                    }}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-[11px] sm:text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl luxury-btn-primary font-bold text-[11px] sm:text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit My Review</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl luxury-btn-primary font-bold text-[11px] sm:text-xs flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Write Student Review</span>
                </button>
              )}
            </div>
          </div>

          {myReview && (
            <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl luxury-glass gold-border-glow space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs font-mono font-semibold text-emerald-300 bg-emerald-500/12 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/25">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Published on Academy Showcase</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(myReview.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="font-display text-lg sm:text-2xl text-zinc-100 italic leading-relaxed">
                &ldquo;{myReview.comment}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 pt-2.5 sm:pt-3 border-t border-white/[0.07]">
                <span>
                  Published as <strong className="text-white">{myReview.name}</strong> ({myReview.level})
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      <StudentReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
