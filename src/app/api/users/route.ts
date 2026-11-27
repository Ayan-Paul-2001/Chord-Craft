import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { MOCK_STUDENTS } from '@/lib/mockData';
import { requireAdmin, sanitizeUserForClient } from '@/lib/authGuard';

async function seedUsersIfEmpty() {
  try {
    for (const s of MOCK_STUDENTS) {
      const exists = await UserModel.findOne({ email: s.email.toLowerCase().trim() });
      if (!exists) {
        await UserModel.create({
          firebaseUid: s.id,
          email: s.email.toLowerCase().trim(),
          fullName: s.fullName,
          role: s.role,
          mobile: s.mobile,
          dateOfBirth: s.dateOfBirth || '',
          level: s.level || 'Beginner',
          registrationDate: s.registrationDate,
          status: s.status || 'Active',
          avatarUrl: s.avatarUrl,
          enrolledCourseIds: s.enrolledCourseIds || [],
          selectedCourseId: s.selectedCourseId || '',
        });
      } else if (
        (!exists.enrolledCourseIds || exists.enrolledCourseIds.length === 0) &&
        s.enrolledCourseIds &&
        s.enrolledCourseIds.length > 0
      ) {
        exists.enrolledCourseIds = s.enrolledCourseIds;
        if (!exists.selectedCourseId && s.selectedCourseId) {
          exists.selectedCourseId = s.selectedCourseId;
        }
        await exists.save();
      }
    }
  } catch (seedErr) {
    console.warn('⚠️ Notice during user auto-seeding:', seedErr);
  }
}

// GET /api/users?role=student — Strictly Administrator only (protects student PII)
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    await seedUsersIfEmpty();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};
    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;

    const users = await UserModel.find(query).sort({ registrationDate: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        users: users.map((u) => sanitizeUserForClient(u)),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.warn('⚠️ GET /api/users notice (serving fallback roster while DB is offline):', error?.message || error);
    return NextResponse.json({
      success: true,
      fallback: true,
      users: MOCK_STUDENTS.map((s) => sanitizeUserForClient(s)),
    });
  }
}
