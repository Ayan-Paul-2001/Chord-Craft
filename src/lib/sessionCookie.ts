import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { StudentLevel, User, UserRole, UserStatus } from '@/lib/types';

export const SESSION_COOKIE_NAME = 'chordandcraft_session';
export const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours
export const SESSION_DURATION_MS = SESSION_MAX_AGE_SECONDS * 1000;

export interface SessionPayload {
  id: string;
  firebaseUid?: string;
  email: string;
  fullName: string;
  role: UserRole;
  mobile?: string;
  dateOfBirth?: string;
  level?: StudentLevel;
  registrationDate?: string;
  status: UserStatus;
  avatarUrl?: string;
  enrolledCourseIds?: string[];
  selectedCourseId?: string;
  iat: number;
  exp: number;
}

// Ephemeral process-level fallback secret if no server env vars exist (never uses NEXT_PUBLIC_*)
const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.MONGODB_URI ||
    process.env.CLOUDINARY_API_SECRET ||
    process.env.GMAIL_APP_PASSWORD ||
    EPHEMERAL_FALLBACK_SECRET;

  // Derive a dedicated signing key via SHA-256 domain separation so raw env secrets are never directly used as HMAC keys
  return crypto
    .createHash('sha256')
    .update(`chord-and-craft-session-key-v2:${secret}`)
    .digest('hex');
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function createSessionToken(user: Partial<User>): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  const payload: SessionPayload = {
    id: user.id || user.firebaseUid || '',
    firebaseUid: user.firebaseUid || user.id || '',
    email: (user.email || '').toLowerCase().trim(),
    fullName: user.fullName || 'Chord & Craft Member',
    role: user.role || 'student',
    mobile: user.mobile || '',
    dateOfBirth: user.dateOfBirth || '',
    level: user.level,
    registrationDate: user.registrationDate || '',
    status: user.status || 'Active',
    avatarUrl: user.avatarUrl || '',
    enrolledCourseIds: Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds : [],
    selectedCourseId: user.selectedCourseId || '',
    iat: now,
    exp: expiresAt,
  };

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayload(encoded);
  return { token: `${encoded}.${signature}`, expiresAt };
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  try {
    const expectedSig = signPayload(encoded);
    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');

    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SessionPayload;

    if (!parsed || !parsed.email || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, user: Partial<User>): number {
  const { token, expiresAt } = createSessionToken(user);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return expiresAt;
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function readSessionCookie(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
