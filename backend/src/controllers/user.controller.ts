import { Request, Response } from 'express';
import User from '../models/User.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private (Authenticated)
 */
export const getProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Update current user profile info (name, bio)
 * @route   PATCH /api/users/profile
 * @access  Private (Authenticated)
 */
export const updateProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const { name, bio } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user,
  });
});

/**
 * @desc    Update current user profile avatar image
 * @route   PUT /api/users/avatar
 * @access  Private (Authenticated)
 */
export const updateAvatar = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const file = req.file;
  if (!file) {
    throw new AppError('Avatar image file is required.', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 1. Delete previous avatar from Cloudinary if it exists
  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  // 2. Upload new avatar buffer
  const uploadResult = await uploadBufferToCloudinary(file.buffer, 'kiduendu/avatars');

  user.avatar = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully.',
    user,
  });
});

/**
 * @desc    Get all users list (Admin Only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});

/**
 * @desc    Block or unblock user account (Admin Only)
 * @route   PATCH /api/users/:id/block
 * @access  Private/Admin
 */
export const toggleBlockUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  if (isBlocked === undefined) {
    throw new AppError('isBlocked status value is required.', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role === 'admin') {
    throw new AppError('Cannot toggle block status on an admin user.', 400);
  }

  user.isBlocked = isBlocked;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User has been successfully ${isBlocked ? 'blocked' : 'unblocked'}.`,
    user,
  });
});
