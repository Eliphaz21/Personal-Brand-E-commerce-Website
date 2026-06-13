import { z } from 'zod';

// ─── Wishlist Operations (Add/Remove) ────────────────────────────────────────
export const wishlistParamsSchema = z.object({
  params: z.object({
    productId: z.string().length(24, 'Invalid product ID'),
  }),
});
