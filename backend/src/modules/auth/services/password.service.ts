import { injectable, inject } from 'tsyringe';
import { passwordManager } from '../utils/password';
import {
  PasswordPolicyError,
  PasswordMismatchError,
} from '@shared/utils/errors';
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { TokenService } from './token.service';

@injectable()
export class PasswordService {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('TokenService') private tokenService: TokenService
  ) {}

  /**
   * Hash password
   */
  async hashPassword(password: string) {
    return await passwordManager.hashPassword(password);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string) {
    return await passwordManager.verifyPassword(password, hash);
  }

  /**
   * Validate password policy
   */
  validatePasswordStrength(password: string) {
    return passwordManager.validatePasswordPolicy(password);
  }

  /**
   * Create password reset token
   */
  async createResetToken(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Return success even if user doesn't exist (security)
      return { 
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
        tokenCreated: false 
      };
    }

    // Generate reset token
    const resetToken = this.tokenService.generateResetToken(user.id, user.email);

    // Save reset token
    await this.tokenService.saveResetToken(
      user.id,
      resetToken,
      new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    );

    // TODO: Send email with reset link
    console.log(`Password reset link: ${resetToken}`);

    return { 
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      tokenCreated: true,
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    };
  }

  /**
   * Validate reset token
   */
  async validateResetToken(token: string) {
    return await this.tokenService.verifyResetToken(token);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new PasswordMismatchError();
    }

    // Validate password policy
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Verify token
    const tokenData = await this.tokenService.verifyResetToken(token);

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user password
    await this.userRepository.updatePassword(tokenData.userId, passwordHash);

    // Mark token as used
    await this.tokenService.markResetTokenUsed(token);

    // Invalidate all refresh tokens for security
    await this.tokenService.invalidateUserTokens(tokenData.userId);

    return { message: '비밀번호가 성공적으로 재설정되었습니다.' };
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string) {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw new PasswordMismatchError();
    }

    // Validate password policy
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await this.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update password
    await this.userRepository.updatePassword(userId, passwordHash);

    // Invalidate all refresh tokens for security
    await this.tokenService.invalidateUserTokens(userId);

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }
}

// DI Container에서 관리하므로 singleton export 제거