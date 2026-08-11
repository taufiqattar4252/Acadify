import mongoose, { Document, Schema, Model } from 'mongoose';
import { ISubject } from './Subject';
import { IChapter } from './Chapter';
import { IAdmin } from './Admin';

export enum QuestionDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum QuestionStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ARCHIVED = 'Archived',
}

export interface IQuestionOption {
  _id?: mongoose.Types.ObjectId;
  text: string;
  image?: string;
  isCorrect: boolean;
}

export enum QuestionType {
  SINGLE_CORRECT = 'Single Correct MCQ',
  MULTIPLE_CORRECT = 'Multiple Correct',
  INTEGER_ANSWER = 'Integer Answer',
  NUMERICAL_VALUE = 'Numerical Value',
  ASSERTION_REASON = 'Assertion Reason',
  MATCH_THE_FOLLOWING = 'Match the Following',
}

export interface IQuestion extends Document {
  questionType: QuestionType;
  questionText: string;
  questionImage?: string;
  options: IQuestionOption[];
  explanation?: string;
  explanationImage?: string;
  subject: mongoose.Types.ObjectId | ISubject;
  chapter: mongoose.Types.ObjectId | IChapter;
  difficulty: QuestionDifficulty;
  positiveMarks: number;
  negativeMarks: number;
  estimatedTime?: number;
  pyqYears: number[];
  status: QuestionStatus;
  tags: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: mongoose.Types.ObjectId | IAdmin;
  updatedBy: mongoose.Types.ObjectId | IAdmin;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema({
  text: { type: String, required: true },
  image: { type: String },
  isCorrect: { type: Boolean, required: true, default: false },
});

const QuestionSchema: Schema = new Schema(
  {
    questionType: {
      type: String,
      enum: Object.values(QuestionType),
      default: QuestionType.SINGLE_CORRECT,
      required: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    questionImage: {
      type: String, // URL to image in S3/Cloudinary
    },
    options: {
      type: [QuestionOptionSchema],
      validate: [
        (val: any[]) => val.length >= 2,
        'A question must have at least 2 options',
      ],
    },
    explanation: {
      type: String,
    },
    explanationImage: {
      type: String,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(QuestionDifficulty),
      default: QuestionDifficulty.MEDIUM,
    },
    positiveMarks: {
      type: Number,
      required: true,
      default: 4, // JEE/CET standard
    },
    negativeMarks: {
      type: Number,
      required: true,
      default: 1, // Usually 1/4th
    },
    estimatedTime: {
      type: Number,
      default: 60, // 60 seconds
    },
    pyqYears: {
      type: [Number],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(QuestionStatus),
      default: QuestionStatus.DRAFT,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize querying for random question generation by subject/chapter/difficulty
QuestionSchema.index({ subject: 1, isDeleted: 1 });
QuestionSchema.index({ chapter: 1, isDeleted: 1 });
QuestionSchema.index({ difficulty: 1, isDeleted: 1 });
QuestionSchema.index({ status: 1, isDeleted: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ pyqYears: 1 });
// Compound index for generating tests and dashboard filters
QuestionSchema.index({ subject: 1, chapter: 1, difficulty: 1, status: 1, isDeleted: 1 });

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
