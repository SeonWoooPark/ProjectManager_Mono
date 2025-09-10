import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ResponseFormatter } from '../utils/response';
import {
  AuthenticatedRequest,
  CompanyManagerSignupRequestDto,
  TeamMemberSignupRequestDto,
  LoginRequestDto,
  CompanyApprovalRequestDto,
  MemberApprovalRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto
} from '../types/auth.types';

export class AuthController {
  // Company Manager Signup
  async signupCompanyManager(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CompanyManagerSignupRequestDto = req.body;
      const result = await authService.signupCompanyManager(dto);
      
      ResponseFormatter.created(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Team Member Signup
  async signupTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: TeamMemberSignupRequestDto = req.body;
      const result = await authService.signupTeamMember(dto);
      
      ResponseFormatter.created(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: LoginRequestDto = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await authService.login(dto, ipAddress, userAgent);
      
      // Set refresh token as HttpOnly cookie
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/v1/auth'
      });
      
      // Remove refresh token from response
      const { refresh_token, ...responseData } = result;
      
      ResponseFormatter.success(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refresh_token;
      
      if (!refreshToken) {
        ResponseFormatter.unauthorized(res, '리프레시 토큰이 없습니다');
        return;
      }
      
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);
      
      // Set new refresh token as HttpOnly cookie
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/v1/auth'
      });
      
      // Remove refresh token from response
      const { refresh_token, ...responseData } = result;
      
      ResponseFormatter.success(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];
      const refreshToken = req.cookies.refresh_token;
      
      if (accessToken) {
        await authService.logout(accessToken, refreshToken);
      }
      
      // Clear refresh token cookie
      res.clearCookie('refresh_token', {
        path: '/api/v1/auth'
      });
      
      ResponseFormatter.success(res, null, '로그아웃되었습니다');
    } catch (error) {
      next(error);
    }
  }

  // Forgot Password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ForgotPasswordRequestDto = req.body;
      const ipAddress = req.ip;
      
      const result = await authService.forgotPassword(dto.email, ipAddress);
      
      ResponseFormatter.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Verify Reset Token
  async verifyResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      
      if (!token) {
        ResponseFormatter.validationError(res, 'token', '토큰이 필요합니다');
        return;
      }
      
      const result = await authService.verifyResetToken(token);
      
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ResetPasswordRequestDto = req.body;
      
      const result = await authService.resetPassword(
        dto.token,
        dto.new_password,
        dto.confirm_password
      );
      
      ResponseFormatter.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  // Approve Company (System Admin)
  async approveCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dto: CompanyApprovalRequestDto = req.body;
      const approvedBy = req.user!.id;
      
      const result = await authService.approveCompany(
        dto.company_id,
        dto.action,
        approvedBy,
        dto.comment,
        dto.generate_invitation_code
      );
      
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Approve Member (Company Manager)
  async approveMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dto: MemberApprovalRequestDto = req.body;
      const approvedBy = req.user!.id;
      
      const result = await authService.approveMember(
        dto.user_id,
        dto.action,
        approvedBy,
        dto.comment
      );
      
      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();