import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../models/Product.model';

// ─── Create Product ───────────────────────────────────────────────────────────
export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).trim(),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    shortDescription: z.string().max(300).optional(),
    price: z.number({ coerce: true }).positive('Price must be positive'),
    compareAtPrice: z.number({ coerce: true }).min(0).optional(),
    stock: z.number({ coerce: true }).int().min(0),
    category: z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]]),
    tags: z.array(z.string()).optional(),
    productType: z.enum(['physical', 'service', 'affiliate']).default('physical'),
    affiliateUrl: z.string().url().optional().or(z.literal('')),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    lowStockThreshold: z.number({ coerce: true }).int().min(0).optional(),
    weight: z.number({ coerce: true }).min(0).optional(),
    sku: z.string().optional(),
  }),
});

// ─── Update Product ───────────────────────────────────────────────────────────
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid product ID'),
  }),
  body: createProductSchema.shape.body.partial(),
});

// ─── Product Query Params ─────────────────────────────────────────────────────
export const productQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.enum(PRODUCT_CATEGORIES as unknown as [string, ...string[]]).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    minRating: z.string().optional(),
    inStock: z.string().optional(),
    isFeatured: z.string().optional(),
    productType: z.enum(['physical', 'service', 'affiliate']).optional(),
    sort: z
      .enum(['price_asc', 'price_desc', 'newest', 'best_selling', 'top_rated'])
      .optional()
      .default('newest'),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('12'),
  }),
});
