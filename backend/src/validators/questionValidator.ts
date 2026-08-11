import { z } from 'zod';
import { QuestionDifficulty, QuestionStatus, QuestionType } from '../models/Question';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  image: z.string().optional().nullable(),
  isCorrect: z.boolean().default(false),
});

export const createQuestionSchema = z.object({
  body: z.object({
    questionType: z.nativeEnum(QuestionType).default(QuestionType.SINGLE_CORRECT),
    questionText: z.string().min(3, 'Question text must be at least 3 characters'),
    questionImage: z.string().optional().nullable(),
    options: z.array(questionOptionSchema).min(2, 'A question must have at least 2 options').refine((options) => {
      // Ensure exactly one correct answer for Single Correct MCQ
      const correctCount = options.filter(opt => opt.isCorrect).length;
      return correctCount === 1;
    }, {
      message: 'Single Correct MCQ must have exactly one correct option',
    }),
    explanation: z.string().optional().nullable(),
    explanationImage: z.string().optional().nullable(),
    subject: objectIdValidator,
    chapter: objectIdValidator,
    difficulty: z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM),
    positiveMarks: z.number().default(4),
    negativeMarks: z.number().default(1),
    estimatedTime: z.number().default(60),
    pyqYears: z.array(z.number()).optional().default([]),
    status: z.nativeEnum(QuestionStatus).default(QuestionStatus.DRAFT),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateQuestionSchema = z.object({
  body: createQuestionSchema.shape.body.partial(),
});

export const bulkImportSchema = z.object({
  body: z.object({
    questions: z.array(createQuestionSchema.shape.body),
  }),
});
