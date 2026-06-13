import { Router } from 'express';
import {
  createCoupon,
  getCoupons,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCouponSchema, validateCouponSchema } from '../validators/coupon.validator';

const router = Router();

router.use(protect); // All coupon endpoints require authentication

router.post('/validate', validate(validateCouponSchema), validateCoupon);

// Admin-only routes
router.post('/', adminOnly, validate(createCouponSchema), createCoupon);
router.get('/', adminOnly, getCoupons);
router.delete('/:id', adminOnly, deleteCoupon);

export default router;
