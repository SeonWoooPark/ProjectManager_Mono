import { passwordService } from '../../src/services/password.service';
import { passwordManager } from '../../src/utils/password';
import { tokenService } from '../../src/services/token.service';
import {
  getUserRepository,
  getTokenRepository,
} from '../../src/infrastructure/database/repositories';
import {
  PasswordPolicyError,
  PasswordMismatchError,
} from '../../src/utils/errors';

// Mock dependencies
jest.mock('../../src/utils/password');
jest.mock('../../src/services/token.service');
jest.mock('../../src/infrastructure/database/repositories');

describe('PasswordService', () => {
  let mockUserRepository: any;
  let mockTokenRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    };
    
    mockTokenRepository = {};

    (getUserRepository as jest.Mock).mockReturnValue(mockUserRepository);
    (getTokenRepository as jest.Mock).mockReturnValue(mockTokenRepository);
  });

  describe('hashPassword', () => {
    it('should hash password using passwordManager', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = 'hashed-password-123';
      
      (passwordManager.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await passwordService.hashPassword(password);

      expect(passwordManager.hashPassword).toHaveBeenCalledWith(password);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('verifyPassword', () => {
    it('should verify password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = 'hashed-password-123';
      
      (passwordManager.verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await passwordService.verifyPassword(password, hash);

      expect(passwordManager.verifyPassword).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate password policy', () => {
      const password = 'TestPassword123!';
      const validation = { valid: true, errors: [] };
      
      (passwordManager.validatePasswordPolicy as jest.Mock).mockReturnValue(validation);

      const result = passwordService.validatePasswordStrength(password);

      expect(passwordManager.validatePasswordPolicy).toHaveBeenCalledWith(password);
      expect(result).toEqual(validation);
    });
  });

  describe('createResetToken', () => {
    it('should create reset token for existing user', async () => {
      const email = 'test@example.com';
      const user = { id: 'USER123', email };
      const resetToken = 'reset-token-123';

      mockUserRepository.findByEmail.mockResolvedValue(user);
      (tokenService.generateResetToken as jest.Mock).mockReturnValue(resetToken);
      (tokenService.saveResetToken as jest.Mock).mockResolvedValue(undefined);

      const result = await passwordService.createResetToken(email);

      expect(result.message).toBe('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
      expect(result.tokenCreated).toBe(true);
      expect(tokenService.generateResetToken).toHaveBeenCalledWith(user.id, email);
      expect(tokenService.saveResetToken).toHaveBeenCalled();
    });

    it('should return success message even for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await passwordService.createResetToken('nonexistent@example.com');

      expect(result.message).toBe('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
      expect(result.tokenCreated).toBe(false);
      expect(tokenService.generateResetToken).not.toHaveBeenCalled();
    });

    it('should include reset token in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const email = 'test@example.com';
      const user = { id: 'USER123', email };
      const resetToken = 'reset-token-123';

      mockUserRepository.findByEmail.mockResolvedValue(user);
      (tokenService.generateResetToken as jest.Mock).mockReturnValue(resetToken);

      const result = await passwordService.createResetToken(email);

      expect(result.resetToken).toBe(resetToken);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      const token = 'reset-token-123';
      const newPassword = 'NewPassword123!';
      const confirmPassword = 'NewPassword123!';
      const tokenData = { userId: 'USER123', email: 'test@example.com' };
      const hashedPassword = 'new-hashed-password';

      (passwordManager.validatePasswordPolicy as jest.Mock).mockReturnValue({ valid: true, errors: [] });
      (tokenService.verifyResetToken as jest.Mock).mockResolvedValue(tokenData);
      (passwordManager.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await passwordService.resetPassword(token, newPassword, confirmPassword);

      expect(result.message).toBe('비밀번호가 성공적으로 재설정되었습니다.');
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('USER123', hashedPassword);
      expect(tokenService.markResetTokenUsed).toHaveBeenCalledWith(token);
      expect(tokenService.invalidateUserTokens).toHaveBeenCalledWith('USER123');
    });

    it('should throw error if passwords do not match', async () => {
      await expect(
        passwordService.resetPassword('token', 'Password1!', 'Password2!')
      ).rejects.toThrow(PasswordMismatchError);
    });

    it('should throw error if password policy validation fails', async () => {
      const errors = ['Password must contain at least one number'];
      (passwordManager.validatePasswordPolicy as jest.Mock).mockReturnValue({ 
        valid: false, 
        errors 
      });

      await expect(
        passwordService.resetPassword('token', 'weakpassword', 'weakpassword')
      ).rejects.toThrow(PasswordPolicyError);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password for authenticated user', async () => {
      const userId = 'USER123';
      const currentPassword = 'OldPassword123!';
      const newPassword = 'NewPassword123!';
      const confirmPassword = 'NewPassword123!';
      const user = { id: userId, password_hash: 'old-hash' };
      const newHash = 'new-hash';

      mockUserRepository.findById.mockResolvedValue(user);
      (passwordManager.validatePasswordPolicy as jest.Mock).mockReturnValue({ valid: true, errors: [] });
      (passwordManager.verifyPassword as jest.Mock).mockResolvedValue(true);
      (passwordManager.hashPassword as jest.Mock).mockResolvedValue(newHash);

      const result = await passwordService.changePassword(userId, currentPassword, newPassword, confirmPassword);

      expect(result.message).toBe('비밀번호가 성공적으로 변경되었습니다.');
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith(userId, newHash);
      expect(tokenService.invalidateUserTokens).toHaveBeenCalledWith(userId);
    });

    it('should throw error if current password is incorrect', async () => {
      const userId = 'USER123';
      const user = { id: userId, password_hash: 'old-hash' };

      mockUserRepository.findById.mockResolvedValue(user);
      (passwordManager.validatePasswordPolicy as jest.Mock).mockReturnValue({ valid: true, errors: [] });
      (passwordManager.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        passwordService.changePassword(userId, 'wrong', 'new', 'new')
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        passwordService.changePassword('invalid', 'old', 'new', 'new')
      ).rejects.toThrow('User not found');
    });
  });
});