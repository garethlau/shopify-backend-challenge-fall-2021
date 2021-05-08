import logger from 'winston';
import { Request, Response, NextFunction } from 'express';

// middleware to log all errors delegated by the next() function
export default function logErrors(
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  logger.error(err.stack);
  return next(err);
}
