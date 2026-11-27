import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { StudentLevel } from '@/lib/types';
import { MOCK_STUDENTS } from '@/lib/mockData';
import { clearSessionCookie, setSessionCookie } from '@/lib/sessionCookie';
import { isAdminEmail, sanitizeUserForClient } from '@/lib/authGuard';
import { hashPassword } from '@/lib/password';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
};

interface VerifiedFirebaseIdentity {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
}

/**
 * Cryptographically verifies a Firebase ID token against Google Firebase Identity Toolkit.
 * Prevents forged /api/auth/sync calls from impersonating any user or admin.
 */
async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseIdentity | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!idToken || !apiKey) return null;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const account = Array.isArray(data?.users) ? data.users[0] : null;
    if (!account?.localId || !account?.email) return null;

    return {
      firebaseUid: String(account.localId),
      email: String(account.email).toLowerCase().trim(),
      displayName: account.displayName ? String(account.displayName) : undefined,
      photoUrl: account.photoUrl ? String(account.photoUrl) : undefined,
    };
  } catch (err) {
    console.error('Firebase ID token verification failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const idToken = bearerToken || (typeof body.idToken === 'string' ? body.idToken.trim() : '');

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Missing Firebase authentication token.' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const verified = await verifyFirebaseIdToken(idToken);
    if (!verified) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired authentication token.' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const { firebaseUid, email: normalizedEmail } = verified;
    const {
      password,
      fullName,
      mobile,
      dateOfBirth,
      level,
      avatarUrl,
      selectedCourseId,
      mode = 'signup', // 'login' | 'signup'
    } = body;

    // STRICT ROLE SEPARATION: Admin accounts can NEVER authenticate or escalate via Student Firebase/OAuth sync
    if (isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Administrator accounts cannot use Student Sign-Up or Google Sign-In. Please sign in with your email and password.',
        },
        { status: 403, headers: NO_CACHE_HEADERS }
      );
    }

    const mockStudent = MOCK_STUDENTS.find((m) => m.email.toLowerCase() === normalizedEmail);
    const validLevels: StudentLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
    const safeLevel: StudentLevel = validLevels.includes(level) ? level : (mockStudent?.level || 'Beginner');

    try {
      await connectToDatabase();

      let userDoc = await User.findOne({
        $or: [{ firebaseUid }, { email: normalizedEmail }],
      });

      // Block cross-login if an existing DB account has admin privileges
      if (userDoc && userDoc.role === 'admin') {
        return NextResponse.json(
          {
            success: false,
            error:
              'This email belongs to an Administrator account. Please sign in with your email and password.',
          },
          { status: 403, headers: NO_CACHE_HEADERS }
        );
      }

      if (mode === 'login' && !userDoc) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: 'No student account found with this Google/Apple ID. Please complete enrollment first.',
          },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      const hashedPass =
        typeof password === 'string' && password.trim().length >= 6
          ? hashPassword(password.trim())
          : undefined;

      if (userDoc) {
        // Preserve admin-controlled level, role ('student'), enrolled courses, and status
        userDoc.firebaseUid = firebaseUid;
        if (hashedPass) userDoc.password = hashedPass;
        if (fullName && !userDoc.fullName) userDoc.fullName = String(fullName).trim();
        if (mobile && !userDoc.mobile) userDoc.mobile = String(mobile).trim();
        if (dateOfBirth && !userDoc.dateOfBirth) userDoc.dateOfBirth = String(dateOfBirth).trim();
        if (selectedCourseId && String(selectedCourseId).trim()) {
          userDoc.selectedCourseId = String(selectedCourseId).trim();
        }
        if ((avatarUrl || verified.photoUrl) && !userDoc.avatarUrl) {
          userDoc.avatarUrl = avatarUrl || verified.photoUrl;
        }
        await userDoc.save();
      } else {
        userDoc = await User.create({
          firebaseUid,
          email: normalizedEmail,
          password: hashedPass || '',
          fullName:
            (fullName && String(fullName).trim()) ||
            verified.displayName ||
            normalizedEmail.split('@')[0],
          role: 'student',
          mobile: (mobile && String(mobile).trim()) || (mockStudent ? mockStudent.mobile : ''),
          dateOfBirth: (dateOfBirth && String(dateOfBirth).trim()) || (mockStudent ? mockStudent.dateOfBirth : ''),
          level: safeLevel,
          status: mockStudent ? mockStudent.status : 'Pending',
          enrolledCourseIds: mockStudent?.enrolledCourseIds || [],
          selectedCourseId:
            (selectedCourseId && String(selectedCourseId).trim()) ||
            mockStudent?.selectedCourseId ||
            '',
          avatarUrl:
            avatarUrl ||
            verified.photoUrl ||
            (mockStudent
              ? mockStudent.avatarUrl
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'),
          registrationDate: new Date().toISOString().split('T')[0],
        });
      }

      const syncedUser = sanitizeUserForClient(userDoc)!;
      const res = NextResponse.json(
        {
          success: true,
          user: syncedUser,
        },
        { headers: NO_CACHE_HEADERS }
      );
      clearSessionCookie(res);
      setSessionCookie(res, syncedUser);
      return res;
    } catch (dbError) {
      console.warn('⚠️ MongoDB sync notice (Database may be offline):', dbError);

      if (mode === 'login' && !mockStudent) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: 'No student account found with this Google/Apple ID. Please complete enrollment first.',
          },
          { status: 404, headers: NO_CACHE_HEADERS }
        );
      }

      const fallbackUser = sanitizeUserForClient({
        id: firebaseUid,
        firebaseUid,
        email: normalizedEmail,
        fullName:
          (fullName && String(fullName).trim()) ||
          verified.displayName ||
          (mockStudent ? mockStudent.fullName : normalizedEmail.split('@')[0]),
        role: 'student',
        mobile: (mobile && String(mobile).trim()) || (mockStudent ? mockStudent.mobile : ''),
        dateOfBirth: (dateOfBirth && String(dateOfBirth).trim()) || (mockStudent ? mockStudent.dateOfBirth : ''),
        level: safeLevel,
        registrationDate: new Date().toISOString().split('T')[0],
        status: mockStudent ? mockStudent.status : 'Pending',
        avatarUrl:
          avatarUrl ||
          verified.photoUrl ||
          (mockStudent
            ? mockStudent.avatarUrl
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'),
      })!;

      const res = NextResponse.json(
        {
          success: true,
          fallback: true,
          user: fallbackUser,
        },
        { headers: NO_CACHE_HEADERS }
      );
      clearSessionCookie(res);
      setSessionCookie(res, fallbackUser);
      return res;
    }
  } catch (error: any) {
    console.error('API /api/auth/sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user authentication.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
