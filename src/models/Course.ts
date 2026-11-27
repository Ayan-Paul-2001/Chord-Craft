import mongoose, { Schema, Document, Model } from 'mongoose';
import { CourseLevel } from '@/lib/types';

export interface ICourseDocument extends Document {
  courseKey: string;
  title: string;
  subtitle: string;
  description: string;
  level: CourseLevel;
  price: number;
  originalPrice?: number;
  duration: string;
  totalModules: number;
  thumbnail: string;
  highlights: string[];
  instructorName: string;
  badge?: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourseDocument>(
  {
    courseKey: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0, min: 0 },
    duration: { type: String, default: '8 Weeks', trim: true },
    totalModules: { type: Number, default: 12, min: 1 },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
    },
    highlights: { type: [String], default: [] },
    instructorName: { type: String, default: 'Julian Mercer', trim: true },
    badge: { type: String, default: '', trim: true },
    isFeatured: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

CourseSchema.index({ order: 1, createdAt: 1 });
CourseSchema.index({ isActive: 1 });

if (mongoose.models.Course) {
  mongoose.deleteModel('Course');
}

const Course: Model<ICourseDocument> =
  mongoose.models.Course || mongoose.model<ICourseDocument>('Course', CourseSchema);

export default Course;
