import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthService } from '../services/auth.service';
import { ResponseFormatter } from '@shared/utils/response';
import { AuthenticatedRequest } from '../interfaces/auth.types';
import {
  CompanyManagerSignupRequestDto,
  TeamMemberSignupRequestDto,
  LoginRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  // CompanyApprovalRequestDto,
  // MemberApprovalRequestDto,
} from '@modules/auth/dto/request';

@injectable()
export class AuthController {
  constructor(@inject('AuthService') private authService: AuthService) {}
  // Company Manager Signup
  async signupCompanyManager(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CompanyManagerSignupRequestDto = req.body;
      const result = await this.authService.signupCompanyManager(dto);

      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Team Member Signup
  async signupTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: TeamMemberSignupRequestDto = req.body;
      const result = await this.authService.signupTeamMember(dto);

      ResponseFormatter.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: LoginRequestDto = req.body;

      const result = await this.authService.login(dto);

      // Set refresh token as HttpOnly cookie
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/v1/auth',
      });

      // Remove refresh token from response
      const { refreshToken, ...responseData } = result;

      ResponseFormatter.success(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const currentRefreshToken = req.cookies.refresh_token;
      const currentAccessToken = req.headers['authorization']?.split(' ')[1]; // Bearer token

      if (!currentRefreshToken) {
        ResponseFormatter.unauthorized(res, '리프레시 토큰이 없습니다');
        return;
      }

      const result = await this.authService.refreshToken(currentRefreshToken, currentAccessToken);

      // Set new refresh token as HttpOnly cookie
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/v1/auth',
      });

      // Remove refresh token from response
      const { refreshToken, ...responseData } = result;

      ResponseFormatter.success(res, responseData);
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader && authHeader.split(' ')[1];

      await this.authService.logout(userId, accessToken);

      // Clear refresh token cookie
      res.clearCookie('refresh_token', {
        path: '/api/v1/auth',
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

      const result = await this.authService.forgotPassword(dto.email);

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

      const result = await this.authService.verifyResetToken(token);

      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: ResetPasswordRequestDto = req.body;

      const result = await this.authService.resetPassword(
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
      const { company_id, action, comment, generate_invitation_code } = req.body;
      const approvedBy = String(req.user!.id);

      const result = await this.authService.approveCompany(
        company_id,
        action,
        approvedBy,
        comment,
        generate_invitation_code
      );

      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Approve Member (Company Manager)
  async approveMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { user_id, action, comment } = req.body;
      const approvedBy = String(req.user!.id);

      const result = await this.authService.approveMember(user_id, action, approvedBy, comment);

      ResponseFormatter.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

// Controller is managed by DI Container, no singleton export
