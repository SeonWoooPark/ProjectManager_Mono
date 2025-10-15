import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from './membersService';
import { membersQueryKeys } from './membersQueries';
import type { UpdateMemberStatusDto, UpdateMemberProfileDto, MemberDto } from '@/types/members.types';
import { useToast } from '@/components/ui/use-toast';

/**
 * 사용자 활성 상태를 변경하는 mutation
 * - ACTIVE (1) ↔ INACTIVE (2) 전환
 * - 권한: SYSTEM_ADMIN, COMPANY_MANAGER (동일 회사)
 */
export const useUpdateMemberStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<MemberDto, Error, UpdateMemberStatusDto>({
    mutationFn: (data: UpdateMemberStatusDto) => membersService.updateMemberStatus(data),
    onSuccess: (data) => {
      // 관련 쿼리 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });

      const statusText = data.status_id === 1 ? '활성화' : '비활성화';
      toast({
        title: '상태 변경 완료',
        description: `${data.user_name}님의 계정이 ${statusText}되었습니다.`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '상태 변경 실패',
        description: error.message || '사용자 상태를 변경할 수 없습니다.',
      });
    },
  });
};

/**
 * 사용자 프로필을 수정하는 mutation
 * - 이름, 전화번호, 이메일 수정 가능
 * - 권한: SYSTEM_ADMIN, COMPANY_MANAGER (동일 회사) 또는 본인
 */
export const useUpdateMemberProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<MemberDto, Error, UpdateMemberProfileDto>({
    mutationFn: (data: UpdateMemberProfileDto) => membersService.updateMemberProfile(data),
    onSuccess: (data) => {
      // 관련 쿼리 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.all });

      toast({
        title: '프로필 수정 완료',
        description: `${data.user_name}님의 프로필이 업데이트되었습니다.`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: '프로필 수정 실패',
        description: error.message || '프로필을 수정할 수 없습니다.',
      });
    },
  });
};
