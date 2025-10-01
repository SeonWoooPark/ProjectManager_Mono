// =============================================
// 기본 엔티티 타입
// =============================================

export interface User {
  id: string;
  email: string;
  user_name: string;
  phone_number?: string | null;
  role_id: 1 | 2 | 3; // SYSTEM_ADMIN | COMPANY_MANAGER | TEAM_MEMBER
  role_name?: string;
  status_id: 1 | 2 | 3; // ACTIVE | INACTIVE | PENDING
  status_name?: string;
  company_id?: string | null;
  company?: Company | null;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  company_name: string;
  company_description?: string | null;
  manager_id?: string | null;
  invitation_code?: string | null;
  status_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
}

export interface Status {
  status_id: number;
  status_name: string;
}

// =============================================
// Auth 요청/응답 DTO
// =============================================

// 회원가입 DTO
export interface CompanyManagerSignupDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  company: {
    company_name: string;
    company_description?: string;
  };
}

export interface TeamMemberSignupDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  invitation_code: string;
}

// 로그인 DTO
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: User;
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

// 토큰 갱신 DTO
export interface RefreshTokenResponseDto {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

// 비밀번호 재설정 DTO
export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

export interface PasswordResetResponseDto {
  message: string;
  reset_url?: string;
}

// 승인 DTO
export interface ApproveCompanyDto {
  company_id: string;
  is_approved: boolean;
}

export interface ApproveMemberDto {
  user_id: string;
  action: 'approve' | 'reject';
  comment?: string;
}

export interface ApprovalResponseDto {
  message: string;
  approved?: boolean;
  user?: User;
  company?: Company;
}

// =============================================
// 에러 응답 타입
// =============================================

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// =============================================
// Auth 상태 관련 타입
// =============================================

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// =============================================
// 역할 및 권한 관련 상수
// =============================================

export const ROLES = {
  SYSTEM_ADMIN: 1,
  COMPANY_MANAGER: 2,
  TEAM_MEMBER: 3,
} as const;

export const STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  PENDING: 3,
} as const;

export type RoleType = keyof typeof ROLES;
export type StatusType = keyof typeof STATUS;

// =============================================
// 유틸리티 타입
// =============================================

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}