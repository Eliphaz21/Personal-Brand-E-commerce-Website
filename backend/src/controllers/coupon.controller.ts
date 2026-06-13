import { Request, Response } from 'express';
import Coupon from '../models/Coupon.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

/**
 * @desc    Create a new coupon (Admin Only)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    code,
    discountType,
    discountValue,
    minimumOrderAmount,
    maxUsageCount,
    expiresAt,
    applicableCategories,
  } = req.body;

  const codeUpper = code.toUpperCase();
  const existing = await Coupon.findOne({ code: codeUpper });

  if (existing) {
    throw new AppError('A coupon with this code already exists.', 400);
  }

  const coupon = await Coupon.create({
    code: codeUpper,
    discountType,
    discountValue,
    minimumOrderAmount,
    maxUsageCount,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    applicableCategories,
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully.',
    coupon,
  });
});

/**
 * @desc    Get all coupons (Admin Only)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getCoupons = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    coupons,
  });
});

/**
 * @desc    Delete a coupon (Admin Only)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found.', 404);
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully.',
  });
});

/**
 * @desc    Validate a coupon code and calculate discount
 * @route   POST /api/coupons/validate
 * @access  Private (Authenticated)
 */
export const validateCoupon = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    throw new AppError('Invalid coupon code.', 404);
  }

  if (!coupon.isActive) {
    throw new AppError('This coupon is currently inactive.', 400);
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError('This coupon has expired.', 400);
  }

  if (coupon.maxUsageCount > 0 && coupon.usedCount >= coupon.maxUsageCount) {
    throw new AppError('This coupon usage limit has been reached.', 400);
  }

  if (coupon.minimumOrderAmount > 0 && subtotal < coupon.minimumOrderAmount) {
    throw new AppError(`This coupon requires a minimum spend of $${coupon.minimumOrderAmount}.`, 400);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = subtotal * (coupon.discountValue / 100);
  } else {
    discountAmount = coupon.discountValue;
  }

  // Cap the discount so it doesn't exceed subtotal
  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  res.status(200).json({
    success: true,
    message: 'Coupon is valid.',
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100, // round to 2 decimal places
    },
  });
});
