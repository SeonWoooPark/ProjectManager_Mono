import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../interfaces/auth.types';
import { jwtManager } from '../utils/jwt';
import { AuthenticationError, AuthorizationError, InvalidTokenError, TokenExpiredError } from '@shared/utils/errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verify JWT token middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError('인증 토큰이 없습니다');
    }

    // Verify token
    const payload = jwtManager.verifyAccessToken(token);

    // Check if token is blacklisted
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { jti: payload.jti }
    });

    if (blacklistedToken) {
      throw new InvalidTokenError('access');
    }

    // Add user info to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: '',  // name field is not in TokenPayload
      role_id: payload.role_id,
      company_id: payload.company_id || null,
      status_id: payload.status_id
    };
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ACCESS_TOKEN_EXPIRED') {
        return next(new TokenExpiredError('access'));
      }
      if (error.message === 'INVALID_ACCESS_TOKEN') {
        return next(new InvalidTokenError('access'));
      }
    }
    next(error);
  }
};

// Check if user has specific role
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return next(new AuthorizationError('해당 작업을 수행할 권한이 없습니다'));
    }

    next();
  };
};

// Check if user is system admin
export const requireSystemAdmin = requireRole(UserRole.SYSTEM_ADMIN);

// Check if user is company manager
export const requireCompanyManager = requireRole(UserRole.COMPANY_MANAGER);

// Check if user is company manager or system admin
export const requireManagerOrAdmin = requireRole(UserRole.SYSTEM_ADMIN, UserRole.COMPANY_MANAGER);

// Check if user belongs to same company
export const requireSameCompany = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    // System admin can access all companies
    if (req.user.role_id === UserRole.SYSTEM_ADMIN) {
      return next();
    }

    const targetUserId = req.params.userId || req.body.user_id;
    if (!targetUserId) {
      return next();
    }

    // Get target user's company
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { company_id: true }
    });

    if (!targetUser) {
      return next(new AuthorizationError('사용자를 찾을 수 없습니다'));
    }

    // Check if both users belong to the same company
    if (targetUser.company_id !== req.user.company_id) {
      return next(new AuthorizationError('다른 회사의 사용자에게 접근할 수 없습니다'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user is active
export const requireActiveUser = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    // UserStatus.ACTIVE = 1
    if (req.user.status_id !== 1) {
      const statusMessages: { [key: number]: string } = {
        2: '비활성화된 계정입니다',
        3: '승인 대기 중인 계정입니다'
      };
      
      return next(new AuthorizationError(
        statusMessages[req.user.status_id] || '계정을 사용할 수 없습니다'
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication - doesn't fail if no token, but adds user if token exists
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const payload = jwtManager.verifyAccessToken(token);
    
    // Check if token is blacklisted
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { jti: payload.jti }
    });

    if (!blacklistedToken) {
      req.user = {
        id: payload.sub,
        email: payload.email,
        name: '',  // TokenPayload doesn't have name field
        role_id: payload.role_id,
        company_id: payload.company_id || null,
        status_id: payload.status_id
      };
      req.token = token;
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};