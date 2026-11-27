import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { MOCK_ADMIN, MOCK_STUDENTS } from '@/lib/mockData';
import { clearSessionCookie, setSessionCookie } from '@/lib/sessionCookie';
import { isAdminEmail, sanitizeUserForClient } from '@/lib/authGuard';
import { hashPassword, isPasswordHashed, safeCompareSecret, verifyPassword } from '@/lib/password';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
};

function buildLoginResponse(user: any) {
  const safeUser = sanitizeUserForClient(user);
  const res = NextResponse.json(
    {
      success: true,
      user: safeUser,
    },
    { headers: NO_CACHE_HEADERS }
  );
  // Always overwrite any previous session cookie atomically so roles can never mix
  clearSessionCookie(res);
  setSessionCookie(res, safeUser!);
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, expectedRole } = body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = typeof password === 'string' ? password.trim() : '';

    if (!normalizedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Brute-force protection: max 12 attempts per 15 minutes per IP + email
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`login:${ip}:${normalizedEmail}`, 12, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many sign-in attempts. Please wait ${rateCheck.retryAfterSeconds} seconds and try again.`,
        },
        {
          status: 429,
          headers: {
            ...NO_CACHE_HEADERS,
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const emailIsAdmin = isAdminEmail(normalizedEmail);

    // 1. STRICT ADMIN PATH — Admin accounts can NEVER cross-login through Student portal
    if (emailIsAdmin) {
      if (expectedRole === 'student') {
        return NextResponse.json(
          {
            success: false,
            error: 'This email belongs to an Administrator account. Please switch to Admin Sign In.',
          },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }

      const envAdminPassword =
        process.env.ADMIN_DEFAULT_PASSWORD ||
        process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
        MOCK_ADMIN.password ||
        '';

      let isValidAdminPass = safeCompareSecret(trimmedPassword, envAdminPassword);
      let dbAdminDoc: any = null;

      try {
        await connectToDatabase();
        dbAdminDoc = await User.findOne({ email: normalizedEmail });
        if (!isValidAdminPass && dbAdminDoc?.password) {
          isValidAdminPass = verifyPassword(trimmedPassword, dbAdminDoc.password);
          if (isValidAdminPass && !isPasswordHashed(dbAdminDoc.password)) {
            dbAdminDoc.password = hashPassword(trimmedPassword);
            await dbAdminDoc.save();
          }
        }
      } catch (dbErr) {
        console.warn('Admin DB lookup notice:', dbErr);
      }

      if (!isValidAdminPass) {
        // NEVER fall through to student login if admin password is wrong
        return NextResponse.json(
          { success: false, error: 'Invalid administrator credentials.' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      return buildLoginResponse({
        id: dbAdminDoc?._id?.toString() || MOCK_ADMIN.id,
        firebaseUid: dbAdminDoc?.firebaseUid || MOCK_ADMIN.id,
        email: normalizedEmail,
        fullName: dbAdminDoc?.fullName || MOCK_ADMIN.fullName || 'Julian Mercer',
        role: 'admin',
        mobile: dbAdminDoc?.mobile || MOCK_ADMIN.mobile || '+880 1711-000000',
        registrationDate: dbAdminDoc?.registrationDate || MOCK_ADMIN.registrationDate || '2023-01-01',
        status: 'Active',
        avatarUrl: dbAdminDoc?.avatarUrl || MOCK_ADMIN.avatarUrl,
      });
    }

    // 2. STRICT STUDENT PATH — Student emails can NEVER cross-login through Admin portal
    try {
      await connectToDatabase();
      const userDoc = await User.findOne({ email: normalizedEmail });

      if (userDoc) {
        const docIsAdmin = userDoc.role === 'admin';

        if (expectedRole === 'admin' && !docIsAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: 'This account is a Student profile, not an Administrator. Please switch to Student Sign In.',
            },
            { status: 403, headers: NO_CACHE_HEADERS }
          );
        }

        if (expectedRole === 'student' && docIsAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: 'This email belongs to an Administrator account. Please switch to Admin Sign In.',
            },
            { status: 403, headers: NO_CACHE_HEADERS }
          );
        }

        if (userDoc.password && verifyPassword(trimmedPassword, userDoc.password)) {
          // Seamlessly upgrade legacy plaintext password to salted scrypt hash
          if (!isPasswordHashed(userDoc.password)) {
            userDoc.password = hashPassword(trimmedPassword);
            await userDoc.save();
          }
          return buildLoginResponse(userDoc);
        }

        // If user exists in DB with no password set (e.g. seeded demo student or Google-only account),
        // only allow matching seeded mock student's exact password — never a blanket password backdoor
        if (!userDoc.password && !docIsAdmin) {
          const mockMatch = MOCK_STUDENTS.find((s) => s.email.toLowerCase() === normalizedEmail);
          if (mockMatch?.password && safeCompareSecret(trimmedPassword, mockMatch.password)) {
            userDoc.password = hashPassword(trimmedPassword);
            await userDoc.save();
            return buildLoginResponse(userDoc);
          }
        }

        return NextResponse.json(
          { success: false, error: 'Invalid email or password. Please verify and try again.' },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }
    } catch (dbErr) {
      console.warn('DB login query error (checking seeded demo fallback):', dbErr);
    }

    // If explicitly trying Admin login with a non-admin email
    if (expectedRole === 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'No Administrator account matches these credentials. Students should use Student Sign In.',
        },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Seeded Demo Students fallback (only when DB is unreachable or user not seeded yet)
    const mockStudent = MOCK_STUDENTS.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );
    if (mockStudent && mockStudent.password && safeCompareSecret(trimmedPassword, mockStudent.password)) {
      return buildLoginResponse({ ...mockStudent, role: 'student' });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid email or password. Please verify and try again.',
      },
      { status: 401, headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error('API /api/auth/login error:', err);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
