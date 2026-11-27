'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmationModal } from '@/components/shared/ConfirmationModal';
import { Course, CourseEnrollment, CourseLevel } from '@/lib/types';
import { formatCurrency, getStudentEnrolledCourseIds } from '@/lib/utils';
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  isCloudinaryUrl,
} from '@/lib/uploadClient';
import {
  GraduationCap,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  BookOpen,
  Eye,
  EyeOff,
  Check,
  Ban,
  Copy,
  RefreshCw,
  Sparkles,
  ReceiptText,
} from 'lucide-react';

const COURSE_LEVELS: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export default function AdminCoursesPage() {
  const {
    courses,
    courseEnrollments,
    lessons,
    users,
    adminName,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourseEnrollments,
    approveCourseEnrollment,
    rejectCourseEnrollment,
    addToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'courses' | 'payments'>('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | CourseLevel>('All');

  // Payments tab filters
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>(
    'All'
  );
  const [paymentSearch, setPaymentSearch] = useState('');
  const [processingEnrollmentId, setProcessingEnrollmentId] = useState<string | null>(null);
  const [rejectingEnrollment, setRejectingEnrollment] = useState<CourseEnrollment | null>(null);
  const [rejectionNoteInput, setRejectionNoteInput] = useState('');
  const [isRefreshingPayments, setIsRefreshingPayments] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  // Course CRUD modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  // Course Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<CourseLevel>('Beginner');
  const [price, setPrice] = useState(3500);
  const [originalPrice, setOriginalPrice] = useState<string>('4500');
  const [duration, setDuration] = useState('8 Weeks');
  const [totalModules, setTotalModules] = useState(12);
  const [instructorName, setInstructorName] = useState(adminName || 'Julian Mercer');
  const [badge, setBadge] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);

  // Cloudinary upload states
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isDeletingThumb, setIsDeletingThumb] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedCourses.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.subtitle || '').toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [sortedCourses, searchQuery, selectedLevel]);

  const pendingEnrollments = useMemo(
    () => courseEnrollments.filter((e) => e.paymentStatus === 'Pending'),
    [courseEnrollments]
  );
  const verifiedEnrollments = useMemo(
    () => courseEnrollments.filter((e) => e.paymentStatus === 'Verified'),
    [courseEnrollments]
  );
  const verifiedRevenue = useMemo(
    () => verifiedEnrollments.reduce((sum, e) => sum + (e.totalAmount || 0), 0),
    [verifiedEnrollments]
  );

  const filteredEnrollments = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase();
    return courseEnrollments.filter((e) => {
      const matchesStatus = paymentFilter === 'All' || e.paymentStatus === paymentFilter;
      const matchesSearch =
        !q ||
        e.studentName.toLowerCase().includes(q) ||
        e.studentEmail.toLowerCase().includes(q) ||
        e.courseTitle.toLowerCase().includes(q) ||
        e.bKashTransactionId.toLowerCase().includes(q) ||
        e.bKashSenderMobile.includes(q) ||
        e.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [courseEnrollments, paymentFilter, paymentSearch]);

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);

  const getEnrolledStudentCount = (courseId: string) =>
    students.filter((s) => getStudentEnrolledCourseIds(s, users).includes(courseId)).length;

  const getLinkedLectureCount = (courseId: string) =>
    lessons.filter((l) => l.courseId === courseId).length;

  const resetForm = () => {
    setEditingCourse(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setLevel('Beginner');
    setPrice(3500);
    setOriginalPrice('4500');
    setDuration('8 Weeks');
    setTotalModules(12);
    setInstructorName(adminName || 'Julian Mercer');
    setBadge('');
    setThumbnail('');
    setHighlightsText(
      'HD YouTube Masterclasses\nPrintable PDF TAB Sheets\nStudio Backing Tracks\nCommon Academy Preview Classes'
    );
    setIsFeatured(true);
    setIsActive(true);
    setOrder(courses.length + 1);
    setUploadError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setSubtitle(course.subtitle || '');
    setDescription(course.description);
    setLevel(course.level);
    setPrice(course.price);
    setOriginalPrice(course.originalPrice ? String(course.originalPrice) : '');
    setDuration(course.duration || '8 Weeks');
    setTotalModules(course.totalModules || 10);
    setInstructorName(course.instructorName || adminName || 'Julian Mercer');
    setBadge(course.badge || '');
    setThumbnail(course.thumbnail || '');
    setHighlightsText((course.highlights || []).join('\n'));
    setIsFeatured(Boolean(course.isFeatured));
    setIsActive(course.isActive !== false);
    setOrder(course.order || 1);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingThumb(true);
    setUploadError('');
    try {
      const res = await uploadImageToCloudinary(file, 'chord_and_craft/courses');
      if (res.url) setThumbnail(res.url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to upload cover image to Cloudinary.'
      );
    } finally {
      setIsUploadingThumb(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveThumb = async () => {
    if (!thumbnail) return;
    setIsDeletingThumb(true);
    setUploadError('');
    try {
      if (isCloudinaryUrl(thumbnail)) {
        await deleteImageFromCloudinary(thumbnail);
      }
      setThumbnail('');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to delete cover image.');
    } finally {
      setIsDeletingThumb(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const highlights = highlightsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedOriginal = originalPrice.trim() ? Number(originalPrice) : undefined;
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      level,
      price: Math.max(0, Number(price) || 0),
      originalPrice:
        parsedOriginal && !Number.isNaN(parsedOriginal) && parsedOriginal > 0
          ? parsedOriginal
          : undefined,
      duration: duration.trim() || '8 Weeks',
      totalModules: Math.max(1, Number(totalModules) || 1),
      instructorName: instructorName.trim() || adminName || 'Julian Mercer',
      badge: badge.trim() || undefined,
      thumbnail:
        thumbnail.trim() ||
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
      highlights,
      isFeatured,
      isActive,
      order: Math.max(1, Number(order) || 1),
    };

    setIsSavingCourse(true);
    try {
      const res = editingCourse
        ? await updateCourse(editingCourse.id, payload)
        : await createCourse(payload);

      if (res.success) {
        setIsModalOpen(false);
        resetForm();
      } else {
        addToast(res.error || 'Could not save course.', 'error');
      }
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleToggleCourseActive = async (course: Course) => {
    await updateCourse(course.id, { isActive: !(course.isActive !== false) });
  };

  const handleToggleCourseFeatured = async (course: Course) => {
    await updateCourse(course.id, { isFeatured: !course.isFeatured });
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    setProcessingEnrollmentId(enrollmentId);
    try {
      await approveCourseEnrollment(enrollmentId);
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleConfirmRejectEnrollment = async () => {
    if (!rejectingEnrollment) return;
    setProcessingEnrollmentId(rejectingEnrollment.id);
    try {
      await rejectCourseEnrollment(
        rejectingEnrollment.id,
        rejectionNoteInput.trim() ||
          'Payment TrxID could not be verified. Please check your bKash transfer and resubmit.'
      );
      setRejectingEnrollment(null);
      setRejectionNoteInput('');
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleRefreshPayments = async () => {
    setIsRefreshingPayments(true);
    try {
      await refreshCourseEnrollments();
      addToast('Course payment verifications refreshed.', 'info');
    } finally {
      setIsRefreshingPayments(false);
    }
  };

  const handleCopyTx = (txId: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(txId);
      setCopiedTxId(txId);
      setTimeout(() => setCopiedTxId(null), 1800);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 font-sans">
      <DashboardHeader
        title="Courses & Tuition Verifications"
        subtitle="Create and customize conservatory courses, choose which courses preview on the homepage, and verify student bKash tuition payments."
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto space-y-6">
        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className="p-4 sm:p-5 rounded-2xl portal-kpi-card text-left flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block truncate">
                Academy Courses
              </span>
              <p className="portal-kpi-num text-3xl sm:text-4xl text-white">{courses.length}</p>
              <p className="text-[11px] text-zinc-400">
                {courses.filter((c) => c.isActive !== false).length} Active Live
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/12 border border-amber-400/25 text-amber-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('payments');
              setPaymentFilter('Pending');
            }}
            className={`p-4 sm:p-5 rounded-2xl portal-kpi-card text-left flex items-center justify-between gap-2 cursor-pointer ${
              pendingEnrollments.length > 0
                ? 'border-amber-400/50 shadow-[0_0_24px_-10px_rgba(245,158,11,0.35)]'
                : ''
            }`}
          >
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-mono font-semibold text-amber-300 uppercase tracking-wider block truncate">
                Pending bKash
              </span>
              <p className="portal-kpi-num text-3xl sm:text-4xl text-amber-300">
                {pendingEnrollments.length}
              </p>
              <p className="text-[11px] text-amber-200/80">
                {pendingEnrollments.length > 0 ? 'Needs Verification' : 'Queue Clear'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('payments');
              setPaymentFilter('Verified');
            }}
            className="p-4 sm:p-5 rounded-2xl portal-kpi-card text-left flex items-center justify-between gap-2 cursor-pointer"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-mono font-semibold text-emerald-300 uppercase tracking-wider block truncate">
                Verified Enrollments
              </span>
              <p className="portal-kpi-num text-3xl sm:text-4xl text-white">
                {verifiedEnrollments.length}
              </p>
              <p className="text-[11px] text-zinc-400">Approved Courses</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/12 border border-emerald-400/25 text-emerald-300 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </button>

          <div className="p-4 sm:p-5 rounded-2xl portal-kpi-card flex items-center justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider block truncate">
                Tuition Revenue
              </span>
              <p className="portal-kpi-num text-2xl sm:text-3xl text-amber-300 truncate">
                {formatCurrency(verifiedRevenue)}
              </p>
              <p className="text-[11px] text-zinc-400">Verified Course Fees</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/12 border border-purple-400/25 text-purple-300 shrink-0">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0b0b10] border border-white/[0.08] w-full sm:w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'courses'
                  ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Courses Catalog ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'bg-amber-500/18 text-amber-200 border border-amber-400/35'
                  : 'text-zinc-400 hover:text-white border border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>bKash Verifications</span>
              {pendingEnrollments.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-mono font-bold text-[10px]">
                  {pendingEnrollments.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'courses' ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-11 px-5 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Course</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRefreshPayments}
              disabled={isRefreshingPayments}
              className="h-10 px-4 rounded-xl luxury-btn-ghost text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPayments ? 'animate-spin' : ''}`} />
              <span>Refresh Payments</span>
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: COURSES CATALOG MANAGEMENT                                 */}
        {/* ================================================================= */}
        {activeTab === 'courses' && (
          <div className="space-y-5 animate-portal-enter">
            {/* Search & Level Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl portal-surface">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses by title or description..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as 'All' | CourseLevel)}
                className="h-11 bg-[#09090d] border border-white/[0.09] text-white rounded-xl px-4 text-xs font-medium cursor-pointer"
              >
                <option value="All">All Levels ({courses.length})</option>
                {COURSE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {filteredCourses.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="w-8 h-8" />}
                title="No Courses Found"
                description="Create a new course or adjust your level/search filters."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredCourses.map((course) => {
                  const enrolledCount = getEnrolledStudentCount(course.id);
                  const lectureCount = getLinkedLectureCount(course.id);
                  const courseActive = course.isActive !== false;

                  return (
                    <div
                      key={course.id}
                      className={`rounded-3xl portal-surface overflow-hidden flex flex-col justify-between border transition ${
                        courseActive
                          ? 'border-white/[0.08] hover:border-amber-400/35'
                          : 'border-white/[0.05] opacity-75'
                      }`}
                    >
                      <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative w-full sm:w-36 h-32 sm:h-28 rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.08] shrink-0">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                            {course.badge && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 font-mono font-bold text-[9.5px] uppercase">
                                {course.badge}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <StatusBadge status={course.level} size="sm" />
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                    courseActive
                                      ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/30'
                                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                  }`}
                                >
                                  {courseActive ? 'Published' : 'Hidden'}
                                </span>
                              </div>
                              <span className="text-[10.5px] font-mono text-zinc-500">
                                ID: {course.id}
                              </span>
                            </div>

                            <h3 className="font-display text-xl font-semibold text-white leading-snug">
                              {course.title}
                            </h3>
                            {course.subtitle && (
                              <p className="text-xs text-amber-200/80 font-medium">
                                {course.subtitle}
                              </p>
                            )}
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                        </div>

                        {/* Stats Strip */}
                        <div className="grid grid-cols-3 gap-2.5 text-center">
                          <div className="p-2.5 rounded-xl bg-[#09090d] border border-white/[0.06]">
                            <p className="text-[10px] font-mono uppercase text-zinc-500">Tuition</p>
                            <p className="font-mono text-sm font-extrabold text-amber-300 tabular-nums mt-0.5">
                              {formatCurrency(course.price)}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#09090d] border border-white/[0.06]">
                            <p className="text-[10px] font-mono uppercase text-zinc-500">
                              Enrolled
                            </p>
                            <p className="font-mono text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                              <Users className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{enrolledCount}</span>
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#09090d] border border-white/[0.06]">
                            <p className="text-[10px] font-mono uppercase text-zinc-500">
                              Lectures
                            </p>
                            <p className="font-mono text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              <span>{lectureCount}</span>
                            </p>
                          </div>
                        </div>

                        {course.highlights && course.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {course.highlights.slice(0, 4).map((hl, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10.5px] text-zinc-300"
                              >
                                ✓ {hl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="px-4 sm:px-6 py-3.5 bg-white/[0.02] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCourseActive(course)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition inline-flex items-center gap-1.5 cursor-pointer ${
                              courseActive
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                                : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-white'
                            }`}
                          >
                            {courseActive ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                            <span>{courseActive ? 'Published' : 'Hidden'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCourseFeatured(course)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition inline-flex items-center gap-1.5 cursor-pointer ${
                              course.isFeatured
                                ? 'bg-amber-500/15 text-amber-200 border-amber-400/35 hover:bg-amber-500/25'
                                : 'bg-zinc-900 text-zinc-400 border-white/[0.08] hover:text-zinc-200'
                            }`}
                            title="Toggle whether this course previews in the Homepage Courses section"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{course.isFeatured ? 'Homepage Preview' : 'Catalog Only'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(course)}
                            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-200 font-bold text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Customize</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingCourseId(course.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 transition cursor-pointer"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: COURSE ENROLLMENT bKash PAYMENT VERIFICATIONS              */}
        {/* ================================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-5 animate-portal-enter">
            {/* Search & Status Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl portal-surface">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by student, email, course, or bKash TrxID..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(['All', 'Pending', 'Verified', 'Rejected'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPaymentFilter(status)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      paymentFilter === status
                        ? 'bg-amber-500/18 text-amber-200 border-amber-400/40'
                        : 'bg-[#09090d] text-zinc-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {status}
                    {status === 'Pending' && pendingEnrollments.length > 0
                      ? ` (${pendingEnrollments.length})`
                      : ''}
                  </button>
                ))}
              </div>
            </div>

            {filteredEnrollments.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck className="w-8 h-8" />}
                title="No Course Payment Records"
                description="Submitted student bKash course tuition verifications will appear here."
              />
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enr) => {
                  const isPending = enr.paymentStatus === 'Pending';
                  const isBusy = processingEnrollmentId === enr.id;

                  return (
                    <div
                      key={enr.id}
                      className={`p-4 sm:p-6 rounded-3xl portal-surface border transition space-y-4 ${
                        isPending
                          ? 'border-amber-400/45 shadow-[0_0_24px_-12px_rgba(245,158,11,0.3)]'
                          : 'border-white/[0.08]'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Info */}
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-300">
                              {enr.id}
                            </span>
                            <StatusBadge status={enr.paymentStatus} size="sm" />
                            <span className="text-[11px] font-mono text-zinc-500">
                              {enr.createdAt}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-white">
                              {enr.studentName}{' '}
                              <span className="text-xs font-mono font-normal text-zinc-400">
                                ({enr.studentEmail})
                              </span>
                            </h3>
                            <p className="text-xs sm:text-sm text-amber-200 font-semibold mt-0.5 flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{enr.courseTitle}</span>
                            </p>
                          </div>

                          {/* bKash Proof Strip */}
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="px-3 py-1.5 rounded-xl bg-[#09090d] border border-white/[0.08] text-xs font-mono flex items-center gap-2">
                              <span className="text-zinc-400">TrxID:</span>
                              <span className="text-amber-300 font-bold">
                                {enr.bKashTransactionId}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTx(enr.bKashTransactionId)}
                                className="text-zinc-400 hover:text-amber-300 cursor-pointer"
                                title="Copy TrxID"
                              >
                                {copiedTxId === enr.bKashTransactionId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="px-3 py-1.5 rounded-xl bg-[#09090d] border border-white/[0.08] text-xs font-mono">
                              <span className="text-zinc-400">Sender: </span>
                              <span className="text-white">{enr.bKashSenderMobile}</span>
                            </div>

                            <div className="px-3 py-1.5 rounded-xl bg-[#09090d] border border-white/[0.08] text-xs font-mono">
                              <span className="text-zinc-400">Paid: </span>
                              <span className="text-emerald-300 font-bold">
                                {formatCurrency(enr.totalAmount)}
                              </span>
                              {enr.couponCode && (enr.couponDiscount || 0) > 0 && (
                                <span className="text-zinc-500 ml-1">
                                  ({enr.couponCode} -{formatCurrency(enr.couponDiscount || 0)})
                                </span>
                              )}
                            </div>
                          </div>

                          {enr.rejectionNote && enr.paymentStatus === 'Rejected' && (
                            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-xl">
                              Rejection Note: {enr.rejectionNote}
                            </p>
                          )}
                        </div>

                        {/* Right Action Controls */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.07]">
                          {isBusy ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-amber-300 text-xs font-bold">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveEnrollment(enr.id)}
                                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Verify &amp; Unlock Course</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingEnrollment(enr);
                                  setRejectionNoteInput('');
                                }}
                                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : enr.paymentStatus === 'Verified' ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/12 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verified &amp; Enrolled</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApproveEnrollment(enr.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition cursor-pointer"
                            >
                              Approve Anyway
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* CREATE / EDIT COURSE MODAL                                        */}
      {/* ================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="luxury-glass gold-border-glow rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92dvh] overflow-y-auto animate-scale-up">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="portal-heading text-2xl sm:text-3xl text-white">
                  {editingCourse ? 'Customize Course' : 'Create New Course'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure curriculum details, tuition fee, cover media, and highlights. Changes sync live to the homepage, signup, and student portals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-200">
                    Course Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Acoustic Fingerstyle Mastery"
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-200">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Foundation to Expressive Solo Arrangements"
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-200">
                    Course Description <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will master in this course..."
                    className="w-full p-3.5 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm leading-relaxed"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CourseLevel)}
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm cursor-pointer"
                  >
                    {COURSE_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Instructor / Mentor
                  </label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Tuition Price (BDT ৳) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Original Price (Optional Strikethrough)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 8 Weeks"
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">Total Modules</label>
                  <input
                    type="number"
                    min={1}
                    value={totalModules}
                    onChange={(e) => setTotalModules(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Most Popular"
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-200">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-sm"
                  />
                </div>
              </div>

              {/* Cover Thumbnail */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-zinc-200">
                    Course Cover Image (Cloudinary or URL)
                  </label>
                  {thumbnail && (
                    <button
                      type="button"
                      disabled={isDeletingThumb || isUploadingThumb}
                      onClick={handleRemoveThumb}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      {isDeletingThumb ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2.5">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt="Course cover"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-400/35 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#09090d] border border-white/[0.09] flex items-center justify-center text-zinc-500 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full h-11 pl-3.5 pr-24 rounded-xl bg-[#09090d] border border-white/[0.09] text-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      disabled={isUploadingThumb}
                      onClick={() => thumbInputRef.current?.click()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUploadingThumb ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingThumb ? '...' : 'Upload'}</span>
                    </button>
                  </div>
                </div>
                {uploadError && <p className="text-[11px] text-rose-400">{uploadError}</p>}
              </div>

              {/* Highlights */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-200">
                  Course Highlights (one bullet per line)
                </label>
                <textarea
                  rows={4}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder={'12 HD Masterclasses\nPrintable PDF TABs\nStudio Backing Tracks'}
                  className="w-full p-3.5 rounded-xl bg-[#09090d] border border-white/[0.09] text-white text-xs leading-relaxed font-mono"
                />
              </div>

              {/* Visibility Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-2xl bg-[#09090d] border border-white/[0.08] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preview on Homepage</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Show in homepage preview strip (all published courses appear on /courses)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </label>

                <label className="p-3.5 rounded-2xl bg-[#09090d] border border-white/[0.08] flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-white">Published &amp; Open</p>
                    <p className="text-[11px] text-zinc-500">Allow students to enroll</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex flex-col-reverse sm:flex-row justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 rounded-xl luxury-btn-ghost text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCourse}
                  className="h-11 px-6 rounded-xl luxury-btn-primary font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingCourse
                    ? 'Saving...'
                    : editingCourse
                    ? 'Save Course Changes'
                    : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectingEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                <span>Reject Course Payment</span>
              </h4>
              <button
                type="button"
                onClick={() => setRejectingEnrollment(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Rejecting payment <strong className="font-mono text-white">{rejectingEnrollment.bKashTransactionId}</strong> for{' '}
              <strong className="text-white">{rejectingEnrollment.studentName}</strong> will notify them in the Payment Lobby so they can resubmit a valid TrxID.
            </p>
            <textarea
              rows={3}
              value={rejectionNoteInput}
              onChange={(e) => setRejectionNoteInput(e.target.value)}
              placeholder="Optional reason shown to student (e.g. TrxID not found in bKash statement)..."
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs"
            />
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingEnrollment(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectEnrollment}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingCourseId)}
        title="Delete Course"
        description="Are you sure you want to delete this course from the academy catalog? Existing lessons linked to it will remain safely in your curriculum library."
        confirmText="Delete Course"
        isDestructive
        onConfirm={() => {
          if (deletingCourseId) deleteCourse(deletingCourseId);
        }}
        onClose={() => setDeletingCourseId(null)}
      />
    </div>
  );
}
