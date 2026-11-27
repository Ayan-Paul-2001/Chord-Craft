import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import UserModel from '@/models/User';
import { requireAdmin, sanitizeUserForClient } from '@/lib/authGuard';
import { StudentLevel } from '@/lib/types';

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};

interface EnrollmentDocLike {
  _id?: { toString(): string } | string;
  id?: string;
  enrollmentId?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  studentMobile?: string;
  courseId?: string;
  courseTitle?: string;
  courseLevel?: string;
  coursePrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  totalAmount?: number;
  bKashSenderMobile?: string;
  bKashTransactionId?: string;
  paymentStatus?: string;
  enrollmentStatus?: string;
  rejectionNote?: string;
  verifiedAt?: string;
  createdAt?: Date | string;
}

function serializeEnrollment(e: EnrollmentDocLike) {
  return {
    id: e.enrollmentId || (e._id ? e._id.toString() : e.id || ''),
    studentId: e.studentId || '',
    studentName: e.studentName || '',
    studentEmail: e.studentEmail || '',
    studentMobile: e.studentMobile || '',
    courseId: e.courseId || '',
    courseTitle: e.courseTitle || '',
    courseLevel: e.courseLevel || 'Beginner',
    coursePrice: Number(e.coursePrice || 0),
    couponCode: e.couponCode || '',
    couponDiscount: Number(e.couponDiscount || 0),
    totalAmount: Number(e.totalAmount || 0),
    paymentMethod: 'bKash' as const,
    bKashSenderMobile: e.bKashSenderMobile || '',
    bKashTransactionId: e.bKashTransactionId || '',
    paymentStatus: e.paymentStatus || 'Pending',
    enrollmentStatus: e.enrollmentStatus || 'Pending Verification',
    rejectionNote: e.rejectionNote || '',
    verifiedAt: e.verifiedAt || '',
    createdAt:
      e.createdAt instanceof Date
        ? e.createdAt.toISOString().split('T')[0]
        : String(e.createdAt || new Date().toISOString().split('T')[0]),
  };
}

async function findEnrollment(id: string) {
  let doc = await CourseEnrollmentModel.findOne({ enrollmentId: id });
  if (!doc && mongoose.Types.ObjectId.isValid(id)) {
    doc = await CourseEnrollmentModel.findById(id);
  }
  return doc;
}

// PATCH /api/enrollments/[id] — Strictly Admin: Verify & Approve OR Reject course payment
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const action = String(body.action || '').toLowerCase();

    const enrollment = await findEnrollment(id);
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Course enrollment record not found.' }, { status: 404 });
    }

    let updatedUser: ReturnType<typeof sanitizeUserForClient> = null;

    if (action === 'approve' || body.paymentStatus === 'Verified') {
      enrollment.paymentStatus = 'Verified';
      enrollment.enrollmentStatus = 'Approved';
      enrollment.rejectionNote = '';
      enrollment.verifiedAt = new Date().toISOString().split('T')[0];
      await enrollment.save();

      // Activate student account & grant course enrollment atomically
      const userSearch: Record<string, unknown>[] = [
        { email: enrollment.studentEmail.toLowerCase().trim() },
      ];
      if (mongoose.Types.ObjectId.isValid(enrollment.studentId)) {
        userSearch.unshift({ _id: enrollment.studentId });
      }
      userSearch.push({ firebaseUid: enrollment.studentId });

      const userDoc = await UserModel.findOne({ $or: userSearch });
      if (userDoc) {
        userDoc.status = 'Active';
        const existingCourses = Array.isArray(userDoc.enrolledCourseIds) ? userDoc.enrolledCourseIds : [];
        if (!existingCourses.includes(enrollment.courseId)) {
          userDoc.enrolledCourseIds = [...existingCourses, enrollment.courseId];
        }
        if (!userDoc.selectedCourseId) {
          userDoc.selectedCourseId = enrollment.courseId;
        }
        // Align level if course has Beginner/Intermediate/Advanced and student was newly registered
        if (
          enrollment.courseLevel &&
          ['Beginner', 'Intermediate', 'Advanced'].includes(enrollment.courseLevel) &&
          existingCourses.length === 0
        ) {
          userDoc.level = enrollment.courseLevel as StudentLevel;
        }
        await userDoc.save();
        updatedUser = sanitizeUserForClient(userDoc.toObject());
      }
    } else if (action === 'reject' || body.paymentStatus === 'Rejected') {
      enrollment.paymentStatus = 'Rejected';
      enrollment.enrollmentStatus = 'Rejected';
      enrollment.rejectionNote =
        String(body.rejectionNote || '').trim() ||
        'bKash Transaction ID could not be verified. Please check your TxID and resubmit.';
      await enrollment.save();
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported enrollment action.' }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        enrollment: serializeEnrollment(enrollment.toObject() as unknown as EnrollmentDocLike),
        user: updatedUser,
      },
      { headers: NO_CACHE }
    );
  } catch (error: unknown) {
    console.error('PATCH /api/enrollments/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update course enrollment.',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/[id] — Strictly Admin
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const enrollment = await findEnrollment(id);
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found.' }, { status: 404 });
    }
    await CourseEnrollmentModel.findByIdAndDelete(enrollment._id);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete enrollment',
      },
      { status: 500 }
    );
  }
}
