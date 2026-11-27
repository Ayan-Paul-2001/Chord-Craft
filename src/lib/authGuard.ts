import { NextRequest, NextResponse } from 'next/server';
import { readSessionCookie, SessionPayload } from '@/lib/sessionCookie';
import { MOCK_ADMIN } from '@/lib/mockData';
import { StudentLevel, User, UserRole, UserStatus } from '@/lib/types';

export const ADMIN_EMAILS = Array.from(
  new Set(
    [
      'admin@chordandcraft.com',
      'mentor@chordandcraft.com',
      (MOCK_ADMIN.email || '').toLowerCase().trim(),
      (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
      (process.env.ADMIN_DEFAULT_EMAIL || '').toLowerCase().trim(),
      (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase().trim(),
    ].filter(Boolean)
  )
);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function getSession(req: NextRequest): SessionPayload | null {
  return readSessionCookie(req);
}

export function requireAuth(
  req: NextRequest
): { session: SessionPayload; error?: never } | { session?: never; error: NextResponse } {
  const session = readSessionCookie(req);
  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }
  return { session };
}

export function requireAdmin(
  req: NextRequest
): { session: SessionPayload; error?: never } | { session?: never; error: NextResponse } {
  const auth = requireAuth(req);
  if (auth.error) return auth;

  if (auth.session.role !== 'admin') {
    return {
      error: NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return { session: auth.session };
}

export function getSessionIdentifiers(session: SessionPayload): string[] {
  return Array.from(
    new Set(
      [
        session.id,
        session.firebaseUid,
        session.email?.toLowerCase().trim(),
      ].filter((v): v is string => typeof v === 'string' && v.length > 0)
    )
  );
}

export function isSelfTarget(
  session: SessionPayload,
  targetIdOrEmail: string,
  extraIdentifiers: (string | undefined | null)[] = []
): boolean {
  const normalizedTarget = (targetIdOrEmail || '').trim().toLowerCase();
  if (!normalizedTarget) return false;

  const sessionIds = new Set(
    [...getSessionIdentifiers(session), ...extraIdentifiers]
      .filter(Boolean)
      .map((s) => String(s).trim().toLowerCase())
  );

  return sessionIds.has(normalizedTarget);
}

interface RawUserRecord {
  _id?: { toString(): string } | string;
  id?: string;
  firebaseUid?: string;
  email?: string;
  fullName?: string;
  role?: UserRole | string;
  mobile?: string;
  dateOfBirth?: string;
  level?: StudentLevel | string;
  registrationDate?: string;
  status?: UserStatus | string;
  avatarUrl?: string;
  enrolledCourseIds?: unknown;
  selectedCourseId?: unknown;
}

export function sanitizeUserForClient(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const u = raw as RawUserRecord;
  const id = u._id ? (typeof u._id === 'string' ? u._id : u._id.toString()) : String(u.id || '');
  const enrolledCourseIds: string[] = Array.isArray(u.enrolledCourseIds)
    ? Array.from(
      new Set<string>(
        u.enrolledCourseIds
          .map((c: unknown) => String(c).trim())
          .filter((c: string): c is string => c.length > 0)
      )
    )
    : [];

  return {
    id,
    firebaseUid: u.firebaseUid || id,
    email: u.email || '',
    fullName: u.fullName || '',
    role: (u.role === 'admin' ? 'admin' : 'student') as UserRole,
    mobile: u.mobile || '',
    dateOfBirth: u.dateOfBirth || '',
    level: (u.level as StudentLevel | undefined) || undefined,
    registrationDate: u.registrationDate || '',
    status: (u.status || 'Pending') as UserStatus,
    avatarUrl: u.avatarUrl || '',
    enrolledCourseIds,
    selectedCourseId: u.selectedCourseId ? String(u.selectedCourseId).trim() : '',
  };
}
