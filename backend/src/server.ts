import 'reflect-metadata';
import app from './app';
import { config } from '@core/config';
import { logger } from '@shared/utils/logger';
import { prismaService } from '@infrastructure/database/prisma.service';
import { initializeApp, shutdownApp } from '@core/app.bootstrap';

const PORT = config.port || 5000;

// 애플리케이션 초기화 및 서버 시작
const startServer = async () => {
  try {
    // 1. 애플리케이션 초기화 (DI Container 포함)
    await initializeApp();
    logger.info('✅ Application initialized successfully');

    // 2. 데이터베이스 연결 초기화
    await prismaService.connect();
    logger.info('✅ Database connected successfully');

    // 서버 시작
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT} in ${config.env} mode`);
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// 서버 시작
let server: any;
startServer().then(s => {
  server = s;
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} signal received: closing HTTP server`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // 애플리케이션 및 데이터베이스 연결 종료
      try {
        await prismaService.disconnect();
        logger.info('Database connection closed');
        
        await shutdownApp();
        logger.info('Application shutdown completed');
      } catch (error) {
        logger.error('Error during shutdown:', error);
      }
      
      process.exit(0);
    });
  }

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

export default server;