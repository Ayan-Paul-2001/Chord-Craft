import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { MOCK_COURSES } from '@/lib/mockData';
import { requireAdmin } from '@/lib/authGuard';

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};

let seedCoursesPromise: Promise<void> | null = null;

async function seedCoursesIfEmpty() {
  if (seedCoursesPromise) {
    await seedCoursesPromise;
    return;
  }
  seedCoursesPromise = (async () => {
    const count = await CourseModel.countDocuments();
    if (count === 0) {
      await Promise.all(
        MOCK_COURSES.map((c) =>
          CourseModel.updateOne(
            { courseKey: c.id },
            {
              $setOnInsert: {
                courseKey: c.id,
                title: c.title,
                subtitle: c.subtitle,
                description: c.description,
                level: c.level,
                price: c.price,
                originalPrice: c.originalPrice || 0,
                duration: c.duration,
                totalModules: c.totalModules,
                thumbnail: c.thumbnail,
                highlights: c.highlights || [],
                instructorName: c.instructorName || 'Julian Mercer',
                badge: c.badge || '',
                isFeatured: c.isFeatured ?? true,
                isActive: c.isActive ?? true,
                order: c.order || 1,
              },
            },
            { upsert: true }
          )
        )
      );
      console.log('✅ Seeded courses collection with demo courses');
    } else {
      // One-time self-healing cleanup if parallel dev hits ever inserted duplicate courseKey docs
      const allDocs = (await CourseModel.find({}, { _id: 1, courseKey: 1 })
        .sort({ createdAt: 1 })
        .lean()) as unknown as Array<{ _id: { toString(): string } | string; courseKey?: string }>;
      const seenKeys = new Set<string>();
      const duplicateIds: string[] = [];
      for (const d of allDocs) {
        if (!d.courseKey) continue;
        if (seenKeys.has(d.courseKey)) {
          duplicateIds.push(typeof d._id === 'string' ? d._id : d._id.toString());
        } else {
          seenKeys.add(d.courseKey);
        }
      }
      if (duplicateIds.length > 0) {
        await CourseModel.deleteMany({ _id: { $in: duplicateIds } });
      }
    }
  })().finally(() => {
    seedCoursesPromise = null;
  });

  await seedCoursesPromise;
}

interface CourseDocLike {
  _id?: { toString(): string } | string;
  id?: string;
  courseKey?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  level?: string;
  price?: number;
  originalPrice?: number;
  duration?: string;
  totalModules?: number;
  thumbnail?: string;
  highlights?: unknown[];
  instructorName?: string;
  badge?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
  createdAt?: Date | string;
}

function serializeCourse(c: CourseDocLike) {
  return {
    id: c.courseKey || (c._id ? c._id.toString() : c.id || ''),
    title: c.title || '',
    subtitle: c.subtitle || '',
    description: c.description || '',
    level: c.level || 'Beginner',
    price: Number(c.price || 0),
    originalPrice: c.originalPrice ? Number(c.originalPrice) : undefined,
    duration: c.duration || '8 Weeks',
    totalModules: Number(c.totalModules || 12),
    thumbnail:
      c.thumbnail ||
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
    highlights: Array.isArray(c.highlights) ? c.highlights.map((h) => String(h)) : [],
    instructorName: c.instructorName || 'Julian Mercer',
    badge: c.badge || '',
    isFeatured: c.isFeatured ?? true,
    isActive: c.isActive ?? true,
    order: Number(c.order || 1),
    createdAt:
      c.createdAt instanceof Date
        ? c.createdAt.toISOString().split('T')[0]
        : String(c.createdAt || new Date().toISOString().split('T')[0]),
  };
}

// GET /api/courses
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedCoursesIfEmpty();

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const query: Record<string, unknown> = {};
    if (activeOnly) query.isActive = true;

    const docs = (await CourseModel.find(query)
      .sort({ order: 1, createdAt: 1 })
      .lean()) as unknown as CourseDocLike[];

    const seen = new Set<string>();
    const uniqueCourses = docs
      .map(serializeCourse)
      .filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });

    return NextResponse.json(
      {
        success: true,
        courses: uniqueCourses,
      },
      { headers: NO_CACHE }
    );
  } catch (error: unknown) {
    console.warn('GET /api/courses fallback notice:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: true,
        fallback: true,
        courses: MOCK_COURSES,
      },
      { headers: NO_CACHE }
    );
  }
}

// POST /api/courses — Strictly Administrator only
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    await seedCoursesIfEmpty();

    const body = await req.json();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const price = Number(body.price);

    if (!title || !description || isNaN(price) || price < 0) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and a valid BDT price are required.' },
        { status: 400 }
      );
    }

    const totalCount = await CourseModel.countDocuments();
    const courseKey =
      body.id && String(body.id).trim()
        ? String(body.id).trim()
        : `crs-${Date.now().toString().slice(-6)}`;

    const highlights = Array.isArray(body.highlights)
      ? body.highlights.map((h: unknown) => String(h).trim()).filter(Boolean)
      : typeof body.highlights === 'string'
      ? body.highlights
          .split('\n')
          .map((h: string) => h.trim())
          .filter(Boolean)
      : [];

    const created = await CourseModel.create({
      courseKey,
      title,
      subtitle: String(body.subtitle || '').trim(),
      description,
      level: body.level || 'Beginner',
      price,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : 0,
      duration: String(body.duration || '8 Weeks').trim(),
      totalModules: Math.max(1, Number(body.totalModules || 12)),
      thumbnail:
        String(body.thumbnail || '').trim() ||
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
      highlights,
      instructorName: String(body.instructorName || 'Julian Mercer').trim(),
      badge: String(body.badge || '').trim(),
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : true,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      order: body.order !== undefined ? Number(body.order) : totalCount + 1,
    });

    return NextResponse.json(
      {
        success: true,
        course: serializeCourse(created.toObject()),
      },
      { status: 201, headers: NO_CACHE }
    );
  } catch (error: unknown) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create course.' },
      { status: 500 }
    );
  }
}
