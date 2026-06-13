import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
});
