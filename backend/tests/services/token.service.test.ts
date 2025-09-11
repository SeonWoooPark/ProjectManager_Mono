import { tokenService } from '../../src/services/token.service';
import { jwtManager } from '../../src/utils/jwt';
import {
  getUserRepository,
  getTokenRepository,
} from '../../src/infrastructure/database/repositories';
import {
  InvalidTokenError,
  TokenExpiredError,
  TokenReuseError,
  TokenAlreadyUsedError,
  NotFoundError,
} from '../../src/utils/errors';

// Mock dependencies
jest.mock('../../src/utils/jwt');
jest.mock('../../src/infrastructure/database/repositories');

describe('TokenService', () => {
  let mockUserRepository: any;
  let mockTokenRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUserRepository = {
      findByIdWithCompany: jest.fn(),
    };
    
    mockTokenRepository = {
      saveRefreshToken: jest.fn(),
      saveResetToken: jest.fn(),
      findRefreshToken: jest.fn(),
      findResetToken: jest.fn(),
      findTokensByFamily: jest.fn(),
      invalidateToken: jest.fn(),
      invalidateTokenFamily: jest.fn(),
      invalidateUserTokens: jest.fn(),
      markResetTokenUsed: jest.fn(),
      addToBlacklist: jest.fn(),
      cleanExpiredTokens: jest.fn(),
    };

    (getUserRepository as jest.Mock).mockReturnValue(mockUserRepository);
    (getTokenRepository as jest.Mock).mockReturnValue(mockTokenRepository);
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const payload = {
        userId: 'USER123',
        email: 'test@example.com',
        role_id: 2,
        company_id: 'COMP123',
      };
      
      const expectedToken = 'access-token-123';
      (jwtManager.generateAccessToken as jest.Mock).mockReturnValue(expectedToken);

      const result = tokenService.generateAccessToken(payload);

      expect(jwtManager.generateAccessToken).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with new token family', () => {
      const userId = 'USER123';
      const expectedToken = 'refresh-token-123';
      
      (jwtManager.generateRefreshToken as jest.Mock).mockReturnValue(expectedToken);

      const result = tokenService.generateRefreshToken(userId);

      expect(jwtManager.generateRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          tokenFamily: expect.any(String),
        })
      );
      expect(result.token).toBe(expectedToken);
      expect(result.tokenFamily).toBeDefined();
    });

    it('should use existing token family if provided', () => {
      const userId = 'USER123';
      const tokenFamily = 'existing-family-123';
      const expectedToken = 'refresh-token-123';
      
      (jwtManager.generateRefreshToken as jest.Mock).mockReturnValue(expectedToken);

      const result = tokenService.generateRefreshToken(userId, tokenFamily);

      expect(jwtManager.generateRefreshToken).toHaveBeenCalledWith({
        userId,
        tokenFamily,
      });
      expect(result.tokenFamily).toBe(tokenFamily);
    });
  });

  describe('rotateTokens', () => {
    it('should successfully rotate tokens', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const tokenData = {
        token_family: 'family-123',
        user_id: 'USER123',
      };
      const userData = {
        id: 'USER123',
        email: 'test@example.com',
        role_id: 2,
        company_id: 'COMP123',
      };

      mockTokenRepository.findRefreshToken.mockResolvedValue(tokenData);
      mockTokenRepository.findTokensByFamily.mockResolvedValue([tokenData]);
      mockUserRepository.findByIdWithCompany.mockResolvedValue(userData);
      (jwtManager.verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'USER123' });
      (jwtManager.generateAccessToken as jest.Mock).mockReturnValue('new-access-token');
      (jwtManager.generateRefreshToken as jest.Mock).mockReturnValue('new-refresh-token');

      const result = await tokenService.rotateTokens(oldRefreshToken);

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(mockTokenRepository.invalidateToken).toHaveBeenCalledWith(oldRefreshToken);
      expect(mockTokenRepository.saveRefreshToken).toHaveBeenCalled();
    });

    it('should throw error for invalid token', async () => {
      mockTokenRepository.findRefreshToken.mockResolvedValue(null);

      await expect(tokenService.rotateTokens('invalid-token'))
        .rejects.toThrow(InvalidTokenError);
    });

    it('should throw error for expired token', async () => {
      const tokenData = { token_family: 'family-123' };
      mockTokenRepository.findRefreshToken.mockResolvedValue(tokenData);
      (jwtManager.verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(tokenService.rotateTokens('expired-token'))
        .rejects.toThrow(TokenExpiredError);
    });

    it('should detect token reuse attack', async () => {
      const tokenData = { token_family: 'family-123' };
      mockTokenRepository.findRefreshToken.mockResolvedValue(tokenData);
      mockTokenRepository.findTokensByFamily.mockResolvedValue([tokenData, tokenData]);
      (jwtManager.verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'USER123' });

      await expect(tokenService.rotateTokens('reused-token'))
        .rejects.toThrow(TokenReuseError);
      expect(mockTokenRepository.invalidateTokenFamily).toHaveBeenCalledWith('family-123');
    });
  });

  describe('verifyResetToken', () => {
    it('should successfully verify valid reset token', async () => {
      const token = 'reset-token-123';
      const tokenData = {
        user_id: 'USER123',
        user: { email: 'test@example.com' },
        used_at: null,
      };

      mockTokenRepository.findResetToken.mockResolvedValue(tokenData);
      (jwtManager.verifyResetToken as jest.Mock).mockReturnValue(true);

      const result = await tokenService.verifyResetToken(token);

      expect(result).toEqual({
        valid: true,
        email: 'test@example.com',
        userId: 'USER123',
      });
    });

    it('should throw error for already used token', async () => {
      const tokenData = {
        user_id: 'USER123',
        user: { email: 'test@example.com' },
        used_at: new Date(),
      };

      mockTokenRepository.findResetToken.mockResolvedValue(tokenData);

      await expect(tokenService.verifyResetToken('used-token'))
        .rejects.toThrow(TokenAlreadyUsedError);
    });
  });

  describe('blacklistToken', () => {
    it('should add token to blacklist', async () => {
      const token = 'access-token-123';
      const userId = 'USER123';
      const decodedToken = { exp: Math.floor(Date.now() / 1000) + 3600 };

      (jwtManager.decodeToken as jest.Mock).mockReturnValue(decodedToken);

      await tokenService.blacklistToken(token, userId);

      expect(mockTokenRepository.addToBlacklist).toHaveBeenCalledWith(
        token,
        expect.any(Date),
        userId,
        'USER_LOGOUT'
      );
    });

    it('should not blacklist if token cannot be decoded', async () => {
      (jwtManager.decodeToken as jest.Mock).mockReturnValue(null);

      await tokenService.blacklistToken('invalid-token', 'USER123');

      expect(mockTokenRepository.addToBlacklist).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should call repository cleanup method', async () => {
      await tokenService.cleanupExpiredTokens();

      expect(mockTokenRepository.cleanExpiredTokens).toHaveBeenCalled();
    });
  });
});