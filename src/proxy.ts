import { NextRequest, NextResponse } from 'next/server';
import { readSessionCookie } from '@/lib/sessionCookie';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = readSessionCookie(req);

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isStudentRoute = pathname === '/student' || pathname.startsWith('/student/');
  const isPaymentLobbyRoute = pathname === '/payment-lobby';
  const isWaitingRoute = pathname === '/waiting-approval';
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  // 1. Protect /admin/* — STRICTLY Admin role only (never Student)
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'admin') {
      const dest = req.nextUrl.clone();
      if (session.status === 'Pending') {
        dest.pathname = '/payment-lobby';
        dest.search = '';
      } else if (session.status === 'Rejected' || session.status === 'Inactive') {
        dest.pathname = '/waiting-approval';
        dest.search = '?status=rejected';
      } else {
        dest.pathname = '/student/dashboard';
        dest.search = '';
      }
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  // 2. Protect /student/* — STRICTLY Active & Payment-Verified Student role only (never Admin or Pending)
  if (isStudentRoute) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === 'admin') {
      const dest = req.nextUrl.clone();
      dest.pathname = '/admin/dashboard';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    if (session.status === 'Pending') {
      const dest = req.nextUrl.clone();
      dest.pathname = '/payment-lobby';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    if (session.status === 'Rejected' || session.status === 'Inactive') {
      const dest = req.nextUrl.clone();
      dest.pathname = '/waiting-approval';
      dest.search = '?status=rejected';
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  // 3. Protect /payment-lobby — Authenticated Students only (Pending students paying first course OR Active students adding a course)
  if (isPaymentLobbyRoute) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === 'admin') {
      const dest = req.nextUrl.clone();
      dest.pathname = '/admin/dashboard';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  // 4. Protect /waiting-approval — Pending students redirected to Payment Lobby; Rejected/Inactive remain here
  if (isWaitingRoute) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
    if (session.role === 'admin') {
      const dest = req.nextUrl.clone();
      dest.pathname = '/admin/dashboard';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    if (session.status === 'Pending') {
      const dest = req.nextUrl.clone();
      dest.pathname = '/payment-lobby';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  // 5. Prevent cross-login while already signed in on /login or /signup
  if (isAuthRoute && session) {
    const dest = req.nextUrl.clone();
    if (session.role === 'admin') {
      dest.pathname = '/admin/dashboard';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    if (session.status === 'Active') {
      // If active student clicked /signup?course=<id>, send them to Payment Lobby to enroll in that course
      const courseParam = req.nextUrl.searchParams.get('course');
      if (pathname === '/signup' && courseParam) {
        dest.pathname = '/payment-lobby';
        dest.search = `?course=${encodeURIComponent(courseParam)}`;
        return NextResponse.redirect(dest);
      }
      dest.pathname = '/student/dashboard';
      dest.search = '';
      return NextResponse.redirect(dest);
    }
    if (session.status === 'Pending') {
      const courseParam = req.nextUrl.searchParams.get('course');
      dest.pathname = '/payment-lobby';
      dest.search = courseParam ? `?course=${encodeURIComponent(courseParam)}` : '';
      return NextResponse.redirect(dest);
    }
    if (session.status === 'Rejected' || session.status === 'Inactive') {
      dest.pathname = '/waiting-approval';
      dest.search = '?status=rejected';
      return NextResponse.redirect(dest);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/payment-lobby',
    '/waiting-approval',
    '/login',
    '/signup',
  ],
};
