import { useQuery } from '@tanstack/react-query';
import { authService } from './authService';
import { useAuthStore } from '@/store/authStore';

// =============================================
// Query Keys
// =============================================

export const authQueryKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authQueryKeys.all, 'currentUser'] as const,
  emailCheck: (email: string) => [...authQueryKeys.all, 'emailCheck', email] as const,
  invitationCode: (code: string) => [...authQueryKeys.all, 'invitationCode', code] as const,
  resetToken: (token: string) => [...authQueryKeys.all, 'resetToken', token] as const,
};

// =============================================
// User Queries
// =============================================

/**
 * 현재 사용자 정보 조회
 */
export const useCurrentUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1,
  });
};

// =============================================
// Validation Queries
// =============================================

/**
 * 이메일 사용 가능 여부 확인
 */
export const useEmailAvailability = (email: string) => {
  return useQuery({
    queryKey: authQueryKeys.emailCheck(email),
    queryFn: () => authService.checkEmailAvailability(email),
    enabled: !!email && email.includes('@'),
    staleTime: 30 * 1000, // 30초
    gcTime: 60 * 1000, // 1분
  });
};

/**
 * 초대 코드 유효성 확인
 */
export const useInvitationCodeValidation = (code: string) => {
  return useQuery({
    queryKey: authQueryKeys.invitationCode(code),
    queryFn: () => authService.validateInvitationCode(code),
    enabled: !!code && code.length >= 6,
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 비밀번호 재설정 토큰 검증
 */
export const useResetTokenValidation = (token: string) => {
  return useQuery({
    queryKey: authQueryKeys.resetToken(token),
    queryFn: () => authService.verifyResetToken(token),
    enabled: !!token,
    staleTime: 0, // 항상 재검증
    gcTime: 0, // 캐시하지 않음
    retry: false,
  });
};