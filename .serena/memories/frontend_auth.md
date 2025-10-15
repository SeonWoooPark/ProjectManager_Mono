# Auth API 프론트엔드 연동 구현 계획서

## 현황 분석 결과

### ✅ 이미 구비된 요소
- React Query (@tanstack/react-query) 설치 및 설정 완료
- Zustand 상태 관리 라이브러리 설치 완료  
- shadcn/ui 컴포넌트 완전 설치 (form, button, input, toast 등)
- Auth 관련 페이지 컴포넌트 존재 (Login, Signup, CompanySetup, JoinCompany)
- Axios 기반 API 클라이언트 구성

### ❌ 발견된 문제점
1. **보안 취약점**: RefreshToken을 localStorage에 저장 (백엔드는 HttpOnly Cookie 사용)
2. **API 엔드포인트 불일치**: 백엔드와 프론트엔드 경로가 전혀 다름
3. **DTO 구조 불일치**: 요청/응답 데이터 구조가 백엔드와 맞지 않음
4. **React Query 미활용**: 훅이 구현되지 않아 캐싱/동기화 이점 없음
5. **로직 미분리**: 비즈니스 로직과 뷰 로직이 섞여있음

## 구현 우선순위

### Phase 1: 기반 구조 개선 (필수)
### Phase 2: 핵심 Auth 기능 (로그인/로그아웃)
### Phase 3: 회원가입 기능
### Phase 4: 비밀번호 재설정
### Phase 5: 승인 기능 (API만)

## 각 Phase별 상세 구현 계획

### Phase 1: 기반 구조 개선

#### 1.1 타입 정의 (types/auth.types.ts)
```typescript
// User 관련
interface User {
  user_id: number;
  email: string;
  user_name: string;
  phone_number: string;
  role_id: 1 | 2 | 3; // SYSTEM_ADMIN | COMPANY_MANAGER | TEAM_MEMBER
  status_id: 1 | 2 | 3; // ACTIVE | INACTIVE | PENDING
  company_id?: number;
  company?: Company;
  role?: Role;
  status?: Status;
}

// 회원가입 DTO
interface CompanyManagerSignupDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  company: {
    company_name: string;
    company_description?: string;
  };
}

interface TeamMemberSignupDto {
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  invitation_code: string;
}

// 로그인 DTO
interface LoginRequestDto {
  email: string;
  password: string;
}

interface LoginResponseDto {
  user: User;
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}
```

#### 1.2 API 클라이언트 수정 (services/api.ts)
```typescript
// Cookie 기반 refresh token 처리
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Cookie는 자동으로 전송됨, withCredentials 필요
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { access_token } = response.data.data;
        
        useAuthStore.setState({ accessToken: access_token });
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

#### 1.3 Store 수정 (store/authStore.ts)
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // refreshToken 제거 (Cookie로 관리)
  
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),
      
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
        
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        // accessToken은 메모리에만 저장
      }),
    }
  )
);
```

### Phase 2: 핵심 Auth 기능

#### 2.1 Auth Service (services/auth/authService.ts)
```typescript
import api from '@services/api';
import type { LoginRequestDto, LoginResponseDto } from '@types/auth.types';

export const authService = {
  // 로그인
  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await api.post('/auth/login', data, {
      withCredentials: true, // Cookie 전송/수신
    });
    return response.data.data;
  },
  
  // 로그아웃
  async logout(): Promise<void> {
    await api.post('/auth/logout', {}, {
      withCredentials: true,
    });
  },
  
  // 토큰 갱신 (자동으로 interceptor에서 처리)
  async refreshToken(): Promise<{ access_token: string }> {
    const response = await api.post('/auth/refresh', {}, {
      withCredentials: true,
    });
    return response.data.data;
  },
};
```

#### 2.2 React Query Hooks (services/auth/authMutations.ts)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from '@hooks/use-toast';
import { authService } from './authService';
import { useAuthStore } from '@store/authStore';

// 로그인 훅
export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: '로그인 성공',
        description: `환영합니다, ${data.user.user_name}님!`,
      });
      
      // 역할별 리다이렉트
      switch(data.user.role_id) {
        case 1: // SYSTEM_ADMIN
          navigate('/admin');
          break;
        case 2: // COMPANY_MANAGER
          navigate('/dashboard');
          break;
        case 3: // TEAM_MEMBER
          if (data.user.status_id === 3) { // PENDING
            navigate('/auth/pending-approval');
          } else {
            navigate('/dashboard');
          }
          break;
      }
    },
    onError: (error: any) => {
      toast({
        title: '로그인 실패',
        description: error.response?.data?.error?.message || '로그인에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });
};

// 로그아웃 훅
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast({
        title: '로그아웃',
        description: '안전하게 로그아웃되었습니다.',
      });
      navigate('/login');
    },
  });
};
```

### Phase 3: 회원가입 기능

#### 3.1 회원가입 Service 추가
```typescript
// authService.ts에 추가
async signupCompanyManager(data: CompanyManagerSignupDto) {
  const response = await api.post('/auth/signup/company-manager', data);
  return response.data.data;
},

