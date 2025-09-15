export interface UserResponseDto {
  user_id: number;
  email: string;
  user_name: string;
  phone_number: string;
  role_id: number;
  status_id: number;
  company_id: number;
  company?: {
    company_id: number;
    company_name: string;
    company_description?: string;
  };
  role?: {
    role_id: number;
    role_name: string;
  };
  status?: {
    status_id: number;
    status_name: string;
  };
  created_at: Date;
  updated_at: Date;
}

export interface LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponseDto {
  user: UserResponseDto;
  message: string;
}

export interface LogoutResponseDto {
  message: string;
}

export interface PasswordResetResponseDto {
  message: string;
}

export interface ApprovalResponseDto {
  message: string;
  user?: UserResponseDto;
  company?: {
    company_id: number;
    company_name: string;
  };
}