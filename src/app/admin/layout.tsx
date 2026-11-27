'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { PortalLayoutProvider } from '@/context/PortalLayoutContext';
import { AdminSidebar } from '@/components/shared/AdminSidebar';
import { X, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthLoading } = useStore();
  const [sidebarOpenPath, setSidebarOpenPath] = useState<string | null>(null);
  const mobileSidebarOpen = sidebarOpenPath === pathname;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser) {
        router.replace('/login');
      } else if (currentUser.role !== 'admin') {
        router.replace('/student/dashboard');
      }
    }
  }, [currentUser, isAuthLoading, router]);

  if (isAuthLoading || !currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen portal-canvas text-zinc-100 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-3 text-amber-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{isAuthLoading ? 'Authenticating Admin Portal...' : 'Redirecting to appropriate portal...'}</span>
        </div>
      </div>
    );
  }

  return (
    <PortalLayoutProvider openMobileSidebar={() => setSidebarOpenPath(pathname)}>
      <div className="min-h-screen portal-canvas portal-workspace text-zinc-100 flex font-sans">
        {/* Desktop Sticky Sidebar (1024px+) */}
        <div className="hidden lg:block shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile & Tablet Slide-Over Drawer (< 1024px) */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
              onClick={() => setSidebarOpenPath(null)}
            />
            <div className="relative z-10 w-[min(248px,80vw)] bg-[#0b0a0e] h-[100dvh] shadow-2xl flex flex-col animate-portal-enter">
              <button
                type="button"
                onClick={() => setSidebarOpenPath(null)}
                className="absolute top-3 right-2.5 z-20 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition cursor-pointer"
                aria-label="Close navigation drawer"
              >
                <X className="w-4 h-4" />
              </button>
              <AdminSidebar onNavigate={() => setSidebarOpenPath(null)} />
            </div>
          </div>
        )}

        {/* Main Content with Smooth Section-Switching Animation */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 pb-10 sm:pb-16">
            <div key={pathname} className="animate-portal-enter">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PortalLayoutProvider>
  );
}
