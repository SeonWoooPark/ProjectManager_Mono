import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import router from './routes';
import { logger } from './utils/logger';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    console.log('[App] Initializing middlewares...');
    console.log('[App] CORS config:', config.cors);
    
    this.app.use(helmet());
    this.app.use(cors(config.cors));
    this.app.use(compression());
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    if (config.env !== 'test') {
      this.app.use(
        morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } })
      );
    }

    this.app.use(requestLogger);
    this.app.use('/api/v1', rateLimiter);
  }

  private initializeRoutes(): void {
    console.log('[App] Initializing routes...');
    
    // Debug middleware to log all requests
    this.app.use((req: Request, _res: Response, next: Function) => {
      console.log(`[Request] ${req.method} ${req.path}`);
      console.log('[Request Headers]', req.headers);
      console.log('[Request Body]', req.body);
      next();
    });
    
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
      });
    });

    this.app.use('/api/v1', router);
    console.log('[App] Routes initialized');
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }
}

export default new App().app;
