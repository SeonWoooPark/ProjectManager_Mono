import { Response } from 'express';
import { ErrorResponseDto, SuccessResponse } from '@modules/auth/interfaces/auth.types';

export class ResponseFormatter {
  // Send success response
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message })
    };
    return res.status(statusCode).json(response);
  }

  // Send error response
  static error(res: Response, error: any) {
    const statusCode = error.statusCode || 500;
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || '서버 오류가 발생했습니다',
        ...(error.details && { details: error.details })
      },
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  // Send created response
  static created<T>(res: Response, data: T, message?: string) {
    return this.success(res, data, message, 201);
  }

  // Send no content response
  static noContent(res: Response) {
    return res.status(204).send();
  }

  // Send validation error response
  static validationError(res: Response, field: string, reason: string) {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '유효성 검사 실패',
        details: { field, reason }
      },
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  // Send unauthorized response
  static unauthorized(res: Response, message: string = '인증이 필요합니다') {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      },
      timestamp: new Date().toISOString()
    };
    return res.status(401).json(response);
  }

  // Send forbidden response
  static forbidden(res: Response, message: string = '권한이 없습니다') {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message
      },
      timestamp: new Date().toISOString()
    };
    return res.status(403).json(response);
  }

  // Send not found response
  static notFound(res: Response, message: string = '리소스를 찾을 수 없습니다') {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message
      },
      timestamp: new Date().toISOString()
    };
    return res.status(404).json(response);
  }

  // Send conflict response
  static conflict(res: Response, message: string, field?: string) {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        ...(field && { details: { field, reason: 'duplicate' } })
      },
      timestamp: new Date().toISOString()
    };
    return res.status(409).json(response);
  }

  // Send rate limit response
  static tooManyRequests(res: Response, retryAfter?: number) {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요',
        ...(retryAfter && { details: { retry_after: retryAfter } })
      },
      timestamp: new Date().toISOString()
    };
    
    if (retryAfter) {
      res.setHeader('Retry-After', retryAfter.toString());
    }
    
    return res.status(429).json(response);
  }

  // Send internal server error response
  static internalError(res: Response, message: string = '서버 오류가 발생했습니다') {
    const response: ErrorResponseDto = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message
      },
      timestamp: new Date().toISOString()
    };
    return res.status(500).json(response);
  }
}