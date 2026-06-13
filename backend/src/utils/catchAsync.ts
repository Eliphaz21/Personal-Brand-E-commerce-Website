import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers to avoid try/catch boilerplate.
 * Automatically catches rejected promises and forwards to Express error middleware.
 *
 * Usage:
 *   router.get('/example', catchAsync(async (req, res) => {
 *     const data = await SomeService.getData();
 *     res.json(data);
 *   }));
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
