import { Request } from 'express';
import { User } from '@prisma/client';

// User roles enum
export enum UserRole {
  SYSTEM_ADMIN = 1,
  COMPANY_MANAGER = 2,
  TEAM_MEMBER = 3
}

// User status enum
export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  PENDING = 3
}

// Company status enum
export enum CompanyStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  PENDING = 3
}

// Extended Request with user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role_id: number;
    company_id?: string;
    status_id: number;
    jti?: string;
  };
}

// Login request DTO
export interface LoginRequestDto {
  email: string;
  password: string;
}

// Login response DTO
export interface LoginResponseDto {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      user_name: string;
      role_id: number;
      role_name: string;
      status_id: number;
      status_name: string;
      company_id?: string;
      company_name?: string;
    };
  };
}

// Company manager signup request DTO
export interface CompanyManagerSignupRequestDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number?: string;
  };
  company: {
    company_name: string;
    company_description?: string;
  };
}

// Team member signup request DTO
export interface TeamMemberSignupRequestDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number?: string;
  };
  invitation_code: string;
}

// Signup response DTO
export interface SignupResponseDto {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      user_name: string;
      role_id: number;
      role_name: string;
      status_id: number;
      status_name: string;
    };
    company?: {
      id: string;
      company_name: string;
      status_id: number;
      status_name: string;
      invitation_code?: string;
    };
    message: string;
  };
}

// Company approval request DTO
export interface CompanyApprovalRequestDto {
  company_id: string;
  action: 'approve' | 'reject';
  comment?: string;
  generate_invitation_code?: boolean;
}

// Company approval response DTO
export interface CompanyApprovalResponseDto {
  success: boolean;
  data: {
    company: {
      id: string;
      company_name: string;
      status_id: number;
      status_name: string;
      invitation_code?: string;
      manager_id: string;
    };
    manager: {
      id: string;
      email: string;
      status_id: number;
      status_name: string;
    };
    approved_at: string;
    approved_by: string;
  };
}

// Member approval request DTO
export interface MemberApprovalRequestDto {
  user_id: string;
  action: 'approve' | 'reject';
  comment?: string;
}

// Member approval response DTO
export interface MemberApprovalResponseDto {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      user_name: string;
      status_id: number;
      status_name: string;
      company_id: string;
    };
    approved_at: string;
    approved_by: string;
  };
}

// Refresh token response DTO
export interface RefreshTokenResponseDto {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

// Logout response DTO
export interface LogoutResponseDto {
  success: boolean;
  message: string;
}

// Forgot password request DTO
export interface ForgotPasswordRequestDto {
  email: string;
}

// Forgot password response DTO
export interface ForgotPasswordResponseDto {
  success: boolean;
  message: string;
  reset_url?: string; // Only in development mode
}

// Verify reset token response DTO
export interface VerifyResetTokenResponseDto {
  success: boolean;
  data: {
    valid: boolean;
    email: string;
    expires_at: string;
  };
}

// Reset password request DTO
export interface ResetPasswordRequestDto {
  token: string;
  new_password: string;
  confirm_password: string;
}

// Reset password response DTO
export interface ResetPasswordResponseDto {
  success: boolean;
  message: string;
}

// Error response DTO
export interface ErrorResponseDto {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Success response wrapper
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Token info stored in Redis or database
export interface RefreshTokenInfo {
  id: string;
  user_id: string;
  token_hash: string;
  token_family: string;
  expires_at: Date;
  created_at: Date;
  last_used_at?: Date;
  revoked_at?: Date;
  revoked_reason?: string;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
}

// Password reset token info
export interface PasswordResetTokenInfo {
  id: string;
  user_id: string;
  jti: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  used_at?: Date;
  ip_address?: string;
}

// Token blacklist entry
export interface TokenBlacklistEntry {
  id: string;
  jti: string;
  token_type: 'access' | 'refresh';
  user_id?: string;
  expires_at: Date;
  blacklisted_at: Date;
  reason?: string;
}