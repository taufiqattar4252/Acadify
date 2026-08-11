import { z } from 'zod';
import { MockTestStatus } from '../models/MockTest';

export const createMockTestSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 characters'),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    instructions: z.string().optional(),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
    passingMarks: z.number().min(0).optional().default(0),
    totalMarks: z.number().min(0).optional().default(0),
    price: z.number().min(0).optional().default(0),
    discountPrice: z.number().min(0).optional(),
    language: z.string().optional().default('English'),
    status: z.nativeEnum(MockTestStatus).optional().default(MockTestStatus.DRAFT),
    featured: z.boolean().optional().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    questions: z.array(z.string()).optional().default([]), // array of question IDs
    category: z.enum([
      'Full Mock Test',
      'Physics Test',
      'Chemistry Test',
      'Mathematics Test',
      'Chapter-wise Test',
      'Previous Year Paper',
      'Custom Practice Test'
    ]).optional().default('Full Mock Test'),
  }),
});

export const updateMockTestSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    instructions: z.string().optional(),
    duration: z.number().min(1).optional(),
    passingMarks: z.number().min(0).optional(),
    totalMarks: z.number().min(0).optional(),
    price: z.number().min(0).optional(),
    discountPrice: z.number().min(0).optional(),
    language: z.string().optional(),
    status: z.nativeEnum(MockTestStatus).optional(),
    featured: z.boolean().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    questions: z.array(z.string()).optional(),
    category: z.enum([
      'Full Mock Test',
      'Physics Test',
      'Chemistry Test',
      'Mathematics Test',
      'Chapter-wise Test',
      'Previous Year Paper',
      'Custom Practice Test'
    ]).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(MockTestStatus),
  }),
});
