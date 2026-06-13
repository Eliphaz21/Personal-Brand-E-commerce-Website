import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/upload.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product.validator';
import {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from '../controllers/product.controller';

const router = Router();

/**
 * Middleware to convert multipart/form-data values (which always arrive as strings)
 * into their appropriate data types (booleans, arrays) before Zod schema validation.
 */
const parseProductMultipart = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    // Convert boolean fields
    if (req.body.isFeatured !== undefined) {
      req.body.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

    // Convert tags array
    if (typeof req.body.tags === 'string' && req.body.tags.trim() !== '') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch {
        req.body.tags = req.body.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
      }
    } else if (req.body.tags === '') {
      req.body.tags = [];
    }
  }
  next();
};

// ─── Public Endpoints ────────────────────────────────────────────────────────
router.get('/', validate(productQuerySchema), getProducts);
router.get('/categories', getProductCategories);
router.get('/:slug', getProductBySlug);

// ─── Private / Admin Endpoints ───────────────────────────────────────────────
router.post(
  '/',
  protect,
  adminOnly,
  uploadImage.array('images', 10),
  parseProductMultipart,
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  uploadImage.array('images', 10),
  parseProductMultipart,
  validate(updateProductSchema),
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
