/**
 * Application Bootstrap
 * 
 * 애플리케이션 초기화 및 설정을 담당
 * - Express 앱 설정
 * - 미들웨어 구성
 * - 모듈 등록
 * - 데이터베이스 연결
 */

import express, { Application } from 'express';
import { AuthModule } from '../../modules/auth';
import { 
  errorHandler, 
  notFoundHandler, 
  requestLogger, 
  rateLimiter,
  authenticateToken,
  requireSystemAdmin,
  requireCompanyManager
} from '../../shared/middleware';
import { logger } from '../../shared/utils';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';

export class AppBootstrap {
  private app: Application;
  private authModule: AuthModule;

  constructor() {
    this.app = express();
    this.initializeGlobalMiddleware();
    this.initializeModules();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Express 앱 인스턴스 반환
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * 글로벌 미들웨어 초기화
   */
  private initializeGlobalMiddleware(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Compression
    this.app.use(compression());

    // Parsing
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          }
        }
      }));
    }

    this.app.use(requestLogger);

    // Rate Limiting (API 경로에만 적용)
    this.app.use('/api/v1', rateLimiter);
  }

  /**
   * 모듈 초기화
   */
  private initializeModules(): void {
    // Auth 모듈 초기화
    this.authModule = AuthModule.getInstance();
  }

  /**
   * API 라우트 초기화
   */
  private initializeRoutes(): void {
    // Health Check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API v1 Routes
    const apiV1 = express.Router();
    
    // Auth 라우트 (공개 + 보호된 라우트 모두 포함)
    apiV1.use('/auth', this.authModule.router);

    // 향후 다른 모듈들 추가
    // apiV1.use('/users', userModule.router);
    // apiV1.use('/projects', projectModule.router);
    // apiV1.use('/companies', companyModule.router);

    this.app.use('/api/v1', apiV1);

    // API 문서 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      this.app.get('/api/docs', (req, res) => {
        res.json({
          message: 'API Documentation',
          version: 'v1',
          endpoints: {
            auth: {
              public: [
                'POST /api/v1/auth/signup/company-manager',
                'POST /api/v1/auth/signup/team-member',
                'POST /api/v1/auth/login',
                'POST /api/v1/auth/refresh',
                'POST /api/v1/auth/password/forgot',
                'GET /api/v1/auth/password/verify',
                'POST /api/v1/auth/password/reset'
              ],
              protected: [
                'POST /api/v1/auth/logout',
                'POST /api/v1/auth/admin/approve/company (SYSTEM_ADMIN)',
                'POST /api/v1/auth/manager/approve/member (COMPANY_MANAGER)'
              ]
            }
          }
        });
      });
    }
  }

  /**
   * 에러 처리 미들웨어 초기화
   */
  private initializeErrorHandling(): void {
    // 404 핸들러
    this.app.use(notFoundHandler);

    // 전역 에러 핸들러
    this.app.use(errorHandler);
  }

  /**
   * 애플리케이션 종료 시 정리 작업
   */
  public async shutdown(): Promise<void> {
    try {
      logger.info('애플리케이션 종료 중...');

      // 모듈 정리
      if (this.authModule) {
        this.authModule.destroy();
      }

      // 캐시 연결 해제
      // await cacheService.disconnect();

      logger.info('애플리케이션이 정상적으로 종료되었습니다.');
    } catch (error) {
      logger.error('애플리케이션 종료 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 애플리케이션 상태 정보 반환
   */
  public getAppInfo() {
    return {
      name: 'ProjectManager Backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      modules: {
        auth: this.authModule ? this.authModule.getModuleInfo() : null,
        // 향후 다른 모듈들 정보 추가
      },
      routes: {
        health: '/health',
        api: '/api/v1',
        docs: process.env.NODE_ENV === 'development' ? '/api/docs' : null
      }
    };
  }
}