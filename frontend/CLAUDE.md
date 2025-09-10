# Frontend 애플리케이션 구조 및 가이드

## 개요
React 18과 TypeScript를 기반으로 한 모던 SPA(Single Page Application)입니다. Vite를 빌드 도구로 사용하며, TailwindCSS로 스타일링하고 Zustand로 상태를 관리합니다.

## 디렉토리 구조

```
frontend/
├── src/
│   ├── App.tsx                # 메인 앱 컴포넌트 및 라우팅
│   ├── main.tsx               # 애플리케이션 진입점
│   ├── index.css              # 글로벌 스타일 및 Tailwind 설정
│   ├── components/            # UI 컴포넌트 (Atomic Design Pattern)
│   │   ├── atoms/             # 기본 컴포넌트
│   │   │   └── LoadingSpinner.tsx
│   │   ├── molecules/         # 복합 컴포넌트
│   │   │   └── ProtectedRoute.tsx
│   │   ├── organisms/         # 복잡한 컴포넌트 그룹
│   │   └── templates/         # 페이지 레이아웃
│   │       └── Layout.tsx
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── HomePage.tsx       # 홈 페이지
│   │   ├── LoginPage.tsx      # 로그인 페이지
│   │   ├── DashboardPage.tsx  # 대시보드
│   │   ├── ProfilePage.tsx    # 프로필 페이지
│   │   └── NotFoundPage.tsx   # 404 페이지
│   ├── hooks/                 # 커스텀 React 훅
│   ├── services/              # API 통신 서비스
│   │   ├── api.ts             # Axios 인스턴스 설정
│   │   └── auth.service.ts    # 인증 관련 API
│   ├── store/                 # 전역 상태 관리 (Zustand)
│   │   └── authStore.ts       # 인증 상태 스토어
│   ├── types/                 # TypeScript 타입 정의
│   └── utils/                 # 유틸리티 함수
├── public/                    # 정적 파일
├── .env                       # 환경 변수
├── .env.example              # 환경 변수 예시
├── package.json              # 프로젝트 의존성
├── tsconfig.json             # TypeScript 설정
├── vite.config.ts            # Vite 설정
├── tailwind.config.js        # TailwindCSS 설정
├── postcss.config.js         # PostCSS 설정
├── index.html                # HTML 템플릿
└── Dockerfile                # Docker 이미지 정의
```

## 기술 스택 상세

### 핵심 프레임워크
- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빠른 빌드 도구 및 개발 서버

### 라우팅 및 네비게이션
- **React Router v6**: SPA 라우팅
- **Protected Routes**: 인증 기반 라우트 보호
- **Lazy Loading**: 코드 스플리팅으로 초기 로딩 최적화

### 상태 관리
- **Zustand**: 간단하고 가벼운 전역 상태 관리
- **React Query (TanStack Query)**: 서버 상태 관리 및 캐싱
- **React Hook Form**: 폼 상태 관리

### 스타일링
- **TailwindCSS**: 유틸리티 우선 CSS 프레임워크
- **clsx**: 조건부 클래스명 관리
- **tailwind-merge**: Tailwind 클래스 충돌 해결

### 데이터 페칭 및 검증
- **Axios**: HTTP 클라이언트
- **Zod**: 런타임 타입 검증
- **@hookform/resolvers**: 폼 검증 통합

### 개발 도구
- **ESLint**: 코드 린팅
- **Prettier**: 코드 포매팅
- **Vitest**: 단위 테스트
- **React Testing Library**: 컴포넌트 테스트
- **React Query Devtools**: 쿼리 디버깅

## 컴포넌트 아키텍처

### Atomic Design Pattern
```
atoms/          # 버튼, 인풋, 라벨 등 기본 요소
molecules/      # 검색바, 카드, 폼 필드 등
organisms/      # 헤더, 사이드바, 폼 전체 등
templates/      # 페이지 레이아웃
pages/          # 실제 페이지 컴포넌트
```

### 컴포넌트 구조 예시
```typescript
// atoms/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

// molecules/SearchBar.tsx
- Button (atom)
- Input (atom)
- Icon (atom)

// organisms/Header.tsx
- Logo (atom)
- Navigation (molecule)
- UserMenu (molecule)
```

## 상태 관리 전략

### Zustand Store 구조
```typescript
// 인증 스토어
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// 프로젝트 스토어
interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  fetchProjects: () => Promise<void>;
  selectProject: (id: string) => void;
}
```

### React Query 사용
```typescript
// 데이터 페칭
const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 5 * 60 * 1000, // 5분
});

// 뮤테이션
const mutation = useMutation({
  mutationFn: createProject,
  onSuccess: () => {
    queryClient.invalidateQueries(['projects']);
  },
});
```

