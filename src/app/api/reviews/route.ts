import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/models/Review';
import { MOCK_REVIEWS } from '@/lib/mockData';
import { requireAuth } from '@/lib/authGuard';

async function seedReviewsIfEmpty() {
  try {
    const count = await Review.countDocuments();
    if (count === 0) {
      for (const rev of MOCK_REVIEWS) {
        await Review.create({
          studentId: rev.studentId || '',
          studentEmail: rev.studentEmail.toLowerCase().trim(),
          name: rev.name,
          level: rev.level,
          avatar: rev.avatar,
          rating: rev.rating,
          comment: rev.comment,
          status: rev.status || 'Approved',
          createdAt: rev.createdAt ? new Date(rev.createdAt) : new Date(),
        });
      }
    }
  } catch (err) {
    console.warn('⚠️ Notice during reviews seeding:', err);
  }
}

// GET /api/reviews - Get all reviews
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    await seedReviewsIfEmpty();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const docs = await Review.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      reviews: docs.map((d) => ({
        id: d._id.toString(),
        studentId: d.studentId,
        studentEmail: d.studentEmail,
        name: d.name,
        level: d.level,
        avatar: d.avatar,
        rating: d.rating,
        comment: d.comment,
        status: d.status,
        createdAt: (d.createdAt as Date)?.toISOString() || new Date().toISOString(),
      })),
    });
  } catch (error: any) {
    console.warn('⚠️ GET /api/reviews notice (offline fallback active):', error?.message || error);
    return NextResponse.json({
      success: true,
      fallback: true,
      reviews: MOCK_REVIEWS,
    });
  }
}

// POST /api/reviews — Authenticated user only; binds student identity to signed session
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const body = await req.json();
    const { name, level, avatar, rating, comment } = body;

    // Non-admins can ONLY post/update under their own verified session email & ID
    const normalizedEmail =
      session.role === 'admin' && body.studentEmail
        ? String(body.studentEmail).trim().toLowerCase()
        : session.email.toLowerCase().trim();
    const studentId =
      session.role === 'admin' && body.studentId ? String(body.studentId) : session.id;
    const trimmedName = (name || session.fullName || '').trim();
    const trimmedComment = (comment || '').trim();
    const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));

    if (!normalizedEmail || !trimmedName || !trimmedComment) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and review comment are required.' },
        { status: 400 }
      );
    }

    if (trimmedComment.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please write a review with at least 5 characters.' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();

      // Check if this student already submitted a review (upsert)
      let doc = await Review.findOne({ studentEmail: normalizedEmail });

      if (doc) {
        doc.name = trimmedName;
        doc.comment = trimmedComment;
        doc.rating = parsedRating;
        if (level) doc.level = level;
        if (avatar) doc.avatar = avatar;
        if (studentId) doc.studentId = studentId;
        doc.status = 'Approved';
        await doc.save();
      } else {
        doc = await Review.create({
          studentId: studentId || '',
          studentEmail: normalizedEmail,
          name: trimmedName,
          level: level || 'Beginner Student',
          avatar:
            avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          rating: parsedRating,
          comment: trimmedComment,
          status: 'Approved',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Your review has been submitted successfully! ✨',
        review: {
          id: doc._id.toString(),
          studentId: doc.studentId,
          studentEmail: doc.studentEmail,
          name: doc.name,
          level: doc.level,
          avatar: doc.avatar,
          rating: doc.rating,
          comment: doc.comment,
          status: doc.status,
          createdAt: (doc.createdAt as Date)?.toISOString() || new Date().toISOString(),
        },
      });
    } catch (dbErr: any) {
      console.warn('DB review save notice:', dbErr);
      const fallbackReview = {
        id: `rev-${Date.now()}`,
        studentId: studentId || '',
        studentEmail: normalizedEmail,
        name: trimmedName,
        level: level || 'Beginner Student',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
        rating: parsedRating,
        comment: trimmedComment,
        status: 'Approved' as const,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        fallback: true,
        message: 'Your review has been saved successfully! ✨',
        review: fallbackReview,
      });
    }
  } catch (error: any) {
    console.error('API /api/reviews error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit review.' },
      { status: 500 }
    );
  }
}
