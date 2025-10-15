import { Router } from 'express';
import type { MembersController } from './controllers/members.controller';
import { authenticateToken, requireActiveUser, requireCompanyManager } from '@modules/auth/middleware/auth.middleware';
import { MembersValidator } from './validators/members.validator';
import { resolve } from '@core/container';

export class MembersModule {
  private static _instance: MembersModule;
  private _router: Router;

  private constructor() {
    this.initializeRoutes();
  }

  public static getInstance(): MembersModule {
    if (!MembersModule._instance) MembersModule._instance = new MembersModule();
    return MembersModule._instance;
  }

  get router() { return this._router; }

  private initializeRoutes() {
    this._router = Router();

    // GET /api/v1/members
    this._router.get(
      '/',
      authenticateToken,
      requireActiveUser,
      MembersValidator.validateListCompanyMembers(),
      (req, res, next) => resolve<MembersController>('MembersController').listCompanyMembers(req, res, next)
    );

    // GET /api/v1/members/pending
    this._router.get(
      '/pending',
      authenticateToken,
      requireActiveUser,
      requireCompanyManager,
      (req, res, next) => resolve<MembersController>('MembersController').listPendingMembers(req, res, next)
    );

    // GET /api/v1/members/projects/:project_id - moved from app.ts
    this._router.get(
      '/projects/:project_id',
      authenticateToken,
      requireActiveUser,
      MembersValidator.validateGetProjectMembers(),
      (req, res, next) => resolve<MembersController>('MembersController').getProjectMembers(req, res, next)
    );
  }
}
