import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1, 'Product ID is required'),
          qty: z.number().int().positive('Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
    shippingAddress: z.object({
      fullName: z.string().min(1, 'Full name is required'),
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
      phone: z.string().min(1, 'Phone number is required'),
    }),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    trackingNumber: z.string().optional(),
  }),
});
