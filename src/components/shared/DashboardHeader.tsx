'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { usePortalLayout } from '@/context/PortalLayoutContext';
import { ShoppingBag, User as UserIcon, Shield, Menu, ExternalLink } from 'lucide-react';

const emptySubscribe = () => () => {};

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onMobileMenuToggle,
}) => {
  const { currentUser, activeRole, cart, adminName } = useStore();
  const portalLayout = usePortalLayout();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const cartCount = mounted ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const handleMenuToggle = onMobileMenuToggle || portalLayout?.openMobileSidebar;
  const isAdmin = activeRole === 'admin' || currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-[#09090d]/90 backdrop-blur-xl border-b border-white/[0.07] px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-4">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {handleMenuToggle && (
          <button
            type="button"
            onClick={handleMenuToggle}
            className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl luxury-btn-ghost text-zinc-300 hover:text-white cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[17px] sm:text-2xl lg:text-[2rem] font-semibold text-white tracking-tight leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10.5px] sm:text-xs lg:text-[13px] text-zinc-400 font-light mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
        {isAdmin ? (
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl luxury-btn-ghost text-zinc-300 hover:text-amber-300 text-xs font-semibold shrink-0"
            title="Open live public website"
            aria-label="Open live public website"
          >
            <span className="hidden sm:inline">Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href="/student/cart"
            className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl luxury-btn-ghost text-zinc-300 hover:text-amber-300 shrink-0"
            aria-label="Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-zinc-950 text-[9.5px] sm:text-[10px] font-bold font-mono flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {/* User Profile Pill */}
        <Link
          href={isAdmin ? '/admin/settings' : '/student/profile'}
          className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3.5 border-l border-white/[0.08] hover:opacity-95 transition group cursor-pointer"
          title="View & Edit Profile / Settings"
        >
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80'
            }
            alt={currentUser?.fullName || 'User'}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80';
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl object-cover border border-amber-400/35 group-hover:border-amber-300 group-hover:scale-105 transition-all shadow-md shrink-0"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors leading-tight">
              {currentUser?.fullName || (isAdmin ? adminName : 'Student')}
            </p>
            <span className="text-[10px] text-amber-300/90 font-mono flex items-center gap-1 mt-0.5">
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3" /> Academy Director
                </>
              ) : (
                <>
                  <UserIcon className="w-3 h-3 text-emerald-400" /> {currentUser?.level || 'Student'}
                </>
              )}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
