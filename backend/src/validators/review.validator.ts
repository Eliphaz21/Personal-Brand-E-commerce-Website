import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
    comment: z.string().min(10, 'Review comment must be at least 10 characters').max(1000, 'Review comment cannot exceed 1000 characters'),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
    title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
    comment: z.string().min(10, 'Review comment must be at least 10 characters').max(1000, 'Review comment cannot exceed 1000 characters').optional(),
  }),
});
