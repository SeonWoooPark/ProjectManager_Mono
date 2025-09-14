# Infrastructure Layer Guide

## 역할
- 데이터베이스, 캐시, 외부 서비스 등 I/O 자원을 캡슐화합니다.

## 데이터베이스(Prisma)
- `database/prisma.service.ts` — PrismaClient 싱글톤 래퍼. `connect()/disconnect()/transaction()/withRetry()` 제공.
- `database/base.repository.ts` — 공통 CRUD/페이지네이션/트랜잭션/RAW 쿼리 헬퍼.
- `database/repositories/*` — 엔티티별 리포지토리(앱 내 사용은 `modules/*/repositories`가 우선). 새 리포지토리는 BaseRepository 상속.
- 마이그레이션/시드: 루트 `backend/prisma/` 디렉토리 참고(`schema.prisma`, `seed.ts`).

## 캐시
- `cache/redis.client.ts` — 기본 InMemoryCache 구현. 운영에서는 실제 Redis 클라이언트로 대체 예정. `getCacheClient()/cacheService` 제공.

## 외부 서비스
- `external-services/email.service.ts` — 이메일 발송 인터페이스/목 구현. 운영용 프로바이더(SendGrid/SES)로 교체 가능.

## 사용 가이드
- 리포지토리에서 트랜잭션이 필요하면 `this.transaction(async tx => { ... })` 패턴 사용.
- 예외/제약조건은 `@shared/utils/errors`, `dbConstraints.ts`를 활용해 표준화.
- 데이터 접근은 Prisma 우선. 레거시 `typeorm` 스크립트는 사용하지 않습니다.
