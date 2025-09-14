# Backend Guidelines

## 개요
- Express + TypeScript API, Prisma 기반 데이터 접근, tsyringe로 DI 구성.
- 레이어드 아키텍처: Core → Infrastructure → Modules → Shared.
- 경로 별칭: `@core/*`, `@modules/*`, `@shared/*`, `@infrastructure/*`, `@/*`.

## 디렉토리 구조
- `core/` — 앱 부트스트랩, DI 컨테이너, 환경설정. 서버 시작/종료 라이프사이클 관리.
- `infrastructure/` — DB(Prisma), 캐시, 외부 서비스, 공통 리포지토리 베이스.
- `modules/` — 도메인 모듈(예: `auth`)의 Controller/Service/Repository/Validator/DTO/미들웨어.
- `shared/` — 공용 미들웨어, 로깅, 에러/응답 포맷, 상수/인터페이스/유틸.
- `tests/` — Jest 설정 및 부가 테스트 유틸.

## 런타임 워크플로우
1) `src/server.ts`에서 `initializeApp()` 호출 → DI 초기화 및 환경설정.
2) `PrismaService.connect()`로 DB 연결 후 Express 서버 리스닝.
3) `src/app.ts`에서 보안/로깅/레이트리밋 미들웨어 구성 후 라우팅(`AuthModule` → `/api/v1/auth`).
4) 요청 흐름: Validator → Auth 미들웨어(선택) → Controller → Service → Repository(Prisma) → ResponseFormatter.
5) 에러는 `shared/middleware/errorHandler.ts`가 처리. 종료 시 `shutdownApp()` 및 Prisma disconnect.

## 테스트
- Jest(ts-jest), 루트 `src` 기준. 커버리지 글로벌 80% 이상(`jest.config.js`).
- 실행: `npm test`, 커버리지: `npm run test:coverage`.

## 코드 스타일
- ESLint + Prettier(2스페이스, single quote, width 100). 커밋 전 `npm run lint:fix` 권장.

## 세부 가이드
- Core: `./core/AGENTS.md`
- Infrastructure: `./infrastructure/AGENTS.md`
- Modules: `./modules/AGENTS.md`
- Shared: `./shared/AGENTS.md`

## 개발 팁
- 새 기능은 모듈 단위로 추가하고, DI 등록/의존성 주입을 명시적으로 관리.
- 요청/응답 포맷은 `ResponseFormatter`를 일관 사용. 예외는 `ApiError` 하위 클래스로 표준화.
