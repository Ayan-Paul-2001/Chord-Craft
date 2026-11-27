import mongoose, { Schema, Document, Model } from 'mongoose';
import { Coupon, NoticeBoard, DeliveryFees } from '@/lib/types';

export interface IBillingSettingsDocument extends Document {
  bKashNumber: string;
  insideDhakaDeliveryFee: number;
  outsideDhakaDeliveryFee: number;
  coupons: Coupon[];
  noticeBoard: NoticeBoard;
  faviconUrl?: string;
  directorName?: string;
  academyEmail?: string;
  academyPhone?: string;
  address?: string;
  socialLinks?: any[];
  legalPolicies?: any;
  updatedAt: Date;
}

const CouponSchema = new Schema(
  {
    id: { type: String, required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: String },
    description: { type: String, default: '' },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const NoticeBoardSchema = new Schema(
  {
    isActive: { type: Boolean, default: false },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    type: {
      type: String,
      enum: ['info', 'warning', 'announcement', 'event', 'custom'],
      default: 'announcement',
    },
    badgeLabel: { type: String, default: 'Announcement' },
    badgeIcon: { type: String, default: 'megaphone' },
    accentColor: { type: String, default: '#f59e0b' },
    backgroundColor: { type: String, default: '#141419' },
    textColor: { type: String, default: '#ffffff' },
    linkLabel: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const BillingSettingsSchema = new Schema<IBillingSettingsDocument>(
  {
    bKashNumber: { type: String, default: '01711-000000', trim: true },
    insideDhakaDeliveryFee: { type: Number, default: 80, min: 0 },
    outsideDhakaDeliveryFee: { type: Number, default: 150, min: 0 },
    coupons: [CouponSchema],
    noticeBoard: {
      type: NoticeBoardSchema,
      default: () => ({
        isActive: false,
        title: '',
        message: '',
        type: 'announcement',
        badgeLabel: 'Announcement',
        badgeIcon: 'megaphone',
        accentColor: '#f59e0b',
        backgroundColor: '#141419',
        textColor: '#ffffff',
        linkLabel: '',
        linkUrl: '',
        updatedAt: new Date().toISOString(),
      }),
    },
    faviconUrl: { type: String, default: '/chord-craft-icon.svg' },
    directorName: { type: String, default: 'Julian Mercer' },
    academyEmail: { type: String, default: 'support@chordandcraft.com' },
    academyPhone: { type: String, default: '+880 1711-000000' },
    address: { type: String, default: 'Banani, Dhaka-1213, Bangladesh' },
    socialLinks: { type: Array, default: [] },
    legalPolicies: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true, strict: false }
);

// Clear model cache in Next.js development to prevent stale schemas
if (mongoose.models && mongoose.models.BillingSettings) {
  delete (mongoose.models as any).BillingSettings;
}

const BillingSettings: Model<IBillingSettingsDocument> =
  mongoose.model<IBillingSettingsDocument>('BillingSettings', BillingSettingsSchema);

export default BillingSettings;
