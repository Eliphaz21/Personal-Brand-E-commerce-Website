import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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
export const getAllUsers = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { search, role, isBlocked, isVerified } = req.query as {
    search?: string;
    role?: string;
    isBlocked?: boolean;
    isVerified?: boolean;
  };

  const filter: Record<string, unknown> = {};

  if (role) {
    filter.role = role;
  }
  if (isBlocked !== undefined) {
    filter.isBlocked = isBlocked;
  }
  if (isVerified !== undefined) {
    filter.isVerified = isVerified;
  }
  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
    total: users.length,
  });
});

/**
 * @desc    Get single user by ID (Admin Only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc    Create a new user (Admin Only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUserByAdmin = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role = 'customer', isVerified = false, isBlocked = false, bio } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    isVerified,
    isBlocked,
    bio: bio || '',
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully.',
    user,
  });
});

/**
 * @desc    Update user details (Admin Only)
 * @route   PATCH /api/users/:id
 * @access  Private/Admin
 */
export const updateUserByAdmin = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, password, role, isVerified, isBlocked, bio } = req.body;

  const user = await User.findById(id).select('+passwordHash');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const actingAdminId = req.user?.userId;
  const isSelf = actingAdminId === id;

  if (email && email !== user.email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      throw new AppError('An account with this email address already exists.', 400);
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;

  if (role !== undefined) {
    if (user.role === 'admin' && role !== 'admin' && !isSelf) {
      throw new AppError('Cannot change role of another admin user.', 400);
    }
    if (isSelf && role !== 'admin') {
      throw new AppError('You cannot remove your own admin role.', 400);
    }
    user.role = role;
  }

  if (isVerified !== undefined) user.isVerified = isVerified;

  if (isBlocked !== undefined) {
    if (user.role === 'admin') {
      throw new AppError('Cannot block an admin user.', 400);
    }
    if (isSelf) {
      throw new AppError('You cannot block your own account.', 400);
    }
    user.isBlocked = isBlocked;
  }

  if (password) {
    user.passwordHash = await bcrypt.hash(password, 12);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully.',
    user,
  });
});

/**
 * @desc    Delete user account (Admin Only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUserByAdmin = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const actingAdminId = req.user?.userId;

  if (actingAdminId === id) {
    throw new AppError('You cannot delete your own account.', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role === 'admin') {
    throw new AppError('Cannot delete an admin user.', 400);
  }

  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully.',
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
