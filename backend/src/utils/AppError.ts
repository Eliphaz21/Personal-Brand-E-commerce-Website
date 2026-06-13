/**
 * Custom operational error class.
 * These are errors we anticipate and handle gracefully (e.g. 404, 401, 400).
 * Non-operational errors (programming bugs) bubble up to the global error handler.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}
