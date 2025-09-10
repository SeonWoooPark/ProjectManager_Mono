# TypeORM → Prisma ORM 마이그레이션 계획

## 📋 현재 상태 분석

### TypeORM 사용 현황
- **영향 받는 파일**: 5개
  - `src/entities/User.ts` - TypeORM Entity
  - `src/repositories/user.repository.ts` - Repository 패턴
  - `src/config/data-source.ts` - DB 연결 설정
  - `src/server.ts` - DB 초기화 로직
  - `package.json` - TypeORM 의존성

### 현재 기술 스택
- TypeORM 0.3.26
- PostgreSQL (pg 8.16.3)
- Express + TypeScript
- Repository 패턴 사용 중

## 🎯 마이그레이션 목표

### Prisma ORM 장점
1. **타입 안전성**: 자동 생성되는 타입으로 100% 타입 안전 보장
2. **개발자 경험**: 자동 완성, 직관적 API
3. **마이그레이션 관리**: 더 안전하고 체계적인 마이그레이션
4. **Prisma Studio**: GUI 기반 데이터 관리 도구
5. **성능**: 효율적인 쿼리 생성 및 최적화

## 📝 단계별 마이그레이션 계획

### Phase 1: 준비 단계 (리스크: 낮음)
#### 1.1 백업 및 브랜치 생성
```bash
# 새 브랜치 생성
git checkout -b migration/typeorm-to-prisma

# 현재 DB 스키마 백업
pg_dump -h localhost -U dbuser -d pm_database -s > backup_schema.sql
```

#### 1.2 TypeORM 분석
- [x] Entity 구조 파악 (User)
- [x] Repository 메서드 목록화
- [x] 사용 중인 TypeORM 기능 확인

### Phase 2: Prisma 설치 및 설정 (리스크: 낮음)
#### 2.1 Prisma 패키지 설치
```bash
# Prisma CLI 설치 (개발 의존성)
npm install -D prisma

# Prisma Client 설치
npm install @prisma/client
```

#### 2.2 Prisma 초기화
```bash
# Prisma 프로젝트 초기화
npx prisma init

# 기존 DB에서 스키마 추출
npx prisma db pull
```

#### 2.3 환경 변수 업데이트
```env
# .env 파일 수정 필요 없음 (이미 DATABASE_URL 존재)
DATABASE_URL="postgresql://dbuser:dbpassword123@localhost:5432/pm_database"
```

### Phase 3: 스키마 정의 (리스크: 중간)
#### 3.1 Prisma 스키마 작성
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(uuid())
  username             String    @db.VarChar(100)
  email                String    @unique @db.VarChar(255)
  password             String    @db.VarChar(255)
  firstName            String?   @map("first_name") @db.VarChar(100)
  lastName             String?   @map("last_name") @db.VarChar(100)
  phoneNumber          String?   @map("phone_number") @db.VarChar(20)
  role                 Role      @default(USER)
  isActive             Boolean   @default(true) @map("is_active")
  isEmailVerified      Boolean   @default(false) @map("is_email_verified")
  lastLoginAt          DateTime? @map("last_login_at")
  profileImage         String?   @map("profile_image") @db.VarChar(255)
  bio                  String?   @db.Text
  preferences          Json?
  resetPasswordToken   String?   @map("reset_password_token") @db.VarChar(255)
  resetPasswordExpires DateTime? @map("reset_password_expires")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  deletedAt            DateTime? @map("deleted_at")

  @@map("users")
  @@index([email])
}

