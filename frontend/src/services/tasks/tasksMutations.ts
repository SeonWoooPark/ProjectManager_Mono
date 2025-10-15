import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from './tasksService';
import { tasksQueryKeys } from './tasksQueries';
import { projectsQueryKeys } from '../projects/projectsQueries';
import { membersQueryKeys } from '../members/membersQueries';
import { toast } from '@/components/ui/use-toast';
import type { UpdateTaskDto, UpdatedTaskDto } from '@/types/tasks.types';

// =============================================
// 작업 수정 Hook
// =============================================

/**
 * 작업 정보 수정 훅
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatedTaskDto,
    Error,
    { taskId: string; data: UpdateTaskDto }
  >({
    mutationFn: ({ taskId, data }) => tasksService.updateTask(taskId, data),
    onSuccess: (data) => {
      // 할당된 작업 목록 무효화
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });

      // 프로젝트 관련 쿼리 무효화 (진행률 업데이트)
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.detail(data.project_id)
      });
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.tasks(data.project_id)
      });

      // 멤버 목록 무효화 (작업 담당자 변경 시 업데이트)
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.all,
      });

      toast({
        title: '작업 수정 완료',
        description: '작업 정보가 성공적으로 수정되었습니다.',
      });
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = error.response?.data?.error?.message;

      if (errorCode === 'FORBIDDEN') {
        toast({
          title: '권한 없음',
          description: '작업 수정 권한이 없습니다.',
          variant: 'destructive',
        });
      } else if (errorCode === 'NOT_FOUND') {
        toast({
          title: '작업 없음',
          description: '해당 작업을 찾을 수 없습니다.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '수정 실패',
          description: errorMessage || '작업 수정에 실패했습니다.',
          variant: 'destructive',
        });
      }
    },
  });
};

// =============================================
// 작업 상태 변경 Hook
// =============================================

/**
 * 작업 상태 변경 훅
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      statusId,
      comment
    }: {
      taskId: string;
      statusId: number;
      comment?: string
    }) => {
      return tasksService.updateStatus(taskId, statusId, comment);
    },
    onSuccess: () => {
      toast({
        title: '작업 상태가 업데이트되었습니다.'
      });

      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });

      // 멤버 목록 무효화 (작업 상태 변경 시 통계 업데이트)
      queryClient.invalidateQueries({
        queryKey: membersQueryKeys.all,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message;
      toast({ 
        title: '작업 상태 변경에 실패했습니다.', 
        description: errorMessage,
        variant: 'destructive' 
      });
    },
  });
};
