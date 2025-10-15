import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../interfaces/auth.types';
import { jwtManager } from '../utils/jwt';

import { prisma } from '@infrastructure/database/prisma.service';

// Verify JWT token middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 없습니다',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const payload = jwtManager.verifyAccessToken(token);

    // Check if token is blacklisted
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { jti: payload.jti }
    });

    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다',
        code: 'INVALID_TOKEN'
      });
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
        return res.status(401).json({
          success: false,
          message: '토큰이 만료되었습니다',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.message === 'INVALID_ACCESS_TOKEN') {
        return res.status(401).json({
          success: false,
          message: '유효하지 않은 토큰입니다',
          code: 'INVALID_TOKEN'
        });
      }
    }
    // 기타 에러의 경우 500 반환
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다',
      code: 'AUTH_ERROR'
    });
  }
};

// Check if user has specific role
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: '해당 작업을 수행할 권한이 없습니다',
        code: 'FORBIDDEN'
      });
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
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
        code: 'AUTHENTICATION_REQUIRED'
      });
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
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if both users belong to the same company
    if (targetUser.company_id !== req.user.company_id) {
      return res.status(403).json({
        success: false,
        message: '다른 회사의 사용자에게 접근할 수 없습니다',
        code: 'FORBIDDEN'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다',
      code: 'AUTH_ERROR'
    });
  }
};

// Check if user is active
export const requireActiveUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // UserStatus.ACTIVE = 1
    if (req.user.status_id !== 1) {
      const statusMessages: { [key: number]: string } = {
        2: '비활성화된 계정입니다',
        3: '승인 대기 중인 계정입니다'
      };
      
      return res.status(403).json({
        success: false,
        message: statusMessages[req.user.status_id] || '계정을 사용할 수 없습니다',
        code: 'ACCOUNT_NOT_ACTIVE'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '권한 확인 중 오류가 발생했습니다',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication - doesn't fail if no token, but adds user if token exists
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<any> => {
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