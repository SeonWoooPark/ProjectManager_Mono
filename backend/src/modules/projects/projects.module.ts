import { Router } from 'express';
import type { ProjectsController } from './controllers/projects.controller';
import { authenticateToken, requireCompanyManager, requireActiveUser } from '@modules/auth/middleware/auth.middleware';
import { ProjectsValidator } from './validators/projects.validator';
import { resolve } from '@core/container';

export class ProjectsModule {
  private static _instance: ProjectsModule;
  private _router: Router;

  private constructor() {
    this.initializeRoutes();
  }

  public static getInstance(): ProjectsModule {
    if (!ProjectsModule._instance) {
      ProjectsModule._instance = new ProjectsModule();
    }
    return ProjectsModule._instance;
  }

  public get router(): Router {
    return this._router;
  }

  private initializeRoutes() {
    this._router = Router();

    // POST /api/v1/projects - create project (manager only)
    this._router.post(
      '/',
      authenticateToken,
      requireActiveUser,
      requireCompanyManager,
      ProjectsValidator.validateCreateProject(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').createProject(req, res, next)
    );

    // GET /api/v1/projects - list projects for company
    this._router.get(
      '/',
      authenticateToken,
      requireActiveUser,
      ProjectsValidator.validateListProjects(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').listProjects(req, res, next)
    );

    // GET /api/v1/projects/:project_id - project detail
    this._router.get(
      '/:project_id',
      authenticateToken,
      requireActiveUser,
      ProjectsValidator.validateProjectIdParam(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').getProjectDetail(req, res, next)
    );

    // GET /api/v1/projects/:project_id/tasks - tasks for a project
    this._router.get(
      '/:project_id/tasks',
      authenticateToken,
      requireActiveUser,
      ProjectsValidator.validateProjectTasksQuery(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').getProjectTasks(req, res, next)
    );

    // GET /api/v1/projects/:project_id/members - project members
    this._router.get(
      '/:project_id/members',
      authenticateToken,
      requireActiveUser,
      ProjectsValidator.validateProjectIdParam(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').getProjectMembers(req, res, next)
    );

    // PATCH /api/v1/projects/:project_id - update project (manager only)
    this._router.patch(
      '/:project_id',
      authenticateToken,
      requireActiveUser,
      requireCompanyManager,
      ProjectsValidator.validateUpdateProject(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').updateProject(req, res, next)
    );

    // POST /api/v1/projects/:project_id/tasks - create task under project (manager only)
    this._router.post(
      '/:project_id/tasks',
      authenticateToken,
      requireActiveUser,
      requireCompanyManager,
      ProjectsValidator.validateCreateTaskInProject(),
      (req, res, next) => resolve<ProjectsController>('ProjectsController').createTaskInProject(req, res, next)
    );
  }
}
