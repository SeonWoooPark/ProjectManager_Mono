import { User, Company } from '@prisma/client';
import { 
  LoginRequestDto, 
  CompanyManagerSignupRequestDto, 
  TeamMemberSignupRequestDto, 
  ForgotPasswordRequestDto, 
  ResetPasswordRequestDto,
  CompanyApprovalRequestDto,
  MemberApprovalRequestDto 
} from '../dto/request';
import { 
  LoginResponseDto, 
  SignupResponseDto, 
  TokenRefreshResponseDto, 
  LogoutResponseDto, 
  PasswordResetResponseDto, 
  ApprovalResponseDto 
} from '../dto/response';

/**
 * Authentication Service Interface
 * 로그인/로그아웃 관련 서비스 인터페이스
 */
export interface IAuthenticationService {
  login(dto: LoginRequestDto): Promise<LoginResponseDto>;
  logout(userId: number, token: string): Promise<LogoutResponseDto>;
  refreshTokens(refreshToken: string): Promise<TokenRefreshResponseDto>;
}

/**
 * Token Service Interface
 * JWT 토큰 관리 서비스 인터페이스
 */
export interface ITokenService {
  generateAccessToken(user: User): string;
  generateRefreshToken(user: User): Promise<string>;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
  blacklistToken(token: string): Promise<void>;
  rotateTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

/**
 * Password Service Interface
 * 비밀번호 관련 서비스 인터페이스
 */
export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  validatePasswordStrength(password: string): void;
  forgotPassword(dto: ForgotPasswordRequestDto): Promise<PasswordResetResponseDto>;
  resetPassword(dto: ResetPasswordRequestDto): Promise<PasswordResetResponseDto>;
  verifyResetToken(token: string): Promise<{ valid: boolean; message: string }>;
}

/**
 * Registration Service Interface
 * 회원가입 관련 서비스 인터페이스
 */
export interface IRegistrationService {
  registerCompanyManager(dto: CompanyManagerSignupRequestDto): Promise<SignupResponseDto>;
  registerTeamMember(dto: TeamMemberSignupRequestDto): Promise<SignupResponseDto>;
}

/**
 * Approval Service Interface
 * 승인 프로세스 관련 서비스 인터페이스
 */
export interface IApprovalService {
  approveCompany(companyId: number, dto: CompanyApprovalRequestDto, adminId: number): Promise<ApprovalResponseDto>;
  approveMember(userId: number, dto: MemberApprovalRequestDto, managerId: number): Promise<ApprovalResponseDto>;
  generateInvitationCode(companyId: number): Promise<string>;
}

/**
 * Auth Service Interface (Facade)
 * 인증 관련 모든 기능을 통합하는 Facade 서비스 인터페이스
 */
export interface IAuthService {
  // Authentication
  login(dto: LoginRequestDto): Promise<LoginResponseDto>;
  logout(userId: number, token: string): Promise<LogoutResponseDto>;
  refresh(refreshToken: string): Promise<TokenRefreshResponseDto>;

  // Registration
  signupCompanyManager(dto: CompanyManagerSignupRequestDto): Promise<SignupResponseDto>;
  signupTeamMember(dto: TeamMemberSignupRequestDto): Promise<SignupResponseDto>;

  // Password Management
  forgotPassword(dto: ForgotPasswordRequestDto): Promise<PasswordResetResponseDto>;
  resetPassword(dto: ResetPasswordRequestDto): Promise<PasswordResetResponseDto>;
  verifyResetToken(token: string): Promise<{ valid: boolean; message: string }>;

  // Approval Process
  approveCompany(companyId: number, dto: CompanyApprovalRequestDto, adminId: number): Promise<ApprovalResponseDto>;
  approveMember(userId: number, dto: MemberApprovalRequestDto, managerId: number): Promise<ApprovalResponseDto>;
  generateInvitationCode(companyId: number): Promise<string>;
}

/**
 * Auth Controller Interface
 * 인증 컨트롤러 인터페이스
 */
export interface IAuthController {
  login(req: any, res: any, next: any): Promise<void>;
  logout(req: any, res: any, next: any): Promise<void>;
  refresh(req: any, res: any, next: any): Promise<void>;
  signupCompanyManager(req: any, res: any, next: any): Promise<void>;
  signupTeamMember(req: any, res: any, next: any): Promise<void>;
  forgotPassword(req: any, res: any, next: any): Promise<void>;
  resetPassword(req: any, res: any, next: any): Promise<void>;
  verifyResetToken(req: any, res: any, next: any): Promise<void>;
  approveCompany(req: any, res: any, next: any): Promise<void>;
  approveMember(req: any, res: any, next: any): Promise<void>;
}

/**
 * Auth Module Interface
 * 인증 모듈 인터페이스
 */
export interface IAuthModule {
  router: any;
  getModuleInfo(): any;
  destroy(): void;
}