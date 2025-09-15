import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { errorHandler } from '@shared/middleware/errorHandler';
import { notFoundHandler } from '@shared/middleware/notFoundHandler';
import { rateLimiter } from '@shared/middleware/rateLimiter';
import { requestLogger } from '@shared/middleware/requestLogger';
import { AuthModule } from '@modules/auth';
import { config } from '@core/config';
import { initializeApp } from '@core/app.bootstrap';
import { prismaService } from '@infrastructure/database/prisma.service';
import { logger } from '@shared/utils/logger';

export async function createTestApp(): Promise<Application> {
  const app = express();

  // 테스트용 환경 설정 (NODE_ENV가 test로 설정되어 있음)
  
  try {
    // 1. DI Container와 모든 의존성 초기화
    await initializeApp();
    logger.info('✅ Test application initialized successfully');

    // 2. 데이터베이스 연결 초기화 (테스트 DB)
    await prismaService.connect();
    logger.info('✅ Test database connected successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize test application:', error);
    throw error;
  }

  // 미들웨어 설정
  app.use(helmet());
  app.use(cors(config.cors));
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLogger);
  app.use('/api/v1', rateLimiter);

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: 'test',
    });
  });

  // Auth 모듈 초기화 (DI Container로 의존성이 이미 주입됨)
  try {
    const authModule = AuthModule.getInstance();
    app.use('/api/v1/auth', authModule.router);
    logger.info('✅ Auth module routes registered');
  } catch (error) {
    logger.error('❌ Auth 모듈 초기화 실패:', error);
    throw error;
  }

  // 에러 핸들링
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}