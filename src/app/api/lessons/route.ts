import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import LessonModel from '@/models/Lesson';
import LessonAccessModel from '@/models/LessonAccess';
import UserModel from '@/models/User';
import { MOCK_LESSONS } from '@/lib/mockData';
import { getSession, requireAdmin } from '@/lib/authGuard';
import { matchesLessonIdentifier } from '@/lib/utils';

async function seedLessonsIfEmpty() {
  const count = await LessonModel.countDocuments();
  if (count === 0) {
    await LessonModel.insertMany(
      MOCK_LESSONS.map((l) => ({
        title: l.title,
        description: l.description,
        level: l.level,
        courseId: l.courseId || 'common',
        lessonNumber: l.lessonNumber,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl || '',
        tabFileUrl: l.tabFileUrl || '',
        tabPreviewText: l.tabPreviewText || '',
        thumbnail: l.thumbnail,
        durationMinutes: l.durationMinutes,
        instructorNotes: l.instructorNotes || '',
        isPublic: !!l.isPublic,
      }))
    );
    console.log('✅ Seeded lessons collection with mock data');
  } else {
    // Backfill courseId on legacy lessons seeded before courses were introduced
    const missingCourse = await LessonModel.find({
      $or: [{ courseId: { $exists: false } }, { courseId: '' }],
    }).lean();
    if (missingCourse.length > 0) {
      await LessonModel.bulkWrite(
        missingCourse.map((doc: any) => {
          const mockMatch = MOCK_LESSONS.find((m) => m.lessonNumber === doc.lessonNumber);
          return {
            updateOne: {
              filter: { _id: doc._id },
              update: { $set: { courseId: mockMatch?.courseId || 'common' } },
            },
          };
        })
      );
    }
  }
}

function serializeLesson(l: any, includePrivateMedia: boolean) {
  return {
    id: l._id ? l._id.toString() : l.id,
    title: l.title,
    description: l.description,
    level: l.level,
    courseId: l.courseId || 'common',
    lessonNumber: l.lessonNumber,
    videoUrl: includePrivateMedia ? l.videoUrl || '' : '',
    audioUrl: includePrivateMedia ? l.audioUrl || '' : '',
    tabFileUrl: includePrivateMedia ? l.tabFileUrl || '' : '',
    tabPreviewText: includePrivateMedia ? l.tabPreviewText || '' : '',
    thumbnail: l.thumbnail,
    durationMinutes: l.durationMinutes,
    instructorNotes: includePrivateMedia ? l.instructorNotes || '' : '',
    isPublic: !!l.isPublic,
    createdAt:
      l.createdAt instanceof Date
        ? l.createdAt.toISOString().split('T')[0]
        : String(l.createdAt || ''),
  };
}

// GET /api/lessons — Enforces server-side media redaction for locked lessons
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedLessonsIfEmpty();

    const session = getSession(req);
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');

    const query: Record<string, unknown> = {};
    if (level && level !== 'All') query.level = level;

    const lessons = await LessonModel.find(query).sort({ lessonNumber: 1 }).lean();

    // Admin sees every lesson with full media
    if (session?.role === 'admin') {
      return NextResponse.json(
        {
          success: true,
          lessons: lessons.map((l) => serializeLesson(l, true)),
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Active Student sees full media ONLY for public lessons + Common classes + their enrolled courses + admin-unlocked lessons
    let studentAccessRecords: { studentId: string; lessonId: string; isUnlocked: boolean }[] = [];
    let isActiveStudent = false;
    let studentEnrolledCourses: string[] = [];

    if (session?.role === 'student') {
      const dbUser = await UserModel.findOne({ email: session.email.toLowerCase().trim() }).lean() as any;
      const effectiveStatus = dbUser?.status || session.status;
      isActiveStudent = effectiveStatus === 'Active';
      studentEnrolledCourses = Array.isArray(dbUser?.enrolledCourseIds)
        ? dbUser.enrolledCourseIds
        : Array.isArray(session.enrolledCourseIds)
        ? session.enrolledCourseIds
        : [];

      if (isActiveStudent) {
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

        const regexSafeIds = idVariants.flatMap((v) => [v, v.toLowerCase()]);
        const records = await LessonAccessModel.find({
          studentId: { $in: Array.from(new Set(regexSafeIds)) },
        }).lean();

        studentAccessRecords = records.map((r) => ({
          studentId: r.studentId,
          lessonId: r.lessonId,
          isUnlocked: r.isUnlocked,
        }));
      }
    }

    const mapped = lessons.map((l: any) => {
      const lessonCourseId = (l.courseId || 'common').trim();
      const isCommonClass = !lessonCourseId || lessonCourseId.toLowerCase() === 'common';
      const isEnrolledInCourse = !isCommonClass && studentEnrolledCourses.includes(lessonCourseId);
      const lessonObj = { id: l._id.toString(), lessonNumber: l.lessonNumber, isPublic: !!l.isPublic };
      let canAccessMedia = lessonObj.isPublic;

      if (!canAccessMedia && isActiveStudent) {
        const matching = studentAccessRecords.filter((rec) =>
          matchesLessonIdentifier(rec.lessonId, lessonObj)
        );
        if (matching.length > 0) {
          const exact = matching.filter((m) => m.lessonId === lessonObj.id);
          const effective = exact.length > 0 ? exact : matching;
          canAccessMedia = effective.some((m) => m.isUnlocked === true);
        } else {
          canAccessMedia = isCommonClass || isEnrolledInCourse;
        }
      }

      return serializeLesson(l, canAccessMedia);
    });

    return NextResponse.json(
      {
        success: true,
        lessons: mapped,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('GET /api/lessons error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch lessons' }, { status: 500 });
  }
}

// POST /api/lessons — Strictly Administrator only
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const body = await req.json();

    const lesson = await LessonModel.create({
      title: body.title,
      description: body.description,
      level: body.level,
      courseId: body.courseId ? String(body.courseId).trim() : 'common',
      lessonNumber: body.lessonNumber,
      videoUrl: body.videoUrl,
      audioUrl: body.audioUrl || '',
      tabFileUrl: body.tabFileUrl || '',
      tabPreviewText: body.tabPreviewText || '',
      thumbnail: body.thumbnail,
      durationMinutes: body.durationMinutes || 30,
      instructorNotes: body.instructorNotes || '',
      isPublic: !!body.isPublic,
    });

    return NextResponse.json(
      {
        success: true,
        lesson: serializeLesson(lesson.toObject(), true),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/lessons error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create lesson' }, { status: 500 });
  }
}
