import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from './projectsService';
import { projectsQueryKeys } from './projectsQueries';
import type { CreateTaskDto, TaskDto } from '@/types/tasks.types';

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    TaskDto,
    Error,
    { projectId: string; data: CreateTaskDto }
  >({
    mutationFn: ({ projectId, data }) => projectsService.createTask(projectId, data),
    onSuccess: (_, variables) => {
      // 프로젝트의 작업 목록 무효화 (올바른 쿼리 키 사용)
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.tasks(variables.projectId),
      });

      // 프로젝트 상세 정보도 무효화 (진행률 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.detail(variables.projectId),
      });

      // 전체 프로젝트 목록도 무효화 (작업 수 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.list(),
      });
    },
  });
};
