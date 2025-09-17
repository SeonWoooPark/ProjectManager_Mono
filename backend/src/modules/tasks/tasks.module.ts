import { Router } from 'express';
import type { TasksController } from './controllers/tasks.controller';
import { authenticateToken, requireActiveUser } from '@modules/auth/middleware/auth.middleware';
import { TasksValidator } from './validators/tasks.validator';
import { resolve } from '@core/container';

export class TasksModule {
  private static _instance: TasksModule;
  private _router: Router;

  private constructor() {
    this.initializeRoutes();
  }

  public static getInstance(): TasksModule {
    if (!TasksModule._instance) {
      TasksModule._instance = new TasksModule();
    }
    return TasksModule._instance;
  }

  get router() {
    return this._router;
  }

  private initializeRoutes() {
    this._router = Router();

    // GET /api/v1/tasks/assigned
    this._router.get(
      '/assigned',
      authenticateToken,
      requireActiveUser,
      TasksValidator.validateListAssigned(),
      (req, res, next) => resolve<TasksController>('TasksController').listAssigned(req, res, next)
    );

    // PATCH /api/v1/tasks/:task_id/status
    this._router.patch(
      '/:task_id/status',
      authenticateToken,
      requireActiveUser,
      TasksValidator.validateChangeStatus(),
      (req, res, next) => resolve<TasksController>('TasksController').changeStatus(req, res, next)
    );

    // PATCH /api/v1/tasks/:task_id
    this._router.patch(
      '/:task_id',
      authenticateToken,
      requireActiveUser,
      TasksValidator.validateUpdateTask(),
      (req, res, next) => resolve<TasksController>('TasksController').updateTask(req, res, next)
    );
  }
}
