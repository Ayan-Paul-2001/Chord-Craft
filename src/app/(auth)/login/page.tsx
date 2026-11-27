'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { getSafeRoleRedirect } from '@/lib/utils';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const queryEmail = searchParams.get('email');

  const { login, loginWithGoogle, currentUser, isAuthLoading } = useStore();

  const [email, setEmail] = useState(queryEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Authentication verified! Launching your studio portal...');

  // If already logged in, redirect strictly to the user's own role portal (never cross-role)
  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      if (currentUser.role === 'admin') {
        router.replace(getSafeRoleRedirect(redirectUrl, 'admin'));
      } else if (currentUser.status === 'Active') {
        router.replace(getSafeRoleRedirect(redirectUrl, 'student'));
      } else if (currentUser.status === 'Pending') {
        router.replace('/payment-lobby');
      } else if (currentUser.status === 'Rejected' || currentUser.status === 'Inactive') {
        router.replace('/waiting-approval?status=rejected');
      }
    }
  }, [currentUser, isAuthLoading, redirectUrl, router]);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsNotRegistered(false);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);

      if (res.success) {
        setIsSuccess(true);

        setTimeout(() => {
          if (res.role === 'admin') {
            router.push(getSafeRoleRedirect(redirectUrl, 'admin'));
          } else if (res.status === 'Active') {
            router.push(getSafeRoleRedirect(redirectUrl, 'student'));
          } else if (res.status === 'Pending') {
            router.push('/payment-lobby');
          } else if (res.status === 'Rejected' || res.status === 'Inactive') {
            router.push('/waiting-approval?status=rejected');
          } else {
            router.push('/student/dashboard');
          }
        }, 500);
      } else {
        setErrorMsg(res.error || 'Invalid email or password. Please verify and try again.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setIsNotRegistered(false);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMsg(
          res.status === 'Pending'
            ? 'Signed in with Google! Opening the Waiting & Payment Lobby...'
            : 'Authentication verified! Launching your studio portal...'
        );
        setIsSuccess(true);
        setTimeout(() => {
          if (res.status === 'Active') {
            router.push(getSafeRoleRedirect(redirectUrl, 'student'));
          } else if (res.status === 'Pending') {
            router.push('/payment-lobby');
          } else if (res.status === 'Rejected' || res.status === 'Inactive') {
            router.push('/waiting-approval?status=rejected');
          } else {
            router.push('/student/dashboard');
          }
        }, 500);
      } else {
        if (res.notFound) {
          setIsNotRegistered(true);
        }
        setErrorMsg(res.error || 'Google sign-in could not be completed.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] sm:min-h-[calc(100vh-80px)] relative flex items-start justify-center px-4 sm:px-6 pt-6 sm:pt-14 pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle atmospheric background */}
      <div className="absolute inset-0 acoustic-strings-bg opacity-45 pointer-events-none" />
      <div className="absolute top-64 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[560px] h-[280px] sm:h-[380px] bg-amber-500/[0.08] rounded-full blur-[120px] sm:blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[460px] rounded-[1.75rem] sm:rounded-[2rem] luxury-glass gold-border-glow px-5 sm:px-10 pt-7 sm:pt-10 pb-7 sm:pb-10 relative z-10">
        {/* Fixed-position Brand Header & Mode Switcher (matches /signup pixel-for-pixel) */}
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
            <span className="flex-1 py-2 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-200 text-xs font-bold text-center">
              Sign In
            </span>
            <Link
              href="/signup"
              className="flex-1 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold text-center transition"
            >
              Enroll
            </Link>
          </div>
        </div>

        <div className="mt-6 sm:mt-7 space-y-5 sm:space-y-6 animate-fade-in">
          <div className="text-center space-y-1.5">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-none">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              Sign in to access your unlocked lessons, PDF tabs &amp; studio portal.
            </p>
          </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-medium space-y-3 animate-scale-up"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="flex-1 leading-relaxed">{errorMsg}</span>
            </div>
            {isNotRegistered && (
              <Link
                href="/signup"
                className="w-full py-2.5 px-4 rounded-xl luxury-btn-primary font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Complete Student Enrollment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        {isSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-3 animate-scale-up">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-[0.14em]"
            >
              Email Address
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="name@example.com"
                autoComplete="off"
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#09090c] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-[0.14em]"
              >
                Password
              </label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-xs text-amber-300 hover:text-amber-200 transition font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                onKeyUp={handleKeyUp}
                placeholder="Enter your password"
                autoComplete="new-password"
                className="w-full h-12 pl-11 pr-12 rounded-xl bg-[#09090c] border border-white/[0.09] text-white placeholder:text-zinc-500 text-sm font-medium focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 transition"
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

            {isCapsLockOn && (
              <p className="text-[11px] text-amber-300 flex items-center gap-1.5 font-mono pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Caps Lock is active.</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full h-12 rounded-xl luxury-btn-primary font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                <span>Authenticated! Launching Portal...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider + Google Sign-In */}
        <div className="space-y-3.5 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="bg-[#121217] px-3 text-[10px] text-zinc-400 font-mono uppercase tracking-[0.18em] shrink-0 rounded-full">
              Or continue with
            </span>
            <div className="w-full border-t border-white/[0.08]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isSuccess}
            className="w-full h-11 px-4 rounded-xl luxury-btn-ghost text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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
            New student? Continue with Google to complete your details, choose a course &amp; submit bKash payment in the Waiting Lobby.
          </p>
        </div>

        {/* Enrollment Link */}
        <div className="text-center pt-3 border-t border-white/[0.07]">
          <p className="text-xs text-zinc-400">
            New to Harmonic Guitar Academy?{' '}
            <Link
              href="/signup"
              className="text-amber-300 font-bold hover:text-amber-200 hover:underline inline-flex items-center gap-1 ml-1"
            >
              <span>Enroll as a Student</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-amber-400">
          <div className="flex items-center gap-2.5 text-sm font-mono">
            <span className="inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading Chord &amp; Craft Portal...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
