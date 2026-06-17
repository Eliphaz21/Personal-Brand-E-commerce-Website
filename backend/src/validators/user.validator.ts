import { z } from 'zod';

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format');

const roleSchema = z.enum(['guest', 'customer', 'admin']);

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
});

export const userIdParamsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const blockUserSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    isBlocked: z.boolean(),
  }),
});

export const adminListUsersQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    role: roleSchema.optional(),
    isBlocked: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    isVerified: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
  }),
});

export const adminCreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: roleSchema.optional().default('customer'),
    isVerified: z.boolean().optional().default(false),
    isBlocked: z.boolean().optional().default(false),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
});

export const adminUpdateUserSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
    email: z.string().email('Please provide a valid email address').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: roleSchema.optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
});
