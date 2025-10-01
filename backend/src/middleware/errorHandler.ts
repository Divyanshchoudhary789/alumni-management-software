import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose validation errors
 */
const handleValidationError = (error: mongoose.Error.ValidationError): AppError => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: (err as any).value
  }));

  return new AppError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    errors
  );
};

/**
 * Handle Mongoose duplicate key errors
 */
const handleDuplicateKeyError = (error: any): AppError => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return new AppError(
    `Duplicate value for field: ${field}`,
    409,
    'DUPLICATE_ERROR',
    { field, value }
  );
};

/**
 * Handle Mongoose cast errors (invalid ObjectId, etc.)
 */
const handleCastError = (error: mongoose.Error.CastError): AppError => {
  return new AppError(
    `Invalid ${error.path}: ${error.value}`,
    400,
    'CAST_ERROR',
    { field: error.path, value: error.value }
  );
};

/**
 * Handle JWT errors
 */
const handleJWTError = (): AppError => {
  return new AppError(
    'Invalid token. Please log in again.',
    401,
    'JWT_INVALID'
  );
};

const handleJWTExpiredError = (): AppError => {
  return new AppError(
    'Your token has expired. Please log in again.',
    401,
    'JWT_EXPIRED'
  );
};

/**
 * Send error response in development
 */
const sendErrorDev = (err: ApiError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      details: err.details,
      stack: err.stack
    }
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err: ApiError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational === true) {
    res.status(err.statusCode || 500).json({
      error: {
        message: err.message,
        code: err.code || 'INTERNAL_ERROR',
        ...(err.details && { details: err.details })
      }
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unknown error:', err);
    
    res.status(500).json({
      error: {
        message: 'Something went wrong!',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Clerk errors
  if (err.message?.includes('clerk') || err.code?.includes('clerk')) {
    error = new AppError(
      'Authentication failed',
      401,
      'AUTH_ERROR'
    );
  }

  // Rate limiting errors
  if (err.message?.includes('Too many requests')) {
    error = new AppError(
      'Too many requests, please try again later',
      429,
      'RATE_LIMIT_ERROR'
    );
  }

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Catch async errors wrapper
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Utility function to create operational errors
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): AppError => {
  return new AppError(message, statusCode, code, details);
};