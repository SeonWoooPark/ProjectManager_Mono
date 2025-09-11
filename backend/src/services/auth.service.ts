import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { jwtManager } from '../utils/jwt';
import { passwordManager } from '../utils/password';
import {
  CompanyManagerSignupRequestDto,
  TeamMemberSignupRequestDto,
  LoginRequestDto,
  UserStatus,
  CompanyStatus,
  UserRole,
} from '../types/auth.types';
import {
  ConflictError,
  InvalidCredentialsError,
  AccountStatusError,
  InvalidInvitationError,
  NotFoundError,
  TokenExpiredError,
  InvalidTokenError,
  TokenReuseError,
  TokenAlreadyUsedError,
  PasswordPolicyError,
  PasswordMismatchError,
  ValidationError,
} from '../utils/errors';
import {
  IdValidator,
  DbConstraintValidator,
} from '../utils/dbConstraints';

export class AuthService {
  // Company Manager Signup
  async signupCompanyManager(dto: CompanyManagerSignupRequestDto) {
    const { user, company } = dto;

    // Validate password policy
    const passwordValidation = passwordManager.validatePasswordPolicy(user.password);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (existingUser) {
      throw new ConflictError('이미 사용 중인 이메일입니다', 'email');
    }

    // Check company name uniqueness
    const existingCompany = await prisma.company.findFirst({
      where: { company_name: company.company_name },
    });
    if (existingCompany) {
      throw new ConflictError('이미 등록된 회사명입니다', 'company_name');
    }

    // Hash password
    const passwordHash = await passwordManager.hashPassword(user.password);

    // Validate database constraints
    const userValidation = DbConstraintValidator.validateUserCreation({
      email: user.email,
      user_name: user.user_name,
      phone_number: user.phone_number,
      role_id: UserRole.COMPANY_MANAGER,
      status_id: UserStatus.PENDING,
    });
    if (!userValidation.valid) {
      throw new ValidationError(userValidation.errors.join(', '));
    }

    const companyValidation = DbConstraintValidator.validateCompanyCreation({
      company_name: company.company_name,
      company_description: company.company_description,
      status_id: CompanyStatus.PENDING,
    });
    if (!companyValidation.valid) {
      throw new ValidationError(companyValidation.errors.join(', '));
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Generate proper IDs
      const companyId = IdValidator.generateId('COMPANY');
      const userId = IdValidator.generateId('USER');

      // Create company (PENDING status)
      const newCompany = await tx.company.create({
        data: {
          id: companyId,
          company_name: company.company_name,
          company_description: company.company_description,
          status_id: CompanyStatus.PENDING,
          created_at: new Date(),
        },
      });

      // Create user (COMPANY_MANAGER role, PENDING status)
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email: user.email,
          password_hash: passwordHash,
          user_name: user.user_name,
          phone_number: user.phone_number,
          role_id: UserRole.COMPANY_MANAGER,
          status_id: UserStatus.PENDING,
          company_id: newCompany.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Update company with manager_id
      await tx.company.update({
        where: { id: newCompany.id },
        data: { manager_id: newUser.id },
      });

      return { user: newUser, company: newCompany };
    });

