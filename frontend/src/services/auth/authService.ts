import api from '@/services/api';
import type {
  LoginRequestDto,
  LoginResponseDto,
  CompanyManagerSignupDto,
  TeamMemberSignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenResponseDto,
  ApproveCompanyDto,
  ApproveMemberDto,
  SuccessResponse,
  User,
  PasswordResetResponseDto,
  ApprovalResponseDto,
} from '@/types/auth.types';

export const authService = {
  // =============================================
  // 인증 기본 기능
  // =============================================

  /**
   * 로그인
   */
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await api.post<SuccessResponse<LoginResponseDto>>(
      '/auth/login',
      data
    );
    return response.data.data;
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  /**
   * 토큰 갱신 (자동으로 interceptor에서 처리되지만 필요시 수동 호출 가능)
   */
  async refreshToken(): Promise<RefreshTokenResponseDto> {
    const response = await api.post<SuccessResponse<RefreshTokenResponseDto>>(
      '/auth/refresh',
      {}
    );
    return response.data.data;
  },

  // =============================================
  // 회원가입 기능
  // =============================================

  /**
   * 회사 관리자 회원가입
   */
  async signupCompanyManager(data: CompanyManagerSignupDto): Promise<User> {
    const response = await api.post<SuccessResponse<User>>(
      '/auth/signup/company-manager',
      data
    );
    return response.data.data;
  },

  /**
   * 팀원 회원가입
   */
  async signupTeamMember(data: TeamMemberSignupDto): Promise<User> {
    const response = await api.post<SuccessResponse<User>>(
      '/auth/signup/team-member',
      data
    );
    return response.data.data;
  },

  // =============================================
  // 비밀번호 재설정 기능
  // =============================================

  /**
   * 비밀번호 재설정 요청 (이메일 전송)
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<PasswordResetResponseDto> {
    const response = await api.post<SuccessResponse<PasswordResetResponseDto>>(
      '/auth/password/forgot',
      data
    );
    return response.data.data;
  },

  /**
   * 비밀번호 재설정 토큰 검증
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const response = await api.get<SuccessResponse<{ valid: boolean; email?: string }>>(
      `/auth/password/verify?token=${token}`
    );
    return response.data.data;
  },

  /**
   * 비밀번호 재설정
   */
  async resetPassword(data: ResetPasswordDto): Promise<PasswordResetResponseDto> {
    const response = await api.post<SuccessResponse<PasswordResetResponseDto>>(
      '/auth/password/reset',
      data
    );
    return response.data.data;
  },

  // =============================================
  // 승인 기능 (관리자용)
  // =============================================

  /**
   * 회사 승인/거부 (시스템 관리자 전용)
   */
  async approveCompany(data: ApproveCompanyDto): Promise<ApprovalResponseDto> {
    const response = await api.post<SuccessResponse<ApprovalResponseDto>>(
      '/auth/admin/approve/company',
      data
    );
    return response.data.data;
  },

  /**
   * 팀원 승인/거부 (회사 관리자 전용)
   */
  async approveMember(data: ApproveMemberDto): Promise<ApprovalResponseDto> {
    const response = await api.post<SuccessResponse<ApprovalResponseDto>>(
      '/auth/manager/approve/member',
      data
    );
    return response.data.data;
  },

  // =============================================
  // 추가 유틸리티 기능
  // =============================================

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<SuccessResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * 이메일 중복 확인
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const response = await api.get<SuccessResponse<{ available: boolean }>>(
      `/auth/check-email?email=${encodeURIComponent(email)}`
    );
    return response.data.data;
  },

  /**
   * 초대 코드 유효성 확인
   */
  async validateInvitationCode(code: string): Promise<{ valid: boolean; company_name?: string }> {
    const response = await api.get<SuccessResponse<{ valid: boolean; company_name?: string }>>(
      `/auth/validate-invitation?code=${code}`
    );
    return response.data.data;
  },
};