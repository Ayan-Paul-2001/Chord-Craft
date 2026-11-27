import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
} from '@/lib/sessionCookie';
import { isAdminEmail, sanitizeUserForClient } from '@/lib/authGuard';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// GET /api/auth/session — validate the 24-hour HttpOnly session cookie & return fresh user details
export async function GET(req: NextRequest) {
  const session = readSessionCookie(req);

  if (!session) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { headers: NO_CACHE_HEADERS }
    );
  }

  // Strict consistency check: admin cookie MUST match an admin email or admin DB record
  const emailIsAdmin = isAdminEmail(session.email);

  let resolvedUser = sanitizeUserForClient({
    id: session.id,
    firebaseUid: session.firebaseUid || session.id,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    mobile: session.mobile || '',
    dateOfBirth: session.dateOfBirth || '',
    level: session.level,
    registrationDate: session.registrationDate || '',
    status: session.status,
    avatarUrl: session.avatarUrl || '',
    enrolledCourseIds: Array.isArray(session.enrolledCourseIds) ? session.enrolledCourseIds : [],
    selectedCourseId: session.selectedCourseId || '',
  })!;

  let needsCookieRefresh = false;

  // Refresh latest status/level/courses/profile from MongoDB when available
  try {
    await connectToDatabase();
    const userDoc = await User.findOne({ email: session.email.toLowerCase().trim() }).lean() as any;

    if (userDoc) {
      // Prevent cross-role drift between signed cookie and MongoDB record
      if (session.role === 'admin' && userDoc.role !== 'admin' && !emailIsAdmin) {
        const res = NextResponse.json(
          { authenticated: false, user: null },
          { headers: NO_CACHE_HEADERS }
        );
        clearSessionCookie(res);
        return res;
      }

      if (session.role === 'student' && (userDoc.role === 'admin' || emailIsAdmin)) {
        const res = NextResponse.json(
          { authenticated: false, user: null },
          { headers: NO_CACHE_HEADERS }
        );
        clearSessionCookie(res);
        return res;
      }

      resolvedUser = sanitizeUserForClient({
        ...userDoc,
        role: session.role === 'admin' ? 'admin' : 'student',
        status: session.role === 'admin' ? 'Active' : userDoc.status || resolvedUser.status,
      })!;

      const prevCourses = JSON.stringify(session.enrolledCourseIds || []);
      const nextCourses = JSON.stringify(resolvedUser.enrolledCourseIds || []);
      if (
        resolvedUser.status !== session.status ||
        prevCourses !== nextCourses ||
        resolvedUser.selectedCourseId !== (session.selectedCourseId || '') ||
        resolvedUser.level !== session.level
      ) {
        needsCookieRefresh = true;
      }
    } else if (session.role === 'admin' && !emailIsAdmin) {
      const res = NextResponse.json(
        { authenticated: false, user: null },
        { headers: NO_CACHE_HEADERS }
      );
      clearSessionCookie(res);
      return res;
    }
  } catch {
    // Gracefully fall back to verified signed cookie payload when DB is offline
  }

  const res = NextResponse.json(
    {
      authenticated: true,
      user: resolvedUser,
      expiresAt: session.exp,
    },
    { headers: NO_CACHE_HEADERS }
  );

  // Atomically sync updated status/courses into HttpOnly cookie so proxy.ts immediately unlocks /student/dashboard upon approval
  if (needsCookieRefresh) {
    setSessionCookie(res, resolvedUser);
  }

  return res;
}

// DELETE /api/auth/session — clear the 24-hour session cookie on explicit sign-out
export async function DELETE() {
  const res = NextResponse.json(
    { success: true, authenticated: false },
    { headers: NO_CACHE_HEADERS }
  );
  clearSessionCookie(res);
  return res;
}
