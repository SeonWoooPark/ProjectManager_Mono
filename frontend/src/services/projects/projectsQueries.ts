import { useQuery } from '@tanstack/react-query';
import { projectsService } from './projectsService';
import type {
  ProjectListResponse,
  ProjectTasksFilters,
  ProjectTasksResponse,
  ProjectMembersResponse,
  ProjectDetail,
} from '@/types/projects.types';

export const projectsQueryKeys = {
  all: ['projects'] as const,
  list: (params?: { page?: number; limit?: number; status_id?: number }) =>
    [...projectsQueryKeys.all, 'list', params] as const,
  detail: (projectId: string) => [...projectsQueryKeys.all, 'detail', projectId] as const,
  tasks: (projectId: string, filters?: ProjectTasksFilters) =>
    [...projectsQueryKeys.all, 'tasks', projectId, filters] as const,
  members: (projectId: string) => [...projectsQueryKeys.all, 'members', projectId] as const,
};

export const useProjects = (params?: { page?: number; limit?: number; status_id?: number }) => {
  return useQuery<ProjectListResponse, Error>({
    queryKey: projectsQueryKeys.list(params),
    queryFn: () => projectsService.listProjects(params),
  });
};

export const useProjectDetail = (projectId: string) => {
  return useQuery<ProjectDetail, Error>({
    queryKey: projectsQueryKeys.detail(projectId),
    queryFn: () => projectsService.getProjectDetail(projectId),
    enabled: !!projectId,
  });
};

export const useProjectTasks = (projectId: string, filters?: ProjectTasksFilters) => {
  return useQuery<ProjectTasksResponse, Error>({
    queryKey: projectsQueryKeys.tasks(projectId, filters),
    queryFn: () => projectsService.getProjectTasks(projectId, filters),
    enabled: !!projectId,
  });
};

export const useProjectMembers = (projectId: string) => {
  return useQuery<ProjectMembersResponse, Error>({
    queryKey: projectsQueryKeys.members(projectId),
    queryFn: () => projectsService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
};
