import app from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT} in ${config.env} mode`);
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal: string) {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

export default server;