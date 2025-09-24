# REST API 연동 구현 계획서

## 📋 프로젝트 개요
백엔드 API (Projects, Tasks, Members)와 프론트엔드 연동을 위한 체계적인 5단계 구현 계획

**아키텍처**: Zustand(UI상태) + React Query(서버데이터) + shadcn/ui(컴포넌트)  
**원칙**: 기존 컴포넌트 최대 활용, 관심사 분리, 타입 안정성

## 🏗️ Phase 1: 기반 구조 구축

### 1.1 타입 정의 생성 (src/types/)
```typescript
// api.ts - 공통 API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// project.ts - 프로젝트 도메인 타입
interface Project {
  project_id: number;
  project_name: string;
  project_description?: string;
  status_id: number;
  created_at: Date;
  updated_at: Date;
}

interface CreateProjectDto {
  project_name: string;
  project_description?: string;
}

// task.ts - 태스크 도메인 타입  
interface Task {
  task_id: number;
  task_name: string;
  task_description?: string;
  status_id: number;
  assignee_id?: number;
  project_id: number;
  created_at: Date;
  updated_at: Date;
}

// member.ts - 멤버 도메인 타입
interface Member {
  user_id: number;
  user_name: string;
  email: string;
  role_id: number;
  status_id: number;
  company_id: number;
}
```

### 1.2 API 클라이언트 확장 (services/api.ts)
- 백엔드 베이스 URL 설정 (`http://localhost:15000/api/v1`)
- JWT 토큰 자동 첨부 인터셉터 
- 에러 응답 처리 로직

## 🔧 Phase 2: Services Layer (React Query)

### 2.1 Projects 서비스 구현
```
services/projects/
├── projectService.ts    # 순수 API 호출 함수
├── projectQueries.ts    # React Query hooks
└── index.ts            # export 통합
```

**API 엔드포인트 매핑:**
- `GET /projects` → useProjects (목록, 페이징, 필터)
- `GET /projects/:id` → useProject (상세)
- `GET /projects/:id/tasks` → useProjectTasks (프로젝트 작업)
- `GET /projects/:id/members` → useProjectMembers (프로젝트 멤버)
- `POST /projects` → useCreateProject (생성)
- `PATCH /projects/:id` → useUpdateProject (수정)
- `POST /projects/:id/tasks` → useCreateProjectTask (작업 생성)

### 2.2 Tasks 서비스 구현
```
services/tasks/
├── taskService.ts
├── taskQueries.ts
└── index.ts
```

**API 엔드포인트 매핑:**
- `GET /tasks/assigned` → useAssignedTasks (할당된 작업)
- `PATCH /tasks/:id/status` → useUpdateTaskStatus (상태 변경)
- `PATCH /tasks/:id` → useUpdateTask (작업 수정)

### 2.3 Members 서비스 구현
```
services/members/
├── memberService.ts
├── memberQueries.ts  
└── index.ts
```

**API 엔드포인트 매핑:**
- `GET /members` → useMembers (회사 멤버 목록)
- `GET /members/pending` → usePendingMembers (승인 대기)
- `GET /members/projects/:id` → useProjectMembers (프로젝트별)

## 🗄️ Phase 3: Store Layer (Zustand)

### 3.1 UI 상태 관리 스토어
```typescript
// store/projectStore.ts
interface ProjectStore {
  selectedProject: Project | null;
  filters: ProjectFilters;
  isCreateModalOpen: boolean;
  setSelectedProject: (project: Project | null) => void;
  setFilters: (filters: ProjectFilters) => void;
  toggleCreateModal: () => void;
}

// store/taskStore.ts  
interface TaskStore {
  selectedTasks: number[];
  filters: TaskFilters;
  sortBy: 'created_at' | 'status' | 'assignee';
  setSelectedTasks: (taskIds: number[]) => void;
  setFilters: (filters: TaskFilters) => void;
}

// store/memberStore.ts
interface MemberStore {
  searchTerm: string;
  selectedRole: number | null;
  setSearchTerm: (term: string) => void;
  setSelectedRole: (role: number | null) => void;
}
```

## 🎨 Phase 4: UI 컴포넌트 연동

### 4.1 기존 Project 컴포넌트 수정
- **ProjectHeader.tsx** - 실제 프로젝트 데이터로 헤더 정보 표시
- **ProjectTabs.tsx** - 탭 구조를 백엔드 데이터에 맞게 수정
- **UnifiedProjectDetailView.tsx** - API 데이터와 React Query 통합
- **ProjectInfoCards.tsx** - 실제 프로젝트 통계 데이터 바인딩

