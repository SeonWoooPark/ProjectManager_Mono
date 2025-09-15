import { TokenRepository } from '../token.repository';
import { PrismaService } from '../../prisma.service';
import crypto from 'crypto';

// Mock the dependencies
jest.mock('../../prisma.service');
jest.mock('../../prisma.service', () => ({
  prisma: {
    refreshToken: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordResetToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    tokenBlacklist: {
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('TokenRepository', () => {
  let tokenRepository: TokenRepository;
  let mockPrismaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPrismaClient = {
      refreshToken: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      passwordResetToken: {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      tokenBlacklist: {
        findFirst: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    (PrismaService.getInstance as jest.Mock).mockReturnValue({
      getClient: () => mockPrismaClient,
    });

    tokenRepository = new TokenRepository();
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token', async () => {
      const userId = 'USER_123';
      const token = 'test_token';
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const tokenFamily = 'family_123';

      mockPrismaClient.refreshToken.create.mockResolvedValue({
        id: 'TOKEN_123',
        user_id: userId,
        token_hash: expect.any(String),
        token_family: tokenFamily,
        expires_at: expiresAt,
      });

      await tokenRepository.saveRefreshToken(userId, token, expiresAt, tokenFamily);

      expect(mockPrismaClient.refreshToken.create).toHaveBeenCalledWith({
        data: {
          id: expect.stringMatching(/^rft_/),
          user_id: userId,
          token_hash: expect.any(String),
          token_family: tokenFamily,
          expires_at: expiresAt,
          user_agent: undefined,
          device_fingerprint: undefined,
        },
        include: undefined,
        select: undefined,
      });
    });
  });

  describe('findRefreshToken', () => {
    it('should find valid refresh token', async () => {
      const token = 'test_token';
      const mockTokenData = {
        id: 'TOKEN_123',
        token_hash: crypto.createHash('sha256').update(token).digest('hex'),
        token_family: 'family_123',
        user: { id: 'USER_123' },
      };

      mockPrismaClient.refreshToken.findFirst.mockResolvedValue(mockTokenData);

      const result = await tokenRepository.findRefreshToken(token);

      expect(result).toEqual(mockTokenData);
      expect(mockPrismaClient.refreshToken.findFirst).toHaveBeenCalledWith({
        where: {
          token_hash: expect.any(String),
          revoked_at: null,
          expires_at: {
            gt: expect.any(Date),
          },
        },
        include: { user: true },
        orderBy: undefined,
        select: undefined,
      });
    });

    it('should return null for invalid token', async () => {
      mockPrismaClient.refreshToken.findFirst.mockResolvedValue(null);

      const result = await tokenRepository.findRefreshToken('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('invalidateToken', () => {
    it('should invalidate a token', async () => {
      const token = 'test_token';

      mockPrismaClient.refreshToken.update.mockResolvedValue({
        id: 'TOKEN_123',
        revoked_at: new Date(),
        revoked_reason: 'MANUAL_INVALIDATION',
      });

      await tokenRepository.invalidateToken(token);

      expect(mockPrismaClient.refreshToken.update).toHaveBeenCalledWith({
        where: { token_hash: expect.any(String) },
        data: {
          revoked_at: expect.any(Date),
          revoked_reason: 'MANUAL_INVALIDATION',
        },
      });
    });
  });

  describe('invalidateUserTokens', () => {
    it('should invalidate all user tokens', async () => {
      const userId = 'USER_123';

      mockPrismaClient.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      await tokenRepository.invalidateUserTokens(userId);

      expect(mockPrismaClient.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          revoked_at: null,
        },
        data: {
          revoked_at: expect.any(Date),
          revoked_reason: 'USER_LOGOUT',
        },
      });
    });
  });

  describe('invalidateTokenFamily', () => {
    it('should invalidate all tokens in a family', async () => {
      const tokenFamily = 'family_123';

      mockPrismaClient.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      await tokenRepository.invalidateTokenFamily(tokenFamily);

      expect(mockPrismaClient.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          token_family: tokenFamily,
          revoked_at: null,
        },
        data: {
          revoked_at: expect.any(Date),
          revoked_reason: 'TOKEN_REUSE_DETECTED',
        },
      });
    });
  });

  describe('saveResetToken', () => {
    it('should save password reset token', async () => {
      const userId = 'USER_123';
      const token = 'reset_token';
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      mockPrismaClient.passwordResetToken.create.mockResolvedValue({
        id: 'RESET_123',
        user_id: userId,
        token_hash: expect.any(String),
        expires_at: expiresAt,
      });

      await tokenRepository.saveResetToken(userId, token, expiresAt);

      expect(mockPrismaClient.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          id: expect.stringMatching(/^prt_/),
          user_id: userId,
          jti: expect.any(String),
          token_hash: expect.any(String),
          expires_at: expiresAt,
        },
      });
    });
  });

  describe('findResetToken', () => {
    it('should find valid reset token', async () => {
      const token = 'reset_token';
      const mockTokenData = {
        id: 'RESET_123',
        user_id: 'USER_123',
        token_hash: crypto.createHash('sha256').update(token).digest('hex'),
        user: { id: 'USER_123', email: 'test@example.com' },
      };

      mockPrismaClient.passwordResetToken.findFirst.mockResolvedValue(mockTokenData);

      const result = await tokenRepository.findResetToken(token);

      expect(result).toEqual(mockTokenData);
      expect(mockPrismaClient.passwordResetToken.findFirst).toHaveBeenCalledWith({
        where: {
          token_hash: expect.any(String),
          expires_at: {
            gt: expect.any(Date),
          },
          used_at: null,
        },
        include: { user: true },
      });
    });
  });

  describe('markResetTokenUsed', () => {
    it('should mark reset token as used', async () => {
      const token = 'reset_token';

      mockPrismaClient.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });

      await tokenRepository.markResetTokenUsed(token);

      expect(mockPrismaClient.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: { token_hash: expect.any(String) },
        data: { used_at: expect.any(Date) },
      });
    });
  });

  describe('addToBlacklist', () => {
    it('should add token to blacklist', async () => {
      const token = 'access_token';
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const userId = 'USER_123';
      const reason = 'USER_LOGOUT';

      mockPrismaClient.tokenBlacklist.create.mockResolvedValue({
        id: 'BLACKLIST_123',
        jti: expect.any(String),
        token_type: 'ACCESS',
        user_id: userId,
        expires_at: expiresAt,
        reason: reason,
      });

      await tokenRepository.addToBlacklist(token, expiresAt, userId, reason);

      expect(mockPrismaClient.tokenBlacklist.create).toHaveBeenCalledWith({
        data: {
          id: expect.stringMatching(/^blk_/),
          jti: expect.any(String),
          token_type: 'ACCESS',
          user_id: userId,
          expires_at: expiresAt,
          reason: reason,
        },
      });
    });
  });

  describe('isBlacklisted', () => {
    it('should check if token is blacklisted', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJ0ZXN0X2p0aSJ9.test';
      
      mockPrismaClient.tokenBlacklist.findFirst.mockResolvedValue({
        id: 'BLACKLIST_123',
        jti: 'test_jti',
      });

      const result = await tokenRepository.isBlacklisted(token);

      expect(result).toBe(true);
      expect(mockPrismaClient.tokenBlacklist.findFirst).toHaveBeenCalledWith({
        where: {
          jti: expect.any(String),
          expires_at: {
            gt: expect.any(Date),
          },
        },
      });
    });

    it('should return false if token is not blacklisted', async () => {
      mockPrismaClient.tokenBlacklist.findFirst.mockResolvedValue(null);

      const result = await tokenRepository.isBlacklisted('token');

      expect(result).toBe(false);
    });
  });

  describe('cleanExpiredTokens', () => {
    it('should clean expired tokens', async () => {
      mockPrismaClient.refreshToken.deleteMany.mockResolvedValue({ count: 5 });
      mockPrismaClient.passwordResetToken.deleteMany.mockResolvedValue({ count: 3 });
      mockPrismaClient.tokenBlacklist.deleteMany.mockResolvedValue({ count: 10 });

      await tokenRepository.cleanExpiredTokens();

      expect(mockPrismaClient.refreshToken.deleteMany).toHaveBeenCalled();
      expect(mockPrismaClient.passwordResetToken.deleteMany).toHaveBeenCalled();
      expect(mockPrismaClient.tokenBlacklist.deleteMany).toHaveBeenCalled();
    });
  });

  describe('findTokensByFamily', () => {
    it('should find tokens by family', async () => {
      const tokenFamily = 'family_123';
      const mockTokens = [
        { id: 'TOKEN_1', token_family: tokenFamily },
        { id: 'TOKEN_2', token_family: tokenFamily },
      ];

      mockPrismaClient.refreshToken.findMany.mockResolvedValue(mockTokens);

      const result = await tokenRepository.findTokensByFamily(tokenFamily);

      expect(result).toEqual(mockTokens);
      expect(mockPrismaClient.refreshToken.findMany).toHaveBeenCalledWith({
        where: {
          token_family: tokenFamily,
          revoked_at: null,
        },
        orderBy: { created_at: 'desc' },
        include: undefined,
        skip: undefined,
        take: undefined,
        select: undefined,
      });
    });
  });
});