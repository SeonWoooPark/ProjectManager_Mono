import { Response } from 'express';
import { AuthenticatedRequest } from '@modules/auth/interfaces/auth.types';
import { ResponseFormatter } from '@shared/utils/response';
import { TasksService } from '../services/tasks.service';
import { injectable, inject } from 'tsyringe';

@injectable()
export class TasksController {
  constructor(@inject('TasksService') private service: TasksService) {}

  async listAssigned(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { status_id, project_id } = req.query as any;
      const result = await this.service.listAssigned(user, {
        status_id: status_id ? parseInt(status_id) : undefined,
        project_id: project_id as string | undefined,
      });
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async changeStatus(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { task_id: taskId } = req.params;
      const result = await this.service.changeStatus(user, taskId, req.body);
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async updateTask(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { task_id: taskId } = req.params;
      const result = await this.service.updateTask(user, taskId, req.body);
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }
}
