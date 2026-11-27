import mongoose, { Schema, Document, Model } from 'mongoose';
import { CourseEnrollmentPaymentStatus, CourseEnrollmentStatus } from '@/lib/types';

export interface ICourseEnrollmentDocument extends Document {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentMobile: string;
  courseId: string;
  courseTitle: string;
  courseLevel: string;
  coursePrice: number;
  couponCode?: string;
  couponDiscount: number;
  totalAmount: number;
  paymentMethod: 'bKash';
  bKashSenderMobile: string;
  bKashTransactionId: string;
  paymentStatus: CourseEnrollmentPaymentStatus;
  enrollmentStatus: CourseEnrollmentStatus;
  rejectionNote?: string;
  verifiedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseEnrollmentSchema = new Schema<ICourseEnrollmentDocument>(
  {
    enrollmentId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    studentMobile: { type: String, default: '', trim: true },
    courseId: { type: String, required: true, index: true },
    courseTitle: { type: String, required: true, trim: true },
    courseLevel: { type: String, default: 'Beginner' },
    coursePrice: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: '', trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['bKash'], default: 'bKash' },
    bKashSenderMobile: { type: String, required: true, trim: true },
    bKashTransactionId: { type: String, required: true, trim: true },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    enrollmentStatus: {
      type: String,
      enum: ['Pending Verification', 'Approved', 'Rejected'],
      default: 'Pending Verification',
      index: true,
    },
    rejectionNote: { type: String, default: '' },
    verifiedAt: { type: String, default: '' },
  },
  { timestamps: true }
);

CourseEnrollmentSchema.index({ studentEmail: 1, courseId: 1 });
CourseEnrollmentSchema.index({ createdAt: -1 });

if (mongoose.models.CourseEnrollment) {
  mongoose.deleteModel('CourseEnrollment');
}

const CourseEnrollment: Model<ICourseEnrollmentDocument> =
  mongoose.models.CourseEnrollment ||
  mongoose.model<ICourseEnrollmentDocument>('CourseEnrollment', CourseEnrollmentSchema);

export default CourseEnrollment;
