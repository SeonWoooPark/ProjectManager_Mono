import { Response } from 'express';
import { AuthenticatedRequest } from '@modules/auth/interfaces/auth.types';
import { MembersService } from '../services/members.service';
import { ResponseFormatter } from '@shared/utils/response';
import { injectable, inject } from 'tsyringe';

@injectable()
export class MembersController {
  constructor(@inject('MembersService') private service: MembersService) {}

  async listCompanyMembers(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const { status_id, role_id } = req.query as any;
      const result = await this.service.listCompanyMembers(user, {
        status_id: status_id ? parseInt(status_id) : undefined,
        role_id: role_id ? parseInt(role_id) : undefined,
      });
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async listPendingMembers(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const user = req.user!;
      const result = await this.service.listPendingMembers(user);
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }
}
