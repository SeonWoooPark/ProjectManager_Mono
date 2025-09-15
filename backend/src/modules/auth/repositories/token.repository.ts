import { RefreshToken, PasswordResetToken } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { BaseRepository } from '@infrastructure/database/base.repository';
import { ITokenRepository } from '../interfaces/repository.interfaces';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IdValidator } from '@shared/utils/dbConstraints';
import { jwtManager } from '../utils/jwt';
import crypto from 'crypto';

@injectable()
export class TokenRepository extends BaseRepository<RefreshToken> implements ITokenRepository {
  private passwordResetTokenModel: any;
  private tokenBlacklistModel: any;

  constructor(@inject('PrismaService') prismaService: PrismaService) {
    super(prismaService.getClient(), 'refreshToken');
    this.passwordResetTokenModel = (prismaService.getClient() as any).passwordResetToken;
    this.tokenBlacklistModel = (prismaService.getClient() as any).tokenBlacklist;
  }

  async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
    tokenFamily?: string,
    userAgent?: string,
    deviceFingerprint?: string
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    const id = IdValidator.generateId('REFRESH_TOKEN');

    await this.create({
      id,
      user_id: userId,
      token_hash: tokenHash,
      token_family: tokenFamily || crypto.randomBytes(16).toString('hex'),
      expires_at: expiresAt,
      user_agent: userAgent,
      device_fingerprint: deviceFingerprint,
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(token);
    return this.findOne({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      include: { user: true },
    });
  }

  async invalidateToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.model.update({
      where: { token_hash: tokenHash },
      data: {
        revoked_at: new Date(),
        revoked_reason: 'MANUAL_INVALIDATION',
      },
    });
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await this.updateMany(
      {
        user_id: userId,
        revoked_at: null,
      },
      {
        revoked_at: new Date(),
        revoked_reason: 'USER_LOGOUT',
      }
    );
  }

  async invalidateTokenFamily(tokenFamily: string): Promise<void> {
    await this.updateMany(
      {
        token_family: tokenFamily,
        revoked_at: null,
      },
      {
        revoked_at: new Date(),
        revoked_reason: 'TOKEN_REUSE_DETECTED',
      }
    );
  }

  async cleanExpiredTokens(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clean expired refresh tokens
    await this.deleteMany({
      OR: [{ expires_at: { lt: new Date() } }, { revoked_at: { lt: thirtyDaysAgo } }],
    });

    // Clean expired password reset tokens
    await this.passwordResetTokenModel.deleteMany({
      where: {
        OR: [{ expires_at: { lt: new Date() } }, { used_at: { lt: thirtyDaysAgo } }],
      },
    });

    // Clean expired blacklist entries
    await this.tokenBlacklistModel.deleteMany({
      where: {
        expires_at: { lt: new Date() },
      },
    });
  }

  async saveResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = this.hashToken(token);
    const jti = crypto.randomBytes(16).toString('hex');
    const id = IdValidator.generateId('PASSWORD_RESET_TOKEN');

    await this.passwordResetTokenModel.create({
      data: {
        id,
        user_id: userId,
        jti,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });
  }

  async findResetToken(token: string): Promise<PasswordResetToken | null> {
    const tokenHash = this.hashToken(token);
    return this.passwordResetTokenModel.findFirst({
      where: {
        token_hash: tokenHash,
        expires_at: {
          gt: new Date(),
        },
        used_at: null,
      },
      include: { user: true },
    });
  }

  async markResetTokenUsed(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.passwordResetTokenModel.updateMany({
      where: { token_hash: tokenHash },
      data: { used_at: new Date() },
    });
  }

  async addToBlacklist(
    token: string,
    expiresAt: Date,
    userId?: string,
    reason?: string
  ): Promise<void> {
    // Extract jti from the actual token
    const decoded = jwtManager.decodeToken(token);
    const jti = decoded?.jti;

    if (!jti) {
      throw new Error('토큰에서 jti를 추출할 수 없습니다');
    }

    const id = IdValidator.generateId('TOKEN_BLACKLIST');

    await this.tokenBlacklistModel.create({
      data: {
        id,
        jti, // Use the actual jti from the token
        token_type: 'ACCESS',
        user_id: userId,
        expires_at: expiresAt,
        reason: reason || 'MANUAL_BLACKLIST',
      },
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    // Extract JTI from token if it's a JWT
    let jti: string;
    try {
      const payload = Buffer.from(token.split('.')[1], 'base64').toString();
      const parsed = JSON.parse(payload);
      jti = parsed.jti;
    } catch {
      // If not a valid JWT, use token hash as JTI
      jti = this.hashToken(token);
    }

    const entry = await this.tokenBlacklistModel.findFirst({
      where: {
        jti,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    return !!entry;
  }

  async updateTokenUsage(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.model.update({
      where: { token_hash: tokenHash },
      data: { last_used_at: new Date() },
    });
  }

  async findTokensByFamily(tokenFamily: string): Promise<RefreshToken[]> {
    return this.findAll({
      where: {
        token_family: tokenFamily,
        revoked_at: null,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
