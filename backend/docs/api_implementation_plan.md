# 프로젝트 관리 시스템 API 구현 계획 (v2.0 기반)

본 문서는 `backend/docs/project_task.md`의 API 명세서를 바탕으로, 현재 백엔드 아키텍처(Express + TypeScript, 모듈 구조, tsyringe DI, Prisma)와 일치하도록 구현하기 위한 단계별 계획을 정리합니다. 구현 범위는 프로젝트/작업/팀원 관리 API 전반이며, 모듈 단위로 점진적 도입을 권장합니다.

---

## 1) 목표 및 범위
- 목표
  - 명세서 v2.0과 동일한 요청/응답 스키마, 권한, 검증, 비즈니스 로직을 충족하는 API 제공
  - 기존 인증 모듈(auth)의 패턴(Controller → Service → Repository → Validator → DTO → Middleware)을 재사용
  - 공통 에러/응답 포맷(`ResponseFormatter`, `ApiError`) 및 미들웨어 체계 활용
- 범위
  - 프로젝트 API: 생성, 목록, 상세, 관련 작업 조회, 수정(progress_rate 포함), 새 작업 생성
  - 작업 API: 팀원 할당 작업 조회, 상태 변경, 정보 수정
  - 팀원 API: 회사 전체 팀원, 프로젝트 참여 팀원, 가입 요청 팀원 조회

---

## 2) 아키텍처 정렬 가이드
- 모듈 구조
  - `src/modules/<domain>/`
    - `controllers/`, `services/`, `repositories/`, `validators/`, `dto/{request, response}/`, `middleware/`(필요 시)
  - Auth 모듈과 동일한 구조/코딩 컨벤션 유지
- DI 컨테이너
  - 새 모듈의 Repository/Service/Controller를 `@core/container.ts`에 등록
- 라우팅
  - `src/app.ts`에서 각 모듈 라우터를 `/api/v1/<base>`에 마운트
- 공통 유틸
  - 응답: `@shared/utils/response.ts`
  - 에러: `@shared/utils/errors.ts`
  - 제약/검증: `@shared/utils/dbConstraints.ts`, `express-validator`
  - 인증/인가: `@modules/auth/middleware/auth.middleware.ts`
- 데이터 접근
  - `PrismaService` 활용, Repository 레이어에서 Prisma 쿼리 캡슐화

---

## 3) 단계별 로드맵
1. 스키마 및 제약 확인
   - Prisma 모델(`Project`, `Task`, `AllocateProject`, `User`, `ProjectStatus`, `TaskStatus`)이 명세서 요구 필드를 충족하는지 점검
   - 진행률 범위/날짜 유효성/상태 범위는 `dbConstraints` 유틸로 일치
2. 모듈 스캐폴딩
   - `modules/projects`, `modules/tasks`, `modules/members` 생성
   - 각 모듈에 Controller/Service/Repository/Validator/DTO 기본 파일 생성
3. DI/라우팅 연결
   - `core/container.ts`에 의존성 등록
   - `app.ts`에 모듈 라우터 마운트: `/api/v1/projects`, `/api/v1/tasks`, `/api/v1/members`
4. 유효성 검증 스키마/DTO 정의
   - `express-validator` + BaseValidator 패턴 채택
   - request/response DTO를 명세서와 정합되게 정의
5. 권한/인가 규칙 반영
   - JWT에서 role/company 추출
   - COMPANY_MANAGER(2) 전용 엔드포인트에 `requireCompanyManager` 사용
   - 공통적으로 `authenticateToken`, `requireActiveUser` 적용
6. Repository 구현(Prisma)
   - 명세서의 SQL 예시를 Prisma 쿼리로 변환
   - 트랜잭션/withRetry 필요 시 `PrismaService` 헬퍼 사용
7. Service 구현(비즈니스 로직)
   - 권한/유효성 → 데이터 변화 → ActivityLog 기록(필요 시) 순서로 구성
