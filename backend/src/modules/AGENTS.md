# Modules Guide (Auth)

## 목적
- 도메인 단위(예: 인증)로 기능을 캡슐화합니다. 각 모듈은 Controller, Service, Repository, Validator, DTO, Middleware, Utils로 구성됩니다.

## 구조 예시: `modules/auth`
- `controllers/` — HTTP 진입점. `AuthController`는 `ResponseFormatter`로 응답 표준화.
- `services/` — 도메인 로직. `AuthenticationService`, `RegistrationService`, `PasswordService`, `TokenService`, `ApprovalService`. `AuthService`는 Facade.
- `repositories/` — Prisma를 통해 영속화. 사용자/회사/토큰 리포지토리 제공.
- `validators/` — `express-validator` 기반. `BaseValidator` + `AuthSchemas` 조합.
- `dto/` — 요청/응답 DTO.
- `middleware/` — 인증/인가 미들웨어(`authenticateToken`, `requireSystemAdmin`, `requireCompanyManager`).
- `utils/` — JWT, 비밀번호 유틸.

## 라우팅
- 베이스 경로: `/api/v1/auth`.
- 공개: `POST /signup/company-manager`, `POST /signup/team-member`, `POST /login`, `POST /refresh`, `POST /password/forgot`, `GET /password/verify`, `POST /password/reset`.
- 보호: `POST /logout`, `POST /admin/approve/company`, `POST /manager/approve/member`.
- 모든 라우트는 유효성 검사 → 선택적/필수 인증 → Controller 순으로 처리.

## 의존성 주입
- 기본적으로 DI 컨테이너에서 토큰명으로 주입(`AuthService`, `UserRepository` 등). 필요 시 모듈 내부 생성자를 통한 명시적 주입 사용.

## 확장 가이드
- 새 엔드포인트: Validator → Controller 메서드 → Service → Repository 순으로 추가하고 `auth.module.ts`에서 라우트 바인딩.
- 새 도메인 모듈: 위 구조를 복제하고 App 레벨 라우터에 마운트(`/api/v1/<module>`), DI 등록 필요 시 `core/container.ts`에 추가.

## 테스트
- 단위: `src/modules/**/__tests__/*.test.ts`.
- 실행: `npm test` 또는 `npm run test:watch` (backend 디렉토리).
