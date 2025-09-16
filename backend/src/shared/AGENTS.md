# Shared Layer Guide

## 역할
- 공통 유틸리티/미들웨어/응답/에러/상수/인터페이스를 제공합니다.

## 주요 구성
- `middleware/` — `errorHandler`, `notFoundHandler`, `requestLogger`, `rateLimiter`, `validateRequest`.
- `utils/` — `logger`(Winston), `response`(ResponseFormatter), `errors`(ApiError 계층), `dbConstraints`(ID/범위 검증, IdValidator), `prismaErrorHandler` 등.
- `constants/` — 앱 상수 및 환경별 값.
- `interfaces/` — 공용 타입/DTO 인터페이스.

## 사용 가이드
- 컨트롤러 응답은 `ResponseFormatter.success/created/error`로 통일합니다.
- 예외는 `ApiError` 파생 클래스로 정의하여 상태코드/코드/상세를 명시합니다.
- 요청 검증은 `express-validator` + `validateRequest` 조합을 권장합니다.
- 로깅은 `logger`를 사용하고, 테스트 환경에서는 파일 출력이 비활성화됩니다.

## 확장 팁
- 새 에러 타입은 `ApiError` 상속 후 `code`와 `details`를 표준화하세요.
- 새 미들웨어 추가 시 `app.ts`에서 등록 순서(보안/로깅 → rate limit → 라우팅 → 에러)를 유지하세요.
