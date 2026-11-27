import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { MOCK_STUDENTS } from '@/lib/mockData';
import {
  requireAdmin,
  requireAuth,
  isSelfTarget,
  sanitizeUserForClient,
  isAdminEmail,
} from '@/lib/authGuard';

interface LeanUserRecord {
  _id?: { toString(): string } | string;
  firebaseUid?: string;
  email?: string;
  fullName?: string;
  role?: string;
  mobile?: string;
  dateOfBirth?: string;
  level?: string;
  status?: string;
  enrolledCourseIds?: string[];
  selectedCourseId?: string;
  avatarUrl?: string;
  registrationDate?: string;
}

interface UserPatchBody {
  email?: string;
  fullName?: string;
  mobile?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  level?: string;
  status?: string;
  role?: string;
  enrolledCourseIds?: unknown[];
  selectedCourseId?: string;
}

// GET /api/users/[id] — Admin OR the authenticated user themselves
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId).trim();

    let user: LeanUserRecord | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = (await UserModel.findById(id).lean()) as LeanUserRecord | null;
    }
    if (!user) {
      user = (await UserModel.findOne({
        $or: [{ firebaseUid: id }, { email: id.toLowerCase() }],
      }).lean()) as LeanUserRecord | null;
    }

    if (!user) {
      const mockUser = MOCK_STUDENTS.find(
        (m) => m.id === id || m.email.toLowerCase() === id.toLowerCase()
      );
      if (mockUser) {
        if (
          session.role !== 'admin' &&
          !isSelfTarget(session, id, [mockUser.id, mockUser.email])
        ) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json({
          success: true,
          user: sanitizeUserForClient(mockUser),
        });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      session.role !== 'admin' &&
      !isSelfTarget(session, id, [user._id?.toString(), user.firebaseUid, user.email])
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: true,
        user: sanitizeUserForClient(user),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] — Admin can manage students; Students can ONLY edit their own safe profile fields
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();
  let body: UserPatchBody = {};

  try {
    body = (await req.json()) as UserPatchBody;
    await connectToDatabase();

    // Locate target user first to verify ownership for non-admin callers
    let existingDoc: LeanUserRecord | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      existingDoc = (await UserModel.findById(id).lean()) as LeanUserRecord | null;
    }
    if (!existingDoc) {
      const searchTerms: Record<string, string>[] = [{ firebaseUid: id }];
      if (body.email) searchTerms.push({ email: String(body.email).toLowerCase().trim() });
      if (id.includes('@')) searchTerms.push({ email: id.toLowerCase().trim() });
      existingDoc = (await UserModel.findOne({ $or: searchTerms }).lean()) as LeanUserRecord | null;
    }

    const isAdmin = session.role === 'admin';
    const isOwner = isSelfTarget(session, id, [
      existingDoc?._id?.toString(),
      existingDoc?.firebaseUid,
      existingDoc?.email,
      body.email,
    ]);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only update your own profile.' },
        { status: 403 }
      );
    }

    // Strict field allowlist based on role (students can NEVER alter role, status, or level once active)
    const allowedFields: Record<string, unknown> = {};
    if (body.fullName !== undefined) allowedFields.fullName = String(body.fullName).trim();
    if (body.mobile !== undefined) allowedFields.mobile = String(body.mobile).trim();
    if (body.dateOfBirth !== undefined) allowedFields.dateOfBirth = String(body.dateOfBirth).trim();
    if (body.avatarUrl !== undefined) allowedFields.avatarUrl = String(body.avatarUrl).trim();

    if (isAdmin) {
      if (body.level !== undefined) allowedFields.level = body.level;
      if (body.status !== undefined) allowedFields.status = body.status;
      if (body.enrolledCourseIds !== undefined && Array.isArray(body.enrolledCourseIds)) {
        allowedFields.enrolledCourseIds = Array.from(
          new Set(body.enrolledCourseIds.map((c: unknown) => String(c).trim()).filter(Boolean))
        );
      }
      if (body.selectedCourseId !== undefined) {
        allowedFields.selectedCourseId = String(body.selectedCourseId || '').trim();
      }
      // Never allow escalating a student to admin unless email is a configured admin email
      if (body.role !== undefined && (body.role === 'student' || isAdminEmail(existingDoc?.email || body.email))) {
        allowedFields.role = body.role;
      }
    } else {
      // Allow a student to update their chosen pending course before payment
      if (body.selectedCourseId !== undefined) {
        allowedFields.selectedCourseId = String(body.selectedCourseId || '').trim();
      }
      // Allow a Pending student (e.g., Google sign-up completing onboarding in the Payment Lobby)
      // to set their initial expertise level before Admin approval
      if (
        existingDoc?.status === 'Pending' &&
        typeof body.level === 'string' &&
        ['Beginner', 'Intermediate', 'Advanced'].includes(body.level)
      ) {
        allowedFields.level = body.level;
      }
    }

    let userDoc: LeanUserRecord | null = null;

    if (existingDoc?._id) {
      userDoc = (await UserModel.findByIdAndUpdate(existingDoc._id, allowedFields, {
        new: true,
        runValidators: true,
      }).lean()) as LeanUserRecord | null;
    } else if (isAdmin) {
      // Only Admin may upsert a seeded mock student who wasn't yet in MongoDB
      const mockStudent = MOCK_STUDENTS.find(
        (m) => m.id === id || (body.email && m.email.toLowerCase() === String(body.email).toLowerCase())
      );
      if (mockStudent) {
        userDoc = (await UserModel.findOneAndUpdate(
          { email: (body.email || mockStudent.email).toLowerCase().trim() },
          {
            firebaseUid: mockStudent.id,
            email: (body.email || mockStudent.email).toLowerCase().trim(),
            fullName: body.fullName || mockStudent.fullName,
            role: 'student',
            mobile: body.mobile || mockStudent.mobile,
            dateOfBirth: mockStudent.dateOfBirth || '',
            level: body.level || mockStudent.level || 'Beginner',
            registrationDate: mockStudent.registrationDate,
            status: body.status || mockStudent.status || 'Active',
            avatarUrl: mockStudent.avatarUrl,
            ...allowedFields,
          },
          { upsert: true, new: true, runValidators: true }
        ).lean()) as LeanUserRecord | null;
      }
    }

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUserForClient(userDoc),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update user.';
    console.warn('⚠️ PATCH /api/users/[id] notice:', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] — Strictly Administrator only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId).trim();

  if (isSelfTarget(auth.session, id)) {
    return NextResponse.json(
      { success: false, error: 'Cannot delete the active administrator account.' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    let deletedUser = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedUser = await UserModel.findOneAndDelete({ _id: id, role: { $ne: 'admin' } }).lean();
    }
    if (!deletedUser) {
      deletedUser = await UserModel.findOneAndDelete({
        $or: [{ firebaseUid: id }, { email: id.toLowerCase() }],
        role: { $ne: 'admin' },
      }).lean();
    }

    return NextResponse.json({ success: true, message: 'Student permanently deleted from database' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete user';
    console.warn('⚠️ DELETE /api/users/[id] notice:', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
