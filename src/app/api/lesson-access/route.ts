import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LessonAccessModel from '@/models/LessonAccess';
import UserModel from '@/models/User';
import { requireAdmin, requireAuth } from '@/lib/authGuard';

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

// GET /api/lesson-access — Admin gets all (or filtered); Student gets ONLY their own access records
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
      // Student can ONLY inspect their own unlock records (resolving all aliases in MongoDB)
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

    const records = await LessonAccessModel.find(query).lean();

    return NextResponse.json(
      {
        success: true,
        lessonAccess: records.map((r) => ({
          studentId: r.studentId,
          lessonId: r.lessonId,
          isUnlocked: r.isUnlocked,
          unlockedAt: r.unlockedAt ? r.unlockedAt.toISOString().split('T')[0] : undefined,
        })),
      },
      { headers: NO_CACHE }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch lesson access' }, { status: 500 });
  }
}

// POST /api/lesson-access — Strictly Administrator only (supports single or bulk alias sync)
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();

    // Support atomic batch writes when admin toggles or bulk-sets across student/lesson aliases
    if (Array.isArray(body.records) && body.records.length > 0) {
      const now = new Date();
      await LessonAccessModel.bulkWrite(
        body.records
          .filter((r: any) => r?.studentId && r?.lessonId)
          .map((r: any) => ({
            updateOne: {
              filter: { studentId: String(r.studentId), lessonId: String(r.lessonId) },
              update: {
                $set: {
                  isUnlocked: Boolean(r.isUnlocked),
                  unlockedAt: r.isUnlocked ? now : null,
                },
              },
              upsert: true,
            },
          }))
      );

      return NextResponse.json({ success: true, count: body.records.length }, { headers: NO_CACHE });
    }

    if (!body.studentId || !body.lessonId) {
      return NextResponse.json({ error: 'studentId and lessonId are required' }, { status: 400 });
    }

    const record = await LessonAccessModel.findOneAndUpdate(
      { studentId: String(body.studentId), lessonId: String(body.lessonId) },
      {
        isUnlocked: Boolean(body.isUnlocked),
        unlockedAt: body.isUnlocked ? new Date() : null,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        lessonAccess: {
          studentId: record!.studentId,
          lessonId: record!.lessonId,
          isUnlocked: record!.isUnlocked,
          unlockedAt: record!.unlockedAt ? record!.unlockedAt.toISOString().split('T')[0] : undefined,
        },
      },
      { headers: NO_CACHE }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update lesson access' }, { status: 500 });
  }
}

// PATCH /api/lesson-access — Strictly Administrator only
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.studentId || !body.lessonId) {
      return NextResponse.json({ error: 'studentId and lessonId are required' }, { status: 400 });
    }

    const existing = await LessonAccessModel.findOne({
      studentId: String(body.studentId),
      lessonId: String(body.lessonId),
    });
    const newState = existing ? !existing.isUnlocked : true;

    const record = await LessonAccessModel.findOneAndUpdate(
      { studentId: String(body.studentId), lessonId: String(body.lessonId) },
      { isUnlocked: newState, unlockedAt: newState ? new Date() : null },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json(
      {
        success: true,
        lessonAccess: {
          studentId: record!.studentId,
          lessonId: record!.lessonId,
          isUnlocked: record!.isUnlocked,
        },
      },
      { headers: NO_CACHE }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to toggle lesson access' }, { status: 500 });
  }
}
