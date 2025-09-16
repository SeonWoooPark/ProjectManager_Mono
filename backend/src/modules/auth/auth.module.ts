import { Router, Response, NextFunction } from 'express';
import type { AuthController } from './controllers/auth.controller';
import { authenticateToken, requireSystemAdmin, requireCompanyManager } from './middleware/auth.middleware';
import { AuthValidator } from './validators/auth.validator';
import { resolve } from '@core/container';
import type { AuthenticatedRequest } from './interfaces/auth.types';

/**
 * Auth Module
 * 
 * 인증 및 인가 관련 모든 기능을 통합 관리하는 모듈
 * - 사용자 회원가입 (회사 관리자, 팀원)
 * - 로그인/로그아웃
 * - 토큰 관리 (JWT Access Token, Refresh Token)
 * - 비밀번호 재설정
 * - 승인 프로세스 (회사 승인, 팀원 승인)
 * - 입력 검증 및 보안
 */
export class AuthModule {
  private static _instance: AuthModule;
  private _router: Router;

  private constructor() {
    this.initializeRoutes();
  }

  /**
   * Singleton 패턴으로 AuthModule 인스턴스 반환
   */
  public static getInstance(): AuthModule {
    if (!AuthModule._instance) {
      AuthModule._instance = new AuthModule();
    }
    return AuthModule._instance;
  }

  /**
   * Auth 모듈의 라우터 반환
   */
  public get router(): Router {
    return this._router;
  }

  // No explicit repository/service/controller construction; resolved lazily from DI

  /**
   * 라우트 설정
   */
  private initializeRoutes(): void {
    this._router = Router();

    // 공개 엔드포인트 (인증 불필요)
    this._router.post(
      '/signup/company-manager',
      AuthValidator.validateCompanyManagerSignup(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').signupCompanyManager(req, res, next)
    );

    this._router.post(
      '/signup/team-member',
      AuthValidator.validateTeamMemberSignup(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').signupTeamMember(req, res, next)
    );

    this._router.post(
      '/login',
      AuthValidator.validateLogin(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').login(req, res, next)
    );

    this._router.post(
      '/refresh',
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').refreshToken(req, res, next)
    );

    this._router.post(
      '/password/forgot',
      AuthValidator.validateForgotPassword(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').forgotPassword(req, res, next)
    );

    this._router.get(
      '/password/verify',
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').verifyResetToken(req, res, next)
    );

    this._router.post(
      '/password/reset',
      AuthValidator.validateResetPassword(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').resetPassword(req, res, next)
    );

    // 보호된 엔드포인트 (인증 필요)
    this._router.post(
      '/logout',
      authenticateToken,
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').logout(req, res, next)
    );

    this._router.post(
      '/admin/approve/company',
      authenticateToken,
      requireSystemAdmin,
      AuthValidator.validateCompanyApproval(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').approveCompany(req, res, next)
    );

    this._router.post(
      '/manager/approve/member',
      authenticateToken,
      requireCompanyManager,
      AuthValidator.validateMemberApproval(),
      (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        resolve<AuthController>('AuthController').approveMember(req, res, next)
    );
  }

  /**
   * 모듈 정리 및 리소스 해제
   */
  public destroy(): void {
    // 필요시 리소스 정리 로직 구현
    AuthModule._instance = undefined as any;
  }

  /**
   * 모듈 상태 정보 반환 (디버깅/모니터링용)
   */
  public getModuleInfo() {
    return {
      name: 'AuthModule',
      version: '1.0.0',
      dependencies: {
        repositories: ['UserRepository', 'CompanyRepository', 'TokenRepository'],
        services: ['AuthService', 'AuthenticationService', 'TokenService', 'PasswordService', 'RegistrationService', 'ApprovalService'],
        controllers: ['AuthController'],
        validators: ['AuthValidator']
      },
      routes: {
        public: [
          'POST /signup/company-manager',
          'POST /signup/team-member',
          'POST /login',
          'POST /refresh',
          'POST /password/forgot',
          'GET /password/verify',
          'POST /password/reset'
        ],
        protected: [
          'POST /logout',
          'POST /admin/approve/company',
          'POST /manager/approve/member'
        ]
      },
      initialized: true
    };
  }
}
