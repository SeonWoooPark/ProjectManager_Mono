import { AuthenticatedRequest } from '@modules/auth/interfaces/auth.types';
import { TasksRepository } from '../repositories/tasks.repository';
import { ValidationError, AuthorizationError } from '@shared/utils/errors';
import { IdValidator, RangeValidator, DateValidator } from '@shared/utils/dbConstraints';
import { injectable, inject } from 'tsyringe';

@injectable()
export class TasksService {
  constructor(@inject('TasksRepository') private repo: TasksRepository) {}

  async listAssigned(
    user: NonNullable<AuthenticatedRequest['user']>,
    filters: { status_id?: number; project_id?: string }
  ) {
    if (filters.project_id) {
      const r = IdValidator.validateProjectId(filters.project_id);
      if (!r.valid) throw new ValidationError(r.errors.join(', '));
    }
    return this.repo.listAssigned(user, filters);
  }

  async changeStatus(
    user: NonNullable<AuthenticatedRequest['user']>,
    taskId: string,
    body: { status_id: number; comment?: string }
  ) {
    const r = /^tsk_[a-zA-Z0-9]{6,}$/.test(taskId);
    if (!r) throw new ValidationError('올바른 taskId 형식이 아닙니다');
    if (!body || typeof body.status_id !== 'number') throw new ValidationError('status_id 필요');

    return this.repo.changeStatus(user, taskId, body.status_id, body.comment);
  }

  async updateTask(
    user: NonNullable<AuthenticatedRequest['user']>,
    taskId: string,
    body: any
  ) {
    const r = /^tsk_[a-zA-Z0-9]{6,}$/.test(taskId);
    if (!r) throw new ValidationError('올바른 taskId 형식이 아닙니다');

    if (body.progress_rate !== undefined) {
      const pr = RangeValidator.validateProgressRate(Number(body.progress_rate));
      if (!pr.valid) throw new ValidationError(pr.errors.join(', '));
    }

    if (body.assignee_id) {
      const idr = IdValidator.validateUserId(body.assignee_id);
      if (!idr.valid) throw new ValidationError(idr.errors.join(', '));
    }

    if (body.end_date) {
      const dv = DateValidator.validateDateRange(body.start_date || null, body.end_date);
      if (!dv.valid) throw new ValidationError(dv.errors.join(', '));
    }

    return this.repo.updateTask(user, taskId, body);
  }
}
