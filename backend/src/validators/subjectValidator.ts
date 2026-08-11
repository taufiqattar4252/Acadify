import { z } from 'zod';

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Subject name must be at least 2 characters'),
    code: z.string().min(2, 'Subject code must be at least 2 characters').toUpperCase(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    displayOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Subject name must be at least 2 characters').optional(),
    code: z.string().min(2, 'Subject code must be at least 2 characters').toUpperCase().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});
