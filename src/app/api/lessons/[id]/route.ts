import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import LessonModel from '@/models/Lesson';
import LessonAccessModel from '@/models/LessonAccess';
import UserModel from '@/models/User';
import { MOCK_LESSONS } from '@/lib/mockData';
import { getSession, requireAdmin } from '@/lib/authGuard';
import { matchesLessonIdentifier } from '@/lib/utils';

interface LessonDocLike {
  _id?: { toString(): string } | string;
  id?: string;
  title?: string;
  description?: string;
  level?: string;
  courseId?: string;
  lessonNumber: number;
  videoUrl?: string;
  audioUrl?: string;
  tabFileUrl?: string;
  tabPreviewText?: string;
  thumbnail?: string;
  durationMinutes?: number;
  instructorNotes?: string;
  isPublic?: boolean;
  createdAt?: Date | string;
}

interface LeanStudentRecord {
  _id?: { toString(): string } | string;
  firebaseUid?: string;
  email?: string;
  status?: string;
  enrolledCourseIds?: string[];
}

// GET /api/lessons/[id] — Public lessons open to all; private lessons strictly require Admin or unlocked Active Student
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let lesson: LessonDocLike | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = (await LessonModel.findById(id).lean()) as unknown as LessonDocLike | null;
    }
    if (!lesson) {
      const numMatch = id.match(/lsn-(\d+)/i);
      if (numMatch) {
        lesson = (await LessonModel.findOne({ lessonNumber: Number(numMatch[1]) }).lean()) as unknown as LessonDocLike | null;
      }
    }
    if (!lesson) {
      const mockLesson = MOCK_LESSONS.find((l) => l.id === id);
      if (mockLesson) {
        lesson = mockLesson;
      } else {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }
    }

    const session = getSession(req);
    const lessonObj = {
      id: lesson._id ? lesson._id.toString() : lesson.id || id,
      lessonNumber: lesson.lessonNumber,
      isPublic: !!lesson.isPublic,
    };

    let allowed = lessonObj.isPublic || session?.role === 'admin';

    if (!allowed && session?.role === 'student') {
      const dbUser = (await UserModel.findOne({
        email: session.email.toLowerCase().trim(),
      }).lean()) as unknown as LeanStudentRecord | null;
      const effectiveStatus = dbUser?.status || session.status;
      if (effectiveStatus === 'Active') {
        const enrolledCourseIds: string[] = Array.isArray(dbUser?.enrolledCourseIds)
          ? dbUser.enrolledCourseIds
          : Array.isArray(session.enrolledCourseIds)
          ? session.enrolledCourseIds
          : [];
        const lessonCourseId = (lesson.courseId || 'common').trim();
        const isCommonClass = !lessonCourseId || lessonCourseId.toLowerCase() === 'common';
        const isEnrolledInCourse = !isCommonClass && enrolledCourseIds.includes(lessonCourseId);

        const idVariants = Array.from(
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
        const records = await LessonAccessModel.find({
          studentId: { $in: idVariants },
        }).lean();
        const matching = records.filter((r) => matchesLessonIdentifier(r.lessonId, lessonObj));
        if (matching.length > 0) {
          const exact = matching.filter((m) => m.lessonId === lessonObj.id);
          const effective = exact.length > 0 ? exact : matching;
          allowed = effective.some((m) => m.isUnlocked === true);
        } else {
          allowed = isCommonClass || isEnrolledInCourse;
        }
      }
    }

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'This lesson is locked for your account.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson: {
        id: lessonObj.id,
        title: lesson.title,
        description: lesson.description,
        level: lesson.level,
        courseId: lesson.courseId || 'common',
        lessonNumber: lesson.lessonNumber,
        videoUrl: lesson.videoUrl,
        audioUrl: lesson.audioUrl,
        tabFileUrl: lesson.tabFileUrl,
        tabPreviewText: lesson.tabPreviewText,
        thumbnail: lesson.thumbnail,
        durationMinutes: lesson.durationMinutes,
        instructorNotes: lesson.instructorNotes,
        isPublic: !!lesson.isPublic,
        createdAt:
          lesson.createdAt instanceof Date
            ? lesson.createdAt.toISOString().split('T')[0]
            : String(lesson.createdAt || new Date().toISOString().split('T')[0]),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

// PUT /api/lessons/[id] — Strictly Administrator only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    let lesson: LessonDocLike | null = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = (await LessonModel.findByIdAndUpdate(id, body, {
        returnDocument: 'after',
        runValidators: true,
      }).lean()) as unknown as LessonDocLike | null;
    }

    if (!lesson) {
      const numMatch = id.match(/lsn-(\d+)/i);
      const targetLessonNumber =
        typeof body.lessonNumber === 'number'
          ? body.lessonNumber
          : numMatch
          ? Number(numMatch[1])
          : undefined;

      if (targetLessonNumber !== undefined) {
        lesson = (await LessonModel.findOneAndUpdate(
          { lessonNumber: targetLessonNumber },
          body,
          { upsert: true, returnDocument: 'after', runValidators: true }
        ).lean()) as unknown as LessonDocLike | null;
      } else {
        const created = await LessonModel.create(body);
        lesson = created.toObject() as unknown as LessonDocLike;
      }
    }

    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson._id?.toString() || id,
        ...lesson,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id] — Strictly Administrator only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;

    let lesson = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      lesson = await LessonModel.findByIdAndDelete(id);
    }
    if (!lesson) {
      const numMatch = id.match(/lsn-(\d+)/i);
      if (numMatch) {
        lesson = await LessonModel.findOneAndDelete({ lessonNumber: Number(numMatch[1]) });
      }
    }

    return NextResponse.json({ success: true, message: 'Lesson deleted' });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
