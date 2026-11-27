'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, exportToCSV } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types';
import { CalendarCheck, Plus, Download, UserCheck } from 'lucide-react';

export default function AdminAttendancePage() {
  const { attendance, users, recordAttendance } = useStore();

  const allStudents = users.filter((u) => u.role === 'student');
  // Attendance logging applies strictly to enrolled (non-Pending/non-Rejected) students
  const activeStudents = allStudents.filter((u) => u.status === 'Active');
  const eligibleStudents =
    activeStudents.length > 0
      ? activeStudents
      : allStudents.filter((u) => u.status !== 'Pending' && u.status !== 'Rejected');

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const effectiveStudentId = eligibleStudents.some((s) => s.id === selectedStudentId)
    ? selectedStudentId
    : eligibleStudents[0]?.id || '';

  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('Present');
  const [attNotes, setAttNotes] = useState('');

  const [filterStudentId, setFilterStudentId] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const student = eligibleStudents.find((s) => s.id === effectiveStudentId);
    if (!student) return;

    recordAttendance({
      studentId: student.id,
      studentName: student.fullName,
      date: attDate,
      status: attStatus,
      notes: attNotes,
    });

    setAttNotes('');
  };

  const filteredAttendance = attendance.filter((item) => {
    const matchesStudent = filterStudentId === 'All' || item.studentId === filterStudentId;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesYear = filterYear === 'All' || item.date.startsWith(filterYear);

    return matchesStudent && matchesStatus && matchesYear;
  });

  const handleExportCSV = () => {
    const rows = filteredAttendance.map((a) => ({
      ID: a.id,
      StudentName: a.studentName,
      StudentID: a.studentId,
      Date: a.date,
      Status: a.status,
      Notes: a.notes || '',
    }));
    exportToCSV(`Chord_and_Craft_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Academy Attendance Logger"
        subtitle="Record session attendance, add mentor feedback comments, and export CSV reports."
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-6 sm:space-y-7">
        {/* Record New Attendance Card */}
        <section className="p-4 sm:p-6 lg:p-8 rounded-3xl portal-surface space-y-5 sm:space-y-6">
          <div className="border-b border-white/[0.07] pb-4">
            <h3 className="portal-heading text-xl sm:text-2xl text-white flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Mark Student Attendance Session</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Log live or studio class attendance; updates immediately on the student&apos;s portal.
            </p>
          </div>

          <form onSubmit={handleRecordAttendance} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* Student Select */}
            <div className="lg:col-span-4 space-y-2">
              <label className="block text-xs font-medium text-zinc-200">
                Select Student <span className="text-amber-400">*</span>
              </label>
              <select
                value={effectiveStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm cursor-pointer truncate"
                required
              >
                {eligibleStudents.length === 0 ? (
                  <option value="">No active students yet</option>
                ) : (
                  eligibleStudents.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.fullName} ({std.level || 'Beginner'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date Select */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-medium text-zinc-200">
                Session Date <span className="text-amber-400">*</span>
              </label>
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm tabular-nums [color-scheme:dark]"
                required
              />
            </div>

            {/* Status Select */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-medium text-zinc-200">
                Status <span className="text-amber-400">*</span>
              </label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm cursor-pointer"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            {/* Notes Input */}
            <div className="lg:col-span-3 space-y-2">
              <label className="block text-xs font-medium text-zinc-200">Mentor Note</label>
              <input
                type="text"
                value={attNotes}
                onChange={(e) => setAttNotes(e.target.value)}
                placeholder="e.g. Mastered alternate picking"
                className="w-full h-11 px-3.5 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={!effectiveStudentId}
                className="w-full h-11 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </section>

        {/* Filter Toolbar & CSV Export */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl portal-surface">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <span className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">Filters:</span>

            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="h-10 bg-[#09090d] border border-white/[0.09] text-white rounded-xl px-3.5 text-xs cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="All">All Students</option>
              {eligibleStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 bg-[#09090d] border border-white/[0.09] text-white rounded-xl px-3.5 text-xs cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excused">Excused</option>
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-10 bg-[#09090d] border border-white/[0.09] text-white rounded-xl px-3.5 text-xs cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full lg:w-auto h-10 px-4 rounded-xl luxury-btn-ghost text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Attendance Records Table */}
        <section className="p-4 sm:p-6 lg:p-7 rounded-3xl portal-surface space-y-5">
          <h3 className="portal-heading text-xl sm:text-2xl text-white flex items-center gap-2.5 border-b border-white/[0.07] pb-4">
            <CalendarCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Attendance Log Entries ({filteredAttendance.length})</span>
          </h3>

          {filteredAttendance.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="w-8 h-8" />}
              title="No Attendance Logs"
              description="No attendance records match the selected filters."
            />
          ) : (
            <>
              <div className="hidden md:block w-full">
                <table className="w-full table-fixed text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-zinc-400 font-mono uppercase tracking-[0.14em] text-[10.5px]">
                      <th className="pb-3.5 pr-4 w-[24%]">Student Name</th>
                      <th className="pb-3.5 px-3 w-[18%]">Session Date</th>
                      <th className="pb-3.5 px-3 w-[16%]">Status</th>
                      <th className="pb-3.5 pl-3 w-[42%]">Mentor Feedback Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] font-medium">
                    {filteredAttendance.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.025]">
                        <td className="py-4 pr-4 font-semibold text-white text-sm truncate">{item.studentName}</td>
                        <td className="py-4 px-3 font-mono text-zinc-300 tabular-nums whitespace-nowrap">{formatDate(item.date)}</td>
                        <td className="py-4 px-3">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="py-4 pl-3 text-zinc-300 text-sm font-normal break-words">{item.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredAttendance.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#09090d]/90 border border-white/[0.08] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white text-sm truncate">{item.studentName}</span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                    <p className="text-[11px] font-mono text-zinc-400 tabular-nums">{formatDate(item.date)}</p>
                    {item.notes && (
                      <p className="text-xs text-zinc-300 leading-relaxed pt-1 border-t border-white/[0.06]">
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
