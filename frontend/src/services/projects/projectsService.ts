import api from '@/services/api';
import type {
  ProjectListResponse,
  ProjectTasksFilters,
  ProjectTasksResponse,
  ProjectMembersResponse,
  ProjectDetail,
} from '@/types/projects.types';
import type { SuccessResponse } from '@/types/auth.types';
import type { CreateTaskDto, TaskDto } from '@/types/tasks.types';

export const projectsService = {
  async listProjects(params?: { page?: number; limit?: number; status_id?: number }) {
    const response = await api.get<SuccessResponse<ProjectListResponse>>('/projects', {
      params,
    });
    return response.data.data;
  },

  async getProjectDetail(projectId: string) {
    const response = await api.get<SuccessResponse<{ project: ProjectDetail }>>(
      `/projects/${projectId}`
    );
    return response.data.data.project;
  },

  async getProjectTasks(projectId: string, params?: ProjectTasksFilters) {
    const response = await api.get<SuccessResponse<ProjectTasksResponse>>(
      `/projects/${projectId}/tasks`,
      { params }
    );
    return response.data.data;
  },

  async getProjectMembers(projectId: string) {
    const response = await api.get<SuccessResponse<ProjectMembersResponse>>(
      `/projects/${projectId}/members`
    );
    return response.data.data;
  },
  async createProject(payload: {
    project_name: string;
    project_description?: string;
    start_date: string;
    end_date: string;
    member_ids?: string[];
  }) {
    const response = await api.post<SuccessResponse<ProjectDetail>>('/projects', {
      project_name: payload.project_name,
      project_description: payload.project_description,
      start_date: payload.start_date,
      end_date: payload.end_date,
      member_ids: payload.member_ids ?? [],
    });
    return response.data.data;
  },

  async updateProject(
    projectId: string,
    payload: {
      project_name?: string;
      project_description?: string;
      end_date?: string;
      status_id?: number;
      progress_rate?: number;
      member_ids_to_add?: string[];
      member_ids_to_remove?: string[];
    }
  ) {
    const response = await api.patch<SuccessResponse<ProjectDetail>>(
      `/projects/${projectId}`,
      payload
    );
    return response.data.data;
  },

  async createTask(projectId: string, payload: CreateTaskDto) {
    const response = await api.post<SuccessResponse<TaskDto>>(
      `/projects/${projectId}/tasks`,
      payload
    );
    return response.data.data;
  },
};
