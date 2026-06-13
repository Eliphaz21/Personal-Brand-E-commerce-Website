import { z } from 'zod';

// ─── Add to Cart ──────────────────────────────────────────────────────────────
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().length(24, 'Invalid product ID'),
    qty: z.number({ coerce: true }).int().min(1, 'Quantity must be at least 1').default(1),
  }),
});

// ─── Update Cart Item Quantity ────────────────────────────────────────────────
export const updateCartItemQtySchema = z.object({
  params: z.object({
    productId: z.string().length(24, 'Invalid product ID'),
  }),
  body: z.object({
    qty: z.number({ coerce: true }).int().min(1, 'Quantity must be at least 1'),
  }),
});

// ─── Remove from Cart ─────────────────────────────────────────────────────────
export const removeFromCartSchema = z.object({
  params: z.object({
    productId: z.string().length(24, 'Invalid product ID'),
  }),
});
