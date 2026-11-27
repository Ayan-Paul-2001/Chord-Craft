'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Package,
  ShoppingBag,
  Sliders,
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  ReceiptText,
  Star,
  Megaphone,
  ArrowUpRight,
  GraduationCap,
} from 'lucide-react';
import { BrandIcon } from '@/components/shared/BrandLogo';

interface AdminSidebarProps {
  onNavigate?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isLive?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser, users, orders, courseEnrollments, reviews, noticeBoard, adminName } = useStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const pendingApprovals = users.filter((u) => u.status === 'Pending').length;
  const pendingCoursePayments = courseEnrollments.filter((e) => e.paymentStatus === 'Pending').length;
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'Pending').length;

  const navGroups: { label: string; items: NavItem[] }[] = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Approvals', href: '/admin/approvals', icon: UserCheck, badge: pendingApprovals },
      ],
    },
    {
      label: 'Academy',
      items: [
        { name: 'Courses & Tuition', href: '/admin/courses', icon: GraduationCap, badge: pendingCoursePayments },
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Lessons', href: '/admin/lessons', icon: BookOpen },
        { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
      ],
    },
    {
      label: 'Store & Billing',
      items: [
        { name: 'Merchandise', href: '/admin/merchandise', icon: Package },
        { name: 'Orders & bKash', href: '/admin/orders', icon: ShoppingBag, badge: pendingPayments },
        { name: 'Billings', href: '/admin/billings', icon: ReceiptText },
      ],
    },
    {
      label: 'Studio & System',
      items: [
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, isLive: Boolean(noticeBoard?.isActive) },
        { name: 'Student Reviews', href: '/admin/reviews', icon: Star, badge: reviews?.length || 0 },
        { name: 'Homepage CMS', href: '/admin/cms', icon: Sliders },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-[268px] bg-[#0a0a0e]/95 backdrop-blur-xl border-r border-white/[0.07] flex flex-col h-[100dvh] lg:h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="pl-3.5 pr-12 py-3 lg:px-6 lg:py-5 border-b border-white/[0.07]">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 lg:gap-3 group">
          <BrandIcon className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl group-hover:scale-105 transition-transform duration-300 shrink-0" />
          <div className="min-w-0">
            <span className="brand-wordmark text-[17px] lg:text-xl tracking-wide text-white block leading-none whitespace-nowrap">
              Chord <span className="text-amber-400 italic">&amp;</span> Craft
            </span>
            <span className="text-[8.5px] lg:text-[9.5px] font-mono text-amber-400/90 font-semibold uppercase tracking-[0.15em] lg:tracking-[0.2em] block mt-0.5 lg:mt-1 whitespace-nowrap">
              Conservatory Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Admin Identity Card — Compact on Mobile, Crisp Zero Clipping */}
      <div className="px-3 pt-2.5 pb-1.5 lg:px-4 lg:pt-4 lg:pb-2">
        <Link
          href="/admin/settings"
          onClick={onNavigate}
          className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-amber-500/[0.11] via-[#131218] to-[#0f0e13] border border-amber-400/25 hover:border-amber-400/55 transition-all duration-300 flex items-center justify-between gap-2 lg:gap-2.5 group cursor-pointer shadow-lg"
          title="Edit Administrator profile & settings"
        >
          <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] lg:text-xs font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                {currentUser?.fullName || adminName}
              </p>
              <p className="text-[9.5px] lg:text-[10px] text-amber-400/85 font-mono truncate mt-0.5">
                Academy Director
              </p>
            </div>
          </div>
          <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-md lg:rounded-lg bg-white/[0.04] group-hover:bg-amber-400/15 text-zinc-400 group-hover:text-amber-300 flex items-center justify-center transition shrink-0">
            <ArrowUpRight className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
          </span>
        </Link>
      </div>

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
                (pathname.startsWith(item.href + '/') && item.href !== '/admin/dashboard');

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

                  {item.badge ? (
                    <span className="px-1.5 lg:px-2 py-0.5 rounded-full text-[9.5px] lg:text-[10px] font-mono font-bold bg-amber-400 text-zinc-950 tabular-nums shrink-0">
                      {item.badge}
                    </span>
                  ) : item.isLive ? (
                    <span
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[8.5px] lg:text-[9px] font-mono font-bold text-emerald-400 shrink-0"
                      title="Live broadcast active"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  ) : null}
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
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};
