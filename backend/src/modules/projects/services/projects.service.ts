import { AuthenticatedRequest } from '@modules/auth/interfaces/auth.types';
import { ProjectsRepository } from '../repositories/projects.repository';
import { ValidationError, AuthorizationError, NotFoundError } from '@shared/utils/errors';
import { DateValidator, RangeValidator, IdValidator } from '@shared/utils/dbConstraints';
import { injectable, inject } from 'tsyringe';

interface PaginationArgs { page: number; limit: number; status_id?: number }

@injectable()
export class ProjectsService {
  constructor(@inject('ProjectsRepository') private repo: ProjectsRepository) {}

  async createProject(user: NonNullable<AuthenticatedRequest['user']>, body: any) {
    if (!user.company_id) throw new AuthorizationError('소속 회사가 없습니다');

    const { project_name, project_description, start_date, end_date, member_ids } = body;

    if (!project_name || !start_date || !end_date) {
      throw new ValidationError('필수 필드가 누락되었습니다', 'project', 'required_fields');
    }

    const dateCheck = DateValidator.validateDateRange(start_date, end_date);
    if (!dateCheck.valid) throw new ValidationError(dateCheck.errors.join(', '));

    if (member_ids && Array.isArray(member_ids)) {
      for (const id of member_ids) {
        const r = IdValidator.validateUserId(id);
        if (!r.valid) throw new ValidationError(r.errors.join(', '));
      }
    }

    return this.repo.createProject(user.company_id, user.id, {
      project_name,
      project_description: project_description || null,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      member_ids: member_ids || [],
    });
  }

  async listProjects(user: NonNullable<AuthenticatedRequest['user']>, args: PaginationArgs) {
    if (!user.company_id && user.role_id !== 1) throw new AuthorizationError('회사 식별 불가');

    const page = Math.max(1, args.page || 1);
    const limit = Math.min(100, Math.max(1, args.limit || 20));
    return this.repo.listProjects(user, { page, limit, status_id: args.status_id });
  }

  async getProjectDetail(user: NonNullable<AuthenticatedRequest['user']>, projectId: string) {
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));
    const detail = await this.repo.getProjectDetail(user, projectId);
    if (!detail) throw new NotFoundError('프로젝트를 찾을 수 없습니다');
    return detail;
  }

  async getProjectTasks(
    user: NonNullable<AuthenticatedRequest['user']>,
    projectId: string,
    filters: { status_id?: number; assignee_id?: string }
  ) {
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));
    if (filters.assignee_id) {
      const r = IdValidator.validateUserId(filters.assignee_id);
      if (!r.valid) throw new ValidationError(r.errors.join(', '));
    }
    return this.repo.getProjectTasks(user, projectId, filters);
  }

  async updateProject(
    user: NonNullable<AuthenticatedRequest['user']>,
    projectId: string,
    body: any
  ) {
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));

    if (body.progress_rate !== undefined) {
      const pr = RangeValidator.validateProgressRate(Number(body.progress_rate));
      if (!pr.valid) throw new ValidationError(pr.errors.join(', '));
    }

    // 날짜 검증 - start_date와 end_date가 둘 다 있는 경우
    if (body.start_date && body.end_date) {
      const dateCheck = DateValidator.validateDateRange(body.start_date, body.end_date);
      if (!dateCheck.valid) throw new ValidationError(dateCheck.errors.join(', '));
    }

    // end_date만 변경되는 경우 - DB에서 start_date를 가져와서 검증
    if (body.end_date && !body.start_date) {
      await this.repo.assertProjectEndDateValid(projectId, new Date(body.end_date));
    }

    const toAdd: string[] = body.member_ids_to_add || [];
    const toRemove: string[] = body.member_ids_to_remove || [];
    for (const id of [...toAdd, ...toRemove]) {
      const r = IdValidator.validateUserId(id);
      if (!r.valid) throw new ValidationError(r.errors.join(', '));
    }

    return this.repo.updateProject(user, projectId, body);
  }

  async createTaskInProject(
    user: NonNullable<AuthenticatedRequest['user']>,
    projectId: string,
    body: any
  ) {
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));

    const { task_name, task_description, assignee_id, start_date, end_date } = body;
    if (!task_name || !assignee_id || !start_date || !end_date) {
      throw new ValidationError('필수 필드가 누락되었습니다', 'task', 'required_fields');
    }

    const idCheck = IdValidator.validateUserId(assignee_id);
    if (!idCheck.valid) throw new ValidationError(idCheck.errors.join(', '));

    const dateCheck = DateValidator.validateDateRange(start_date, end_date);
    if (!dateCheck.valid) throw new ValidationError(dateCheck.errors.join(', '));

    return this.repo.createTaskInProject(user, projectId, {
      task_name,
      task_description: task_description || null,
      assignee_id,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });
  }

  async getProjectMembers(user: NonNullable<AuthenticatedRequest['user']>, projectId: string) {
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));
    return this.repo.getProjectMembers(user, projectId);
  }

  async deleteProject(
    user: NonNullable<AuthenticatedRequest['user']>,
    projectId: string
  ) {
    // 1. ID 형식 검증
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));

    // 2. 권한 검증: TEAM_MEMBER(3)는 삭제 불가
    if (user.role_id === 3) {
      throw new AuthorizationError('프로젝트 삭제 권한이 없습니다');
    }

    // 3. Repository 호출
    await this.repo.deleteProject(user, projectId);
  }
}
