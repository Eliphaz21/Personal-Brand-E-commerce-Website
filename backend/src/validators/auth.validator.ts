import { z } from 'zod';

// ─── Password strength validator (shared) ─────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: passwordSchema,
    confirmPassword: z.string({ required_error: 'Please confirm your password' }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// ─── OTP Verify ───────────────────────────────────────────────────────────────
export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
  }),
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  }),
});

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase().trim(),
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  body: z.object({
    otp: z
      .string({ required_error: 'Verification code is required' })
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must contain only digits'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export const resendOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address').toLowerCase(),
  }),
});