### 4.2 신규 컴포넌트 추가
```
components/
├── project/
│   ├── ProjectList.tsx      # 프로젝트 목록 (페이징, 필터링)
│   └── ProjectForm.tsx      # 프로젝트 생성/수정 폼
├── task/ (신규)
│   ├── TaskList.tsx         # 작업 목록 컴포넌트
│   ├── TaskCard.tsx         # 작업 카드 (shadcn Card 기반)
│   ├── TaskForm.tsx         # 작업 생성/수정 폼
│   └── TaskStatusBadge.tsx  # 상태 배지 (shadcn Badge)
└── member/ (신규)
    ├── MemberList.tsx       # 멤버 목록 (shadcn Table 기반)
    ├── MemberCard.tsx       # 멤버 카드
    └── PendingMemberList.tsx # 승인 대기 멤버 목록
```

## 📄 Phase 5: 페이지 통합

### 5.1 기존 페이지 수정
- **DashboardPage.tsx** - 프로젝트 목록과 대시보드 통계 표시
- React Query + Zustand 연동으로 완전한 기능 구현

### 5.2 새 페이지 추가 (필요시)
- **ProjectDetailPage.tsx** - 프로젝트 상세 페이지
- **TaskManagePage.tsx** - 태스크 관리 페이지
- **MemberManagePage.tsx** - 멤버 관리 페이지

## 🔐 권한 기반 UI 제어

### 권한 레벨별 기능 제어
- **SYSTEM_ADMIN (1)**: 모든 기능 접근 가능
- **COMPANY_MANAGER (2)**: 프로젝트/태스크 생성, 멤버 승인
- **TEAM_MEMBER (3)**: 할당된 태스크 조회/수정만

### UI 조건부 렌더링
```typescript
const { user } = useAuthStore();
const isManager = user?.role_id <= 2;

return (
  <div>
    {isManager && <CreateProjectButton />}
    <ProjectList />
  </div>
);
```

## 📊 구현 우선순위 및 일정

### High Priority (1차 구현)
- **Projects 도메인** - 가장 복잡하고 핵심 기능
- 예상 소요: 4-6시간

### Medium Priority (2차 구현)
- **Tasks 도메인** - 프로젝트와 연관성 높음
- 예상 소요: 3-4시간

### Low Priority (3차 구현)  
- **Members 도메인** - 상대적으로 단순함
- 예상 소요: 2-3시간

## 🎯 아키텍처 원칙

### 데이터 흐름
1. **사용자 인터랙션** (UI 컴포넌트)
2. **UI 상태 변경** (Zustand Store)
3. **API 호출** (React Query Service)
4. **서버 응답 처리** (React Query Cache)
5. **UI 업데이트** (자동 리렌더링)

### 관심사 분리
- **View Layer**: 페이지 + 컴포넌트 (shadcn 기반)
- **State Layer**: Zustand (UI 상태) + React Query (서버 상태)
- **Service Layer**: API 서비스 (axios 기반)
- **Type Layer**: TypeScript 타입 정의

### 코드 품질
- **타입 안정성**: 모든 API 응답에 대한 TypeScript 타입
- **에러 처리**: React Query error boundary + 사용자 친화적 메시지
- **성능 최적화**: React Query 캐싱 + 무한 스크롤 (필요시)

## 📈 예상 결과물

### 파일 생성/수정 목록
**신규 파일**: ~15개
- types: 4개 (api, project, task, member)
- services: 9개 (3개 도메인 × 3파일)  
- stores: 3개 (project, task, member)

**수정 파일**: ~8개
- 기존 project 컴포넌트 4개
- 페이지 컴포넌트 2-3개
- API 클라이언트 1개

### 개발 환경 및 도구
- **개발 서버**: `npm run dev` (Vite)
- **타입 체크**: `npm run lint` 
- **디버깅**: React Query Devtools + Zustand Devtools
- **테스트**: 단계별 기능 검증

### 완료 기준
- [ ] 모든 백엔드 API와 정상 연동 확인
- [ ] 권한별 UI 제어 동작 확인  
- [ ] 에러 핸들링 및 로딩 상태 적절히 처리
- [ ] TypeScript 타입 에러 없음
- [ ] 기존 UI/UX 패턴과 일관성 유지

**총 예상 소요 시간**: 1-2일 (8-12시간)
**구현 완료 예정**: 2025년 9월 24일