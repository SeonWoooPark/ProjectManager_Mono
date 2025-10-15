import { useQuery } from '@tanstack/react-query';
import { membersService } from './membersService';
import type { MembersListResponse, ProjectMembersPayload, PendingMembersResponse } from '@/types/members.types';

export const membersQueryKeys = {
  all: ['members'] as const,
  list: (params?: { status_id?: number; role_id?: number }) =>
    [...membersQueryKeys.all, 'list', params] as const,
  projectMembers: (projectId: string) => [...membersQueryKeys.all, 'project', projectId] as const,
  pending: () => [...membersQueryKeys.all, 'pending'] as const,
};

export const useCompanyMembers = (params?: { status_id?: number; role_id?: number }) => {
  return useQuery<MembersListResponse, Error>({
    queryKey: membersQueryKeys.list(params),
    queryFn: () => membersService.listCompanyMembers(params),
  });
};

export const useProjectMembers = (projectId: string) => {
  return useQuery<ProjectMembersPayload, Error>({
    queryKey: membersQueryKeys.projectMembers(projectId),
    queryFn: () => membersService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
};

export const usePendingMembers = () => {
  return useQuery<PendingMembersResponse, Error>({
    queryKey: membersQueryKeys.pending(),
    queryFn: () => membersService.listPendingMembers(),
  });
};
