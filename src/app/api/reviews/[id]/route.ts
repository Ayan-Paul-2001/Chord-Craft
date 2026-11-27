import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/models/Review';
import { requireAuth } from '@/lib/authGuard';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const review = await Review.findById(id).lean() as any;

    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found.' }, { status: 404 });
    }

    const isOwner =
      (review.studentEmail && review.studentEmail.toLowerCase() === session.email.toLowerCase()) ||
      review.studentId === session.id ||
      review.studentId === session.firebaseUid;

    if (session.role !== 'admin' && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete your own review.' },
        { status: 403 }
      );
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete review.' },
      { status: 500 }
    );
  }
}
