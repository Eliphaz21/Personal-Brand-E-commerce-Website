import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/generateToken';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Protect routes — verifies JWT access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch {
      throw new AppError('Invalid or expired token. Please log in again.', 401);
    }
  }
);

/**
 * Restrict access to admin role only.
 * Must be used AFTER protect middleware.
 */
export const adminOnly = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    throw new AppError('You do not have permission to perform this action.', 403);
  }
  next();
};

/**
 * Restrict access to customers and admins (excludes guests).
 * Must be used AFTER protect middleware.
 */
export const customerOnly = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role === 'guest') {
    throw new AppError('Please log in to access this resource.', 401);
  }
  next();
};
