import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from './projectsService';
import { projectsQueryKeys } from './projectsQueries';
import { tasksQueryKeys } from '../tasks/tasksQueries';
import type { CreateTaskDto, TaskDto } from '@/types/tasks.types';
import type { SuccessResponse } from '@/types/auth.types';

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

      // 할당된 작업 목록도 무효화 (내 작업 페이지 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: tasksQueryKeys.all,
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SuccessResponse<{ message: string }>,
    Error,
    string
  >({
    mutationFn: (projectId: string) => projectsService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      // 캐시에서 프로젝트 상세 제거
      queryClient.removeQueries({
        queryKey: projectsQueryKeys.detail(projectId),
      });

      // 프로젝트 작업 목록 제거
      queryClient.removeQueries({
        queryKey: projectsQueryKeys.tasks(projectId),
      });

      // 프로젝트 멤버 목록 제거
      queryClient.removeQueries({
        queryKey: projectsQueryKeys.members(projectId),
      });

      // 프로젝트 목록 무효화
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.all,
      });

      // 할당된 작업 목록도 무효화 (삭제된 프로젝트의 작업 제거를 위해)
      queryClient.invalidateQueries({
        queryKey: tasksQueryKeys.all,
      });
    },
  });
};
