'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { formatCurrency } from '@/lib/utils';
import { StudentLevel } from '@/lib/types';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  GraduationCap,
  ChevronDown,
  Clock,
  BookOpen,
} from 'lucide-react';

const SKILL_TIERS: { id: StudentLevel; label: string; desc: string }[] = [
  { id: 'Beginner', label: 'Beginner', desc: 'Open chords, rhythm & picking fundamentals' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'CAGED fretboard, barre chords & pentatonics' },
  { id: 'Advanced', label: 'Advanced', desc: 'Sweep picking, legato, modes & phrasing' },
];

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCourseId = searchParams.get('course') || '';

  const { courses, signup, signupWithGoogle, currentUser, activeRole, isAuthLoading } = useStore();

  const activeCourses = useMemo(
    () =>
      [...courses]
        .filter((c) => c.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [courses]
  );

  // Derive initial expertise level from ?course=<id> when arriving from a specific course
  const initialLevelFromCourse = useMemo<StudentLevel>(() => {
    if (!queryCourseId) return 'Beginner';
    const matched = activeCourses.find((c) => c.id === queryCourseId);
    if (
      matched &&
      (matched.level === 'Beginner' ||
        matched.level === 'Intermediate' ||
        matched.level === 'Advanced')
    ) {
      return matched.level;
    }
    return 'Beginner';
  }, [queryCourseId, activeCourses]);

  const [pickedLevel, setPickedLevel] = useState<StudentLevel | null>(null);
  const level: StudentLevel = pickedLevel ?? initialLevelFromCourse;

  // Courses filtered dynamically by selected expertise level (+ 'All Levels' tracks)
  const levelFilteredCourses = useMemo(() => {
    const exactAndAll = activeCourses.filter(
      (c) => c.level === level || c.level === 'All Levels'
    );
    // Order exact level matches ahead of 'All Levels' tracks
    const sorted = [...exactAndAll].sort((a, b) => {
      const aExact = a.level === level ? 0 : 1;
      const bExact = b.level === level ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return (a.order || 0) - (b.order || 0);
    });
    return sorted.length > 0 ? sorted : activeCourses;
  }, [activeCourses, level]);

  const [pickedCourseId, setPickedCourseId] = useState<string>('');
  const selectedCourseId = useMemo(() => {
    if (pickedCourseId && levelFilteredCourses.some((c) => c.id === pickedCourseId)) {
      return pickedCourseId;
    }
    if (queryCourseId && levelFilteredCourses.some((c) => c.id === queryCourseId)) {
      return queryCourseId;
    }
    return levelFilteredCourses[0]?.id || '';
  }, [pickedCourseId, queryCourseId, levelFilteredCourses]);

  const selectedCourse =
    levelFilteredCourses.find((c) => c.id === selectedCourseId) || null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If already logged in, redirect cleanly to the right portal / Payment Lobby
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'admin' || activeRole === 'admin') {
        router.replace('/admin/dashboard');
      } else if (currentUser.status === 'Active') {
        if (queryCourseId) {
          router.replace(`/payment-lobby?course=${encodeURIComponent(queryCourseId)}`);
        } else {
          router.replace('/student/dashboard');
        }
      } else if (currentUser.status === 'Pending') {
        router.replace(
          queryCourseId
            ? `/payment-lobby?course=${encodeURIComponent(queryCourseId)}`
            : '/payment-lobby'
        );
      } else if (currentUser.status === 'Rejected' || currentUser.status === 'Inactive') {
        router.replace('/waiting-approval?status=rejected');
      }
    }
  }, [currentUser, activeRole, isAuthLoading, queryCourseId, router]);

  // Password strength heuristic (0 to 4)
  const passwordScore = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel =
    passwordScore <= 1
      ? 'Too Short'
      : passwordScore === 2
      ? 'Fair'
      : passwordScore === 3
      ? 'Strong'
      : 'Excellent';

  const getPostSignupHref = () =>
    selectedCourseId
      ? `/payment-lobby?course=${encodeURIComponent(selectedCourseId)}`
      : '/payment-lobby';

  const handleLevelSelect = (nextLevel: StudentLevel) => {
    setPickedLevel(nextLevel);
    // Reset manual course pick so the dropdown smoothly defaults to the top matching course for the new level
    setPickedCourseId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCourseId && activeCourses.length > 0) {
      setErrorMsg('Please select a course from the dropdown to enroll in.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim(),
        dateOfBirth,
        level,
        selectedCourseId: selectedCourseId || undefined,
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(getPostSignupHref());
        }, 600);
      } else {
        setErrorMsg(res.error || 'Failed to complete registration. Please try again.');
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const explicitCourseId = pickedCourseId || queryCourseId || undefined;
    try {
      const res = await signupWithGoogle({
        level: pickedLevel || (queryCourseId ? level : undefined),
        mobile: mobile.trim() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        selectedCourseId: explicitCourseId,
      });
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (res.status === 'Active' && !explicitCourseId) {
            router.push('/student/dashboard');
          } else {
            router.push(
              explicitCourseId
                ? `/payment-lobby?course=${encodeURIComponent(explicitCourseId)}`
                : '/payment-lobby'
            );
          }
        }, 600);
      } else {
        setErrorMsg(res.error || 'Google sign-up could not be completed.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass =
    'w-full h-12 rounded-xl bg-[#09090c] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 hover:border-white/[0.16] transition';

  return (
    <div className="min-h-[calc(100dvh-72px)] sm:min-h-[calc(100vh-80px)] relative flex items-start justify-center px-4 sm:px-6 pt-6 sm:pt-12 pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle atmospheric background */}
      <div className="absolute inset-0 acoustic-strings-bg opacity-45 pointer-events-none" />
      <div className="absolute top-64 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[680px] h-[300px] sm:h-[460px] bg-amber-500/[0.07] rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />

      <div className="w-full max-w-2xl rounded-[1.75rem] sm:rounded-[2rem] luxury-glass gold-border-glow px-5 sm:px-10 md:px-12 pt-7 sm:pt-10 pb-7 sm:pb-10 relative z-10">
        {/* Brand Header & Mode Switcher (matches /login pixel-for-pixel) */}
        <div className="flex flex-col items-center text-center space-y-5">
          <Link href="/" className="inline-flex items-center gap-3 sm:gap-3.5 group">
            <BrandIcon className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl group-hover:scale-105 transition-transform duration-300" />
            <div className="text-left">
              <span className="brand-wordmark text-xl sm:text-2xl tracking-wide text-white block leading-none">
                Chord <span className="text-amber-400 italic">&amp;</span> Craft
              </span>
              <span className="text-[9px] sm:text-[9.5px] text-zinc-400 tracking-[0.2em] sm:tracking-[0.22em] uppercase block mt-1">
                Harmonic Guitar Academy
              </span>
            </div>
          </Link>

          {/* Segmented Mode Switcher */}
          <div className="flex p-1 rounded-2xl bg-[#09090c] border border-white/[0.08] w-full max-w-[320px]">
            <Link
              href="/login"
              className="flex-1 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold text-center transition"
            >
              Sign In
            </Link>
            <span className="flex-1 py-2 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-200 text-xs font-bold text-center">
              Enroll
            </span>
          </div>
        </div>

        <div className="mt-7 animate-fade-in">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-none">
              Student Enrollment
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-lg mx-auto">
              Create your account, select your expertise level &amp; course, and verify tuition in the bKash Payment Lobby.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-[10px] sm:text-[10.5px] font-mono text-zinc-400">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/35 text-amber-200 font-semibold">
                1. Account &amp; Course
              </span>
              <span>→</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                2. Payment Lobby
              </span>
              <span>→</span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                3. Dashboard Access
              </span>
            </div>
          </div>

          <div className="section-hairline my-7" />

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-7 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs sm:text-sm font-medium flex items-start gap-3 animate-scale-up"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="flex-1 leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mb-7 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-3 animate-scale-up">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Account created! Redirecting to the Payment Lobby...</span>
            </div>
          )}

          {/* Structured Enrollment Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
            {/* Section 1: Personal Information */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-amber-300/90 shrink-0">
                  Personal Information
                </h2>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="e.g. Mahfuz Hasan"
                      autoComplete="off"
                      className={`${inputBaseClass} pl-11 pr-4`}
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="signup-dob"
                      className="block text-xs font-medium text-zinc-200"
                    >
                      Date of Birth
                    </label>
                    <span className="text-[11px] text-zinc-500">Optional</span>
                  </div>
                  <div className="relative group">
                    <Calendar className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      id="signup-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={`${inputBaseClass} pl-11 pr-3.5 tabular-nums [color-scheme:dark]`}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="name@example.com"
                      autoComplete="off"
                      className={`${inputBaseClass} pl-11 pr-4`}
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-mobile"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Mobile Number <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      id="signup-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="01712345678"
                      autoComplete="tel"
                      className={`${inputBaseClass} pl-11 pr-4 tabular-nums`}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Expertise Level & Level-Matched Course Dropdown */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-amber-300/90 shrink-0">
                  Expertise Level &amp; Course
                </h2>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              {/* Expertise Level Cards */}
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
                    const selected = level === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => handleLevelSelect(tier.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[84px] ${
                          selected
                            ? 'bg-amber-500/[0.11] border-amber-400/65 shadow-[inset_0_1px_0_rgba(253,230,138,0.18),0_10px_24px_-12px_rgba(245,158,11,0.35)]'
                            : 'bg-[#09090c] border-white/[0.08] hover:border-white/[0.18] hover:bg-[#0e0e13]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span
                            className={`text-sm font-semibold ${
                              selected ? 'text-amber-300' : 'text-zinc-100'
                            }`}
                          >
                            {tier.label}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                              selected
                                ? 'bg-amber-400 border-amber-400 text-zinc-950'
                                : 'border-white/[0.22]'
                            }`}
                          >
                            {selected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-zinc-400 mt-2 leading-relaxed">
                          {tier.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Level-Filtered Course Dropdown */}
              {activeCourses.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="signup-course"
                      className="block text-xs font-medium text-zinc-200"
                    >
                      Select Course for <span className="text-amber-300 font-semibold">{level}</span> Level{' '}
                      <span className="text-amber-400">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {levelFilteredCourses.length}{' '}
                      {levelFilteredCourses.length === 1 ? 'Course' : 'Courses'} Available
                    </span>
                  </div>

                  <div className="relative group">
                    <GraduationCap className="w-4 h-4 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="signup-course"
                      value={selectedCourseId}
                      onChange={(e) => {
                        setPickedCourseId(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className={`${inputBaseClass} pl-11 pr-10 appearance-none cursor-pointer`}
                      required
                    >
                      {levelFilteredCourses.map((course) => (
                        <option
                          key={course.id}
                          value={course.id}
                          className="bg-[#0e0e13] text-white"
                        >
                          {course.title} — {formatCurrency(course.price)}
                          {course.level === 'All Levels' ? ' (All Levels)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  </div>

                  {/* Compact Selected Course Metadata Strip */}
                  {selectedCourse && (
                    <div className="px-4 py-3 rounded-xl bg-[#09090c]/90 border border-amber-400/25 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-300">
                        <span className="font-semibold text-white">{selectedCourse.title}</span>
                        <span className="text-zinc-600 hidden sm:inline">•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{selectedCourse.duration}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span>{selectedCourse.totalModules} Modules</span>
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-amber-300 text-xs sm:text-sm tabular-nums">
                        {formatCurrency(selectedCourse.price)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Section 3: Account Security */}
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-amber-300/90 shrink-0">
                  Account Security
                </h2>
                <div className="h-px flex-1 bg-white/[0.07]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      className={`${inputBaseClass} pl-11 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="signup-confirm"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Confirm Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      id="signup-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className={`${inputBaseClass} pl-11 pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] transition cursor-pointer"
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Password Strength & Match Status */}
              {password && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-[#09090c]/85 border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-28">
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            passwordScore >= seg
                              ? passwordScore <= 1
                                ? 'bg-rose-400'
                                : passwordScore === 2
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                              : 'bg-white/[0.1]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Strength: <strong className="text-zinc-100">{strengthLabel}</strong>
                    </span>
                  </div>

                  {confirmPassword &&
                    (password === confirmPassword ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Passwords match</span>
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Passwords do not match</span>
                      </span>
                    ))}
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="pt-2 space-y-5">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full h-12 sm:h-[52px] rounded-xl luxury-btn-primary font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Proceeding to Payment Lobby...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to bKash Payment Lobby</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/[0.08]" />
                <span className="bg-[#121217] px-3.5 text-[10px] text-zinc-400 font-mono uppercase tracking-[0.18em] shrink-0 rounded-full">
                  Or enroll with
                </span>
                <div className="w-full border-t border-white/[0.08]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isSuccess}
                className="w-full h-12 px-4 rounded-xl luxury-btn-ghost text-zinc-100 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.4 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
              <p className="text-[11px] text-center text-zinc-500 leading-relaxed">
                Signing up with Google? You&apos;ll fill in your profile details, choose your course, and complete bKash payment in the Waiting Lobby.
              </p>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-white/[0.07] text-center">
            <p className="text-xs sm:text-sm text-zinc-400">
              Already have a student or admin account?{' '}
              <Link
                href="/login"
                className="text-amber-300 font-semibold hover:text-amber-200 hover:underline inline-flex items-center gap-1 ml-1"
              >
                <span>Sign in here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber-400">
          <div className="flex items-center gap-2.5 text-sm font-mono">
            <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Enrollment Studio...</span>
          </div>
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
