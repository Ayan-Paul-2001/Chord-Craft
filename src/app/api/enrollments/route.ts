import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseModel from '@/models/Course';
import UserModel from '@/models/User';
import BillingSettingsModel from '@/models/BillingSettings';
import { MOCK_COURSES, MOCK_COURSE_ENROLLMENTS } from '@/lib/mockData';
import { getSessionIdentifiers, requireAuth, sanitizeUserForClient } from '@/lib/authGuard';
import { cleanMobileNumber, isValidMobile } from '@/lib/utils';

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};

async function seedEnrollmentsIfEmpty() {
  const count = await CourseEnrollmentModel.countDocuments();
  if (count === 0) {
    await CourseEnrollmentModel.insertMany(
      MOCK_COURSE_ENROLLMENTS.map((e) => ({
        enrollmentId: e.id,
        studentId: e.studentId,
        studentName: e.studentName,
        studentEmail: e.studentEmail.toLowerCase().trim(),
        studentMobile: e.studentMobile,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        courseLevel: e.courseLevel || 'Beginner',
        coursePrice: e.coursePrice,
        couponCode: e.couponCode || '',
        couponDiscount: e.couponDiscount || 0,
        totalAmount: e.totalAmount,
        paymentMethod: 'bKash',
        bKashSenderMobile: e.bKashSenderMobile,
        bKashTransactionId: e.bKashTransactionId,
        paymentStatus: e.paymentStatus,
        enrollmentStatus: e.enrollmentStatus,
        verifiedAt: e.verifiedAt || '',
      }))
    );
  }
}

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

interface CourseLookupDoc {
  courseKey?: string;
  title: string;
  level?: string;
  price?: number;
}

interface CouponDocLike {
  code?: string;
  isActive?: boolean;
  expiryDate?: string;
  minOrderAmount?: number;
  usageLimit?: number | null;
  usageCount?: number;
  discountType?: string;
  discountValue?: number;
  maxDiscount?: number;
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

// GET /api/enrollments — Admin gets all; Student gets strictly their own enrollments
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();
    await seedEnrollmentsIfEmpty();

    let docs: EnrollmentDocLike[] = [];
    if (session.role === 'admin') {
      docs = (await CourseEnrollmentModel.find().sort({ createdAt: -1 }).lean()) as unknown as EnrollmentDocLike[];
    } else {
      const ids = getSessionIdentifiers(session);
      docs = (await CourseEnrollmentModel.find({
        $or: [
          { studentEmail: session.email.toLowerCase().trim() },
          { studentId: { $in: ids } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean()) as unknown as EnrollmentDocLike[];
    }

    return NextResponse.json(
      {
        success: true,
        enrollments: docs.map(serializeEnrollment),
      },
      { headers: NO_CACHE }
    );
  } catch (error: unknown) {
    console.warn('GET /api/enrollments notice:', error instanceof Error ? error.message : error);
    const fallback =
      session.role === 'admin'
        ? MOCK_COURSE_ENROLLMENTS
        : MOCK_COURSE_ENROLLMENTS.filter(
            (e) => e.studentEmail.toLowerCase() === session.email.toLowerCase().trim()
          );
    return NextResponse.json({ success: true, fallback: true, enrollments: fallback }, { headers: NO_CACHE });
  }
}

// POST /api/enrollments — Authenticated student submits bKash payment for a course (0 delivery charge)
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    const body = await req.json();
    const courseId = String(body.courseId || '').trim();
    const rawSender = String(body.bKashSenderMobile || '').trim();
    const cleanedSender = cleanMobileNumber(rawSender);
    const txId = String(body.bKashTransactionId || '').trim().toUpperCase();
    const couponCode = String(body.couponCode || '').trim().toUpperCase();

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Please select a course to enroll in.' },
        { status: 400 }
      );
    }

