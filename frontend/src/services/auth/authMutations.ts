import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { authService } from './authService';
import { useAuthStore } from '@/store/authStore';
import type {
  LoginRequestDto,
  CompanyManagerSignupDto,
  TeamMemberSignupDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ApproveCompanyDto,
  ApproveMemberDto,
} from '@/types/auth.types';

// =============================================
// 로그인 / 로그아웃 Hooks
// =============================================

/**
 * 로그인 훅
 */
export const useLogin = () => {
  // const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequestDto) => authService.login(data),
    onSuccess: (data) => {
      console.log('data', data);
      // Auth 상태 설정
      setAuth(data.user, data.access_token);

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // 성공 메시지
      toast({
        title: '로그인 성공',
        description: `환영합니다, ${data.user.user_name}님!`,
      });

      // // 역할별 리다이렉트
      // switch (data.user.role_id) {
      //   case 1: // SYSTEM_ADMIN
      //     navigate('/admin/system');
      //     break;
      //   case 2: // COMPANY_MANAGER
      //     if (data.user.company && !data.user.company.is_approved) {
      //       navigate('/auth/pending-approval');
      //     } else {
      //       navigate('/admin/company');
      //     }
      //     break;
      //   case 3: // TEAM_MEMBER
      //     if (data.user.status_id === 3) {
      //       // PENDING
      //       navigate('/auth/pending-approval');
      //     } else {
      //       navigate('/dashboard/member');
      //     }
      //     break;
      //   default:
      //     // navigate('/auth/login');
      //     break;
      // }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message;
      const errorCode = error.response?.data?.code;

      if (errorCode === 'INVALID_CREDENTIALS') {
        toast({
          title: '로그인 실패',
          description: '이메일 또는 비밀번호가 올바르지 않습니다.',
          variant: 'destructive',
        });
      } else if (errorCode === 'USER_INACTIVE') {
        toast({
          title: '계정 비활성화',
          description: '계정이 비활성화되었습니다. 관리자에게 문의하세요.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '로그인 실패',
          description: errorMessage || '로그인에 실패했습니다.',
          variant: 'destructive',
        });
      }
    },
  });
};

/**
 * 로그아웃 훅
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // 상태 초기화
      logout();

      // 모든 캐시 클리어
      queryClient.clear();

      // 성공 메시지
      toast({
        title: '로그아웃',
        description: '안전하게 로그아웃되었습니다.',
      });

      // 로그인 페이지로 이동
      navigate('/auth/login');
    },
    onError: () => {
      // 에러가 발생해도 로컬 상태는 클리어
      logout();
      queryClient.clear();
      navigate('/auth/login');
    },
  });
};

// =============================================
// 회원가입 Hooks
// =============================================

/**
 * 회사 관리자 회원가입 훅
 */
export const useSignupCompanyManager = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CompanyManagerSignupDto) => authService.signupCompanyManager(data),
    onSuccess: () => {
      toast({
        title: '회원가입 완료',
        description: '회사 승인 대기중입니다. 승인 후 로그인 가능합니다.',
      });
      navigate('/auth/pending-approval');
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message;

      if (errorCode === 'EMAIL_ALREADY_EXISTS') {
        toast({
          title: '이메일 중복',
          description: '이미 사용중인 이메일입니다.',
          variant: 'destructive',
        });
      } else if (errorCode === 'COMPANY_NAME_EXISTS') {
        toast({
          title: '회사명 중복',
          description: '이미 등록된 회사명입니다.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '회원가입 실패',
          description: errorMessage || '회원가입에 실패했습니다.',
          variant: 'destructive',
        });
      }
    },
  });
};

/**
 * 팀원 회원가입 훅
 */
export const useSignupTeamMember = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: TeamMemberSignupDto) => authService.signupTeamMember(data),
    onSuccess: () => {
      toast({
        title: '회원가입 완료',
        description: '관리자 승인 대기중입니다. 승인 후 로그인 가능합니다.',
      });
      navigate('/auth/pending-approval');
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = error.response?.data?.error?.message;

      if (errorCode === 'INVALID_INVITATION_CODE') {
        toast({
          title: '초대 코드 오류',
          description: '유효하지 않은 초대 코드입니다.',
          variant: 'destructive',
        });
      } else if (errorCode === 'EMAIL_ALREADY_EXISTS') {
        toast({
          title: '이메일 중복',
          description: '이미 사용중인 이메일입니다.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '회원가입 실패',
          description: errorMessage || '회원가입에 실패했습니다.',
          variant: 'destructive',
        });
      }
    },
  });
};

// =============================================
// 비밀번호 재설정 Hooks
// =============================================

/**
 * 비밀번호 재설정 요청 훅
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
    onSuccess: () => {
      toast({
        title: '이메일 전송 완료',
        description: '비밀번호 재설정 링크를 이메일로 전송했습니다.',
      });
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = error.response?.data?.error?.message;

      if (errorCode === 'USER_NOT_FOUND') {
        toast({
          title: '사용자 없음',
          description: '해당 이메일로 등록된 사용자가 없습니다.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '전송 실패',
          description: errorMessage || '이메일 전송에 실패했습니다.',
          variant: 'destructive',
        });
      }
    },
  });
};

/**
 * 비밀번호 재설정 훅
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),
    onSuccess: () => {
      toast({
        title: '비밀번호 변경 완료',
        description: '새로운 비밀번호로 로그인해주세요.',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = error.response?.data?.error?.message;

      if (errorCode === 'INVALID_TOKEN') {
        toast({
          title: '토큰 오류',
          description: '유효하지 않거나 만료된 토큰입니다.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '변경 실패',
          description: errorMessage || '비밀번호 변경에 실패했습니다.',
          variant: 'destructive',
        });
      }
    },
  });
};

// =============================================
// 승인 Hooks (관리자용)
// =============================================

/**
 * 회사 승인/거부 훅 (시스템 관리자용)
 */
export const useApproveCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveCompanyDto) => authService.approveCompany(data),
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });

      toast({
        title: variables.is_approved ? '승인 완료' : '거부 완료',
        description: `회사 ${variables.is_approved ? '승인' : '거부'} 처리가 완료되었습니다.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message;
      toast({
        title: '처리 실패',
        description: errorMessage || '승인/거부 처리에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * 팀원 승인/거부 훅 (회사 관리자용)
 */
export const useApproveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveMemberDto) => authService.approveMember(data),
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['pending-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });

      toast({
        title: variables.is_approved ? '승인 완료' : '거부 완료',
        description: `팀원 ${variables.is_approved ? '승인' : '거부'} 처리가 완료되었습니다.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message;
      toast({
        title: '처리 실패',
        description: errorMessage || '승인/거부 처리에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
};

// =============================================
// 유틸리티 Hooks
// =============================================

/**
 * 이메일 중복 확인 훅
 */
export const useCheckEmail = () => {
  return useMutation({
    mutationFn: (email: string) => authService.checkEmailAvailability(email),
  });
};

/**
 * 초대 코드 검증 훅
 */
export const useValidateInvitationCode = () => {
  return useMutation({
    mutationFn: (code: string) => authService.validateInvitationCode(code),
  });
};
