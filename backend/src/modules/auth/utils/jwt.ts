import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  role_id: number;
  company_id?: string;
  status_id: number;
  jti: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  token_family: string;
  iat: number;
  exp: number;
}

export interface PasswordResetTokenPayload {
  sub: string;
  purpose: 'password_reset';
  jti: string;
  iat: number;
  exp: number;
}

export class JWTManager {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly resetTokenSecret: string;
  private readonly accessTokenExpiry: number = 900; // 15 minutes
  private readonly refreshTokenExpiry: number = 2592000; // 30 days
  private readonly passwordResetTokenExpiry: number = 3600; // 1 hour

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'your-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.resetTokenSecret = process.env.JWT_RESET_SECRET || 'your-reset-secret-key';
  }

  // Generate Access Token (overloaded for backward compatibility)
  generateAccessToken(payload: {
    userId: string;
    email: string;
    role_id: number;
    company_id: string | null;
  }): string;
  generateAccessToken(
    userId: string,
    email: string,
    roleId: number,
    statusId: number,
    companyId?: string
  ): string;
  generateAccessToken(
    payloadOrUserId: any,
    email?: string,
    roleId?: number,
    statusId?: number,
    companyId?: string
  ): string {
    const now = Math.floor(Date.now() / 1000);
    
    if (typeof payloadOrUserId === 'object') {
      // New signature
      const payload: TokenPayload = {
        sub: payloadOrUserId.userId,
        email: payloadOrUserId.email,
        role_id: payloadOrUserId.role_id,
        company_id: payloadOrUserId.company_id || undefined,
        status_id: payloadOrUserId.status_id || 1, // Default to ACTIVE
        jti: crypto.randomUUID(),
        iat: now,
        exp: now + this.accessTokenExpiry
      };
      return jwt.sign(payload, this.accessTokenSecret);
    } else {
      // Old signature
      const payload: TokenPayload = {
        sub: payloadOrUserId,
        email: email!,
        role_id: roleId!,
        company_id: companyId,
        status_id: statusId!,
        jti: crypto.randomUUID(),
        iat: now,
        exp: now + this.accessTokenExpiry
      };
      return jwt.sign(payload, this.accessTokenSecret);
    }
  }

  // Generate Refresh Token (overloaded for backward compatibility)
  generateRefreshToken(payload: {
    userId: string;
    tokenFamily: string;
  }): string;
  generateRefreshToken(userId: string, tokenFamily?: string): string;
  generateRefreshToken(
    payloadOrUserId: any,
    tokenFamily?: string
  ): string {
    const now = Math.floor(Date.now() / 1000);
    
    if (typeof payloadOrUserId === 'object') {
      // New signature
      const payload: RefreshTokenPayload = {
        sub: payloadOrUserId.userId,
        jti: crypto.randomUUID(),
        token_family: payloadOrUserId.tokenFamily,
        iat: now,
        exp: now + this.refreshTokenExpiry
      };
      return jwt.sign(payload, this.refreshTokenSecret);
    } else {
      // Old signature
      const payload: RefreshTokenPayload = {
        sub: payloadOrUserId,
        jti: crypto.randomUUID(),
        token_family: tokenFamily || crypto.randomUUID(),
        iat: now,
        exp: now + this.refreshTokenExpiry
      };
      return jwt.sign(payload, this.refreshTokenSecret);
    }
  }

  // Generate Reset Token (new method)
  generateResetToken(payload: {
    userId: string;
    email: string;
  }): string {
    const now = Math.floor(Date.now() / 1000);
    const resetPayload: PasswordResetTokenPayload = {
      sub: payload.userId,
      purpose: 'password_reset',
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + this.passwordResetTokenExpiry
    };

    return jwt.sign(resetPayload, this.resetTokenSecret);
  }

  // Generate Password Reset Token (keep for backward compatibility)
  generatePasswordResetToken(userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: PasswordResetTokenPayload = {
      sub: userId,
      purpose: 'password_reset',
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + this.passwordResetTokenExpiry
    };

    return jwt.sign(payload, this.resetTokenSecret);
  }

  // Verify Access Token
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_ACCESS_TOKEN');
      }
      throw error;
    }
  }

  // Verify Refresh Token
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }
      throw error;
    }
  }

  // Verify Reset Token (new method)
  verifyResetToken(token: string): PasswordResetTokenPayload {
    try {
      const payload = jwt.verify(token, this.resetTokenSecret) as PasswordResetTokenPayload;
      if (payload.purpose !== 'password_reset') {
        throw new Error('INVALID_TOKEN_PURPOSE');
      }
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('RESET_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_RESET_TOKEN');
      }
      throw error;
    }
  }

  // Verify Password Reset Token (keep for backward compatibility)
  verifyPasswordResetToken(token: string): PasswordResetTokenPayload {
    return this.verifyResetToken(token);
  }

  // Decode token without verification (for extracting JTI)
  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  // Get JTI from token
  getJti(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded?.jti || null;
  }

  // Generate unique JTI
  generateJti(): string {
    return crypto.randomUUID();
  }

  // Generate token family for refresh token rotation
  generateTokenFamily(): string {
    return crypto.randomUUID();
  }
}

export const jwtManager = new JWTManager();