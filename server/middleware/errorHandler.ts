import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/exceptions';
import { logger } from '../core/logging';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err instanceof Error) {
    // Standard JS error
    message = err.message || 'Internal server error';
  }

  // Log error with request ID
  logger.error(`Request error on ${req.method} ${req.originalUrl}: ${message}`, err, {
    requestId: req.id,
    userId: req.user?.userId,
    status: statusCode,
    error: { code, message },
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      request_id: req.id,
    },
  });
}