## 라우팅 구조

### 라우트 정의
```
/                     # 홈 페이지
/login                # 로그인
/dashboard            # 대시보드 (보호됨)
/profile              # 프로필 (보호됨)
/projects             # 프로젝트 목록 (보호됨)
/projects/:id         # 프로젝트 상세 (보호됨)
/tasks                # 작업 목록 (보호됨)
/tasks/:id            # 작업 상세 (보호됨)
/*                    # 404 페이지
```

### 인증 보호
```typescript
// ProtectedRoute 컴포넌트로 감싸진 라우트는
// 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
```

## 개발 가이드

### 환경 설정
```bash
# 환경 변수 설정
cp .env.example .env

# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
# 개발 모드 (HMR 활성화)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 테스트 실행
```bash
# 단위 테스트
npm test

# UI 테스트 모드
npm run test:ui

# 커버리지 리포트
npm run test:coverage
```

### 린팅 및 포매팅
```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix
```

## 코드 작성 규칙

### 컴포넌트 작성
```typescript
// 함수형 컴포넌트 사용
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>...</div>;
};

// Props 인터페이스 정의
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
}
```

### 커스텀 훅 작성
```typescript
// use 접두사 사용
const useCustomHook = (param: string) => {
  const [state, setState] = useState();
  
  useEffect(() => {
    // 효과
  }, [param]);
  
  return { state };
};
```

### 네이밍 컨벤션
- 컴포넌트: PascalCase (예: UserProfile)
- 훅: camelCase with 'use' prefix (예: useAuth)
- 유틸리티 함수: camelCase (예: formatDate)
- 상수: UPPER_SNAKE_CASE (예: API_BASE_URL)
- 타입/인터페이스: PascalCase (예: UserData)

## API 통신

### Axios 인스턴스 설정
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 추가)
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API 서비스 구조
```typescript
// services/project.service.ts
export const projectService = {
  getAll: () => apiClient.get('/projects'),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: CreateProjectDto) => apiClient.post('/projects', data),
  update: (id: string, data: UpdateProjectDto) => 
    apiClient.put(`/projects/${id}`, data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
};
```

## 성능 최적화

### 코드 스플리팅
```typescript
// React.lazy로 동적 임포트
const DashboardPage = lazy(() => import('@pages/DashboardPage'));

// Suspense로 로딩 처리
<Suspense fallback={<LoadingSpinner />}>
  <DashboardPage />
</Suspense>
```

### 메모이제이션
```typescript
// React.memo로 불필요한 리렌더링 방지
const ExpensiveComponent = React.memo(({ data }) => {
  // 렌더링 로직
});

// useMemo로 계산 값 캐싱
const expensiveValue = useMemo(() => 
  calculateExpensive(data), [data]
);

// useCallback으로 함수 캐싱
const handleClick = useCallback(() => {
  // 핸들러 로직
}, [dependency]);
```

### 이미지 최적화
- WebP 포맷 사용
- 적절한 이미지 크기 제공
- Lazy loading 적용

## 테스팅 전략

### 단위 테스트
```typescript
// 컴포넌트 테스트
describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

// 훅 테스트
describe('useAuth', () => {
  it('should handle login', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login(credentials);
    });
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## 배포 준비

### 환경별 설정
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

### 빌드 최적화
1. Tree shaking으로 미사용 코드 제거
2. 코드 minification
3. CSS purge (TailwindCSS)
4. 이미지 압축
5. 청크 분할 최적화

## 트러블슈팅

### 일반적인 문제 해결
1. **HMR 작동 안 함**: Vite 서버 재시작
2. **타입 에러**: `npm run build`로 타입 체크
3. **스타일 적용 안 됨**: TailwindCSS 설정 확인
4. **라우팅 문제**: React Router 설정 확인

### 개발 도구
- React DevTools: 컴포넌트 트리 검사
- Redux DevTools: Zustand 상태 디버깅
- Network 탭: API 요청 모니터링
- Lighthouse: 성능 분석

## 접근성 (A11y)
1. Semantic HTML 사용
2. ARIA 속성 적절히 활용
3. 키보드 네비게이션 지원
4. 충분한 색상 대비
5. 스크린 리더 호환성

## 보안 고려사항
1. XSS 방지 (React 자동 이스케이핑)
2. 민감한 정보 클라이언트 저장 금지
3. HTTPS 사용
4. CSP(Content Security Policy) 헤더 설정
5. 환경 변수로 API 키 관리