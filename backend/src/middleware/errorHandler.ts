import { ErrorRequestHandler } from 'express';

interface AppError extends Error {
  statusCode?: number;
  name: string;
  errors?: unknown[];
  code?: number;
}

export const errorHandler: ErrorRequestHandler = (err: AppError, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  }
  if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  }
  if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  }
  if (err.name === 'NotFoundError') {
    status = 404;
    message = 'Not found';
  }
  if (err.name === 'MongoServerError' && err.code === 11000) {
    status = 409;
    message = 'Duplicate key error';
  }

  res.status(status).json({
    success: false,
    message,
    errors: err.errors,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};