8. Controller 구현 및 응답 포맷 통일
   - `ResponseFormatter.success/created` 사용, 에러는 `ApiError` 파이프라인
9. 테스트 작성(Jest)
   - Service/Repository 단위 테스트 우선, Controller 라우팅 테스트 선택
   - 커버리지 80% 준수
10. 문서/스키마 스냅샷 검증
    - 샘플 응답 본문과 실제 응답 형태 비교 점검

---

## 4) 도메인별 상세 계획

### A. Projects 모듈 (`/api/v1/projects`)
- 엔드포인트 우선순위
  1) POST `/` 프로젝트 생성
  2) GET `/` 회사 전체 프로젝트 조회 (페이지네이션/필터)
  3) GET `/:projectId` 프로젝트 상세
  4) GET `/:projectId/tasks` 프로젝트 관련 작업 조회
  5) PATCH `/:projectId` 프로젝트 정보 수정(progress_rate 검증 포함)
  6) POST `/:projectId/tasks` 프로젝트에 새 작업 생성

- 권한/인증
  - POST/POST(tasks)/PATCH: COMPANY_MANAGER(2) 이상
  - GET: 동일 회사 소속 사용자 허용, 단 시스템 관리자(1)는 모든 회사 가능

- Validator (요지)
  - 생성: `project_name` 필수/길이, `start_date < end_date`, `member_ids` 배열 형식 및 ID 패턴(`usr_`)
  - 수정: `progress_rate` 범위(0~100), 설명 길이 제한, 상태 범위
  - 공통: `projectId` 경로 파라미터 형식(`prj_`)

- Service/Repository (요지)
  - 생성
    - 날짜 유효성 검사 → 회사 식별(JWT) → `projects` insert → `allocate_projects` 일괄 insert → 초기 `progress_rate=0`, `status_id=1`
  - 목록
    - 회사 스코프 필터, 상태 필터, 페이지네이션
    - 조인/집계: `tasks`와 `tasks_status`를 이용해 완료/미완료 수 집계
    - 각 프로젝트별 할당 멤버 조회 후 병합(2단계 조회 또는 Prisma include + select)
  - 상세
    - 프로젝트 + 상태명 + 집계치 + 할당 멤버 포함
  - 관련 작업
    - 프로젝트 ID 스코프 + 상태/기간 필터(명세 제공 시), 페이지네이션
  - 수정
    - progress_rate 범위 검증, 날짜 재검증(필요 시), 필드별 partial update
  - 새 작업 생성
    - 프로젝트 존재/회사 소속 검증 → `tasks` insert → 초기 상태/진행률 설정

- 응답 포맷
  - `ResponseFormatter.success/created` 사용, 명세서 샘플 필드명에 정합

### B. Tasks 모듈 (`/api/v1/tasks`)
- 엔드포인트
  1) GET `/` 팀원에게 할당된 작업 조회 (쿼리: assignee_id, page, limit, status 등)
  2) PATCH `/:taskId/status` 작업 상태 변경
  3) PATCH `/:taskId` 작업 정보 수정

- 권한/인증
  - 조회: 본인 또는 동일 회사 권한 검증
  - 상태 변경/수정: COMPANY_MANAGER 또는 해당 프로젝트 관리자 권한(정책상 매핑 필요 시 requireManagerOrAdmin)

- Validator
  - `taskId` 형식(`tsk_`), 상태 범위, 진행률/기간 유효성

- Service/Repository
  - 조회: assignee 스코프 + 상태/기간 필터 + 페이지네이션
  - 상태 변경: 히스토리(선택) 기록, 비즈니스 규칙 충족(완료 시 완료일 등)
  - 수정: partial update + 범위/날짜 재검증

### C. Members 모듈 (`/api/v1/members`)
- 엔드포인트
  1) GET `/` 회사 전체 팀원 조회 (페이지네이션/필터)
  2) GET `/projects/:projectId` 특정 프로젝트 참여 팀원 조회
  3) GET `/pending-requests` 가입 요청 팀원 조회

