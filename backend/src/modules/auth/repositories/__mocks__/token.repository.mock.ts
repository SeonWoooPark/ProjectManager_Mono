import { jest } from '@jest/globals';
import { RefreshToken, PasswordResetToken } from '@prisma/client';
import { ITokenRepository } from '../../interfaces/repository.interfaces';

/**
 * TokenRepository Mock Implementation
 * 모든 TokenRepository 메서드를 jest.Mock으로 구현
 */
export class MockTokenRepository implements ITokenRepository {
  // Base repository methods
  public findById = jest.fn() as any;
  public findOne = jest.fn() as any;
  public findAll = jest.fn() as any;
  public create = jest.fn() as any;
  public update = jest.fn() as any;
  public delete = jest.fn() as any;
  public deleteMany = jest.fn() as any;
  public updateMany = jest.fn() as any;
  public count = jest.fn() as any;
  public exists = jest.fn() as any;
  public paginate = jest.fn() as any;
  public transaction = jest.fn() as any;

  // ITokenRepository specific methods
  public saveRefreshToken = jest.fn() as any;
  public findRefreshToken = jest.fn() as any;
  public invalidateToken = jest.fn() as any;
  public invalidateUserTokens = jest.fn() as any;
  public invalidateTokenFamily = jest.fn() as any;
  public cleanExpiredTokens = jest.fn() as any;
  public saveResetToken = jest.fn() as any;
  public findResetToken = jest.fn() as any;
  public markResetTokenUsed = jest.fn() as any;
  public addToBlacklist = jest.fn() as any;
  public isBlacklisted = jest.fn() as any;

  // Additional TokenRepository methods
  public updateTokenUsage = jest.fn() as any;
  public findTokensByFamily = jest.fn() as any;

  constructor() {
    this.setupDefaultMocks();
  }

  /**
   * 기본 Mock 동작 설정
   */
  private setupDefaultMocks(): void {
    // Base methods
    this.findById.mockResolvedValue(null);
    this.findOne.mockResolvedValue(null);
    this.findAll.mockResolvedValue([]);
    this.create.mockResolvedValue(this.createMockRefreshToken());
    this.update.mockResolvedValue(this.createMockRefreshToken());
    this.delete.mockResolvedValue(this.createMockRefreshToken());
    this.deleteMany.mockResolvedValue({ count: 0 });
    this.updateMany.mockResolvedValue({ count: 0 });
    this.count.mockResolvedValue(0);
    this.exists.mockResolvedValue(false);
    this.paginate.mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
    this.transaction.mockImplementation(async (fn: (tx: any) => Promise<any>) => {
      return fn({});
    });

    // ITokenRepository methods
    this.saveRefreshToken.mockResolvedValue(undefined);
    this.findRefreshToken.mockResolvedValue(null);
    this.invalidateToken.mockResolvedValue(undefined);
    this.invalidateUserTokens.mockResolvedValue(undefined);
    this.invalidateTokenFamily.mockResolvedValue(undefined);
    this.cleanExpiredTokens.mockResolvedValue(undefined);
    this.saveResetToken.mockResolvedValue(undefined);
    this.findResetToken.mockResolvedValue(null);
    this.markResetTokenUsed.mockResolvedValue(undefined);
    this.addToBlacklist.mockResolvedValue(undefined);
    this.isBlacklisted.mockResolvedValue(false);

    // Additional methods
    this.updateTokenUsage.mockResolvedValue(undefined);
    this.findTokensByFamily.mockResolvedValue([]);
  }

