import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LessonProgressModel from '@/models/LessonProgress';
import UserModel from '@/models/User';
import { requireAuth } from '@/lib/authGuard';

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

// GET /api/lesson-progress — Admin sees all; Student sees ONLY their own progress
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    const query: Record<string, unknown> = {};
    if (lessonId) query.lessonId = lessonId;

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
            session.email?.toLowerCase().trim(),
            dbUser?._id?.toString(),
            dbUser?.firebaseUid,
            dbUser?.email?.toLowerCase().trim(),
          ].filter(Boolean)
        )
      ) as string[];
      query.studentId = { $in: ownIds };
    }

    const records = await LessonProgressModel.find(query).lean();

    return NextResponse.json(
      {
        success: true,
        lessonProgress: records.map((r) => ({
          studentId: r.studentId,
          lessonId: r.lessonId,
          status: r.status,
          lastAccessed: r.lastAccessed ? r.lastAccessed.toISOString().split('T')[0] : undefined,
          completedAt: r.completedAt ? r.completedAt.toISOString().split('T')[0] : undefined,
        })),
      },
      { headers: NO_CACHE }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch lesson progress' }, { status: 500 });
  }
}

// POST /api/lesson-progress — Students can ONLY update their own progress
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();
    const body = await req.json();

    const validStatuses = ['Locked', 'Unlocked', 'In Progress', 'Completed'];
    if (!body.lessonId || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Valid lessonId and status are required' }, { status: 400 });
    }

    // Non-admin callers are strictly scoped to their own verified session ID
    const targetStudentId =
      session.role === 'admin' && body.studentId ? String(body.studentId) : session.id;

    const updateData: Record<string, unknown> = {
      status: body.status,
      lastAccessed: new Date(),
    };
    if (body.status === 'Completed') {
      updateData.completedAt = new Date();
    }

    const record = await LessonProgressModel.findOneAndUpdate(
      { studentId: targetStudentId, lessonId: String(body.lessonId) },
      updateData,
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        lessonProgress: {
          studentId: record!.studentId,
          lessonId: record!.lessonId,
          status: record!.status,
          lastAccessed: record!.lastAccessed ? record!.lastAccessed.toISOString().split('T')[0] : undefined,
          completedAt: record!.completedAt ? record!.completedAt.toISOString().split('T')[0] : undefined,
        },
      },
      { headers: NO_CACHE }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update lesson progress' }, { status: 500 });
  }
}
