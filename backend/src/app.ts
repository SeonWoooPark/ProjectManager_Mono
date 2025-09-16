import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from '@core/config';
import { errorHandler } from '@shared/middleware/errorHandler';
import { notFoundHandler } from '@shared/middleware/notFoundHandler';
import { rateLimiter } from '@shared/middleware/rateLimiter';
import { requestLogger } from '@shared/middleware/requestLogger';
import { AuthModule } from '@modules/auth';
import { ProjectsModule } from '@modules/projects';
import { TasksModule } from '@modules/tasks';
import { MembersModule } from '@modules/members';
import { logger } from '@shared/utils/logger';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
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
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
      });
    });

    // Module routes
    const authModule = AuthModule.getInstance();
    this.app.use('/api/v1/auth', authModule.router);

    const projectsModule = ProjectsModule.getInstance();
    this.app.use('/api/v1/projects', projectsModule.router);

    const tasksModule = TasksModule.getInstance();
    this.app.use('/api/v1/tasks', tasksModule.router);

    const membersModule = MembersModule.getInstance();
    this.app.use('/api/v1/members', membersModule.router);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }
}

export default new App().app;
