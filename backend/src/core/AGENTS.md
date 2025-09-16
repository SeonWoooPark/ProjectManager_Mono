# Core Layer Guide

## 역할
- 애플리케이션 수명주기와 DI, 환경설정을 관리합니다.

## 주요 파일
- `config/config.ts` — `.env` 로딩, CORS/로그/레이트리밋 등 설정 객체 제공. `isDevelopment/Production/Test` 헬퍼.
- `container.ts` — tsyringe DI 컨테이너. `PrismaService`, Repositories, Services, Controllers를 토큰명으로 등록/해제.
- `app.bootstrap.ts` — `initializeApp()/shutdownApp()` 제공. 환경별 추가 설정 훅 포함.
- `test-container.ts` — 테스트 전용 DI(모의 Prisma/Repositories 등록)와 헬퍼 함수.

## DI 사용 패턴
- 등록: `container.registerSingleton<Class>('Token', Class)` 혹은 `registerInstance`.
- 해석: `diContainer.resolve<T>('Token')` 또는 `@inject('Token')` 사용.
- 테스트: `initializeTestDI()`로 Mock 주입 → 테스트 종료 시 `clearTestContainer()`.

## 초기화 워크플로우
1) `initializeApp()` → `initializeDI()` 실행.
2) 환경별 구성 적용(개발/운영/테스트).
3) 종료 시 `shutdownApp()`으로 컨테이너 정리.

## 확장 가이드
- 새 서비스/리포지토리 추가 시 토큰명을 일관되게 정의하고 `container.ts`에 등록하세요.
- 외부 의존성(Mock 포함)은 테스트 컨테이너에서 우선 정의 후 점진적으로 본 컨테이너에 반영합니다.
