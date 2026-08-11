import mongoose, { Schema, Document } from 'mongoose';

export enum MockTestStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
  HIDDEN = 'Hidden',
}

export interface IMockTest extends Document {
  title: string;
  slug: string;
  category: string;
  description?: string;
  thumbnail?: string;
  instructions?: string;
  duration: number; // in minutes
  passingMarks?: number;
  totalMarks?: number;
  price?: number;
  discountPrice?: number;
  language: string;
  status: MockTestStatus;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  questions: any[]; // Array of ObjectIds
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: any;
  updatedBy: any;
  createdAt: Date;
  updatedAt: Date;
}

const MockTestSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: [
        'Full Mock Test',
        'Physics Test',
        'Chemistry Test',
        'Mathematics Test',
        'Chapter-wise Test',
        'Previous Year Paper',
        'Custom Practice Test'
      ],
      default: 'Full Mock Test',
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    instructions: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
    },
    language: {
      type: String,
      default: 'English',
    },
    status: {
      type: String,
      enum: Object.values(MockTestStatus),
      default: MockTestStatus.DRAFT,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimization
MockTestSchema.index({ status: 1 });
MockTestSchema.index({ slug: 1 });
MockTestSchema.index({ category: 1 });
MockTestSchema.index({ createdAt: -1 });
MockTestSchema.index({ status: 1, isDeleted: 1 });
MockTestSchema.index({ createdBy: 1 });
MockTestSchema.index({ price: 1 });

export default mongoose.models.MockTest || mongoose.model<IMockTest>('MockTest', MockTestSchema);
