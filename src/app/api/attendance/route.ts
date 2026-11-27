import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';
import UserModel from '@/models/User';
import { MOCK_ATTENDANCE } from '@/lib/mockData';
import { requireAdmin, requireAuth } from '@/lib/authGuard';

async function seedAttendanceIfEmpty() {
  const count = await AttendanceModel.countDocuments();
  if (count === 0) {
    await AttendanceModel.insertMany(
      MOCK_ATTENDANCE.map((a) => ({
        studentId: a.studentId,
        studentName: a.studentName,
        date: a.date,
        status: a.status,
        notes: a.notes || '',
      }))
    );
    console.log('✅ Seeded attendance collection');
  }
}

// GET /api/attendance — Admin sees all; Student sees ONLY their own attendance
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();
    await seedAttendanceIfEmpty();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const query: Record<string, unknown> = {};
    if (date) query.date = date;

    if (session.role === 'admin') {
      const studentId = searchParams.get('studentId');
      if (studentId) query.studentId = studentId;
    } else {
      const dbUser = await UserModel.findOne({ email: session.email.toLowerCase().trim() }).lean() as any;
      const ownIds = Array.from(
        new Set(
          [
            session.id,
            session.firebaseUid,
            dbUser?._id?.toString(),
            dbUser?.firebaseUid,
          ].filter(Boolean)
        )
      ) as string[];
      query.studentId = { $in: ownIds };
    }

    const records = await AttendanceModel.find(query).sort({ date: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        attendance: records.map((a) => ({
          id: a._id.toString(),
          studentId: a.studentId,
          studentName: a.studentName,
          date: a.date,
          status: a.status,
          notes: a.notes,
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/attendance — Strictly Administrator only
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();

    const record = await AttendanceModel.create({
      studentId: body.studentId,
      studentName: body.studentName,
      date: body.date,
      status: body.status,
      notes: body.notes || '',
    });

    return NextResponse.json(
      {
        success: true,
        attendance: {
          id: record._id.toString(),
          studentId: record.studentId,
          studentName: record.studentName,
          date: record.date,
          status: record.status,
          notes: record.notes,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/attendance error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to record attendance' }, { status: 500 });
  }
}