async signupTeamMember(data: TeamMemberSignupDto) {
  const response = await api.post('/auth/signup/team-member', data);
  return response.data.data;
},
```

#### 3.2 회원가입 Hooks
```typescript
// authMutations.ts에 추가
export const useSignupCompanyManager = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: authService.signupCompanyManager,
    onSuccess: () => {
      toast({
        title: '회원가입 완료',
        description: '회사 승인 대기중입니다. 승인 후 로그인 가능합니다.',
      });
      navigate('/auth/pending-approval');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message;
      
      if (error.response?.data?.error?.code === 'CONFLICT') {
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

export const useSignupTeamMember = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: authService.signupTeamMember,
    onSuccess: () => {
      toast({
        title: '회원가입 완료',
        description: '관리자 승인 대기중입니다. 승인 후 로그인 가능합니다.',
      });
      navigate('/auth/pending-approval');
    },
    onError: (error: any) => {
      if (error.response?.data?.error?.code === 'NOT_FOUND') {
        toast({
          title: '초대 코드 오류',
          description: '유효하지 않은 초대 코드입니다.',
          variant: 'destructive',
        });
      }
    },
  });
};
```

### Phase 4: 비밀번호 재설정

#### 4.1 비밀번호 재설정 Service
```typescript
// authService.ts에 추가
async forgotPassword(email: string) {
  const response = await api.post('/auth/password/forgot', { email });
  return response.data.data;
},

async verifyResetToken(token: string) {
  const response = await api.get(`/auth/password/verify?token=${token}`);
  return response.data.data;
},

async resetPassword(data: { token: string; new_password: string }) {
  const response = await api.post('/auth/password/reset', data);
  return response.data.data;
},
```

#### 4.2 비밀번호 재설정 Hooks
```typescript
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast({
        title: '이메일 전송 완료',
        description: '비밀번호 재설정 링크를 이메일로 전송했습니다.',
      });
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast({
        title: '비밀번호 변경 완료',
        description: '새로운 비밀번호로 로그인해주세요.',
      });
      navigate('/login');
    },
  });
};
```

### Phase 5: 승인 기능 (API만)

#### 5.1 승인 Service
```typescript
// authService.ts에 추가
async approveCompany(company_id: number, is_approved: boolean) {
  const response = await api.post('/auth/admin/approve/company', {
    company_id,
    is_approved,
  });
  return response.data.data;
},

async approveMember(user_id: number, is_approved: boolean) {
  const response = await api.post('/auth/manager/approve/member', {
    user_id,
    is_approved,
  });
  return response.data.data;
},
```

#### 5.2 승인 Hooks
```typescript
export const useApproveCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ company_id, is_approved }: ApprovalDto) =>
      authService.approveCompany(company_id, is_approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
      toast({
        title: '처리 완료',
        description: '회사 승인 요청이 처리되었습니다.',
      });
    },
  });
};

export const useApproveMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ user_id, is_approved }: ApprovalDto) =>
      authService.approveMember(user_id, is_approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-members'] });
      toast({
        title: '처리 완료',
        description: '팀원 승인 요청이 처리되었습니다.',
      });
    },
  });
};
```

## UI 컴포넌트 수정 방안

### LoginPage 수정 예시
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@services/auth/authMutations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export function LoginPage() {
  const login = useLogin();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values);
  };
  
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>계정에 로그인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

## 파일 구조 최종 정리

```
frontend/src/
├── types/
│   └── auth.types.ts                    # 모든 Auth 관련 타입 정의
│
├── services/
│   ├── api.ts                          # Axios 인스턴스 (수정)
│   └── auth/
│       ├── authService.ts              # API 호출 함수들
│       ├── authQueries.ts              # React Query queries
│       └── authMutations.ts            # React Query mutations
│
├── store/
│   └── authStore.ts                    # Zustand store (수정)
│
├── hooks/
│   └── useAuth.ts                      # 통합 Auth 훅
│
├── components/
│   └── auth/
│       ├── LoginForm.tsx               # 로그인 폼 컴포넌트
│       ├── SignupForm.tsx              # 회원가입 폼 컴포넌트
│       ├── PasswordResetForm.tsx       # 비밀번호 재설정 폼
│       └── ProtectedRoute.tsx          # 인증 라우트 가드
│
└── pages/
    └── auth/
        ├── LoginPage.tsx               # 로그인 페이지 (수정)
        ├── SignupPage.tsx              # 회원가입 페이지 (수정)
        ├── CompanySetupPage.tsx        # 회사 설정 페이지 (수정)
        ├── JoinCompanyPage.tsx         # 팀원 가입 페이지 (수정)
        ├── PendingApprovalPage.tsx     # 승인 대기 페이지 (유지)
        └── PasswordResetPage.tsx       # 비밀번호 재설정 페이지 (신규)
```

## 핵심 원칙

1. **보안 최우선**: RefreshToken은 HttpOnly Cookie로만 관리
2. **관심사 분리**: 
   - Zustand: UI 상태 (user 정보, 인증 상태)
   - React Query: 서버 데이터 (API 호출, 캐싱)
3. **타입 안정성**: 모든 DTO와 응답을 타입으로 정의
4. **재사용성**: 작은 단위의 훅과 컴포넌트로 분리
5. **shadcn 활용**: 일관된 UI/UX를 위해 shadcn 컴포넌트 최대 활용

## 구현 순서 권장사항

1. **Phase 1 먼저 완료** (기반 구조): 이후 작업의 토대
2. **Phase 2 우선** (로그인/로그아웃): 가장 핵심 기능
3. **Phase 3-4 순차적** (회원가입, 비밀번호): 사용자 플로우 완성
4. **Phase 5 마지막** (승인): 관리자 기능, UI 수정 없음

각 Phase는 독립적으로 테스트 가능하도록 구현