    if (!isValidMobile(cleanedSender)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 11-digit bKash sender mobile number (e.g. 01712345678).' },
        { status: 400 }
      );
    }

    if (!txId || txId.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid bKash Transaction ID (TxID).' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Authoritative server-side course price lookup (never trust client price)
    let courseDoc = (await CourseModel.findOne({ courseKey: courseId }).lean()) as unknown as CourseLookupDoc | null;
    if (!courseDoc) {
      const mockCourse = MOCK_COURSES.find((c) => c.id === courseId);
      if (mockCourse) {
        courseDoc = {
          courseKey: mockCourse.id,
          title: mockCourse.title,
          level: mockCourse.level,
          price: mockCourse.price,
        };
      }
    }

    if (!courseDoc) {
      return NextResponse.json({ success: false, error: 'Selected course not found.' }, { status: 404 });
    }

    const coursePrice = Math.max(0, Number(courseDoc.price || 0));

    // Server-side coupon discount computation (strictly 0 delivery charge)
    let appliedCouponCode = '';
    let couponDiscount = 0;

    if (couponCode) {
      const billing = (await BillingSettingsModel.findOne().lean()) as unknown as {
        coupons?: CouponDocLike[];
      } | null;
      const coupons: CouponDocLike[] = Array.isArray(billing?.coupons) ? billing.coupons : [];
      const matched = coupons.find(
        (c) => String(c.code || '').toUpperCase() === couponCode && c.isActive
      );

      if (matched) {
        const isExpired = matched.expiryDate && new Date(matched.expiryDate) < new Date();
        const belowMin = matched.minOrderAmount && coursePrice < matched.minOrderAmount;
        const limitReached =
          matched.usageLimit !== undefined &&
          matched.usageLimit !== null &&
          (matched.usageCount || 0) >= matched.usageLimit;

        if (!isExpired && !belowMin && !limitReached) {
          appliedCouponCode = couponCode;
          if (matched.discountType === 'percentage') {
            couponDiscount = Math.round((coursePrice * Number(matched.discountValue || 0)) / 100);
            if (matched.maxDiscount && couponDiscount > matched.maxDiscount) {
              couponDiscount = Number(matched.maxDiscount);
            }
          } else {
            couponDiscount = Math.min(coursePrice, Number(matched.discountValue || 0));
          }

          // Increment coupon usage count
          await BillingSettingsModel.updateOne(
            { 'coupons.code': matched.code },
            { $inc: { 'coupons.$.usageCount': 1 } }
          ).catch(() => {});
        }
      }
    }

    // No delivery charge for digital course enrollments
    const totalAmount = Math.max(0, coursePrice - couponDiscount);

    // Prevent duplicate pending submission for the same course by updating existing Pending/Rejected record or creating a new one
    const studentEmail = session.email.toLowerCase().trim();
    const dbUser = await UserModel.findOne({ email: studentEmail });

    const studentId = dbUser?._id?.toString() || session.id;
    const studentName = String(body.studentName || dbUser?.fullName || session.fullName || 'Student').trim();
    const studentMobile = cleanMobileNumber(String(body.studentMobile || dbUser?.mobile || session.mobile || cleanedSender));
    const dateOfBirth = typeof body.dateOfBirth === 'string' ? body.dateOfBirth.trim() : '';
    const requestedLevel =
      typeof body.level === 'string' && ['Beginner', 'Intermediate', 'Advanced'].includes(body.level)
        ? (body.level as 'Beginner' | 'Intermediate' | 'Advanced')
        : undefined;

    const existingPending = await CourseEnrollmentModel.findOne({
      studentEmail,
      courseId,
      paymentStatus: { $in: ['Pending', 'Rejected'] },
    });

    let savedDoc: { toObject(): EnrollmentDocLike };
    if (existingPending) {
      existingPending.studentId = studentId;
      existingPending.studentName = studentName;
      existingPending.studentMobile = studentMobile;
      existingPending.courseTitle = courseDoc.title;
      existingPending.courseLevel = courseDoc.level || 'Beginner';
      existingPending.coursePrice = coursePrice;
      existingPending.couponCode = appliedCouponCode;
      existingPending.couponDiscount = couponDiscount;
      existingPending.totalAmount = totalAmount;
      existingPending.bKashSenderMobile = cleanedSender;
      existingPending.bKashTransactionId = txId;
      existingPending.paymentStatus = 'Pending';
      existingPending.enrollmentStatus = 'Pending Verification';
      existingPending.rejectionNote = '';
      savedDoc = (await existingPending.save()) as unknown as { toObject(): EnrollmentDocLike };
    } else {
      const enrollmentId = `ENR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      savedDoc = (await CourseEnrollmentModel.create({
        enrollmentId,
        studentId,
        studentName,
        studentEmail,
        studentMobile,
        courseId,
        courseTitle: courseDoc.title,
        courseLevel: courseDoc.level || 'Beginner',
        coursePrice,
        couponCode: appliedCouponCode,
        couponDiscount,
        totalAmount,
        paymentMethod: 'bKash',
        bKashSenderMobile: cleanedSender,
        bKashTransactionId: txId,
        paymentStatus: 'Pending',
        enrollmentStatus: 'Pending Verification',
      })) as unknown as { toObject(): EnrollmentDocLike };
    }

    // Persist onboarding details (especially for Google sign-ups completing info in the Payment Lobby)
    let updatedUserClient = null;
    if (dbUser) {
      dbUser.selectedCourseId = courseId;
      const isPendingUser = dbUser.status === 'Pending';
      if (studentName && (isPendingUser || !dbUser.fullName)) {
        dbUser.fullName = studentName;
      }
      if (studentMobile && (isPendingUser || !dbUser.mobile)) {
        dbUser.mobile = studentMobile;
      }
      if (dateOfBirth && (isPendingUser || !dbUser.dateOfBirth)) {
        dbUser.dateOfBirth = dateOfBirth;
      }
      if (requestedLevel && isPendingUser) {
        dbUser.level = requestedLevel;
      }
      await dbUser.save();
      updatedUserClient = sanitizeUserForClient(dbUser.toObject());
    }

    return NextResponse.json(
      {
        success: true,
        enrollment: serializeEnrollment(savedDoc.toObject()),
        user: updatedUserClient,
      },
      { status: 201, headers: NO_CACHE }
    );
  } catch (error: unknown) {
    console.error('POST /api/enrollments error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit course payment.' },
      { status: 500 }
    );
  }
}
