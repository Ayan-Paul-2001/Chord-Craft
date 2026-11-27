'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Shield,
  ArrowUpRight,
  Sparkles,
  Award,
  Layers,
  PlayCircle,
  Star,
  Store,
  GraduationCap,
} from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';

const emptySubscribe = () => () => {};

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname() || '';
  const { cart, activeRole, currentUser, adminName } = useStore();
  const [menuOpenPath, setMenuOpenPath] = useState<string | null>(null);
  const mobileMenuOpen = menuOpenPath === pathname;
  const setMobileMenuOpen = (open: boolean) => setMenuOpenPath(open ? pathname : null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Do not render PublicNavbar on student or admin dashboard routes
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/student');
  if (isDashboard) {
    return null;
  }

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
  const cartCount = mounted ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const studentPortalHref =
    currentUser?.role === 'student' && currentUser?.status !== 'Active'
      ? '/payment-lobby'
      : '/student/dashboard';

  const navLinks = [
    { href: '/#about', label: 'Philosophy', mobileLabel: 'Philosophy', icon: Sparkles },
    { href: '/#instructor', label: 'Mentor', mobileLabel: 'Mentor', icon: Award },
    { href: '/#curriculum', label: 'Curriculum', mobileLabel: 'Roadmap', icon: Layers },
    { href: '/#lessons', label: 'Lessons', mobileLabel: 'Demo Lessons', icon: PlayCircle },
    { href: '/courses', label: 'Courses', mobileLabel: 'Courses', icon: GraduationCap },
    { href: '/#testimonials', label: 'Reviews', mobileLabel: 'Reviews', icon: Star },
    { href: '/#merchandise', label: 'Store', mobileLabel: 'Merch Store', icon: Store },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0b0a0e]/88 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_16px_40px_-16px_rgba(0,0,0,0.85)]'
            : 'bg-[#0a0a0c]/60 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Left: Brand Lockup */}
            <div className="flex items-center shrink-0 z-10 min-w-0">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                <BrandIcon className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform duration-300 shrink-0" />
                <div className="min-w-0">
                  <span className="brand-wordmark text-[17px] sm:text-[22px] tracking-wide text-white leading-none block whitespace-nowrap">
                    Chord <span className="text-amber-400 italic">&amp;</span> Craft
                  </span>
                  <span className="block text-[8px] sm:text-[9.5px] tracking-[0.15em] sm:tracking-[0.22em] text-zinc-400 uppercase font-sans mt-0.5 whitespace-nowrap">
                    Harmonic Guitar Academy
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav Links (1024px+) */}
            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mx-auto"
            >
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-2.5 xl:px-3.5 py-1.5 rounded-full text-[12px] xl:text-[13px] font-medium text-zinc-300 hover:text-amber-300 hover:bg-white/[0.04] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: Actions (Desktop + Tablet + Mobile unified cleanly without any 768-1023px gap) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 z-10 shrink-0">
              <Link
                href="/cart"
                className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-300 hover:text-amber-300 luxury-btn-ghost rounded-lg sm:rounded-xl"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 min-w-4 h-4 sm:min-w-5 sm:h-5 px-1 rounded-full bg-amber-400 text-zinc-950 text-[9.5px] sm:text-[10px] font-extrabold font-mono flex items-center justify-center shadow-md tabular-nums">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth / Portal Actions on Tablet & Desktop (sm+) */}
              <div className="hidden sm:flex items-center gap-2">
                {mounted && activeRole === 'admin' ? (
                  <Link
                    href="/admin/dashboard"
                    className="px-3.5 lg:px-4 py-2.5 rounded-xl luxury-btn-primary font-bold text-xs tracking-wide flex items-center gap-2 whitespace-nowrap"
                  >
                    <Shield className="w-4 h-4" /> Admin Portal
                  </Link>
                ) : mounted && activeRole === 'student' && currentUser ? (
                  <Link
                    href={studentPortalHref}
                    className="px-3.5 lg:px-4 py-2.5 rounded-xl luxury-btn-primary font-bold text-xs tracking-wide flex items-center gap-2 whitespace-nowrap"
                  >
                    <User className="w-4 h-4" />
                    {currentUser.status !== 'Active'
                      ? 'Payment Lobby'
                      : `Portal (${currentUser?.fullName?.split(' ')[0]})`}
                  </Link>
                ) : !isAuthPage ? (
                  <>
                    <Link
                      href="/login"
                      className="px-3.5 lg:px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.05] transition whitespace-nowrap"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 lg:px-5 py-2.5 rounded-xl luxury-btn-primary font-bold text-xs tracking-wide flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Enroll Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </>
                ) : null}
              </div>

              {/* Mobile & Tablet Menu Button (< 1024px) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-zinc-200 hover:text-white luxury-btn-ghost rounded-lg sm:rounded-xl cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Compact, Organized Mobile & Tablet Navigation Panel (< 1024px) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0c0c10]/98 backdrop-blur-2xl border-b border-white/[0.08] px-3.5 sm:px-6 pt-2.5 pb-3.5 animate-fade-in shadow-2xl max-h-[calc(100dvh-64px)] overflow-y-auto">
            <div className="max-w-xl mx-auto space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9.5px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                  Explore Conservatory
                </span>
                <span className="text-[9.5px] font-mono text-amber-400/80">
                  Mentor: {adminName}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-amber-400/35 hover:bg-amber-500/[0.06] text-xs font-medium text-zinc-200 hover:text-amber-300 transition"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-400/85 shrink-0" />
                      <span className="truncate">{item.mobileLabel}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile-only compact Account / Portal Actions */}
              {((mounted && currentUser) || !isAuthPage) && (
                <div className="sm:hidden pt-2.5 border-t border-white/[0.07]">
                  {mounted && currentUser ? (
                    <div className="flex items-center justify-between gap-2.5 bg-white/[0.025] border border-white/[0.06] rounded-xl px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">
                          {currentUser.fullName || adminName}
                        </p>
                        <p className="text-[9.5px] font-mono text-amber-400/85 uppercase tracking-wider">
                          {currentUser.role === 'admin'
                            ? 'Admin Portal'
                            : currentUser.status !== 'Active'
                            ? 'Payment Verification Pending'
                            : 'Student Studio'}
                        </p>
                      </div>
                      <Link
                        href={currentUser.role === 'admin' ? '/admin/dashboard' : studentPortalHref}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3.5 py-1.5 rounded-lg luxury-btn-primary font-bold text-xs inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <span>
                          {currentUser.role === 'student' && currentUser.status !== 'Active'
                            ? 'Payment Lobby'
                            : 'Open Portal'}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : !isAuthPage ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-3 text-center text-zinc-200 luxury-btn-ghost rounded-lg font-semibold text-xs"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-3 text-center luxury-btn-primary rounded-lg font-bold text-xs inline-flex items-center justify-center gap-1"
                      >
                        <span>Enroll Now</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <div className="h-16 sm:h-20 shrink-0" aria-hidden="true" />
    </>
  );
};