enum Role {
  ADMIN
  USER
  MODERATOR
}
```

#### 3.2 베이스라인 마이그레이션 생성
```bash
# 기존 DB 스키마를 베이스라인으로 설정
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
npx prisma migrate resolve --applied "0_init"
```

### Phase 4: Repository 패턴 전환 (리스크: 중간)
#### 4.1 Prisma Client 싱글톤 생성
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### 4.2 UserRepository 전환
```typescript
// src/repositories/user.repository.prisma.ts (새 파일)
import { prisma } from '../lib/prisma';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export class UserRepository {
  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { id, isActive: true }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { email, isActive: true }
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await prisma.user.findFirst({
      where: { email, isActive: true }
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    // 비밀번호 해싱
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    return await prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    // 비밀번호 해싱 (업데이트 시)
    if (data.password && typeof data.password === 'string') {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete
    const result = await prisma.user.update({
      where: { id },
      data: { 
        isActive: false, 
        deletedAt: new Date() 
      }
    });
    return !!result;
  }

  async hardDelete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async count(): Promise<number> {
    return await prisma.user.count({
      where: { isActive: true }
    });
  }

  async search(query: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
```

### Phase 5: DB 연결 로직 수정 (리스크: 중간)
#### 5.1 서버 시작 파일 수정
```typescript
// src/server.ts
import 'reflect-metadata'; // TypeORM 의존성 제거 가능
import app from './app';
import { config } from './config/config';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

const PORT = config.port || 5000;

const startServer = async () => {
  try {
    // Prisma 연결 테스트
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT} in ${config.env} mode`);
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} signal received: closing HTTP server`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Prisma 연결 종료
      await prisma.$disconnect();
      logger.info('Database connection closed');
      
      process.exit(0);
    });
  }
}
```

### Phase 6: 테스트 및 검증 (리스크: 낮음)
#### 6.1 단위 테스트
```bash
# Prisma Client 생성
npx prisma generate

# 테스트 실행
npm test
```

#### 6.2 통합 테스트 체크리스트
- [ ] User CRUD 작업 테스트
- [ ] 비밀번호 해싱 검증
- [ ] Soft delete 기능 확인
- [ ] 검색 기능 테스트
- [ ] 트랜잭션 처리 확인

### Phase 7: TypeORM 제거 (리스크: 높음)
#### 7.1 TypeORM 패키지 제거
```bash
# TypeORM 관련 패키지 제거
npm uninstall typeorm pg reflect-metadata @types/pg

# 불필요한 파일 삭제
rm src/config/data-source.ts
rm src/entities/User.ts
rm -rf src/migrations
rm -rf src/subscribers
```

#### 7.2 Import 정리
- TypeORM 관련 import 제거
- Repository를 Prisma 버전으로 교체
- tsconfig.json에서 `strictPropertyInitialization: false` 제거 가능

### Phase 8: 프로덕션 마이그레이션 (리스크: 높음)
#### 8.1 프로덕션 준비
```bash
# 프로덕션 마이그레이션 생성
npx prisma migrate dev --name init

# 프로덕션 배포
npx prisma migrate deploy
```

#### 8.2 환경별 설정
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"] // 선택적: 성능 모니터링
}
```

## ⚠️ 주의사항 및 리스크 관리

### 주요 차이점
| TypeORM | Prisma |
|---------|---------|
| `@Entity()` 데코레이터 | schema.prisma 파일 |
| Repository 패턴 | Prisma Client API |
| `save()` 메서드 | `create()`, `update()` 분리 |
| 자동 마이그레이션 | 명시적 마이그레이션 |
| QueryBuilder | Prisma Client 쿼리 |

### 리스크 및 대응 방안
1. **데이터 손실 리스크**
   - 백업 필수
   - 스테이징 환경에서 먼저 테스트
   - 베이스라인 마이그레이션 사용

2. **성능 차이**
   - Prisma의 쿼리 최적화 확인
   - N+1 문제 주의 (include 사용)
   - 필요시 Raw SQL 사용

3. **기능 호환성**
   - TypeORM 특정 기능 대체 방안 마련
   - 트랜잭션 처리 방식 변경
   - 관계 설정 방식 차이 숙지

## 📊 예상 타임라인

| Phase | 작업 내용 | 예상 시간 | 리스크 |
|-------|----------|-----------|---------|
| 1 | 준비 및 백업 | 1시간 | 낮음 |
| 2 | Prisma 설치 | 30분 | 낮음 |
| 3 | 스키마 정의 | 2시간 | 중간 |
| 4 | Repository 전환 | 3시간 | 중간 |
| 5 | DB 연결 수정 | 1시간 | 중간 |
| 6 | 테스트 | 2시간 | 낮음 |
| 7 | TypeORM 제거 | 1시간 | 높음 |
| 8 | 프로덕션 배포 | 2시간 | 높음 |
| **총계** | | **12.5시간** | |

## ✅ 체크리스트

### 마이그레이션 전
- [ ] 데이터베이스 백업 완료
- [ ] 새 브랜치 생성
- [ ] 팀원 공지
- [ ] 롤백 계획 수립

### 마이그레이션 중
- [ ] Prisma 설치 및 설정
- [ ] 스키마 정의 및 검증
- [ ] Repository 패턴 전환
- [ ] 모든 CRUD 작업 테스트
- [ ] 성능 테스트

### 마이그레이션 후
- [ ] TypeORM 완전 제거 확인
- [ ] 문서 업데이트
- [ ] 팀 교육
- [ ] 모니터링 설정
- [ ] 성능 벤치마크

## 🔄 롤백 계획

만약 문제 발생 시:
1. Git에서 이전 브랜치로 복원
2. TypeORM 패키지 재설치
3. 데이터베이스 백업 복원 (필요시)
4. 서비스 재시작

```bash
# 롤백 명령어
git checkout main
npm install typeorm pg reflect-metadata @types/pg
npm run dev
```

## 📚 참고 자료

- [Prisma 공식 마이그레이션 가이드](https://www.prisma.io/docs/guides/migrate-from-typeorm)
- [Prisma vs TypeORM 비교](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-typeorm)
- [Prisma 베스트 프랙티스](https://www.prisma.io/docs/guides/performance-and-optimization)

## 🎯 성공 지표

- ✅ 모든 API 엔드포인트 정상 작동
- ✅ 테스트 커버리지 유지 (기존 수준 이상)
- ✅ 응답 시간 개선 또는 유지
- ✅ 메모리 사용량 개선
- ✅ 개발자 생산성 향상

---

**작성일**: 2025-09-10
**작성자**: Migration Planning System
**버전**: 1.0.0