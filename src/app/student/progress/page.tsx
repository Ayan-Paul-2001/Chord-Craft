'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { isLessonUnlockedForStudent, findLessonProgressForStudent } from '@/lib/utils';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="px-3.5 py-2.5 rounded-xl bg-[#111116]/95 border border-amber-400/30 shadow-2xl backdrop-blur-xl">
      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-400">{item.name}</p>
      <p className="font-display text-xl font-semibold text-white tabular-nums mt-0.5">
        {item.value} {item.value === 1 ? 'Module' : 'Modules'}
      </p>
    </div>
  );
};

export default function StudentProgressPage() {
  const { lessons, users, currentUser, lessonAccess, lessonProgress } = useStore();

  const unlockedLessons = lessons.filter((l) =>
    isLessonUnlockedForStudent(l, currentUser, users, lessonAccess)
  );
  const totalUnlocked = unlockedLessons.length;

  const completed = unlockedLessons.filter((l) => {
    const lp = findLessonProgressForStudent(l, currentUser, users, lessonProgress);
    return lp?.status === 'Completed';
  }).length;

  const inProgress = unlockedLessons.filter((l) => {
    const lp = findLessonProgressForStudent(l, currentUser, users, lessonProgress);
    return lp?.status === 'In Progress';
  }).length;

  const untouched = Math.max(0, totalUnlocked - completed - inProgress);
  const overallPct = totalUnlocked > 0 ? Math.round((completed / totalUnlocked) * 100) : 0;

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const levelData = levels.map((lvl) => {
    const lvlUnlockedLessons = unlockedLessons.filter((l) => l.level === lvl);
    const lvlTotal = lvlUnlockedLessons.length;
    const lvlCompleted = lvlUnlockedLessons.filter((l) => {
      const lp = findLessonProgressForStudent(l, currentUser, users, lessonProgress);
      return lp?.status === 'Completed';
    }).length;

    return {
      level: lvl,
      total: lvlTotal,
      completed: lvlCompleted,
      percentage: lvlTotal > 0 ? Math.round((lvlCompleted / lvlTotal) * 100) : 0,
    };
  });

  const chartItems = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Untouched', value: untouched, color: '#6366f1' },
  ];

  const pieData =
    totalUnlocked === 0
      ? [{ name: 'No Unlocked Lessons', value: 1, color: '#27272a' }]
      : chartItems.filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Student Learning Progress"
        subtitle="Visual mastery analytics and curriculum completion across all conservatory levels."
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="p-4 sm:p-6 rounded-2xl portal-kpi-card animate-stagger space-y-2.5 sm:space-y-3" style={{ animationDelay: '30ms' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] sm:text-[10.5px] font-mono font-semibold text-zinc-400 uppercase tracking-[0.12em] sm:tracking-[0.16em]">
                Total Modules
              </span>
              <div className="p-2 rounded-xl bg-amber-500/12 border border-amber-400/25 text-amber-300 shrink-0">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-3xl sm:text-[2.75rem] text-white">{totalUnlocked}</p>
            <p className="text-[11px] sm:text-xs text-zinc-400">Unlocked curriculum</p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl portal-kpi-card animate-stagger space-y-2.5 sm:space-y-3" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] sm:text-[10.5px] font-mono font-semibold text-emerald-300 uppercase tracking-[0.12em] sm:tracking-[0.16em]">
                Completed Lessons
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/12 border border-emerald-400/25 text-emerald-300 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-3xl sm:text-[2.75rem] text-white">{completed}</p>
            <p className="text-[11px] sm:text-xs text-emerald-400 font-medium">100% Validated</p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl portal-kpi-card animate-stagger space-y-2.5 sm:space-y-3" style={{ animationDelay: '130ms' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] sm:text-[10.5px] font-mono font-semibold text-amber-300 uppercase tracking-[0.12em] sm:tracking-[0.16em]">
                In Progress
              </span>
              <div className="p-2 rounded-xl bg-amber-500/12 border border-amber-400/25 text-amber-300 shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-3xl sm:text-[2.75rem] text-white">{inProgress}</p>
            <p className="text-[11px] sm:text-xs text-amber-300 font-medium">Active learning</p>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl portal-kpi-card animate-stagger space-y-2.5 sm:space-y-3" style={{ animationDelay: '180ms' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9.5px] sm:text-[10.5px] font-mono font-semibold text-indigo-300 uppercase tracking-[0.12em] sm:tracking-[0.16em]">
                Untouched Modules
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/12 border border-indigo-400/25 text-indigo-300 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="portal-kpi-num text-3xl sm:text-[2.75rem] text-white">{untouched}</p>
            <p className="text-[11px] sm:text-xs text-zinc-400">Ready to start</p>
          </div>
        </div>

        {/* Charts & Level Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Level Breakdown Progress Bars */}
          <div className="lg:col-span-7 p-5 sm:p-8 rounded-3xl portal-surface space-y-6 sm:space-y-7">
            <div className="space-y-1">
              <h3 className="portal-heading text-xl sm:text-2xl text-white flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Curriculum Completion by Level</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Track mastery progression across your unlocked Beginner, Intermediate, and Advanced tracks
              </p>
            </div>

            <div className="space-y-6">
              {levelData.map((lvl) => (
                <div key={lvl.level} className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                    <span className="text-white flex items-center gap-2.5">
                      <StatusBadge status={lvl.level} size="sm" />
                      <span>{lvl.level} Tier</span>
                    </span>
                    <span className="text-amber-300 font-mono tabular-nums">
                      {lvl.completed} / {lvl.total} Lessons ({lvl.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#09090d] rounded-full h-3 p-0.5 border border-white/[0.08]">
                    <div
                      className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                      style={{ width: `${lvl.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated Donut Chart */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl portal-surface space-y-5 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="portal-heading text-2xl text-white flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>Lesson Status Breakdown</span>
              </h3>
              <p className="text-xs text-zinc-400">Live distribution of your unlocked modules</p>
            </div>

            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={90}
                    paddingAngle={pieData.length > 1 ? 5 : 0}
                    stroke="none"
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={950}
                    animationEasing="ease-out"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="portal-kpi-num text-4xl text-white">{overallPct}%</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mt-1">
                  Complete
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.07]">
              {chartItems.map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-xl bg-[#09090d] border border-white/[0.06] text-center space-y-1"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-zinc-400">{item.name}</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-white tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
