'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  CalendarCheck,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Store,
  User,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';
import { getStudentEnrolledCourseIds } from '@/lib/utils';

const emptySubscribe = () => () => {};

interface StudentSidebarProps {
  onNavigate?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser, users } = useStore();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const studentInRoster = currentUser
    ? users.find(
        (u) =>
          u.id === currentUser.id ||
          (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : null;
  const currentSkillLevel = studentInRoster?.level || currentUser?.level || 'Beginner';
  const enrolledCoursesCount = getStudentEnrolledCourseIds(currentUser, users).length;

  const navGroups = [
    {
      label: 'Conservatory',
      items: [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Lessons', href: '/student/lessons', icon: BookOpen },
        { name: 'Progress Track', href: '/student/progress', icon: TrendingUp },
        { name: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
      ],
    },
    {
      label: 'Boutique & Account',
      items: [
        { name: 'Enroll Course', href: '/payment-lobby', icon: GraduationCap },
        { name: 'Merchandise', href: '/student/merchandise', icon: Store },
        { name: 'My Orders', href: '/student/orders', icon: ShoppingBag },
        { name: 'My Profile', href: '/student/profile', icon: User },
      ],
    },
  ];

  return (
    <aside
      className="w-full lg:w-[268px] bg-[#0a0a0e]/95 backdrop-blur-xl border-r border-white/[0.07] flex flex-col h-[100dvh] lg:h-screen sticky top-0 shrink-0"
      suppressHydrationWarning
    >
      {/* Brand Header */}
      <div className="pl-3.5 pr-12 py-3 lg:px-6 lg:py-5 border-b border-white/[0.07]">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 lg:gap-3 group">
          <BrandIcon className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl group-hover:scale-105 transition-transform duration-300 shrink-0" />
          <div className="min-w-0">
            <span className="brand-wordmark text-[17px] lg:text-xl tracking-wide text-white block leading-none whitespace-nowrap">
              Chord <span className="text-amber-400 italic">&amp;</span> Craft
            </span>
            <span className="text-[8.5px] lg:text-[9.5px] font-mono text-amber-400/90 font-semibold uppercase tracking-[0.15em] lg:tracking-[0.2em] block mt-0.5 lg:mt-1 whitespace-nowrap">
              Student Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Student Identity Card — Compact on Mobile, Crisp Zero Clipping */}
      {mounted && currentUser && (
        <div className="px-3 pt-2.5 pb-1.5 lg:px-4 lg:pt-4 lg:pb-2">
          <Link
            href="/student/profile"
            onClick={onNavigate}
            className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-white/[0.04] via-[#131218] to-[#0f0e13] border border-white/[0.08] hover:border-amber-400/45 transition-all duration-300 flex items-center justify-between gap-2 lg:gap-2.5 group cursor-pointer shadow-lg"
            title="Edit your student profile"
          >
            <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
              <img
                src={
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'
                }
                alt={currentUser.fullName || 'Student Avatar'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl object-cover border border-amber-400/35 group-hover:border-amber-300 group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11.5px] lg:text-xs font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                  {currentUser.fullName}
                </p>
                <p className="text-[9.5px] lg:text-[10px] text-amber-400/90 font-mono truncate mt-0.5">
                  {currentSkillLevel} • {enrolledCoursesCount} {enrolledCoursesCount === 1 ? 'Course' : 'Courses'}
                </p>
              </div>
            </div>
            <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-white/[0.04] group-hover:bg-amber-400/15 text-zinc-400 group-hover:text-amber-300 flex items-center justify-center transition shrink-0">
              <ArrowUpRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            </span>
          </Link>
        </div>
      )}

      {/* Grouped Navigation */}
      <nav className="flex-1 px-2.5 py-2 space-y-2.5 lg:px-3.5 lg:py-3 lg:space-y-5 overflow-y-auto no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5 lg:space-y-1">
            <p className="px-2.5 lg:px-3 pb-0.5 lg:pb-1 text-[9px] lg:text-[10px] font-mono font-semibold uppercase tracking-[0.18em] lg:tracking-[0.2em] text-zinc-500">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href + '/') && item.href !== '/student/dashboard');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={`relative flex items-center justify-between px-2.5 py-1.5 lg:px-3.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[12px] lg:text-[13px] font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/[0.16] via-amber-500/[0.08] to-transparent text-amber-300 border border-amber-400/30 shadow-[inset_0_1px_0_rgba(253,230,138,0.12)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 lg:h-5 rounded-r-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]" />
                  )}
                  <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
                    <Icon
                      className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 transition-colors ${
                        isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Logout */}
      <div className="p-2.5 lg:p-4 border-t border-white/[0.07]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 lg:gap-3 px-2.5 py-2 lg:px-3.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[12px] lg:text-[13px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
