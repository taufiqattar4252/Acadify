import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { IMockTest } from './MockTest';
import { IQuestion } from './Question';

export interface IAttemptAnswer {
  questionId: mongoose.Types.ObjectId | IQuestion;
  selectedOptionId?: mongoose.Types.ObjectId; // null or undefined if skipped
  timeSpent: number; // in seconds
}

export interface IAttempt extends Document {
  user: mongoose.Types.ObjectId | IUser;
  mockTest: mongoose.Types.ObjectId | IMockTest;
  startedAt: Date;
  submittedAt?: Date;
  duration: number; // in seconds spent total
  answers: IAttemptAnswer[];
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  rank?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptAnswerSchema = new Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const AttemptSchema: Schema = new Schema(
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
    submittedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 0,
    },
    answers: [AttemptAnswerSchema],
    score: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    wrong: {
      type: Number,
      default: 0,
    },
    skipped: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
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

// Indexes for querying analytics
AttemptSchema.index({ user: 1, mockTest: 1 });
AttemptSchema.index({ mockTest: 1, score: -1 }); // Used for calculating ranks
AttemptSchema.index({ submittedAt: 1 });

const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);

export default Attempt;
