import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { generateOTP, getOTPExpiry } from '../utils/generateOTP';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/generateToken';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/email.service';
import { env } from '../config/env';

/**
 * Cookie options helper for Refresh Tokens
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  // Lax in dev allows the httpOnly cookie on cross-origin API calls from the Vite dev server
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

const clearRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
});

/** Safe user payload returned to the client after auth / refresh */
const formatAuthUser = (user: InstanceType<typeof User>) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar?.url || '',
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError('An account with this email address already exists.', 400);
    }

    // User exists but is unverified - update name, password, generate new OTP
    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10); // 10 minutes from now

    existingUser.name = name;
    existingUser.passwordHash = passwordHash;
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    existingUser.otpResendCount = 0;

    await existingUser.save();

    // TEMPORARY: Skip email sending for testing
    // await sendOTPEmail(email, name, otp);

    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.',
      // TEMPORARY: Return OTP for testing
      otp: otp,
    });
    return;
  }

  // Create new user (unverified by default)
  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(10);

  const newUser = await User.create({
    name,
    email,
    passwordHash,
    role: 'customer',
    isVerified: false,
    otp,
    otpExpiry,
  });

  // TEMPORARY: Skip email sending for testing
  // await sendOTPEmail(email, name, otp);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email for the verification code.',
    userId: newUser._id,
    // TEMPORARY: Return OTP for testing
    otp: otp,
  });
});

/**
 * @desc    Verify OTP to activate user account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.isVerified) {
    throw new AppError('Account is already verified. Please log in.', 400);
  }

  if (!user.otp || !user.otpExpiry) {
    throw new AppError('No verification code requested. Please sign up or resend.', 400);
  }

  // Validate OTP code
  if (user.otp !== otp) {
    throw new AppError('Invalid verification code.', 400);
  }

  // Check expiry
  if (new Date() > user.otpExpiry) {
    throw new AppError('Verification code has expired. Please request a new one.', 400);
  }

  // Mark user as verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpResendCount = 0;

  // Generate session tokens
  const tokenPayload: TokenPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You are now logged in.',
    accessToken,
    token: accessToken,
    user: formatAuthUser(user),
  });
});

/**
 * @desc    Resend OTP verification code
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTP = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+otpExpiry');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.isVerified) {
    throw new AppError('Account is already verified. Please log in.', 400);
  }

  // Basic rate limiting: block if requested too many times within the current expiry window
  if (user.otpResendCount >= 5 && user.otpExpiry && new Date() < user.otpExpiry) {
    throw new AppError('Too many request attempts. Please try again in 10 minutes.', 429);
  }

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(10);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.otpResendCount = user.otpExpiry && new Date() < user.otpExpiry ? user.otpResendCount + 1 : 1;

  await user.save();
  await sendOTPEmail(email, user.name, otp);

  res.status(200).json({
    success: true,
    message: 'Verification code resent successfully.',
  });
});

/**
 * @desc    Login user & issue access + refresh tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.isBlocked) {
    throw new AppError('Your account has been suspended. Please contact support.', 403);
  }

  // Account must be verified to log in
  if (!user.isVerified) {
    // Proactively send a new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry(10);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpResendCount = 0;
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.status(403).json({
      success: false,
      isVerified: false,
      message: 'Your email is not verified yet. A new verification code has been sent.',
    });
    return;
  }

  // Generate tokens
  const tokenPayload: TokenPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set HTTP-only cookie
  res.cookie('refreshToken', refreshToken, getCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    accessToken,
    token: accessToken,
    user: formatAuthUser(user),
  });
});

/**
 * @desc    Get new access token using refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshToken = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new AppError('Refresh token not found. Please log in again.', 401);
  }

  try {
    const decoded = verifyRefreshToken(token);

    const user = await User.findOne({ _id: decoded.userId, refreshToken: token });

    if (!user) {
      throw new AppError('Session expired or invalid. Please log in again.', 401);
    }

    if (user.isBlocked) {
      throw new AppError('User account has been blocked.', 403);
    }

    // Generate new tokens (rotation)
    const tokenPayload: TokenPayload = { userId: user._id.toString(), role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      token: newAccessToken,
      user: formatAuthUser(user),
    });
  } catch (err) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }
});

/**
 * @desc    Logout user & clear session/cookies
 * @route   POST /api/auth/logout
 * @access  Public (or protected)
 */
export const logout = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (token) {
    // Clear token in database
    await User.findOneAndUpdate({ refreshToken: token }, { $unset: { refreshToken: 1 } });
  }

  res.clearCookie('refreshToken', clearRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * @desc    Request password reset OTP code
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Security measure: Do not confirm if a user exists or not to prevent user scanning
  if (!user) {
    res.status(200).json({
      success: true,
      message: 'If the email matches an account, a password reset code was sent.',
    });
    return;
  }

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(10);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.otpResendCount = 0;
  await user.save();

  await sendPasswordResetEmail(email, user.name, otp);

  res.status(200).json({
    success: true,
    message: 'If the email matches an account, a password reset code was sent.',
  });
});

/**
 * @desc    Reset password using reset OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+otp +otpExpiry');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!user.otp || !user.otpExpiry) {
    throw new AppError('No password reset was requested.', 400);
  }

  if (user.otp !== otp) {
    throw new AppError('Invalid code.', 400);
  }

  if (new Date() > user.otpExpiry) {
    throw new AppError('Verification code has expired. Please request a new one.', 400);
  }

  // Update password hash and revoke active refresh tokens (force sign out)
  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpResendCount = 0;
  user.refreshToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully! You can now log in with your new password.',
  });
});

/**
 * @desc    Send OTP to verify identity before changing password
 * @route   POST /api/auth/change-password/request-otp
 * @access  Private
 */
export const requestChangePasswordOTP = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(10);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.otpResendCount = 0;
  await user.save();

  await sendOTPEmail(user.email, user.name, otp);

  res.status(200).json({
    success: true,
    message: 'A verification code has been sent to your email address.',
  });
});

/**
 * @desc    Change password while logged in (requires email OTP + current password)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword, otp } = req.body;
  const userId = req.user?.userId;

  const user = await User.findById(userId).select('+passwordHash +otp +otpExpiry');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!user.otp || !user.otpExpiry) {
    throw new AppError('Please request a verification code first.', 400);
  }

  if (user.otp !== otp) {
    throw new AppError('Invalid verification code.', 400);
  }

  if (new Date() > user.otpExpiry) {
    throw new AppError('Verification code has expired. Please request a new one.', 400);
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Incorrect current password.', 400);
  }

  if (await user.comparePassword(newPassword)) {
    throw new AppError('New password must be different from your current password.', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.refreshToken = undefined;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpResendCount = 0;

  await user.save();

  res.clearCookie('refreshToken', clearRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Password updated successfully. Please log in again with your new password.',
  });
});
