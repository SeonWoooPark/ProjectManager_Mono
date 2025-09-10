import app from './app';
import { config } from './config/config';
import { logger } from './utils/logger';
import { connectPrisma, disconnectPrisma } from './lib/prisma';

const PORT = config.port || 5000;

// 데이터베이스 연결 후 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 초기화
    await connectPrisma();
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
      
      // 데이터베이스 연결 종료
      try {
        await disconnectPrisma();
        logger.info('Database connection closed');
      } catch (error) {
        logger.error('Error closing database connection:', error);
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