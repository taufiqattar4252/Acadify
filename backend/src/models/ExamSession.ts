import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { IMockTest } from './MockTest';

export enum ExamSessionStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  SUBMITTED = 'Submitted',
  EXPIRED = 'Expired',
}

export interface IExamSession extends Document {
  user: mongoose.Types.ObjectId | IUser;
  mockTest: mongoose.Types.ObjectId | IMockTest;
  startedAt: Date;
  expiresAt: Date;
  status: ExamSessionStatus;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSessionSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ExamSessionStatus),
      default: ExamSessionStatus.IN_PROGRESS, // By default, when they start, it is in progress
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize querying for active sessions
ExamSessionSchema.index({ user: 1, mockTest: 1, status: 1 });

const ExamSession: Model<IExamSession> = mongoose.models.ExamSession || mongoose.model<IExamSession>('ExamSession', ExamSessionSchema);

export default ExamSession;
