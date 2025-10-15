import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from './projectsService';
import { projectsQueryKeys } from './projectsQueries';
import { tasksQueryKeys } from '../tasks/tasksQueries';
import { membersQueryKeys } from '../members/membersQueries';
import type { CreateTaskDto, TaskDto } from '@/types/tasks.types';
import type { SuccessResponse } from '@/types/auth.types';
import type { ProjectDetail } from '@/types/projects.types';

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

      // 멤버 목록 무효화 (작업 담당자 할당 시 업데이트)
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.all,
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

      // 멤버 목록 무효화 (프로젝트 삭제 시 할당 해제)
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.all,
      });
    },
  });
};

/**
 * 프로젝트 생성 mutation
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectDetail,
    Error,
    {
      project_name: string;
      project_description?: string;
      start_date: string;
      end_date: string;
      member_ids?: string[];
    }
  >({
    mutationFn: (data) => projectsService.createProject(data),
    onSuccess: () => {
      // 프로젝트 목록 무효화
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.all,
      });

      // 멤버 목록 무효화 (프로젝트에 할당된 멤버 정보 업데이트)
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.all,
      });
    },
  });
};

/**
 * 프로젝트 수정 mutation
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProjectDetail,
    Error,
    {
      projectId: string;
      data: {
        project_name?: string;
        project_description?: string;
        end_date?: string;
        status_id?: number;
        progress_rate?: number;
        member_ids_to_add?: string[];
        member_ids_to_remove?: string[];
      };
    }
  >({
    mutationFn: ({ projectId, data }) => projectsService.updateProject(projectId, data),
    onSuccess: (updatedProject, variables) => {
      // 서버 응답으로 프로젝트 상세 캐시 즉시 업데이트
      queryClient.setQueryData(
        projectsQueryKeys.detail(variables.projectId),
        updatedProject
      );

      // 프로젝트 목록 무효화
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.all,
      });

      // 프로젝트 멤버 무효화
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.members(variables.projectId),
      });

      // 멤버 목록 무효화 (멤버 추가/제거 시 업데이트)
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.all,
      });
    },
  });
};
