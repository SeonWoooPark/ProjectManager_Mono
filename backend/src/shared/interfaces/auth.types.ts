import { Request } from 'express';

/**
 * 사용자 역할 열거형
 */
export enum UserRole {
  SYSTEM_ADMIN = 1,
  COMPANY_MANAGER = 2,
  TEAM_MEMBER = 3
}

/**
 * 사용자 상태 열거형
 */
export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  PENDING = 3
}

/**
 * 회사 상태 열거형
 */
export enum CompanyStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  PENDING = 3
}

/**
 * 인증된 요청 인터페이스
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role_id: number;
    company_id: string | null;
    status_id: number;
  };
  token?: string;
}

/**
 * JWT 페이로드 인터페이스
 */
export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role_id: number;
  company_id: string | null;
  status_id: number;
  iat?: number;
  exp?: number;
  tokenFamily?: string;
}

/**
 * 성공 응답 인터페이스
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * 에러 응답 DTO
 */
export interface ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}