    // Get role and status names
    const role = await prisma.role.findUnique({ where: { id: result.user.role_id } });
    const userStatus = await prisma.userStatus.findUnique({ where: { id: result.user.status_id } });
    const companyStatus = await prisma.companyStatus.findUnique({
      where: { id: result.company.status_id },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        user_name: result.user.user_name,
        role_id: result.user.role_id,
        role_name: role?.role_name || 'COMPANY_MANAGER',
        status_id: result.user.status_id,
        status_name: userStatus?.status_name || 'PENDING',
      },
      company: {
        id: result.company.id,
        company_name: result.company.company_name,
        status_id: result.company.status_id,
        status_name: companyStatus?.status_name || 'PENDING',
        invitation_code: null,
      },
      message: '회원가입이 완료되었습니다. 시스템 관리자의 승인을 기다려주세요.',
    };
  }

  // Team Member Signup
  async signupTeamMember(dto: TeamMemberSignupRequestDto) {
    const { user, invitation_code } = dto;

    // Validate password policy
    const passwordValidation = passwordManager.validatePasswordPolicy(user.password);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (existingUser) {
      throw new ConflictError('이미 사용 중인 이메일입니다', 'email');
    }

    // Validate invitation code
    const company = await prisma.company.findFirst({
      where: {
        invitation_code,
        status_id: CompanyStatus.ACTIVE,
      },
    });
    if (!company) {
      throw new InvalidInvitationError();
    }

    // Validate database constraints
    const userValidation = DbConstraintValidator.validateUserCreation({
      email: user.email,
      user_name: user.user_name,
      phone_number: user.phone_number,
      role_id: UserRole.TEAM_MEMBER,
      status_id: UserStatus.PENDING,
      company_id: company.id,
    });
    if (!userValidation.valid) {
      throw new ValidationError(userValidation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await passwordManager.hashPassword(user.password);

    // Generate proper user ID
    const userId = IdValidator.generateId('USER');

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.email,
        password_hash: passwordHash,
        user_name: user.user_name,
        phone_number: user.phone_number,
        role_id: UserRole.TEAM_MEMBER,
        status_id: UserStatus.PENDING,
        company_id: company.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Get role and status names
    const role = await prisma.role.findUnique({ where: { id: newUser.role_id } });
    const userStatus = await prisma.userStatus.findUnique({ where: { id: newUser.status_id } });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        user_name: newUser.user_name,
        role_id: newUser.role_id,
        role_name: role?.role_name || 'TEAM_MEMBER',
        status_id: newUser.status_id,
        status_name: userStatus?.status_name || 'PENDING',
      },
      company: {
        id: company.id,
        company_name: company.company_name,
      },
      message: '회원가입이 완료되었습니다. 회사 관리자의 승인을 기다려주세요.',
    };
  }

  // Login
  async login(dto: LoginRequestDto, userAgent?: string) {
    console.log('[AuthService] Login method called with:', dto);
    const { email, password } = dto;

    // Find user with company and role info
    console.log('[AuthService] Finding user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        status: true,
        company: true,
      },
    });
    console.log('[AuthService] User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('[AuthService] User not found, throwing InvalidCredentialsError');
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isValidPassword = await passwordManager.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    // Check account status
    if (user.status_id === UserStatus.PENDING) {
      throw new AccountStatusError('PENDING');
    }
    if (user.status_id === UserStatus.INACTIVE) {
      throw new AccountStatusError('INACTIVE');
    }

    // Revoke all existing active refresh tokens for this user
    // This ensures only one active session per user (optional: can be configured)
    await prisma.refreshToken.updateMany({
      where: {
        user_id: user.id,
        revoked_at: null,
        expires_at: {
          gt: new Date() // Only revoke non-expired tokens
        }
      },
      data: {
        revoked_at: new Date(),
        revoked_reason: 'new_login'
      }
    });

    // Generate tokens
    const accessToken = jwtManager.generateAccessToken(
      user.id,
      user.email,
      user.role_id,
      user.status_id,
      user.company_id || undefined
    );

    const tokenFamily = jwtManager.generateTokenFamily();
    const refreshToken = jwtManager.generateRefreshToken(user.id, tokenFamily);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Generate proper refresh token ID
    const refreshTokenId = IdValidator.generateId('REFRESH_TOKEN');

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        user_id: user.id,
        token_hash: refreshTokenHash,
        token_family: tokenFamily,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        created_at: new Date(),
        user_agent: userAgent,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        role_id: user.role_id,
        role_name: user.role.role_name,
        status_id: user.status_id,
        status_name: user.status.status_name,
        company_id: user.company_id,
        company_name: user.company?.company_name,
      },
    };
  }

  // Refresh Token
  async refreshToken(refreshToken: string, userAgent?: string, oldAccessToken?: string) {
    // Verify refresh token
    try {
      jwtManager.verifyRefreshToken(refreshToken);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'REFRESH_TOKEN_EXPIRED') {
          throw new TokenExpiredError('refresh');
        }
        if (error.message === 'INVALID_REFRESH_TOKEN') {
          throw new InvalidTokenError('refresh');
        }
      }
      throw error;
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find the refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (!storedToken) {
      throw new InvalidTokenError('refresh');
    }

    // Check if token is already revoked (possible token reuse attack)
    if (storedToken.revoked_at) {
      // Revoke all tokens in the same family (security measure)
      await prisma.refreshToken.updateMany({
        where: { token_family: storedToken.token_family },
        data: {
          revoked_at: new Date(),
          revoked_reason: 'suspicious_activity',
        },
      });
      throw new TokenReuseError();
    }

    // Check if token is expired
    if (storedToken.expires_at < new Date()) {
      throw new TokenExpiredError('refresh');
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: storedToken.user_id },
      include: {
        role: true,
        status: true,
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }

    // Token rotation: revoke old token and create new one
    await prisma.$transaction(async (tx: any) => {
      // Revoke old refresh token
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revoked_at: new Date(),
          revoked_reason: 'token_rotation',
        },
      });

      // If old access token is provided, add it to blacklist
      if (oldAccessToken) {
        try {
          const oldJti = jwtManager.getJti(oldAccessToken);
          const decoded = jwtManager.decodeToken(oldAccessToken) as any;
          
          if (oldJti && decoded) {
            const expiresAt = new Date(decoded.exp * 1000);
            const blacklistId = IdValidator.generateId('TOKEN_BLACKLIST');
            
            await tx.tokenBlacklist.create({
              data: {
                id: blacklistId,
                jti: oldJti,
                token_type: 'access',
                user_id: user.id,
                expires_at: expiresAt,
                blacklisted_at: new Date(),
                reason: 'token_refresh',
              },
            });
          }
        } catch (error) {
          // If old token is invalid or expired, ignore the error
          console.log('[AuthService] Failed to blacklist old access token:', error);
        }
      }

      // Create new refresh token with same family
      const newRefreshToken = jwtManager.generateRefreshToken(user.id, storedToken.token_family);
      const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

      // Generate proper refresh token ID
      const newRefreshTokenId = IdValidator.generateId('REFRESH_TOKEN');

      await tx.refreshToken.create({
        data: {
          id: newRefreshTokenId,
          user_id: user.id,
          token_hash: newTokenHash,
          token_family: storedToken.token_family,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          created_at: new Date(),
          user_agent: userAgent,
        },
      });

      refreshToken = newRefreshToken;
    });

    // Generate new access token
    const accessToken = jwtManager.generateAccessToken(
      user.id,
      user.email,
      user.role_id,
      user.status_id,
      user.company_id || undefined
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutes
    };
  }

  // Logout
  async logout(accessToken: string, refreshToken?: string) {
    // Extract JTI from access token
    const jti = jwtManager.getJti(accessToken);

    if (jti) {
      // Get token expiry
      const decoded = jwtManager.decodeToken(accessToken) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      // Generate proper blacklist ID
      const blacklistId = IdValidator.generateId('TOKEN_BLACKLIST');

      // Add access token to blacklist
      await prisma.tokenBlacklist.create({
        data: {
          id: blacklistId,
          jti,
          token_type: 'access',
          user_id: decoded.sub,
          expires_at: expiresAt,
          blacklisted_at: new Date(),
          reason: 'logout',
        },
      });
    }

    // Revoke refresh token if provided
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { token_hash: tokenHash },
        data: {
          revoked_at: new Date(),
          revoked_reason: 'logout',
        },
      });
    }

    return { message: '로그아웃되었습니다' };
  }

  // Forgot Password
  async forgotPassword(email: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success message to prevent email enumeration
    if (!user) {
      return {
        message: '이메일이 등록되어 있다면 비밀번호 재설정 링크가 발송됩니다',
      };
    }

    // Invalidate existing reset tokens
    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: user.id,
        used_at: null,
      },
      data: {
        used_at: new Date(),
      },
    });

    // Generate reset token
    const resetToken = jwtManager.generatePasswordResetToken(user.id);
    const jti = jwtManager.getJti(resetToken)!;
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Generate proper reset token ID
    const resetTokenId = IdValidator.generateId('PASSWORD_RESET_TOKEN');

    // Save reset token
    await prisma.passwordResetToken.create({
      data: {
        id: resetTokenId,
        user_id: user.id,
        jti,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        created_at: new Date(),
      },
    });

    // In production, send email
    // In development, return reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    return {
      message: '이메일이 등록되어 있다면 비밀번호 재설정 링크가 발송됩니다',
      ...(process.env.NODE_ENV === 'development' && { reset_url: resetUrl }),
    };
  }

  // Verify Reset Token
  async verifyResetToken(token: string) {
    // Verify JWT token
    let payload;
    try {
      payload = jwtManager.verifyPasswordResetToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'RESET_TOKEN_EXPIRED') {
          throw new TokenExpiredError('reset');
        }
        if (error.message === 'INVALID_RESET_TOKEN' || error.message === 'INVALID_TOKEN_PURPOSE') {
          throw new InvalidTokenError('reset');
        }
      }
      throw error;
    }

    // Check if token exists in database
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!storedToken || storedToken.used_at) {
      throw new InvalidTokenError('reset');
    }

    if (storedToken.expires_at < new Date()) {
      throw new TokenExpiredError('reset');
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: storedToken.user_id },
      select: { email: true },
    });

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }

    // Mask email for privacy
    const maskedEmail = user.email.replace(/^(.{3}).*(@.*)$/, '$1***$2');

    return {
      valid: true,
      email: maskedEmail,
      expires_at: storedToken.expires_at.toISOString(),
    };
  }

  // Reset Password
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new PasswordMismatchError();
    }

    // Validate password policy
    const passwordValidation = passwordManager.validatePasswordPolicy(newPassword);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Verify token
    let payload;
    try {
      payload = jwtManager.verifyPasswordResetToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'RESET_TOKEN_EXPIRED') {
          throw new TokenExpiredError('reset');
        }
        if (error.message === 'INVALID_RESET_TOKEN' || error.message === 'INVALID_TOKEN_PURPOSE') {
          throw new InvalidTokenError('reset');
        }
      }
      throw error;
    }

    // Check token in database
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!storedToken) {
      throw new InvalidTokenError('reset');
    }

    if (storedToken.used_at) {
      throw new TokenAlreadyUsedError();
    }

    if (storedToken.expires_at < new Date()) {
      throw new TokenExpiredError('reset');
    }

    // Hash new password
    const passwordHash = await passwordManager.hashPassword(newPassword);

    // Update password and mark token as used
    await prisma.$transaction(async (tx: any) => {
      // Update user password
      await tx.user.update({
        where: { id: storedToken.user_id },
        data: {
          password_hash: passwordHash,
          updated_at: new Date(),
        },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: storedToken.id },
        data: {
          used_at: new Date(),
        },
      });

      // Revoke all refresh tokens for security
      await tx.refreshToken.updateMany({
        where: { user_id: storedToken.user_id },
        data: {
          revoked_at: new Date(),
          revoked_reason: 'password_change',
        },
      });
    });

    return { message: '비밀번호가 성공적으로 변경되었습니다' };
  }

  // Approve Company (System Admin)
  async approveCompany(
    companyId: string,
    action: 'approve' | 'reject',
    approvedBy: string,
    _comment?: string,
    generateInvitationCode?: boolean
  ) {
    // Find company with manager
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        manager: true,
      },
    });

    if (!company) {
      throw new NotFoundError('회사를 찾을 수 없습니다');
    }

    if (!company.manager) {
      throw new ValidationError('회사 관리자가 설정되지 않았습니다');
    }

    const newStatusId = action === 'approve' ? CompanyStatus.ACTIVE : CompanyStatus.INACTIVE;
    const userStatusId = action === 'approve' ? UserStatus.ACTIVE : UserStatus.INACTIVE;

    // Update company and manager status
    const result = await prisma.$transaction(async (tx: any) => {
      // Update company status
      const updatedCompany = await tx.company.update({
        where: { id: companyId },
        data: {
          status_id: newStatusId,
          ...(generateInvitationCode &&
            action === 'approve' && {
              invitation_code: IdValidator.generateId('INVITATION_CODE'),
            }),
        },
      });

      // Update manager status
      const updatedManager = await tx.user.update({
        where: { id: company.manager_id! },
        data: {
          status_id: userStatusId,
          updated_at: new Date(),
        },
      });

      return { company: updatedCompany, manager: updatedManager };
    });

    // Get status names
    const companyStatus = await prisma.companyStatus.findUnique({
      where: { id: result.company.status_id },
    });
    const userStatus = await prisma.userStatus.findUnique({
      where: { id: result.manager.status_id },
    });

    return {
      company: {
        id: result.company.id,
        company_name: result.company.company_name,
        status_id: result.company.status_id,
        status_name: companyStatus?.status_name || (action === 'approve' ? 'ACTIVE' : 'INACTIVE'),
        invitation_code: result.company.invitation_code,
        manager_id: result.company.manager_id!,
      },
      manager: {
        id: result.manager.id,
        email: result.manager.email,
        status_id: result.manager.status_id,
        status_name: userStatus?.status_name || (action === 'approve' ? 'ACTIVE' : 'INACTIVE'),
      },
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    };
  }

  // Approve Member (Company Manager)
  async approveMember(
    userId: string,
    action: 'approve' | 'reject',
    approvedBy: string,
    _comment?: string
  ) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다');
    }

    const newStatusId = action === 'approve' ? UserStatus.ACTIVE : UserStatus.INACTIVE;

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status_id: newStatusId,
        updated_at: new Date(),
      },
    });

    // Get status name
    const userStatus = await prisma.userStatus.findUnique({ where: { id: updatedUser.status_id } });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        user_name: updatedUser.user_name,
        status_id: updatedUser.status_id,
        status_name: userStatus?.status_name || (action === 'approve' ? 'ACTIVE' : 'INACTIVE'),
        company_id: updatedUser.company_id!,
      },
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    };
  }
}

export const authService = new AuthService();
