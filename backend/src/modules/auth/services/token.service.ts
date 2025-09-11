import crypto from 'crypto';
import { injectable, inject } from 'tsyringe';
import { jwtManager } from '@shared/utils/jwt';
import {
  InvalidTokenError,
  TokenExpiredError,
  TokenReuseError,
  TokenAlreadyUsedError,
  NotFoundError,
} from '@shared/utils/errors';
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { TokenRepository } from '@modules/auth/repositories/token.repository';

@injectable()
export class TokenService {
  constructor(
    @inject('TokenRepository') private tokenRepository: TokenRepository,
    @inject('UserRepository') private userRepository: UserRepository
  ) {}

  /**
   * Generate access token for user
   */
  generateAccessToken(payload: {
    userId: string;
    email: string;
    role_id: number;
    company_id: string | null;
  }) {
    return jwtManager.generateAccessToken(payload);
  }

  /**
   * Generate refresh token for user
   */
  generateRefreshToken(userId: string, tokenFamily?: string) {
    const family = tokenFamily || crypto.randomBytes(16).toString('hex');
    return {
      token: jwtManager.generateRefreshToken({
        userId,
        tokenFamily: family,
      }),
      tokenFamily: family,
    };
  }

  /**
   * Generate reset token for password reset
   */
  generateResetToken(userId: string, email: string) {
    return jwtManager.generateResetToken({
      userId,
      email,
    });
  }

  /**
   * Save refresh token to database
   */
  async saveRefreshToken(userId: string, refreshToken: string, expiresAt: Date, tokenFamily: string) {
    return await this.tokenRepository.saveRefreshToken(
      userId,
      refreshToken,
      expiresAt,
      tokenFamily
    );
  }

  /**
   * Save reset token to database
   */
  async saveResetToken(userId: string, resetToken: string, expiresAt: Date) {
    return await this.tokenRepository.saveResetToken(
      userId,
      resetToken,
      expiresAt
    );
  }

  /**
   * Verify and rotate refresh token
   */
  async rotateTokens(refreshToken: string, currentAccessToken?: string) {
    // Find and validate refresh token
    const tokenData = await this.tokenRepository.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw new InvalidTokenError('refresh');
    }

    // Verify token with JWT
    let decoded: any;
    try {
      decoded = jwtManager.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new TokenExpiredError('refresh');
    }

    // Check token family for rotation detection
    const familyTokens = await this.tokenRepository.findTokensByFamily(tokenData.token_family);
    
    // If there are multiple active tokens in the same family, it might be a token reuse attack
    if (familyTokens.length > 1) {
      // Invalidate all tokens in the family
      await this.tokenRepository.invalidateTokenFamily(tokenData.token_family);
      throw new TokenReuseError();
    }

    // Get user data - use 'sub' field from JWT payload
    const user = await this.userRepository.findByIdWithCompany(decoded.sub);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Blacklist current access token if provided
    if (currentAccessToken) {
      try {
        await this.blacklistToken(currentAccessToken, user.id, 'TOKEN_REFRESH');
      } catch (error) {
        // Log error but don't fail the refresh process
        console.warn('Failed to blacklist current access token:', error);
      }
    }

    // Generate new tokens (rotation)
    const newAccessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      role_id: user.role_id,
      company_id: user.company_id,
    });

    const { token: newRefreshToken } = this.generateRefreshToken(
      user.id,
      tokenData.token_family
    );

    // Invalidate old refresh token
    await this.tokenRepository.invalidateToken(refreshToken);

    // Save new refresh token
    await this.saveRefreshToken(
      user.id,
      newRefreshToken,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      tokenData.token_family
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string) {
    return jwtManager.verifyAccessToken(token);
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string) {
    return jwtManager.verifyRefreshToken(token);
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(token: string) {
    const tokenData = await this.tokenRepository.findResetToken(token);
    if (!tokenData) {
      throw new InvalidTokenError('reset');
    }

    // Check if token was already used
    if (tokenData.used_at) {
      throw new TokenAlreadyUsedError();
    }

    // Verify token with JWT
    try {
      jwtManager.verifyResetToken(token);
    } catch (error) {
      throw new TokenExpiredError('reset');
    }

    return {
      valid: true,
      email: (tokenData as any).user.email,
      userId: tokenData.user_id,
    };
  }

  /**
   * Blacklist access token
   */
  async blacklistToken(token: string, userId: string, reason: string = 'USER_LOGOUT') {
    const decoded = jwtManager.decodeToken(token);
    if (decoded && decoded.exp) {
      await this.tokenRepository.addToBlacklist(
        token,
        new Date(decoded.exp * 1000),
        userId,
        reason
      );
    }
  }

  /**
   * Invalidate all user tokens
   */
  async invalidateUserTokens(userId: string) {
    await this.tokenRepository.invalidateUserTokens(userId);
  }

  /**
   * Mark reset token as used
   */
  async markResetTokenUsed(token: string) {
    await this.tokenRepository.markResetTokenUsed(token);
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens() {
    await this.tokenRepository.cleanExpiredTokens();
  }
}

// DI Container에서 관리하므로 singleton export 제거