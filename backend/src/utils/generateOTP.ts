import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit OTP
 */
export const generateOTP = (): string => {
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
};

/**
 * Returns a Date object N minutes from now (default: 10 minutes)
 */
export const getOTPExpiry = (minutes = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
