'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  ShoppingBag,
  CalendarCheck,
  ArrowRight,
  ShieldAlert,
  TrendingUp,
  Activity,
  Clock,
  Check,
  Ban,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
  mode: 'students' | 'revenue';
}

const CustomChartTooltip = ({ active, payload, label, mode }: CustomChartTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="px-4 py-3 rounded-2xl bg-[#111116]/95 border border-amber-400/30 shadow-2xl backdrop-blur-xl">
      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className="font-display text-2xl font-semibold text-white mt-0.5 tabular-nums">
        {mode === 'revenue' ? formatCurrency(val) : `${val} Students`}
      </p>
      <p className="text-[11px] text-amber-300/90 mt-0.5 font-medium">
        {mode === 'revenue' ? 'Verified Gear & Course Sales' : 'Active Conservatory Roster'}
      </p>
    </div>
  );
};

export default function AdminDashboardPage() {
  const {
    users,
    courses,
    courseEnrollments,
    lessons,
    orders,
    attendance,
    verifyBkashPayment,
    approveCourseEnrollment,
    approveUser,
    denyUser,
  } = useStore();
  const [chartRange, setChartRange] = useState<'4m' | '6m'>('6m');

  const students = users.filter((u) => u.role === 'student');
  const studentCount = students.length;
  const pendingStudents = students.filter((s) => s.status === 'Pending');
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const totalLessons = lessons.length;
  const pendingCoursePayments = courseEnrollments.filter((e) => e.paymentStatus === 'Pending');
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'Pending');
  const totalOrders = orders.length;
  const orderRevenue = orders
    .filter((o) => o.paymentStatus === 'Verified')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const courseRevenue = courseEnrollments
    .filter((e) => e.paymentStatus === 'Verified')
    .reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const totalRevenue = orderRevenue + courseRevenue;

  const chartData = useMemo(() => {
    const base6m = [
      { month: 'Nov', students: 9, revenue: 14200 },
      { month: 'Dec', students: 14, revenue: 21800 },
      { month: 'Jan', students: 19, revenue: 28500 },
      { month: 'Feb', students: 26, revenue: 36400 },
      { month: 'Mar', students: 34, revenue: 49200 },
      { month: 'Apr', students: Math.max(45, studentCount * 6), revenue: Math.max(68900, totalRevenue) },
    ];
    return chartRange === '4m' ? base6m.slice(2) : base6m;
  }, [chartRange, studentCount, totalRevenue]);

  const kpiCards = [
    {
      label: 'Pending Signups',
      value: pendingStudents.length,
      sub: pendingStudents.length > 0 ? 'Requires Approval' : 'Queue Clear',
      href: '/admin/approvals',
      accent: 'amber',
      highlight: pendingStudents.length > 0,
      icon: Clock,
    },
    {
      label: 'Total Students',
      value: students.length,
      sub: `${activeStudents} Active Profiles`,
      href: '/admin/students',
      accent: 'amber',
      highlight: false,
      icon: Users,
    },
    {
      label: 'Courses',
      value: courses.length,
      sub: `${totalLessons} Total Lectures`,
      href: '/admin/courses',
      accent: 'emerald',
      highlight: false,
      icon: GraduationCap,
    },
    {
      label: 'Pending bKash',
      value: pendingPayments.length + pendingCoursePayments.length,
      sub:
        pendingCoursePayments.length > 0
          ? `${pendingCoursePayments.length} Course • ${pendingPayments.length} Store`
          : pendingPayments.length > 0
          ? 'Verify Payments'
          : 'All Verified',
      href: pendingCoursePayments.length > 0 ? '/admin/courses' : '/admin/orders',
      accent: 'amber',
      highlight: pendingPayments.length + pendingCoursePayments.length > 0,
      icon: ShieldAlert,
    },
    {
      label: 'Gear Orders',
      value: totalOrders,
      sub: formatCurrency(totalRevenue) + ' Verified',
      href: '/admin/orders',
      accent: 'purple',
      highlight: false,
      icon: ShoppingBag,
    },
    {
      label: 'Attendance',
      value: attendance.length,
      sub: 'Recorded Logs',
      href: '/admin/attendance',
      accent: 'sky',
      highlight: false,
      icon: CalendarCheck,
    },
  ];

  const iconAccentMap: Record<string, string> = {
    amber: 'bg-amber-500/12 text-amber-300 border-amber-400/25',
    emerald: 'bg-emerald-500/12 text-emerald-300 border-emerald-400/25',
    purple: 'bg-purple-500/12 text-purple-300 border-purple-400/25',
    sky: 'bg-sky-500/12 text-sky-300 border-sky-400/25',
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Admin Control Center"
        subtitle="Conservatory roster metrics, bKash payment verification, analytics & curriculum management."
      />

      <div className="px-3.5 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Top 6 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-5">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={kpi.label}
                href={kpi.href}
                style={{ animationDelay: `${idx * 55}ms` }}
                className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl portal-kpi-card animate-stagger flex flex-col justify-between gap-2 sm:gap-4 group ${
                  kpi.highlight ? 'border-amber-400/45 shadow-[0_0_28px_-12px_rgba(245,158,11,0.3)]' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <span
                    className={`text-[9px] sm:text-[10.5px] font-mono font-semibold uppercase tracking-[0.09em] sm:tracking-[0.16em] truncate ${
                      kpi.highlight ? 'text-amber-300' : 'text-zinc-400'
                    }`}
                  >
                    {kpi.label}
                  </span>
                  {kpi.highlight ? (
                    <span className="min-w-5 h-5 sm:min-w-6 sm:h-6 px-1 sm:px-1.5 rounded-md sm:rounded-lg bg-amber-400 text-zinc-950 font-mono font-bold text-[10px] sm:text-xs flex items-center justify-center tabular-nums shrink-0">
                      {kpi.value}
                    </span>
                  ) : (
                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border shrink-0 ${iconAccentMap[kpi.accent]}`}>
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 sm:space-y-1.5">
                  <p
                    className={`portal-kpi-num text-2xl sm:text-[2.5rem] ${
                      kpi.highlight ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {kpi.value}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs font-medium flex items-center justify-between ${
                      kpi.highlight ? 'text-amber-300/90' : 'text-zinc-400'
                    }`}
                  >
                    <span className="truncate">{kpi.sub}</span>
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400 shrink-0" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Priority Action Banners */}
        {(pendingCoursePayments.length > 0 || pendingStudents.length > 0 || pendingPayments.length > 0) && (
          <div className="space-y-4 sm:space-y-6">
            {/* Pending Course Tuition bKash Verifications */}
            {pendingCoursePayments.length > 0 && (
              <section className="p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl luxury-glass gold-border-glow space-y-3.5 sm:space-y-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 shrink-0">
                      <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="portal-heading text-base sm:text-2xl text-white leading-tight">
                        Course Tuition Verifications (bKash)
                        <span className="ml-2 text-xs sm:text-sm font-mono text-amber-300">
                          ({pendingCoursePayments.length})
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Verify student course payments to activate accounts and unlock enrolled course lectures.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 transition self-start sm:self-auto"
                  >
                    <span>Open Course Studio</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-4">
                  {pendingCoursePayments.slice(0, 4).map((enr) => (
                    <div
                      key={enr.id}
                      className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0b0b10]/90 border border-white/[0.08] hover:border-amber-400/35 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
                    >
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {enr.studentName} — <span className="text-amber-200">{enr.courseTitle}</span>
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-400">
                          Tuition:{' '}
                          <span className="text-amber-300 font-mono font-bold tabular-nums">
                            {formatCurrency(enr.totalAmount)}
                          </span>
                        </p>
                        <p className="text-[10.5px] sm:text-[11px] font-mono text-zinc-300 truncate">
                          TrxID:{' '}
                          <span className="text-amber-400 font-bold">{enr.bKashTransactionId}</span>{' '}
                          <span className="text-zinc-500">({enr.bKashSenderMobile})</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => approveCourseEnrollment(enr.id)}
                        className="self-end sm:self-auto px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] sm:text-xs shrink-0 cursor-pointer"
                      >
                        Verify &amp; Unlock ✓
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Registration Approvals */}
            {pendingStudents.length > 0 && (
              <section className="p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl luxury-glass gold-border-glow space-y-3.5 sm:space-y-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 shrink-0">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="portal-heading text-base sm:text-2xl text-white leading-tight">
                        Student Registration Approvals
                        <span className="ml-2 text-xs sm:text-sm font-mono text-amber-300">
                          ({pendingStudents.length})
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Review incoming applications and unlock their starter conservatory module.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/approvals"
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 transition self-start sm:self-auto"
                  >
                    <span>View Approvals Center</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-4">
                  {pendingStudents.slice(0, 4).map((student) => (
                    <div
                      key={student.id}
                      className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0b0b10]/90 border border-white/[0.08] hover:border-amber-400/35 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        <img
                          src={
                            student.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={student.fullName}
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover border border-amber-400/35 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">{student.fullName}</p>
                          <p className="text-[10.5px] sm:text-[11px] text-zinc-400 font-mono truncate">{student.email}</p>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-amber-300/90 font-mono">
                            <span>{student.level || 'Beginner'}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="truncate">{student.mobile || 'No Phone'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => approveUser(student.id)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] sm:text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
                          title="Approve student & unlock Lesson 1"
                        >
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => denyUser(student.id)}
                          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition cursor-pointer"
                          title="Deny registration"
                        >
                          <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pending bKash Verification Actions */}
            {pendingPayments.length > 0 && (
              <section className="p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl portal-surface border-amber-500/30 space-y-3.5 sm:space-y-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="portal-heading text-base sm:text-2xl text-white leading-tight">
                        bKash Payment Verifications
                        <span className="ml-2 text-xs sm:text-sm font-mono text-amber-300">
                          ({pendingPayments.length})
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Confirm submitted bKash transaction IDs to release merchandise orders.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/orders"
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 transition self-start sm:self-auto"
                  >
                    <span>Manage All Orders</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-4">
                  {pendingPayments.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0b0b10]/90 border border-white/[0.08] hover:border-amber-400/35 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4"
                    >
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          Order #{order.id} — {order.customerName}
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-400">
                          Amount:{' '}
                          <span className="text-amber-300 font-mono font-bold tabular-nums">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </p>
                        {order.bKashTransactionId && (
                          <p className="text-[10.5px] sm:text-[11px] font-mono text-zinc-300 truncate">
                            TxID:{' '}
                            <span className="text-amber-400 font-bold">{order.bKashTransactionId}</span>{' '}
                            <span className="text-zinc-500">
                              ({order.bKashSenderMobile || 'No Mobile'})
                            </span>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => verifyBkashPayment(order.id)}
                        className="self-end sm:self-auto px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl luxury-btn-primary font-bold text-[11px] sm:text-xs shrink-0 cursor-pointer"
                      >
                        Verify Payment ✓
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Smoothly Animated Analytics Charts Section */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em] text-amber-300/90">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Conservatory Telemetry</span>
              </div>
              <h2 className="portal-heading text-lg sm:text-[1.75rem] text-white mt-0.5">
                Growth &amp; Revenue Performance
              </h2>
            </div>

            {/* Smooth Animated Timeframe Switcher */}
            <div className="flex p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-[#0b0b10] border border-white/[0.08] w-fit">
              {(
                [
                  { id: '4m', label: 'Last 4 Months' },
                  { id: '6m', label: 'Last 6 Months' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChartRange(tab.id)}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    chartRange === tab.id
                      ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35 shadow-sm'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6">
            {/* Student Growth Area Chart */}
            <div className="lg:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl portal-surface space-y-3.5 sm:space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="portal-heading text-base sm:text-xl text-white flex items-center gap-2 sm:gap-2.5">
                    <span className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/12 border border-amber-400/25 text-amber-300 shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                    <span>Academy Student Growth Trend</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 sm:pl-11">
                    Cumulative student enrollments across all three guitar tiers
                  </p>
                </div>
                <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-[11px] font-mono font-semibold tabular-nums shrink-0">
                  +28.4%
                </span>
              </div>

              <div className="h-48 sm:h-64 lg:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudentsLuxury" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.42} />
                        <stop offset="60%" stopColor="#d97706" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      content={<CustomChartTooltip mode="students" />}
                      cursor={{ stroke: 'rgba(245,158,11,0.35)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#fbbf24"
                      fillOpacity={1}
                      fill="url(#colorStudentsLuxury)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#0b0b10', stroke: '#fbbf24', strokeWidth: 2 }}
                      activeDot={{ r: 5.5, fill: '#f59e0b', stroke: '#fef3c7', strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="lg:col-span-5 p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl portal-surface space-y-3.5 sm:space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <h3 className="portal-heading text-base sm:text-xl text-white flex items-center gap-2 sm:gap-2.5">
                    <span className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/12 border border-emerald-400/25 text-emerald-300 shrink-0">
                      <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                    <span>Monthly Revenue (BDT)</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 sm:pl-11">
                    Verified boutique gear &amp; academy transactions
                  </p>
                </div>
              </div>

              <div className="h-48 sm:h-64 lg:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 8, left: -4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenueLuxury" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.55} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      content={<CustomChartTooltip mode="revenue" />}
                      cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#colorRevenueLuxury)"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={32}
                      isAnimationActive={true}
                      animationDuration={950}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Students & Recent Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-6">
          {/* Recent Students */}
          <div className="p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl portal-surface space-y-3 sm:space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] pb-3 sm:pb-4">
              <h3 className="portal-heading text-base sm:text-xl text-white flex items-center gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>Recent Students</span>
              </h3>
              <Link
                href="/admin/students"
                className="text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition shrink-0"
              >
                <span>Manage All</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {students.slice(0, 4).map((std) => (
                <div
                  key={std.id}
                  className="py-2.5 sm:py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2.5 sm:gap-3 group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                    <img
                      src={
                        std.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={std.fullName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border border-amber-400/25 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-amber-200 transition">
                        {std.fullName}
                      </p>
                      <p className="text-[10.5px] sm:text-[11px] text-zinc-400 font-mono truncate">{std.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <div className="hidden sm:block">
                      <StatusBadge status={std.level || 'Beginner'} size="sm" />
                    </div>
                    <Link
                      href={`/admin/students/${std.id}`}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl luxury-btn-ghost text-amber-300 text-[11px] sm:text-xs font-semibold whitespace-nowrap"
                    >
                      Access →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="p-3.5 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl portal-surface space-y-3 sm:space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] pb-3 sm:pb-4">
              <h3 className="portal-heading text-base sm:text-xl text-white flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span>Recent Merchandise Orders</span>
              </h3>
              <Link
                href="/admin/orders"
                className="text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition shrink-0"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="py-2.5 sm:py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {order.id} — {order.customerName}
                    </p>
                    <p className="text-[10.5px] sm:text-[11px] text-zinc-400 font-mono mt-0.5 tabular-nums">
                      <span className="text-amber-300 font-semibold">{formatCurrency(order.totalAmount)}</span>
                      {' • '}
                      {order.paymentMethod}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                    <StatusBadge status={order.paymentStatus} size="sm" />
                    <StatusBadge status={order.orderStatus} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
