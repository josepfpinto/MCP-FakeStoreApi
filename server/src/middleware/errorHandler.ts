import { Request, Response, NextFunction } from "express";
import { ApiResponse, ErrorCodes } from "../types";

export interface AppError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  code?: string;
  details?: any;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error creators
export const createValidationError = (message: string, details?: any) =>
  new CustomError(message, 400, ErrorCodes.VALIDATION_ERROR, details);

export const createAuthenticationError = (message: string, details?: any) =>
  new CustomError(message, 401, ErrorCodes.INVALID_TOKEN, details);

export const createAuthorizationError = (message: string, details?: any) =>
  new CustomError(message, 403, ErrorCodes.MISSING_AUTH, details);

export const createNotFoundError = (message: string, details?: any) =>
  new CustomError(message, 404, ErrorCodes.NOT_FOUND, details);

export const createRateLimitError = (message: string, details?: any) =>
  new CustomError(message, 429, ErrorCodes.RATE_LIMITED, details);

export const createServerError = (message: string, details?: any) =>
  new CustomError(message, 500, ErrorCodes.INTERNAL_ERROR, details);

export const createExternalApiError = (message: string, details?: any) =>
  new CustomError(message, 502, ErrorCodes.EXTERNAL_API_ERROR, details);

// Global error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("🚨 Error Handler:", {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Default error values
  let statusCode = error.statusCode || 500;
  let code = error.code || ErrorCodes.INTERNAL_ERROR;
  let message = error.message || "Internal server error";
  let details = error.details;

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    code = ErrorCodes.VALIDATION_ERROR;
    message = "Validation failed";
    details = error.details || error.message;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    code = ErrorCodes.VALIDATION_ERROR;
    message = "Invalid data format";
  }

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    code = ErrorCodes.INVALID_TOKEN;
    message = "Invalid authentication token";
  }

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    code = ErrorCodes.INVALID_TOKEN;
    message = "Authentication token has expired";
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error";
    details = undefined;
  }

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = createNotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};
