import { injectable, inject } from 'tsyringe';
import {
  CompanyManagerSignupRequestDto,
  TeamMemberSignupRequestDto,
  LoginRequestDto,
} from '../dto/request';
import { AuthenticationService } from './authentication.service';
import { RegistrationService } from './registration.service';
import { PasswordService } from './password.service';
import { ApprovalService } from './approval.service';
import { TokenService } from './token.service';

/**
 * AuthService - Facade for authentication services
 * This service acts as a single entry point for all auth-related operations,
 * delegating to specialized services while maintaining backward compatibility.
 */
@injectable()
export class AuthService {
  constructor(
    @inject('AuthenticationService') private authenticationService: AuthenticationService,
    @inject('RegistrationService') private registrationService: RegistrationService,
    @inject('PasswordService') private passwordService: PasswordService,
    @inject('ApprovalService') private approvalService: ApprovalService,
    @inject('TokenService') private tokenService: TokenService
  ) {}

  // Company Manager Signup - Delegate to RegistrationService
  async signupCompanyManager(dto: CompanyManagerSignupRequestDto) {
    return await this.registrationService.registerCompanyManager(dto);
  }

  // Team Member Signup - Delegate to RegistrationService
  async signupTeamMember(dto: TeamMemberSignupRequestDto) {
    return await this.registrationService.registerTeamMember(dto);
  }

  // Login - Delegate to AuthenticationService
  async login(dto: LoginRequestDto) {
    return await this.authenticationService.login(dto);
  }

  // Refresh Token - Delegate to TokenService
  async refreshToken(refreshToken: string, currentAccessToken?: string) {
    return await this.tokenService.rotateTokens(refreshToken, currentAccessToken);
  }

  // Logout - Delegate to AuthenticationService
  async logout(userId: string, accessToken?: string) {
    return await this.authenticationService.logout(userId, accessToken);
  }

  // Forgot Password - Delegate to PasswordService
  async forgotPassword(email: string) {
    return await this.passwordService.createResetToken(email);
  }

  // Verify Reset Token - Delegate to PasswordService
  async verifyResetToken(token: string) {
    return await this.passwordService.validateResetToken(token);
  }

  // Reset Password - Delegate to PasswordService
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return await this.passwordService.resetPassword(token, newPassword, confirmPassword);
  }

  // Change Password - Delegate to PasswordService
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    return await this.passwordService.changePassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );
  }

  // Approve Company - Delegate to ApprovalService
  async approveCompany(
    companyId: string, 
    action: 'approve' | 'reject',
    adminId: string,
    comment?: string,
    generateInvitationCode?: boolean
  ) {
    return await this.approvalService.approveCompany(
      companyId, 
      action,
      adminId,
      comment,
      generateInvitationCode
    );
  }

  // Approve Member - Delegate to ApprovalService
  async approveMember(
    memberId: string, 
    action: 'approve' | 'reject',
    managerId: string,
    comment?: string
  ) {
    return await this.approvalService.approveMember(
      memberId, 
      action,
      managerId,
      comment
    );
  }

  // Clean up expired tokens - Delegate to TokenService
  async cleanupExpiredTokens() {
    return await this.tokenService.cleanupExpiredTokens();
  }
}

// DI Container에서 관리하므로 singleton export 제거
