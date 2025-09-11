import crypto from 'crypto';
import { injectable, inject } from 'tsyringe';
import { LoginRequestDto } from '@modules/auth/dto/request';
import { UserStatus, CompanyStatus, UserRole } from '@shared/interfaces/auth.types';
import {
  InvalidCredentialsError,
  AccountStatusError,
} from '@shared/utils/errors';
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { PrismaService } from '@infrastructure/database/prisma.service';

@injectable()
export class AuthenticationService {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('TokenService') private tokenService: TokenService,
    @inject('PasswordService') private passwordService: PasswordService,
    @inject('PrismaService') private prismaService: PrismaService
  ) {}

  /**
   * User login
   */
  async login(dto: LoginRequestDto) {
    const { email, password } = dto;

    // Find user with company info
    const user = await this.userRepository.findByIdWithCompany(
      (await this.userRepository.findByEmail(email))?.id || ''
    );

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isValidPassword = await this.passwordService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    // Check user status
    this.validateUserStatus(user);

    // Check company status for non-system-admin users
    if (user.role_id !== UserRole.SYSTEM_ADMIN) {
      this.validateCompanyStatus(user);
    }

    // Invalidate all existing refresh tokens before generating new ones
    await this.tokenService.invalidateUserTokens(user.id);

    // Generate tokens
    const tokens = await this.generateUserTokens(user);

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Get role and status names
    const role = await this.prismaService.getClient().role.findUnique({ where: { id: user.role_id } });
    const userStatus = await this.prismaService.getClient().userStatus.findUnique({ where: { id: user.status_id } });

    return {
      access_token: tokens.accessToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes in seconds
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        role_id: user.role_id,
        role_name: role?.role_name,
        status_id: user.status_id,
        status_name: userStatus?.status_name,
        company: user.company ? {
          id: user.company.id,
          company_name: user.company.company_name,
        } : null,
      },
    };
  }

  /**
   * User logout
   */
  async logout(userId: string, accessToken?: string) {
    // Invalidate all user's refresh tokens
    await this.tokenService.invalidateUserTokens(userId);

    // Add access token to blacklist if provided
    if (accessToken) {
      await this.tokenService.blacklistToken(accessToken, userId, 'USER_LOGOUT');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    return await this.tokenService.rotateTokens(refreshToken);
  }

  /**
   * Validate user status
   */
  private validateUserStatus(user: any) {
    if (user.status_id === UserStatus.INACTIVE) {
      throw new AccountStatusError('INACTIVE');
    } else if (user.status_id === UserStatus.PENDING) {
      throw new AccountStatusError('PENDING');
    }
  }

  /**
   * Validate company status
   */
  private validateCompanyStatus(user: any) {
    if (!user.company) {
      throw new AccountStatusError('NO_COMPANY');
    }
    if (user.company.status_id === CompanyStatus.INACTIVE) {
      throw new AccountStatusError('COMPANY_INACTIVE');
    } else if (user.company.status_id === CompanyStatus.PENDING) {
      throw new AccountStatusError('COMPANY_PENDING');
    }
  }

  /**
   * Generate tokens for user
   */
  private async generateUserTokens(user: any) {
    // Generate token family for refresh token rotation
    const tokenFamily = crypto.randomBytes(16).toString('hex');

    // Generate access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role_id: user.role_id,
      company_id: user.company_id,
    });

    // Generate refresh token
    const { token: refreshToken } = this.tokenService.generateRefreshToken(user.id, tokenFamily);

    // Save refresh token
    await this.tokenService.saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      tokenFamily
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findByIdWithCompany(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Get role and status names
    const role = await this.prismaService.getClient().role.findUnique({ where: { id: user.role_id } });
    const userStatus = await this.prismaService.getClient().userStatus.findUnique({ where: { id: user.status_id } });

    return {
      id: user.id,
      email: user.email,
      user_name: user.user_name,
      phone_number: user.phone_number,
      role_id: user.role_id,
      role_name: role?.role_name,
      status_id: user.status_id,
      status_name: userStatus?.status_name,
      company: user.company ? {
        id: user.company.id,
        company_name: user.company.company_name,
        company_description: user.company.company_description,
        invitation_code: user.company.invitation_code,
      } : null,
      created_at: user.created_at,
    };
  }
}

// DI Container에서 관리하므로 singleton export 제거