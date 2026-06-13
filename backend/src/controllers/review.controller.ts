import { Request, Response } from 'express';
import Review from '../models/Review.model';
import Order from '../models/Order.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

/**
 * @desc    Create a product review (Verified purchase only)
 * @route   POST /api/reviews
 * @access  Private (Authenticated)
 */
export const createReview = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId, rating, title, comment } = req.body;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  // 1. Check if user already reviewed this product
  const existingReview = await Review.findOne({ userId, productId });
  if (existingReview) {
    throw new AppError('You have already reviewed this product.', 400);
  }

  // 2. Enforce verified purchase (user must have a paid order containing this product)
  const order = await Order.findOne({
    userId,
    paymentStatus: 'paid',
    'items.productId': productId,
  });

  if (!order) {
    throw new AppError('You can only review products you have purchased and paid for.', 403);
  }

  // 3. Create review
  const review = await Review.create({
    userId,
    productId,
    orderId: order._id,
    rating,
    title: title || '',
    comment,
    isVerifiedPurchase: true,
  });

  res.status(201).json({
    success: true,
    message: 'Review created successfully.',
    review,
  });
});

/**
 * @desc    Get all reviews for a product (paginated & sortable)
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  let sortOption: any = { createdAt: -1 };
  if (sort === 'helpful') {
    sortOption = { helpfulVotes: -1, createdAt: -1 };
  } else if (sort === 'highest') {
    sortOption = { rating: -1, createdAt: -1 };
  } else if (sort === 'lowest') {
    sortOption = { rating: 1, createdAt: -1 };
  }

  const total = await Review.countDocuments({ productId });
  const reviews = await Review.find({ productId })
    .populate('userId', 'name avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const pages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    total,
    pages,
    page: pageNum,
    limit: limitNum,
    reviews,
  });
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private (Owner only)
 */
export const updateReview = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { rating, title, comment } = req.body;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  // Verify owner
  if (review.userId.toString() !== userId) {
    throw new AppError('You do not have permission to edit this review.', 403);
  }

  if (rating !== undefined) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save(); // triggers post save rating hooks

  res.status(200).json({
    success: true,
    message: 'Review updated successfully.',
    review,
  });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Owner or Admin only)
 */
export const deleteReview = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  // Verify owner or admin
  if (review.userId.toString() !== userId && userRole !== 'admin') {
    throw new AppError('You do not have permission to delete this review.', 403);
  }

  // Must call deleteOne on document to trigger the post delete hook
  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully.',
  });
});

/**
 * @desc    Upvote review as helpful
 * @route   POST /api/reviews/:id/helpful
 * @access  Private (Authenticated)
 */
export const voteHelpful = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  // Professional check: user cannot vote on their own review
  if (review.userId.toString() === userId) {
    throw new AppError('You cannot vote on your own review.', 400);
  }

  review.helpfulVotes += 1;
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Vote submitted.',
    helpfulVotes: review.helpfulVotes,
  });
});
