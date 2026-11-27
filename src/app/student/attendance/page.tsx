'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/utils';
import { CalendarCheck, Calendar } from 'lucide-react';

export default function StudentAttendancePage() {
  const { attendance, users, currentUser, adminName } = useStore();

  const studentInRoster = currentUser
    ? users.find(
        (u) =>
          u.id === currentUser.id ||
          (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : null;

  const ownStudentIds = new Set(
    [
      currentUser?.id,
      currentUser?.firebaseUid,
      studentInRoster?.id,
      studentInRoster?.firebaseUid,
    ].filter((v): v is string => Boolean(v))
  );

  const studentAtt =
    ownStudentIds.size > 0
      ? attendance.filter((a) => ownStudentIds.has(a.studentId))
      : [];

  const totalSessions = studentAtt.length;
  const present = studentAtt.filter((a) => a.status === 'Present').length;
  const late = studentAtt.filter((a) => a.status === 'Late').length;
  const absent = studentAtt.filter((a) => a.status === 'Absent').length;
  const excused = studentAtt.filter((a) => a.status === 'Excused').length;

  const attendanceRate =
    totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : null;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Academy Attendance Log"
        subtitle="Track your in-studio and live online masterclass session attendance records."
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-6 sm:space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          <div className="p-4 sm:p-5 rounded-2xl portal-kpi-card animate-stagger space-y-1.5 sm:space-y-2 col-span-2 sm:col-span-3 lg:col-span-1 border-amber-400/30">
            <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold text-amber-300 uppercase tracking-[0.14em] sm:tracking-[0.16em]">
              Attendance Rate
            </span>
            <p className="portal-kpi-num text-3xl sm:text-4xl text-white">
              {attendanceRate !== null ? `${attendanceRate}%` : '—'}
            </p>
            <p className="text-xs text-zinc-400 tabular-nums">
              {totalSessions > 0 ? `Total sessions: ${totalSessions}` : 'No sessions recorded yet'}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl portal-kpi-card animate-stagger space-y-1.5 sm:space-y-2" style={{ animationDelay: '50ms' }}>
            <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold text-emerald-300 uppercase tracking-[0.14em] sm:tracking-[0.16em]">
              Present
            </span>
            <p className="portal-kpi-num text-3xl sm:text-4xl text-white">{present}</p>
            <p className="text-xs text-zinc-400">On time</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl portal-kpi-card animate-stagger space-y-1.5 sm:space-y-2" style={{ animationDelay: '100ms' }}>
            <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold text-amber-300 uppercase tracking-[0.14em] sm:tracking-[0.16em]">
              Late
            </span>
            <p className="portal-kpi-num text-3xl sm:text-4xl text-white">{late}</p>
            <p className="text-xs text-zinc-400">Recorded late</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl portal-kpi-card animate-stagger space-y-1.5 sm:space-y-2" style={{ animationDelay: '150ms' }}>
            <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold text-rose-300 uppercase tracking-[0.14em] sm:tracking-[0.16em]">
              Absent
            </span>
            <p className="portal-kpi-num text-3xl sm:text-4xl text-white">{absent}</p>
            <p className="text-xs text-zinc-400">Unexcused</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl portal-kpi-card animate-stagger space-y-1.5 sm:space-y-2" style={{ animationDelay: '200ms' }}>
            <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold text-sky-300 uppercase tracking-[0.14em] sm:tracking-[0.16em]">
              Excused
            </span>
            <p className="portal-kpi-num text-3xl sm:text-4xl text-white">{excused}</p>
            <p className="text-xs text-zinc-400">Notified</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="p-4 sm:p-6 lg:p-7 rounded-3xl portal-surface space-y-5">
          <h3 className="portal-heading text-xl sm:text-2xl text-white flex items-center gap-2.5 border-b border-white/[0.07] pb-4">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Attendance History Log</span>
          </h3>

          {studentAtt.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8" />}
              title="No Attendance Logs Yet"
              description={`Your attendance logs will appear here once recorded by ${adminName}.`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-400 font-mono uppercase tracking-[0.14em] text-[10.5px]">
                    <th className="pb-3.5 px-4">Session Date</th>
                    <th className="pb-3.5 px-4">Status</th>
                    <th className="pb-3.5 px-4">Instructor Feedback Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-medium">
                  {studentAtt.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.025]">
                      <td className="py-4 px-4 font-mono text-zinc-200 tabular-nums">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 px-4 text-zinc-300 text-sm font-normal">
                        {item.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