- 권한/인증
  - COMPANY_MANAGER 이상, 시스템 관리자는 전사/모든 회사 접근 가능

- Validator
  - `projectId` 형식, 페이지네이션 파라미터 범위 검증

- Service/Repository
  - 회사/프로젝트 스코프 하에 사용자 목록 조회, 상태/역할 필터링
  - 가입 요청(Status.PENDING)만 필터

---

## 5) 공통 구현 사항
- 페이지네이션
  - 쿼리: `page`, `limit` 기본값/최대값 가드, `skip/take` 변환 헬퍼
  - 응답: `{ total, page, limit, total_pages }` 형태 유지
- 권한 상수/매핑
  - `UserRole`(SYSTEM_ADMIN=1, COMPANY_MANAGER=2, TEAM_MEMBER=3) 현행 유지
- 에러 처리
  - `ValidationError`, `AuthorizationError`, `NotFoundError`, `ConflictError` 적절 사용
- 로깅/감사
  - 주요 변경 작업 시 `ActivityLog` 고려(선택), 최소한 서비스 레벨 로깅

---

## 6) 테스트 전략 (Jest)
- 단위 테스트
  - Service: 권한/검증/비즈니스 로직 브랜치 커버리지 확보
  - Repository: Prisma 호출 파라미터/결과 변형 검증 (mock Prisma)
- 통합/라우트 테스트(선택)
  - 인증 미들웨어 + Validator + Controller까지 경로 테스트
- 커버리지 기준
  - 기존 정책(80%) 준수, 회귀 방지 케이스 포함

---

## 7) 마이그레이션/시드 점검
- 현재 `schema.prisma`는 명세서 필드 충족(프로젝트/작업/상태/할당/로그/역할/유저)
- 필요 시 `ProjectStatus`, `TaskStatus` 초기값 시드 보강
- 인덱스: 집계/조회 경로(`project_id`, `status_id`, 날짜 컬럼 등) 확인 완료

---

## 8) 구현 순서 제안 (스프린트 단위)
- 스프린트 1
  - Projects 모듈 스캐폴딩/DI/라우팅
  - POST /projects, GET /projects
  - 테스트 커버리지 기본선 확보
- 스프린트 2
  - GET /projects/:projectId, GET /projects/:projectId/tasks
  - PATCH /projects/:projectId
- 스프린트 3
  - POST /projects/:projectId/tasks
  - Tasks 모듈: GET /tasks, PATCH /tasks/:taskId/status, PATCH /tasks/:taskId
- 스프린트 4
  - Members 모듈: 3개 조회 엔드포인트
  - 문서/샘플 응답 일치 검증/성능 점검

---

## 9) 완료 기준(DoD)
- 모든 엔드포인트가 명세서의 요청/응답/권한/검증을 충족
- 에러 포맷/상태코드/에러코드 일치
- 테스트 커버리지 80% 이상, 린트 통과, 타입 에러 없음
- 페이지네이션/정렬/필터 동작 확인 및 응답 스키마 일치
- 개발/테스트 환경에서 시드/데이터 시나리오로 통합 동작 검증

---

## 10) 참고 경로
- 명세서: `backend/docs/project_task.md`
- 앱 진입/설정: `backend/src/server.ts`, `backend/src/app.ts`, `backend/src/core/*`
- 공통 유틸: `backend/src/shared/utils/*`, 미들웨어: `backend/src/shared/middleware/*`
- Auth 모듈 참조: `backend/src/modules/auth/*`
- Prisma 스키마: `backend/prisma/schema.prisma`

---

본 계획에 따라 모듈 단위로 점진 구현/테스트를 진행하고, 각 스프린트 종료 시 명세서와 실제 응답의 일치 여부를 샘플 페이로드로 검증합니다.

