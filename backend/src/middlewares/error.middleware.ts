import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: string;
  errors?: Record<string, { message: string }>;
}

/** Handle Mongoose duplicate key errors (code 11000) */
const handleDuplicateKeyError = (err: MongoError): AppError => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  return new AppError(`${field} '${value}' already exists. Please use a different value.`, 409);
};

/** Handle Mongoose cast errors (e.g., invalid ObjectId) */
const handleCastError = (err: MongoError): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

/** Handle Mongoose validation errors */
const handleValidationError = (err: MongoError): AppError => {
  const messages = Object.values(err.errors || {})
    .map((e) => e.message)
    .join('. ');
  return new AppError(`Validation failed: ${messages}`, 400);
};

/** Handle JWT errors */
const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

/** Handle JWT expiry */
const handleJWTExpiredError = (): AppError =>
  new AppError('Your session has expired. Please log in again.', 401);

/** Development error: full stack + details */
const sendDevError = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    status: err.statusCode,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

/** Production error: clean, no internal details */
const sendProdError = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or unknown error — don't leak details
    console.error('💥 NON-OPERATIONAL ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

/**
 * Global Express error handler middleware.
 * Must be registered LAST in app.ts.
 */
export const globalErrorHandler = (
  err: MongoError & AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = (err as AppError).statusCode || 500;
  error.isOperational = (err as AppError).isOperational ?? false;

  // Transform known Mongoose/JWT errors into operational AppErrors
  if (err.name === 'CastError') error = handleCastError(err) as typeof error;
  if (err.code === 11000) error = handleDuplicateKeyError(err) as typeof error;
  if (err.name === 'ValidationError') error = handleValidationError(err) as typeof error;
  if (err.name === 'JsonWebTokenError') error = handleJWTError() as typeof error;
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError() as typeof error;

  if (env.NODE_ENV === 'development') {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};

/** Handle routes not matched by any registered handler */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route '${req.originalUrl}' not found on this server.`, 404));
};
