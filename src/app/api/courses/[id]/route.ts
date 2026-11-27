import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { MOCK_COURSES } from '@/lib/mockData';
import { requireAdmin } from '@/lib/authGuard';

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};

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

function serializeCourse(c: CourseDocLike | null) {
  if (!c) return null;
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

async function findCourseDoc(id: string) {
  let doc = await CourseModel.findOne({ courseKey: id });
  if (!doc && mongoose.Types.ObjectId.isValid(id)) {
    doc = await CourseModel.findById(id);
  }
  return doc;
}

// GET /api/courses/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const doc = await findCourseDoc(id);
    if (doc) {
      return NextResponse.json({ success: true, course: serializeCourse(doc.toObject()) }, { headers: NO_CACHE });
    }
    const mock = MOCK_COURSES.find((c) => c.id === id);
    if (mock) {
      return NextResponse.json({ success: true, course: mock }, { headers: NO_CACHE });
    }
    return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] — Strictly Administrator only
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.subtitle !== undefined) updateData.subtitle = String(body.subtitle).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.level !== undefined) updateData.level = body.level;
    if (body.price !== undefined) updateData.price = Math.max(0, Number(body.price));
    if (body.originalPrice !== undefined) updateData.originalPrice = Math.max(0, Number(body.originalPrice) || 0);
    if (body.duration !== undefined) updateData.duration = String(body.duration).trim();
    if (body.totalModules !== undefined) updateData.totalModules = Math.max(1, Number(body.totalModules) || 1);
    if (body.thumbnail !== undefined) updateData.thumbnail = String(body.thumbnail).trim();
    if (body.instructorName !== undefined) updateData.instructorName = String(body.instructorName).trim();
    if (body.badge !== undefined) updateData.badge = String(body.badge).trim();
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.highlights !== undefined) {
      updateData.highlights = Array.isArray(body.highlights)
        ? body.highlights.map((h: unknown) => String(h).trim()).filter(Boolean)
        : typeof body.highlights === 'string'
        ? body.highlights
            .split('\n')
            .map((h: string) => h.trim())
            .filter(Boolean)
        : [];
    }

    const existing = await findCourseDoc(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    const updated = await CourseModel.findByIdAndUpdate(
      existing._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json(
      { success: true, course: serializeCourse(updated as CourseDocLike | null) },
      { headers: NO_CACHE }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] — Strictly Administrator only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const existing = await findCourseDoc(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }
    await CourseModel.findByIdAndDelete(existing._id);
    return NextResponse.json({ success: true, message: 'Course deleted' }, { headers: NO_CACHE });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete course' },
      { status: 500 }
    );
  }
}
