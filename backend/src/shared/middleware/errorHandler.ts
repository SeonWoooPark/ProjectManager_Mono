import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/errors';
import { handlePrismaTransactionError } from '../utils/prismaErrorHandler';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Prisma 에러 처리 (에러 메시지 패턴으로 감지)
  if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string' && err.code.startsWith('P')) {
    try {
      handlePrismaTransactionError(err);
    } catch (handledError) {
      error = handledError as Error;
    }
  }

  // 로깅
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    ...(error instanceof ApiError && { 
      code: error.code,
      details: error.details 
    }),
  });

  // ApiError (커스텀 에러) 처리
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
    return;
  }

  // AppError (레거시 에러) 처리
  if ('statusCode' in error && (error as any).statusCode) {
    res.status((error as any).statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
    return;
  }

  // 기본 에러 처리
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? '서버 오류가 발생했습니다' 
      : error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};