import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist.model';
import Product from '../models/Product.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

/**
 * Helper to fetch a populated wishlist document or create one if it doesn't exist.
 */
const getOrCreateWishlist = async (userId: string) => {
  let wishlist = await Wishlist.findOne({ userId }).populate({
    path: 'products',
    select: 'title slug price compareAtPrice images stock category productType rating numReviews',
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, products: [] });
  }
  return wishlist;
};

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private (Authenticated)
 */
export const getWishlist = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const wishlist = await getOrCreateWishlist(userId);

  res.status(200).json({
    success: true,
    wishlist,
  });
});

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private (Authenticated)
 */
export const addToWishlist = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const wishlist = await getOrCreateWishlist(userId);

  // If already in wishlist, return it directly without duplicates
  const alreadyInWishlist = wishlist.products.some(
    (prod: any) => prod._id.toString() === productId
  );

  if (!alreadyInWishlist) {
    wishlist.products.push(productId as any);
    await wishlist.save();
  }

  const populatedWishlist = await wishlist.populate({
    path: 'products',
    select: 'title slug price compareAtPrice images stock category productType rating numReviews',
  });

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist successfully.',
    wishlist: populatedWishlist,
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private (Authenticated)
 */
export const removeFromWishlist = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const wishlist = await getOrCreateWishlist(userId);

  // Filter out product
  const originalLength = wishlist.products.length;
  wishlist.products = wishlist.products.filter(
    (prod: any) => prod._id.toString() !== productId
  );

  if (wishlist.products.length === originalLength) {
    throw new AppError('Product not found in wishlist.', 404);
  }

  await wishlist.save();

  const populatedWishlist = await wishlist.populate({
    path: 'products',
    select: 'title slug price compareAtPrice images stock category productType rating numReviews',
  });

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist.',
    wishlist: populatedWishlist,
  });
});
