# 프로젝트/작업 API 구현 계획 (v2.0 기준)

## 범위와 목표
- backend/docs/project_task.md 명세의 프로젝트, 작업, 팀원 관리 API를 현재 레이어드 아키텍처(Core → Infrastructure → Modules → Shared)와 DI(tsyringe), Prisma 기반으로 구현.
- 일관 응답(ResponseFormatter)과 에러 표준(ApiError 계층)을 준수하고, 권한/검증/로그를 공통 미들웨어로 처리.

## 아키텍처 매핑
- 새 모듈: `src/modules/projects`, `src/modules/tasks`, `src/modules/members`(조회 전용)
- 각 모듈 구성: `controllers/`, `services/`, `repositories/`, `validators/`, `dto/{request,response}/`, `index.ts`
- DI 등록: `src/core/container.ts`에 Repository/Service/Controller 싱글톤/인스턴스 등록
- 라우팅 마운트: `src/app.ts`에 `/api/v1/projects`, `/api/v1/tasks`, `/api/v1/members`

## 단계별 계획
1) DB/시드 확인
- Prisma 스키마는 Project/Task/Status/Allocate/Review/ActivityLog를 포함함. 필요 상태값은 `npm run seed`로 채움.
- ID 포맷은 `IdValidator`(usr_/cmp_/prj_/tsk_) 사용을 기본으로 함.

2) 모듈 스캐폴딩
- 디렉토리 생성: 
  - `src/modules/projects/{controllers,services,repositories,validators,dto/{request,response}}`
  - `src/modules/tasks/{controllers,services,repositories,validators,dto/{request,response}}`
  - `src/modules/members/{controllers,services,repositories,validators}`
- 엔트리(예): `ProjectsModule`, `TasksModule` with `get router()`

3) 라우트 정의 및 마운트
- Projects
  - POST `/api/v1/projects` (회사 관리자) — 생성+팀원할당
  - GET `/api/v1/projects` — 회사 전체 프로젝트 목록(페이지네이션+통계)
  - GET `/api/v1/projects/:projectId` — 상세+통계+멤버
  - GET `/api/v1/projects/:projectId/tasks` — 필터(status, assignee)
  - PATCH `/api/v1/projects/:projectId` — 부분 수정(progress_rate 포함)
- Tasks
  - GET `/api/v1/tasks/my` — 내 작업 목록+통계
  - PATCH `/api/v1/tasks/:taskId/status` — 상태 변경(+Review/ActivityLog 사이드이펙트)
  - PATCH `/api/v1/tasks/:taskId` — 정보 수정(담당자 변경 포함)
- Members
  - GET `/api/v1/members` — 회사 팀원 목록+통계
  - GET `/api/v1/projects/:projectId/members` — 프로젝트 참여 멤버
- app.ts: `this.app.use('/api/v1/projects', ProjectsModule.getInstance().router)` 등 추가

4) 권한/미들웨어
- 공통: `authenticateToken` → 리소스 접근 검증
- 역할: 관리자 전용(`requireCompanyManager`) 엔드포인트 구분
- 리소스 소속 검증: 동일 회사/프로젝트 할당 여부 검사(서비스/리포지토리에서 보강)
- 레이트리밋: `/api/v1` 하위 유지

5) DTO/Validator
- BaseValidator + 커스텀 규칙 사용
  - 날짜: 프로젝트 `end_date > start_date`, 작업 `end_date >= start_date`, 작업 기간 ⊆ 프로젝트 기간
  - 진행률: 0 ≤ progress_rate ≤ 100 (소수 1자리)
  - ID: `IdValidator` 패턴(usr_/prj_/tsk_)
- 예) Projects
  - CreateProjectRequestDto, UpdateProjectRequestDto, ListProjectsQueryDto, ListProjectTasksQueryDto
  - Validators: `validateCreateProject()`, `validateUpdateProject()`, `validateListProjects()`
- 예) Tasks
  - UpdateTaskStatusRequestDto, UpdateTaskRequestDto, MyTasksQueryDto
  - Validators: `validateUpdateStatus()`, `validateUpdateTask()`, `validateMyTasks()`

6) Repository 설계(Prisma)
- ProjectRepository: 
  - `createWithAllocations(data, memberIds)` → 트랜잭션으로 projects/allocate_projects 생성
  - `listByCompany(companyId, filters, pagination)` → 집계 포함(total/completed/incomplete)
  - `getDetailWithStats(projectId)` → 상태명/작업 통계/멤버 include
  - `listTasks(projectId, filters)`
  - `updatePartial(projectId, patch)`
- TaskRepository:
  - `listMyTasks(userId, filters)` + 상태 통계
  - `updateStatus(taskId, statusId, updatedBy, comment)` → 이전상태 조회, 상태 업데이트, Review 조건부 생성, ActivityLog 기록(트랜잭션)
  - `updateTask(taskId, patch)` → 날짜/진행률/담당자 유효성 포함
  - 헬퍼: ActivityLog/Review 작성 메서드

7) Service 로직
- ProjectsService: 권한/날짜 검증 → 생성/수정 → allocate 처리 → 상세/목록 집계 조합
- TasksService: 권한/담당자/기간 검증 → 상태변경 사이드이펙트 → 활동 로그 기록 → 응답 포맷
- MembersService: 회사/프로젝트 단위로 사용자/할당/작업 통계 집계

8) Controller/응답
- `ResponseFormatter.success/created` 사용, 에러는 `ApiError` 파생으로 throw
- 공통 에러코드 매핑: VALIDATION_ERROR, PROGRESS_RATE_ERROR, MEMBER_NOT_IN_PROJECT, RESOURCE_NOT_FOUND 등

9) DI 등록
- `src/core/container.ts`에 Repository/Service/Controller 싱글톤 등록 및 토큰명 부여

10) 테스트(Jest)
- 유효성: Validator 단위 테스트
- 서비스: 권한/날짜/진행률/사이드이펙트 시나리오 테스트
- 컨트롤러: supertest로 핵심 경로 happy/edge 케이스
- 커버리지 80% 유지(`npm run test:coverage`)

## 파일/네이밍 가이드(예)
- `src/modules/projects/controllers/projects.controller.ts`
- `src/modules/projects/services/projects.service.ts`
- `src/modules/projects/repositories/project.repository.ts`
- `src/modules/projects/validators/projects.validator.ts`
- `src/modules/projects/dto/request/{create-project.dto.ts,update-project.dto.ts}`
- `src/modules/tasks/...` 유사 패턴 적용

## 실행/검증 커맨드
- 개발 서버: `cd backend && npm run dev`
- Prisma 마이그레이션/시드: `npm run build && npx prisma generate && npm run seed`
- 테스트: `npm test`, 커버리지: `npm run test:coverage`

## 수용 기준(Checklist)
- [ ] 모든 엔드포인트가 명세의 입력/출력 스키마를 충족
- [ ] 권한/검증/에러 코드가 명세와 일치
- [ ] Review/ActivityLog 사이드이펙트 동작 검증
- [ ] 성능: 목록 API N+1 없이 Prisma include/집계로 처리
- [ ] 테스트 커버리지 ≥ 80%
