import { z } from 'zod';

export const createChapterSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Chapter name must be at least 2 characters'),
    code: z.string().min(2, 'Chapter code must be at least 2 characters').toUpperCase(),
    subject: z.string().min(24, 'Invalid Subject ID').max(24, 'Invalid Subject ID'),
    description: z.string().optional(),
    displayOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateChapterSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Chapter name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Chapter code must be at least 2 characters').toUpperCase().optional(),
    subject: z.string().min(24, 'Invalid Subject ID').max(24, 'Invalid Subject ID').optional(),
    description: z.string().optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});
