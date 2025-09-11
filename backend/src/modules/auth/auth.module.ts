import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthenticationService } from './services/authentication.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { RegistrationService } from './services/registration.service';
import { ApprovalService } from './services/approval.service';
import { UserRepository } from './repositories/user.repository';
import { CompanyRepository } from './repositories/company.repository';
import { authenticateToken, requireSystemAdmin, requireCompanyManager } from '@shared/middleware/auth.middleware';
import { TokenRepository } from './repositories/token.repository';
import { AuthValidator } from './validators/auth.validator';
import { PrismaService } from '@infrastructure/database/prisma.service';

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
  private _authController: AuthController;

  // Repositories
  private _userRepository: UserRepository;
  private _companyRepository: CompanyRepository;
  private _tokenRepository: TokenRepository;

  // Services
  private _authService: AuthService;
  private _authenticationService: AuthenticationService;
  private _tokenService: TokenService;
  private _passwordService: PasswordService;
  private _registrationService: RegistrationService;
  private _approvalService: ApprovalService;

  private constructor() {
    this.initializeRepositories();
    this.initializeServices();
    this.initializeController();
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

  /**
   * Repository 계층 초기화
   */
  private initializeRepositories(): void {
    const prismaService = PrismaService.getInstance();
    this._userRepository = new UserRepository(prismaService);
    this._companyRepository = new CompanyRepository(prismaService);
    this._tokenRepository = new TokenRepository(prismaService);
  }

  /**
   * Service 계층 초기화 (의존성 주입)
   */
  private initializeServices(): void {
    const prismaService = PrismaService.getInstance();
    
    // 기본 서비스 생성
    this._tokenService = new TokenService(this._tokenRepository, this._userRepository);
    this._passwordService = new PasswordService(this._userRepository, this._tokenService);
    
    // 의존성을 가진 서비스 생성
    this._authenticationService = new AuthenticationService(
      this._userRepository,
      this._tokenService,
      this._passwordService,
      prismaService
    );
    
    this._registrationService = new RegistrationService(
      this._userRepository,
      this._companyRepository,
      this._passwordService
    );
    
    this._approvalService = new ApprovalService(
      this._userRepository,
      this._companyRepository,
      prismaService
    );
    
    // Facade 서비스 생성
    this._authService = new AuthService(
      this._authenticationService,
      this._registrationService,
      this._passwordService,
      this._approvalService,
      this._tokenService
    );
  }

  /**
   * Controller 초기화
   */
  private initializeController(): void {
    this._authController = new AuthController(this._authService);
  }

  /**
   * 라우트 설정
   */
  private initializeRoutes(): void {
    this._router = Router();

    // 공개 엔드포인트 (인증 불필요)
    this._router.post(
      '/signup/company-manager',
      AuthValidator.validateCompanyManagerSignup(),
      this._authController.signupCompanyManager.bind(this._authController)
    );

    this._router.post(
      '/signup/team-member',
      AuthValidator.validateTeamMemberSignup(),
      this._authController.signupTeamMember.bind(this._authController)
    );

    this._router.post(
      '/login',
      AuthValidator.validateLogin(),
      this._authController.login.bind(this._authController)
    );

    this._router.post(
      '/refresh',
      this._authController.refreshToken.bind(this._authController)
    );

    this._router.post(
      '/password/forgot',
      AuthValidator.validateForgotPassword(),
      this._authController.forgotPassword.bind(this._authController)
    );

    this._router.get(
      '/password/verify',
      this._authController.verifyResetToken.bind(this._authController)
    );

    this._router.post(
      '/password/reset',
      AuthValidator.validateResetPassword(),
      this._authController.resetPassword.bind(this._authController)
    );

    // 보호된 엔드포인트 (인증 필요)
    this._router.post(
      '/logout',
      authenticateToken,
      this._authController.logout.bind(this._authController)
    );

    this._router.post(
      '/admin/approve/company',
      authenticateToken,
      requireSystemAdmin,
      AuthValidator.validateCompanyApproval(),
      this._authController.approveCompany.bind(this._authController)
    );

    this._router.post(
      '/manager/approve/member',
      authenticateToken,
      requireCompanyManager,
      AuthValidator.validateMemberApproval(),
      this._authController.approveMember.bind(this._authController)
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