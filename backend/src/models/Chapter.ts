import mongoose, { Document, Schema, Model } from 'mongoose';
import { ISubject } from './Subject';

export interface IChapter extends Document {
  name: string;
  code: string;
  subject: mongoose.Types.ObjectId | ISubject;
  description?: string;
  weightage?: number;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Chapter name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Chapter code is required'],
      trim: true,
      uppercase: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    weightage: {
      type: Number,
      default: 0, 
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ChapterSchema.index({ subject: 1 });

// Ensure chapter names are unique per subject, excluding deleted ones
ChapterSchema.index(
  { name: 1, subject: 1 }, 
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Global unique chapter code
ChapterSchema.index(
  { code: 1 }, 
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Chapter: Model<IChapter> = mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);

export default Chapter;
