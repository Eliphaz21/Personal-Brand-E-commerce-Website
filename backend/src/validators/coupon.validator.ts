import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3, 'Coupon code must be at least 3 characters')
      .max(20, 'Coupon code cannot exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/, 'Coupon code must be uppercase alphanumeric (dashes/underscores allowed)'),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().nonnegative('Discount value cannot be negative'),
    minimumOrderAmount: z.number().nonnegative('Minimum order amount cannot be negative').optional(),
    maxUsageCount: z.number().int().nonnegative('Max usage count must be a non-negative integer').optional(),
    expiresAt: z
      .string()
      .datetime({ message: 'Expiry must be a valid ISO Date String' })
      .refine((val) => new Date(val) > new Date(), { message: 'Expiration date must be in the future' })
      .optional(),
    applicableCategories: z.array(z.string()).optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    subtotal: z.number().positive('Subtotal must be positive'),
  }),
});
