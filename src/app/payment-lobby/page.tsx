'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, getStudentEnrolledCourseIds, isValidMobile } from '@/lib/utils';
import { Coupon, StudentLevel } from '@/lib/types';
import {
  ShieldCheck,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Tag,
  X,
  Sparkles,
  RefreshCw,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Info,
  Lock,
  BookOpen,
  Smartphone,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  Award,
} from 'lucide-react';

const SKILL_TIERS: { id: StudentLevel; label: string; desc: string }[] = [
  { id: 'Beginner', label: 'Beginner', desc: 'Open chords, rhythm & picking' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'CAGED, barre & pentatonics' },
  { id: 'Advanced', label: 'Advanced', desc: 'Sweep, legato, modes & phrasing' },
];

function PaymentLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCourseId = searchParams.get('course') || '';

  const {
    currentUser,
    activeRole,
    isAuthLoading,
    courses,
    courseEnrollments,
    platformSettings,
    validateCoupon,
    submitCourseEnrollmentPayment,
    refreshCurrentUser,
    logout,
    addToast,
    adminName,
  } = useStore();

  const activeCourses = useMemo(
    () =>
      [...courses]
        .filter((c) => c.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [courses]
  );

  const enrolledCourseIds = useMemo(
    () => (currentUser ? getStudentEnrolledCourseIds(currentUser) : []),
    [currentUser]
  );

  const myEnrollments = useMemo(() => {
    if (!currentUser) return [];
    return courseEnrollments.filter(
      (e) =>
        e.studentId === currentUser.id ||
        (e.studentEmail &&
          currentUser.email &&
          e.studentEmail.toLowerCase() === currentUser.email.toLowerCase())
    );
  }, [courseEnrollments, currentUser]);

  const latestPendingEnrollment = useMemo(
    () =>
      myEnrollments.find(
        (e) => e.paymentStatus === 'Pending' || e.enrollmentStatus === 'Pending Verification'
      ) || null,
    [myEnrollments]
  );

  // Student onboarding details (draft state overrides currentUser cleanly — ideal for Google sign-ups!)
  const [fullNameDraft, setFullNameDraft] = useState<string | null>(null);
  const [mobileDraft, setMobileDraft] = useState<string | null>(null);
  const [dobDraft, setDobDraft] = useState<string | null>(null);
  const [levelDraft, setLevelDraft] = useState<StudentLevel | null>(null);

  const studentFullName = fullNameDraft ?? (currentUser?.fullName || '');
  const studentMobile = mobileDraft ?? (currentUser?.mobile || '');
  const studentDob = dobDraft ?? (currentUser?.dateOfBirth || '');

  // Initial level matches URL ?course= or currentUser.level
  const defaultLevel = useMemo<StudentLevel>(() => {
    if (queryCourseId) {
      const matched = activeCourses.find((c) => c.id === queryCourseId);
      if (
        matched &&
        (matched.level === 'Beginner' ||
          matched.level === 'Intermediate' ||
          matched.level === 'Advanced')
      ) {
        return matched.level;
      }
    }
    if (
      currentUser?.level === 'Beginner' ||
      currentUser?.level === 'Intermediate' ||
      currentUser?.level === 'Advanced'
    ) {
      return currentUser.level;
    }
    return 'Beginner';
  }, [queryCourseId, activeCourses, currentUser]);

  const selectedLevel: StudentLevel = levelDraft ?? defaultLevel;

  // Courses filtered dynamically by selected expertise level (+ All Levels tracks)
  const levelFilteredCourses = useMemo(() => {
    const exactAndAll = activeCourses.filter(
      (c) => c.level === selectedLevel || c.level === 'All Levels'
    );
    const sorted = [...exactAndAll].sort((a, b) => {
      const aExact = a.level === selectedLevel ? 0 : 1;
      const bExact = b.level === selectedLevel ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return (a.order || 0) - (b.order || 0);
    });
    return sorted.length > 0 ? sorted : activeCourses;
  }, [activeCourses, selectedLevel]);

  const [pickedCourseId, setPickedCourseId] = useState<string>('');
  const userSelectedCourseId = currentUser?.selectedCourseId || '';

  const isPendingAccountGate = currentUser?.status !== 'Active';

  // For Pending students, filter course dropdown by expertise level; for Active students adding another course, show all active courses
  const dropdownCourses = isPendingAccountGate ? levelFilteredCourses : activeCourses;

  const selectedCourseId = useMemo(() => {
    if (pickedCourseId && dropdownCourses.some((c) => c.id === pickedCourseId)) {
      return pickedCourseId;
    }
    if (queryCourseId && dropdownCourses.some((c) => c.id === queryCourseId)) {
      return queryCourseId;
    }
    if (
      latestPendingEnrollment &&
      activeCourses.some((c) => c.id === latestPendingEnrollment.courseId)
    ) {
      return latestPendingEnrollment.courseId;
    }
    if (userSelectedCourseId && dropdownCourses.some((c) => c.id === userSelectedCourseId)) {
      return userSelectedCourseId;
    }
    const firstUnenrolled = dropdownCourses.find((c) => !enrolledCourseIds.includes(c.id));
    return firstUnenrolled?.id || dropdownCourses[0]?.id || '';
  }, [
    pickedCourseId,
    queryCourseId,
    latestPendingEnrollment,
    userSelectedCourseId,
    dropdownCourses,
    activeCourses,
    enrolledCourseIds,
  ]);

  const selectedCourse = activeCourses.find((c) => c.id === selectedCourseId) || null;
  const isAlreadyEnrolledInSelected =
    Boolean(selectedCourse) &&
    currentUser?.status === 'Active' &&
    enrolledCourseIds.includes(selectedCourse!.id);

  // Enrollment records for the currently selected course (or any pending enrollment for pending accounts)
  const pendingForSelected = useMemo(() => {
    const exact = myEnrollments.find(
      (e) =>
        e.courseId === selectedCourseId &&
        (e.paymentStatus === 'Pending' || e.enrollmentStatus === 'Pending Verification')
    );
    if (exact) return exact;
    if (isPendingAccountGate && latestPendingEnrollment) return latestPendingEnrollment;
    return null;
  }, [myEnrollments, selectedCourseId, isPendingAccountGate, latestPendingEnrollment]);

  const rejectedForSelected = useMemo(
    () =>
      myEnrollments.find(
        (e) =>
          e.courseId === selectedCourseId &&
          (e.paymentStatus === 'Rejected' || e.enrollmentStatus === 'Rejected')
      ) || null,
    [myEnrollments, selectedCourseId]
  );

  const [bKashSenderMobileDraft, setBKashSenderMobileDraft] = useState<string | null>(null);
  const [bKashTxId, setBKashTxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Auto-default bKash sender mobile from the student's contact mobile until manually edited
  const effectiveSenderMobile = bKashSenderMobileDraft ?? studentMobile;

  // Auth guard: guests -> login, admins -> admin dashboard
  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser) {
        const redirectTarget = queryCourseId
          ? `/payment-lobby?course=${encodeURIComponent(queryCourseId)}`
          : '/payment-lobby';
        router.replace(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
      } else if (activeRole === 'admin' || currentUser.role === 'admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [currentUser, activeRole, isAuthLoading, queryCourseId, router]);

  // Auto-poll verification status every 5 seconds while waiting for Admin verification
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student' || justUnlocked) return;
    const isWaitingForVerification =
      currentUser.status !== 'Active' || Boolean(pendingForSelected);
    if (!isWaitingForVerification) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await refreshCurrentUser();
        if (!fresh) return;
        const freshCourses = getStudentEnrolledCourseIds(fresh);
        if (currentUser.status !== 'Active' && fresh.status === 'Active') {
          setJustUnlocked(true);
          addToast(
            'Payment verified by Admin! Launching your Student Dashboard...',
            'success'
          );
          setTimeout(() => {
            router.replace('/student/dashboard');
          }, 1100);
        } else if (
          pendingForSelected &&
          fresh.status === 'Active' &&
          freshCourses.includes(pendingForSelected.courseId)
        ) {
          setJustUnlocked(true);
          addToast(
            `Enrollment verified! "${pendingForSelected.courseTitle}" is now unlocked.`,
            'success'
          );
          setTimeout(() => {
            router.replace(
              `/student/lessons?course=${encodeURIComponent(pendingForSelected.courseId)}`
            );
          }, 1100);
        }
      } catch {
        // silent poll
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, pendingForSelected, justUnlocked, refreshCurrentUser, addToast, router]);

  const coursePrice = selectedCourse?.price ?? 0;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const res = validateCoupon(appliedCoupon.code, coursePrice);
    return res.valid ? res.discount : 0;
  }, [appliedCoupon, coursePrice, validateCoupon]);

  const totalPayable = Math.max(0, coursePrice - couponDiscount);

  const handleCopyBkash = () => {
    const num = platformSettings?.bKashNumber || '01711-000000';
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(num.replace(/\s+/g, ''));
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    }
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccessMsg('');

    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const res = validateCoupon(couponInput.trim(), coursePrice);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccessMsg(
        `Coupon "${res.coupon.code}" applied! You save ${formatCurrency(res.discount)}.`
      );
    } else {
      setAppliedCoupon(null);
      setCouponError(res.error || 'Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccessMsg('');
  };

  const handleLevelChange = (nextLevel: StudentLevel) => {
    setLevelDraft(nextLevel);
    setPickedCourseId('');
    setErrorMsg('');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isPendingAccountGate) {
      if (!studentFullName.trim()) {
        setErrorMsg('Please enter your full name to complete your enrollment profile.');
        return;
      }
      if (!studentMobile.trim() || !isValidMobile(studentMobile.trim())) {
        setErrorMsg(
          'Please enter a valid 11-digit contact mobile number (e.g. 01712345678).'
        );
        return;
      }
    }

    if (!selectedCourse) {
      setErrorMsg('Please select a course before submitting payment.');
      return;
    }

    const sender = effectiveSenderMobile.trim();
    const txId = bKashTxId.trim().toUpperCase();

    if (!sender || !isValidMobile(sender)) {
      setErrorMsg(
        'Please enter a valid 11-digit bKash sender mobile number (e.g. 01712345678).'
      );
      return;
    }

    if (txId.length < 6) {
      setErrorMsg('Please enter your valid bKash Transaction ID (TrxID, min 6 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCourseEnrollmentPayment({
        courseId: selectedCourse.id,
        bKashSenderMobile: sender,
        bKashTransactionId: txId,
        couponCode: appliedCoupon && couponDiscount > 0 ? appliedCoupon.code : undefined,
        studentName: studentFullName.trim() || undefined,
        studentMobile: studentMobile.trim() || sender,
        dateOfBirth: studentDob.trim() || undefined,
        level: isPendingAccountGate ? selectedLevel : undefined,
      });

      if (res.success) {
        setBKashTxId('');
      } else {
        setErrorMsg(res.error || 'Could not submit bKash payment. Please check your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualStatusCheck = async () => {
    setIsCheckingStatus(true);
    try {
      const fresh = await refreshCurrentUser();
      setCheckCount((c) => c + 1);
      if (!fresh) return;
      const freshCourses = getStudentEnrolledCourseIds(fresh);
      if (fresh.status === 'Active' && currentUser?.status !== 'Active') {
        setJustUnlocked(true);
        addToast('Payment verified! Launching your Student Dashboard...', 'success');
        setTimeout(() => router.replace('/student/dashboard'), 900);
      } else if (
        pendingForSelected &&
        fresh.status === 'Active' &&
        freshCourses.includes(pendingForSelected.courseId)
      ) {
        setJustUnlocked(true);
        addToast(
          `Verified! "${pendingForSelected.courseTitle}" is unlocked in your portal.`,
          'success'
        );
        setTimeout(
          () =>
            router.replace(
              `/student/lessons?course=${encodeURIComponent(pendingForSelected.courseId)}`
            ),
          900
        );
      }
    } finally {
      setTimeout(() => setIsCheckingStatus(false), 450);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  if (isAuthLoading || !currentUser || currentUser.role !== 'student') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-amber-400">
        <div className="flex items-center gap-2.5 text-sm font-mono">
          <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Opening Enrollment Lobby...</span>
        </div>
      </div>
    );
  }

  const needsProfileCompletion =
    isPendingAccountGate && (!currentUser.mobile || !isValidMobile(currentUser.mobile));

  const pendingCourseObj = pendingForSelected
    ? activeCourses.find((c) => c.id === pendingForSelected.courseId) || selectedCourse
    : selectedCourse;

  const inputClass =
    'w-full h-11 rounded-xl bg-[#09090d] border border-white/[0.1] text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-amber-400/75 transition';

  return (
    <div className="min-h-[calc(100dvh-72px)] relative py-7 sm:py-11 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 font-sans text-zinc-100">
      {/* Atmospheric glow */}
      <div className="fixed top-28 left-1/2 -translate-x-1/2 w-[360px] sm:w-[700px] h-[280px] bg-amber-500/[0.06] rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/12 border border-amber-400/35 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isPendingAccountGate ? 'Enrollment & Payment Lobby' : 'Course Payment Lobby'}</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-semibold text-white tracking-tight">
            {pendingForSelected
              ? 'Waiting for Payment Verification'
              : isPendingAccountGate
              ? 'Complete Enrollment & Payment'
              : 'Enroll in an Academy Course'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            {pendingForSelected
              ? `Thank you, ${currentUser.fullName}. Your details and bKash tuition payment have been submitted and are queued for verification by ${adminName} & our admin team.`
              : isPendingAccountGate
              ? `Welcome, ${currentUser.fullName}. Confirm your details, select your expertise level & course, and complete bKash tuition payment to unlock your Student Dashboard.`
              : `Logged in as ${currentUser.fullName}. Choose an additional course below and submit your bKash tuition payment for verification.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {!isPendingAccountGate ? (
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl luxury-btn-ghost text-zinc-200 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Student Dashboard</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/35 text-zinc-300 hover:text-rose-200 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Strict Access Gate Notice for Pending Students */}
      {isPendingAccountGate && !justUnlocked && (
        <div className="relative z-10 p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-400/30 flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-[13px] text-amber-100/90 leading-relaxed">
            <strong className="text-amber-300 font-semibold">
              Student Dashboard Locked Until Payment Verification:
            </strong>{' '}
            {needsProfileCompletion && !pendingForSelected
              ? 'Complete your student details, select your course, and submit your bKash payment below. Once approved by Admin, your Student Dashboard will unlock automatically.'
              : 'Your access to course lectures, PDF TABs, and the Student Dashboard stays locked until your bKash payment is verified and approved by Admin.'}
          </div>
        </div>
      )}

      {/* Unlocked Celebration State */}
      {justUnlocked ? (
        <div className="relative z-10 max-w-xl mx-auto p-6 sm:p-10 rounded-3xl luxury-glass gold-border-glow text-center space-y-5 animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Payment Verified &amp; Approved</span>
            </span>
            <h2 className="font-display text-3xl text-white font-semibold">
              Welcome to Your Conservatory!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Your course tuition has been verified. Redirecting you to your unlocked courses and lectures now...
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="w-full py-3.5 rounded-xl luxury-btn-primary font-bold text-sm inline-flex items-center justify-center gap-2"
          >
            <span>Enter Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : pendingForSelected ? (
        /* STATE B: WAITING FOR ADMIN PAYMENT VERIFICATION */
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-5 sm:p-8 rounded-3xl luxury-glass gold-border-glow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-white/[0.08] pb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 relative">
                <Clock className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Awaiting Admin Payment Verification</span>
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                  Enrollment &amp; Payment Submitted!
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Our admin team is verifying your bKash Transaction ID. Your Student Dashboard will unlock automatically once approved.
                </p>
              </div>
            </div>

            {/* Student Details Snapshot */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08] space-y-3 text-xs">
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/[0.06] pb-2">
                Submitted Student Profile
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Full Name</span>
                  <p className="text-white font-semibold mt-0.5 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{currentUser.fullName}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Email</span>
                  <p className="text-zinc-300 font-mono mt-0.5 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{currentUser.email}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Mobile Number</span>
                  <p className="text-zinc-200 font-mono mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{currentUser.mobile || pendingForSelected.studentMobile}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Expertise Level</span>
                  <p className="text-amber-300 font-semibold mt-0.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{currentUser.level || 'Beginner'} Level</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Verification Receipt */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08] space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  bKash Payment Summary
                </span>
                <span className="font-mono text-[11px] text-amber-300 font-bold">
                  {pendingForSelected.id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Selected Course</span>
                <span className="text-white font-semibold text-right">
                  {pendingForSelected.courseTitle}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">bKash Sender Mobile</span>
                <span className="text-white font-mono">{pendingForSelected.bKashSenderMobile}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">bKash Transaction ID</span>
                <span className="text-amber-300 font-mono font-bold">
                  {pendingForSelected.bKashTransactionId}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Course Tuition</span>
                <span className="text-zinc-200 font-mono">
                  {formatCurrency(pendingForSelected.coursePrice)}
                </span>
              </div>

              {pendingForSelected.couponCode && (pendingForSelected.couponDiscount || 0) > 0 && (
                <div className="flex justify-between gap-4 text-emerald-300">
                  <span>Coupon ({pendingForSelected.couponCode})</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(pendingForSelected.couponDiscount || 0)}
                  </span>
                </div>
              )}

              <div className="pt-2.5 border-t border-white/[0.08] flex justify-between items-baseline">
                <span className="text-white font-bold">Total Paid via bKash</span>
                <span className="font-mono text-lg font-extrabold text-amber-300">
                  {formatCurrency(pendingForSelected.totalAmount)}
                </span>
              </div>
            </div>

            {/* 3-Step Verification Progress */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.07]">
              <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Verification Progress
              </p>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300">
                    1. Student Details &amp; Course Saved
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {currentUser.fullName} • {pendingForSelected.courseTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300">
                    2. bKash Payment Proof Submitted
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    TrxID {pendingForSelected.bKashTransactionId} received on {pendingForSelected.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-300">
                    3. Admin Verification &amp; Dashboard Activation (In Progress)
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Once verified, your Student Dashboard and course lectures unlock automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleManualStatusCheck}
                disabled={isCheckingStatus}
                className="w-full py-3.5 rounded-xl luxury-btn-primary font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>
                  {isCheckingStatus
                    ? 'Checking Live Verification Status...'
                    : 'Check Payment Verification Status'}
                </span>
              </button>

              {checkCount > 0 && (
                <p className="text-center text-[11px] text-zinc-400 font-mono">
                  Checked live with database — still pending Admin verification. Auto-refreshing every 5s.
                </p>
              )}
            </div>
          </div>

          {/* Right Side: Course Info & Support Card */}
          <div className="lg:col-span-5 space-y-5">
            {pendingCourseObj && (
              <div className="p-5 rounded-3xl luxury-glass space-y-4">
                <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.08]">
                  <img
                    src={pendingCourseObj.thumbnail}
                    alt={pendingCourseObj.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-amber-300">
                    {pendingCourseObj.level} • {pendingCourseObj.duration}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {pendingCourseObj.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {pendingCourseObj.description}
                  </p>
                </div>
              </div>
            )}

            <div className="p-5 rounded-3xl bg-[#0c0c10] border border-white/[0.07] space-y-3 text-xs">
              <h4 className="text-amber-300 font-mono text-[11px] uppercase tracking-wider font-bold">
                Need Help With Payment?
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                If you entered the wrong TrxID or need faster verification, contact academy support with your enrollment ID{' '}
                <span className="font-mono text-zinc-200">{pendingForSelected.id}</span>.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-zinc-300">
                <p>bKash Merchant: {platformSettings?.bKashNumber || '01711-000000'}</p>
                <p>Phone: {platformSettings?.academyPhone || '+880 1711-000000'}</p>
                <p className="break-all">
                  Email: {platformSettings?.academyEmail || 'support@chordandcraft.com'}
                </p>
              </div>
              <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between">
                <Link href="/" className="text-zinc-400 hover:text-amber-300 transition">
                  ← Academy Homepage
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-zinc-400 hover:text-rose-400 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE A: STUDENT DETAILS + LEVEL-FILTERED COURSE DROPDOWN + bKash PAYMENT FORM */
        <form
          onSubmit={handleSubmitPayment}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start"
        >
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {errorMsg && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs sm:text-sm font-medium flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {rejectedForSelected && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/35 text-rose-200 text-xs sm:text-sm space-y-1.5">
                <p className="font-bold flex items-center gap-2 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Previous Payment Submission Was Not Verified</span>
                </p>
                <p className="text-xs text-rose-200/85 leading-relaxed">
                  {rejectedForSelected.rejectionNote ||
                    'Your previous bKash TrxID could not be matched. Please verify your bKash transfer and resubmit below.'}
                </p>
              </div>
            )}

            {/* Step 1: Complete Student Details (for Pending accounts, especially Google sign-ups) */}
            {isPendingAccountGate && (
              <div className="p-5 sm:p-7 rounded-3xl luxury-glass space-y-5">
                <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/35 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Student Enrollment Details</h2>
                    <p className="text-xs text-zinc-400">
                      Complete or verify your personal details before proceeding with course payment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lobby-fullname"
                      className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider"
                    >
                      Full Name <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="lobby-fullname"
                        type="text"
                        value={studentFullName}
                        onChange={(e) => {
                          setFullNameDraft(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="e.g. Mahfuz Hasan"
                        className={`${inputClass} pl-10 pr-4`}
                        required
                      />
                    </div>
                  </div>

                  {/* Verified Account Email (read-only) */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lobby-email"
                      className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider"
                    >
                      Verified Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="lobby-email"
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#09090d]/60 border border-white/[0.06] text-zinc-400 font-mono text-xs cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lobby-mobile"
                      className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider"
                    >
                      Mobile Number <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="lobby-mobile"
                        type="tel"
                        value={studentMobile}
                        onChange={(e) => {
                          setMobileDraft(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="01712345678"
                        className={`${inputClass} pl-10 pr-4 font-mono`}
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="lobby-dob"
                        className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider"
                      >
                        Date of Birth
                      </label>
                      <span className="text-[10px] text-zinc-500">Optional</span>
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="lobby-dob"
                        type="date"
                        value={studentDob}
                        onChange={(e) => setDobDraft(e.target.value)}
                        className={`${inputClass} pl-10 pr-3.5 font-mono [color-scheme:dark]`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 (or Step 1 for Active Students): Expertise Level & Course Dropdown */}
            <div className="p-5 sm:p-7 rounded-3xl luxury-glass space-y-5">
              <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/35 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                  {isPendingAccountGate ? '2' : '1'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {isPendingAccountGate ? 'Expertise Level & Course Selection' : 'Select Your Course'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {isPendingAccountGate
                      ? 'Pick your guitar level to view matching courses in the dropdown below.'
                      : 'Choose the course you want to add to your student studio.'}
                  </p>
                </div>
              </div>

              {/* Expertise Level Selector for Pending Students */}
              {isPendingAccountGate && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-zinc-200">
                    Current Guitar Level <span className="text-amber-400">*</span>
                  </label>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    role="radiogroup"
                    aria-label="Current Guitar Level"
                  >
                    {SKILL_TIERS.map((tier) => {
                      const isSelected = selectedLevel === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleLevelChange(tier.id)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-500/[0.11] border-amber-400/65 shadow-[0_10px_24px_-12px_rgba(245,158,11,0.35)]'
                              : 'bg-[#09090d] border-white/[0.08] hover:border-white/[0.18]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs sm:text-sm font-semibold ${
                                isSelected ? 'text-amber-300' : 'text-zinc-100'
                              }`}
                            >
                              {tier.label}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-amber-400 border-amber-400 text-zinc-950'
                                  : 'border-white/[0.22]'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug">
                            {tier.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clean Course Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="lobby-course-select"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    {isPendingAccountGate ? (
                      <>
                        Select Course for{' '}
                        <span className="text-amber-300 font-semibold">{selectedLevel}</span> Level{' '}
                        <span className="text-amber-400">*</span>
                      </>
                    ) : (
                      <>
                        Choose Course <span className="text-amber-400">*</span>
                      </>
                    )}
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {dropdownCourses.length}{' '}
                    {dropdownCourses.length === 1 ? 'Course' : 'Courses'}
                  </span>
                </div>

                <div className="relative group">
                  <GraduationCap className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="lobby-course-select"
                    value={selectedCourseId}
                    onChange={(e) => {
                      setPickedCourseId(e.target.value);
                      setErrorMsg('');
                    }}
                    className={`${inputClass} pl-10 pr-10 appearance-none cursor-pointer`}
                    required
                  >
                    {dropdownCourses.map((course) => {
                      const enrolledTag =
                        currentUser.status === 'Active' && enrolledCourseIds.includes(course.id)
                          ? ' [Already Enrolled]'
                          : '';
                      const allLvlTag =
                        isPendingAccountGate && course.level === 'All Levels'
                          ? ' (All Levels)'
                          : !isPendingAccountGate
                          ? ` (${course.level})`
                          : '';
                      return (
                        <option
                          key={course.id}
                          value={course.id}
                          className="bg-[#0e0e13] text-white"
                        >
                          {course.title} — {formatCurrency(course.price)}
                          {allLvlTag}
                          {enrolledTag}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                </div>
              </div>
            </div>

            {/* Step 3 (or Step 2): bKash Payment Verification */}
            {isAlreadyEnrolledInSelected ? (
              <div className="p-6 rounded-3xl bg-emerald-500/[0.08] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You are already enrolled in {selectedCourse?.title}</span>
                  </p>
                  <p className="text-xs text-zinc-300">
                    All lectures for this course are unlocked in your Student Portal.
                  </p>
                </div>
                <Link
                  href={`/student/lessons?course=${encodeURIComponent(selectedCourse!.id)}`}
                  className="px-5 py-2.5 rounded-xl luxury-btn-primary text-xs font-bold inline-flex items-center gap-2 shrink-0"
                >
                  <span>Open Course Lectures</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-5 sm:p-7 rounded-3xl luxury-glass space-y-5">
                <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/35 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                    {isPendingAccountGate ? '3' : '2'}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      bKash Tuition Payment &amp; Verification
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Send your course tuition via bKash and submit your Transaction ID for admin approval.
                    </p>
                  </div>
                </div>

                {/* Instructions Container */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#09090d] border border-white/[0.08] space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                      <p className="text-sm font-bold text-white">bKash Payment Steps</p>
                      <p>
                        1. Open your bKash App and select <strong className="text-white">Send Money</strong>.
                        <br />
                        2. Send the exact tuition amount of{' '}
                        <strong className="text-amber-300 font-mono font-bold">
                          {formatCurrency(totalPayable)}
                        </strong>{' '}
                        to the official academy bKash number below.
                        <br />
                        3. Copy your <strong className="text-white">Transaction ID (TrxID)</strong> and submit it below for Admin verification.
                      </p>
                    </div>
                  </div>

                  {/* Merchant Number Copy Box */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">
                        Official Academy bKash Personal / Merchant Number:
                      </span>
                      <span className="text-base sm:text-lg font-mono font-extrabold text-amber-300 tracking-wide">
                        {platformSettings?.bKashNumber || '01711-000000'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBkash}
                      className="px-3.5 py-2 rounded-lg bg-white/[0.07] hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedNumber ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sender Mobile & TrxID Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label
                        htmlFor="lobby-bkash-mobile"
                        className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                      >
                        bKash Sender Mobile <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="lobby-bkash-mobile"
                          type="tel"
                          value={effectiveSenderMobile}
                          onChange={(e) => {
                            setBKashSenderMobileDraft(e.target.value);
                            if (errorMsg) setErrorMsg('');
                          }}
                          placeholder="01712345678"
                          className="w-full h-11 pl-10 pr-4 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="lobby-bkash-txid"
                        className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
                      >
                        bKash Transaction ID (TrxID) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        id="lobby-bkash-txid"
                        type="text"
                        value={bKashTxId}
                        onChange={(e) => {
                          setBKashTxId(e.target.value.toUpperCase());
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="e.g. 9J28DA10K"
                        className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono text-sm uppercase placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Enrollment Tuition Summary */}
          <div className="lg:col-span-5 p-5 sm:p-7 rounded-3xl luxury-glass gold-border-glow space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Enrollment Summary</span>
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                Course Tuition
              </span>
            </div>

            {selectedCourse ? (
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#09090d] border border-white/[0.07]">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/[0.08]"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {selectedCourse.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[10.5px] font-mono text-zinc-400">
                    <span className="text-amber-300">{selectedCourse.level}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {selectedCourse.totalModules} Modules
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedCourse.duration}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Select a course on the left to view tuition.</p>
            )}

            {/* Promotional Coupon */}
            {!isAlreadyEnrolledInSelected && (
              <div className="p-4 rounded-2xl bg-[#09090d] border border-white/[0.07] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scholarship / Promo Coupon</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-mono font-bold text-emerald-300 uppercase">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-[11px] text-emerald-200/90">
                          -{formatCurrency(couponDiscount)} applied
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      aria-label="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. CHORD10"
                      className="flex-1 min-w-0 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/[0.1] text-white font-mono text-xs uppercase placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 rounded-xl bg-white/[0.07] hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 font-bold text-xs transition cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
                {couponSuccessMsg && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{couponSuccessMsg}</span>
                  </p>
                )}
              </div>
            )}

            {/* Tuition Breakdown */}
            <div className="space-y-3 text-xs border-t border-white/[0.08] pt-4">
              <div className="flex justify-between text-zinc-400">
                <span>Course Tuition</span>
                <span className="font-mono text-white font-semibold tabular-nums">
                  {formatCurrency(coursePrice)}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-mono font-bold tabular-nums">
                    -{formatCurrency(couponDiscount)}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Payable (bKash)</span>
                <span className="font-display text-2xl sm:text-3xl font-bold text-amber-300 tabular-nums">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
            </div>

            {!isAlreadyEnrolledInSelected && (
              <button
                type="submit"
                disabled={isSubmitting || !selectedCourse}
                className="w-full py-3.5 rounded-xl luxury-btn-primary font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Details &amp; Payment...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isPendingAccountGate
                        ? `Save Details & Submit Payment (${formatCurrency(totalPayable)})`
                        : `Submit Payment (${formatCurrency(totalPayable)})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.07] text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified by Academy Admin</span>
              </span>
              <Link href="/" className="hover:text-amber-300 transition">
                Browse Homepage
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function PaymentLobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber-400">
          <div className="flex items-center gap-2.5 text-sm font-mono">
            <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Enrollment Lobby...</span>
          </div>
        </div>
      }
    >
      <PaymentLobbyContent />
    </Suspense>
  );
}
