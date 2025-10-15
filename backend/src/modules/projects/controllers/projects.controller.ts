import { Response } from 'express';
import { AuthenticatedRequest } from '@modules/auth/interfaces/auth.types';
import { ProjectsService } from '../services/projects.service';
import { ResponseFormatter } from '@shared/utils/response';
import { injectable, inject } from 'tsyringe';

@injectable()
export class ProjectsController {
  constructor(@inject('ProjectsService') private service: ProjectsService) {}

  async createProject(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const result = await this.service.createProject(user, req.body);
      return ResponseFormatter.created(res, result);
    } catch (err) {
      next(err);
    }
  }

  async listProjects(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { page, limit, status_id } = req.query as any;
      const result = await this.service.listProjects(user, {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        status_id: status_id ? parseInt(status_id) : undefined,
      });
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getProjectDetail(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { project_id: projectId } = req.params;
      const result = await this.service.getProjectDetail(user, projectId);
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getProjectTasks(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { project_id: projectId } = req.params;
      const { status_id, assignee_id } = req.query as any;
      const result = await this.service.getProjectTasks(user, projectId, {
        status_id: status_id ? parseInt(status_id) : undefined,
        assignee_id: assignee_id as string | undefined,
      });
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { project_id: projectId } = req.params;
      const result = await this.service.updateProject(user, projectId, req.body);
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createTaskInProject(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { project_id: projectId } = req.params;
      const result = await this.service.createTaskInProject(user, projectId, req.body);
      return ResponseFormatter.created(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getProjectMembers(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { project_id: projectId } = req.params;
      const result = await this.service.getProjectMembers(user, projectId);
      return ResponseFormatter.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response, next: Function): Promise<any> {
    try {
      const user = req.user!;
      const { project_id: projectId } = req.params;
      await this.service.deleteProject(user, projectId);
      return ResponseFormatter.success(res, {
        message: '프로젝트가 삭제되었습니다'
      });
    } catch (err) {
      next(err);
    }
  }
}
