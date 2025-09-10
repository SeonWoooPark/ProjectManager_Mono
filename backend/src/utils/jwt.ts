import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TokenPayload {
  sub: string;
  email: string;
  role_id: number;
  company_id?: string;
  status_id: number;
  jti: string;
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  token_family: string;
  iat: number;
  exp: number;
}

interface PasswordResetTokenPayload {
  sub: string;
  purpose: 'password_reset';
  jti: string;
  iat: number;
  exp: number;
}

export class JWTManager {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: number = 900; // 15 minutes
  private readonly refreshTokenExpiry: number = 2592000; // 30 days
  private readonly passwordResetTokenExpiry: number = 3600; // 1 hour

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  }

  // Generate Access Token
  generateAccessToken(
    userId: string,
    email: string,
    roleId: number,
    statusId: number,
    companyId?: string
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      sub: userId,
      email,
      role_id: roleId,
      company_id: companyId,
      status_id: statusId,
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + this.accessTokenExpiry
    };

    return jwt.sign(payload, this.accessTokenSecret);
  }

  // Generate Refresh Token
  generateRefreshToken(userId: string, tokenFamily?: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: RefreshTokenPayload = {
      sub: userId,
      jti: crypto.randomUUID(),
      token_family: tokenFamily || crypto.randomUUID(),
      iat: now,
      exp: now + this.refreshTokenExpiry
    };

    return jwt.sign(payload, this.refreshTokenSecret);
  }

  // Generate Password Reset Token
  generatePasswordResetToken(userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: PasswordResetTokenPayload = {
      sub: userId,
      purpose: 'password_reset',
      jti: crypto.randomUUID(),
      iat: now,
      exp: now + this.passwordResetTokenExpiry
    };

    return jwt.sign(payload, this.accessTokenSecret);
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

  // Verify Password Reset Token
  verifyPasswordResetToken(token: string): PasswordResetTokenPayload {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as PasswordResetTokenPayload;
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