  /**
   * Mock RefreshToken 객체 생성
   */
  private createMockRefreshToken(overrides?: Partial<RefreshToken & { user?: any }>): RefreshToken & { user?: any } {
    return {
      id: 'REFRESH_TOKEN_test123',
      user_id: 'USER_test123',
      token_hash: 'hashed_refresh_token',
      token_family: 'family_abc123',
      expires_at: new Date('2024-12-31T23:59:59.000Z'),
      user_agent: 'Mozilla/5.0 Test Browser',
      device_fingerprint: 'device_fingerprint_123',
      last_used_at: null,
      revoked_at: null,
      revoked_reason: null,
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * Mock PasswordResetToken 객체 생성
   */
  private createMockResetToken(overrides?: Partial<PasswordResetToken & { user?: any }>): PasswordResetToken & { user?: any } {
    return {
      id: 'PASSWORD_RESET_TOKEN_test123',
      user_id: 'USER_test123',
      jti: 'jti_abc123',
      token_hash: 'hashed_reset_token',
      expires_at: new Date('2024-12-31T23:59:59.000Z'),
      used_at: null,
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * Mock TokenBlacklist 객체 생성
   */
  private createMockBlacklistEntry(overrides?: any): any {
    return {
      id: 'TOKEN_BLACKLIST_test123',
      jti: 'jti_blacklisted',
      token_type: 'ACCESS',
      user_id: 'USER_test123',
      expires_at: new Date('2024-12-31T23:59:59.000Z'),
      reason: 'MANUAL_BLACKLIST',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * 모든 mock 초기화
   */
  public resetMocks(): void {
    Object.getOwnPropertyNames(this).forEach((prop) => {
      const method = (this as any)[prop];
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
    this.setupDefaultMocks();
  }

  /**
   * 특정 시나리오를 위한 헬퍼 메서드들
   */

  public mockRefreshTokenExists(token?: Partial<RefreshToken>, user?: any): RefreshToken & { user?: any } {
    const mockToken = this.createMockRefreshToken({
      user: user || {
        id: 'USER_test123',
        email: 'test@example.com',
        name: 'Test User',
        status_id: 1,
      },
      ...token,
    });
    
    this.findRefreshToken.mockResolvedValue(mockToken);
    this.findOne.mockResolvedValue(mockToken);
    return mockToken;
  }

  public mockRefreshTokenNotFound(): void {
    this.findRefreshToken.mockResolvedValue(null);
    this.findOne.mockResolvedValue(null);
  }

  public mockExpiredRefreshToken(token?: Partial<RefreshToken>): RefreshToken {
    const expiredToken = this.createMockRefreshToken({
      expires_at: new Date('2020-01-01T00:00:00.000Z'), // Past date
      ...token,
    });
    
    this.findRefreshToken.mockResolvedValue(null); // Expired tokens shouldn't be found
    return expiredToken;
  }

  public mockRevokedRefreshToken(token?: Partial<RefreshToken>): RefreshToken {
    const revokedToken = this.createMockRefreshToken({
      revoked_at: new Date(),
      revoked_reason: 'MANUAL_INVALIDATION',
      ...token,
    });
    
    this.findRefreshToken.mockResolvedValue(null); // Revoked tokens shouldn't be found
    return revokedToken;
  }

  public mockResetTokenExists(token?: Partial<PasswordResetToken>, user?: any): PasswordResetToken & { user?: any } {
    const mockToken = this.createMockResetToken({
      user: user || {
        id: 'USER_test123',
        email: 'test@example.com',
        name: 'Test User',
        status_id: 1,
      },
      ...token,
    });
    
    this.findResetToken.mockResolvedValue(mockToken);
    return mockToken;
  }

  public mockResetTokenNotFound(): void {
    this.findResetToken.mockResolvedValue(null);
  }

  public mockExpiredResetToken(token?: Partial<PasswordResetToken>): PasswordResetToken {
    const expiredToken = this.createMockResetToken({
      expires_at: new Date('2020-01-01T00:00:00.000Z'), // Past date
      ...token,
    });
    
    this.findResetToken.mockResolvedValue(null); // Expired tokens shouldn't be found
    return expiredToken;
  }

  public mockUsedResetToken(token?: Partial<PasswordResetToken>): PasswordResetToken {
    const usedToken = this.createMockResetToken({
      used_at: new Date(),
      ...token,
    });
    
    this.findResetToken.mockResolvedValue(null); // Used tokens shouldn't be found
    return usedToken;
  }

  public mockTokenIsBlacklisted(jti?: string): void {
    this.isBlacklisted.mockResolvedValue(true);
    // Mock the blacklist entry
    const blacklistEntry = this.createMockBlacklistEntry({
      jti: jti || 'jti_blacklisted',
    });
    this.findOne.mockResolvedValue(blacklistEntry);
  }

  public mockTokenIsNotBlacklisted(): void {
    this.isBlacklisted.mockResolvedValue(false);
  }

  public mockTokenFamily(tokenFamily: string, tokens?: Partial<RefreshToken>[]): RefreshToken[] {
    const mockTokens = tokens?.map(token => 
      this.createMockRefreshToken({ 
        token_family: tokenFamily,
        ...token 
      })
    ) || [];
    
    this.findTokensByFamily.mockResolvedValue(mockTokens);
    return mockTokens;
  }

  public mockSuccessfulTokenSave(): void {
    this.saveRefreshToken.mockResolvedValue(undefined);
    this.saveResetToken.mockResolvedValue(undefined);
    this.create.mockResolvedValue(this.createMockRefreshToken());
  }

  public mockSuccessfulTokenInvalidation(): void {
    this.invalidateToken.mockResolvedValue(undefined);
    this.invalidateUserTokens.mockResolvedValue(undefined);
    this.invalidateTokenFamily.mockResolvedValue(undefined);
    this.markResetTokenUsed.mockResolvedValue(undefined);
    this.updateMany.mockResolvedValue({ count: 1 });
  }

  public mockSuccessfulBlacklist(): void {
    this.addToBlacklist.mockResolvedValue(undefined);
    this.create.mockResolvedValue(this.createMockBlacklistEntry());
  }

  public mockCleanupResults(refreshCount: number = 0, resetCount: number = 0, blacklistCount: number = 0): void {
    this.cleanExpiredTokens.mockResolvedValue(undefined);
    this.deleteMany
      .mockResolvedValueOnce({ count: refreshCount })
      .mockResolvedValueOnce({ count: resetCount })
      .mockResolvedValueOnce({ count: blacklistCount });
  }

  public mockRepositoryError(error: Error): void {
    // 모든 메서드가 에러를 던지도록 설정
    Object.getOwnPropertyNames(this).forEach((prop) => {
      const method = (this as any)[prop];
      if (jest.isMockFunction(method)) {
        (method as any).mockRejectedValue(error);
      }
    });
  }

  public mockTransactionFailure(error: Error): void {
    this.transaction.mockRejectedValue(error);
  }

  public mockTokenReuseDetection(tokenFamily: string): RefreshToken[] {
    const familyTokens = [
      this.createMockRefreshToken({
        token_family: tokenFamily,
        revoked_at: new Date(),
        revoked_reason: 'TOKEN_REUSE_DETECTED',
      }),
    ];
    
    this.findTokensByFamily.mockResolvedValue(familyTokens);
    this.invalidateTokenFamily.mockResolvedValue(undefined);
    return familyTokens;
  }

  /**
   * 특정 메서드 체인을 테스트하는 헬퍼들
   */
  public mockRefreshTokenFlow(userId: string, tokenFamily: string): {
    saveToken: RefreshToken;
    findToken: RefreshToken;
  } {
    const saveToken = this.createMockRefreshToken({ user_id: userId, token_family: tokenFamily });
    const findToken = this.createMockRefreshToken({ user_id: userId, token_family: tokenFamily });
    
    this.saveRefreshToken.mockResolvedValue(undefined);
    this.findRefreshToken.mockResolvedValue(findToken);
    
    return { saveToken, findToken };
  }

  public mockResetTokenFlow(userId: string): {
    saveToken: PasswordResetToken;
    findToken: PasswordResetToken;
  } {
    const saveToken = this.createMockResetToken({ user_id: userId });
    const findToken = this.createMockResetToken({ 
      user_id: userId,
      user: {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    
    this.saveResetToken.mockResolvedValue(undefined);
    this.findResetToken.mockResolvedValue(findToken);
    this.markResetTokenUsed.mockResolvedValue(undefined);
    
    return { saveToken, findToken };
  }
}

/**
 * Factory functions
 */
export const createMockTokenRepository = (): MockTokenRepository => {
  return new MockTokenRepository();
};

/**
 * Singleton instance for consistent mocking
 */
export const mockTokenRepository = createMockTokenRepository();

/**
 * Jest mock implementation for DI container
 */
export const MockTokenRepositoryImplementation = (): ITokenRepository => {
  return mockTokenRepository;
};