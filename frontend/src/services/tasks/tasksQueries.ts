import { useQuery } from '@tanstack/react-query';
import { tasksService } from './tasksService';
import type { AssignedTasksResponse } from '@/types/tasks.types';

export const tasksQueryKeys = {
  all: ['tasks'] as const,
  assigned: (params?: { status_id?: number; project_id?: string }) =>
    [...tasksQueryKeys.all, 'assigned', params] as const,
};

export const useAssignedTasks = (params?: { status_id?: number; project_id?: string }) => {
  return useQuery<AssignedTasksResponse, Error>({
    queryKey: tasksQueryKeys.assigned(params),
    queryFn: () => tasksService.listAssigned(params),
  });
};
