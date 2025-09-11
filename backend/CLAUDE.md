# ProjectManager 백엔드 아키텍처 가이드

## 프로젝트 개요

ProjectManager 백엔드는 **DI Container 기반의 모듈형 Clean Architecture**로 설계된 현대적인 Express/TypeScript 애플리케이션입니다. 

### 핵심 설계 원칙
- **Dependency Injection**: tsyringe를 활용한 의존성 주입으로 결합도 최소화
- **Domain Module Pattern**: 도메인별 완전 독립 모듈 구조
- **Repository Pattern**: 데이터 접근 로직 추상화
- **Service Layer**: 비즈니스 로직의 체계적 분리
- **Type Safety**: TypeScript의 엄격한 타입 체크 활용

## 기술 스택

### 핵심 프레임워크
- **Express.js**: 웹 프레임워크
- **TypeScript**: 정적 타입 언어 (ES2022 target)
- **tsx**: 개발 시 TypeScript 실행 도구
- **Node.js 18+**: 런타임 환경

### 데이터베이스 & ORM
- **PostgreSQL**: 관계형 데이터베이스
- **Prisma 6.15.0**: 타입 안전 ORM
  - 자동 타입 생성
  - 마이그레이션 관리
  - 쿼리 빌더
  - 트랜잭션 지원

### 의존성 주입 & 아키텍처
- **tsyringe 4.10.0**: 경량 DI 컨테이너
- **reflect-metadata 0.2.2**: 데코레이터 메타데이터 지원
- **@injectable, @inject**: 의존성 주입 데코레이터

### 보안 & 인증
- **JWT (jsonwebtoken 9.0.2)**: 토큰 기반 인증
  - Access Token (15분) + Refresh Token (30일)
  - Token Rotation 보안 강화
  - 토큰 블랙리스트 관리
- **bcryptjs 2.4.3**: 비밀번호 해싱 (rounds: 10)
- **helmet 7.1.0**: 보안 헤더 설정
- **cors 2.8.5**: CORS 정책 관리
- **express-rate-limit 7.2.0**: API 속도 제한

### 검증 & 미들웨어
- **express-validator 7.2.1**: 입력 검증
- **class-validator 0.14.1**: 클래스 기반 검증
- **class-transformer 0.5.1**: 객체 변환
- **compression 1.7.4**: 응답 압축
- **cookie-parser 1.4.7**: 쿠키 파싱
- **morgan 1.10.0**: HTTP 로깅

### 개발 도구 & 테스팅
- **Jest 29.7.0**: 테스트 프레임워크
- **ts-jest 29.1.2**: TypeScript Jest 지원
- **Supertest 6.3.4**: HTTP 테스트 유틸리티
- **ESLint + Prettier**: 코드 품질 도구
- **Winston 3.13.0**: 구조화된 로깅

### API 문서화
- **swagger-jsdoc 6.2.8**: JSDoc 기반 스웨거 생성
- **swagger-ui-express 5.0.0**: 스웨거 UI 제공

## 아키텍처 설계

### 1. DI Container 기반 아키텍처

#### DI Container 구조 (`src/core/container.ts`)
```typescript
class DIContainer {
  // Singleton Pattern으로 전역 관리
  static getInstance(): DIContainer

  // 의존성 등록 및 초기화
  async initialize(): Promise<void>

  // 계층별 의존성 등록
  private registerInfrastructure(): void    // Database, Cache
  private registerRepositories(): void     // Data Access Layer
  private registerServices(): void         // Business Logic Layer
  private registerControllers(): void      // Presentation Layer

  // 의존성 해결
  resolve<T>(token: string): T
  registerMock<T>(token: string, mockInstance: T): void
}
```

#### 의존성 주입 패턴
```typescript
// Service Layer 예제
@injectable()
export class AuthService {
  constructor(
    @inject('AuthenticationService') private authenticationService: AuthenticationService,
    @inject('RegistrationService') private registrationService: RegistrationService,
    @inject('TokenService') private tokenService: TokenService
  ) {}
}

// Repository Layer 예제
@injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @inject('PrismaService') prismaService: PrismaService
  ) {
    super(prismaService.getClient(), 'user');
  }
}
```

### 2. 모듈 시스템

#### 도메인 모듈 구조
```
src/modules/auth/                 # 인증 도메인 모듈
├── controllers/                  # Presentation Layer
│   └── auth.controller.ts        # API 엔드포인트 핸들러
├── services/                     # Business Logic Layer
│   ├── auth.service.ts           # Facade Service
│   ├── authentication.service.ts # 로그인/로그아웃
│   ├── registration.service.ts   # 회원가입
│   ├── password.service.ts       # 비밀번호 관리
│   ├── token.service.ts          # JWT 토큰 관리
│   └── approval.service.ts       # 승인 프로세스
├── repositories/                 # Data Access Layer
│   ├── user.repository.ts        # 사용자 데이터 접근
│   ├── company.repository.ts     # 회사 데이터 접근
│   └── token.repository.ts       # 토큰 데이터 접근
├── dto/                          # Data Transfer Objects
│   ├── request/                  # 요청 DTO
│   └── response/                 # 응답 DTO
├── validators/                   # 입력 검증
│   ├── auth.validator.ts         # 검증 로직
│   └── schemas/                  # 검증 스키마
│       └── auth.schema.ts
├── interfaces/                   # 타입 정의
│   └── auth.interface.ts
└── auth.module.ts               # 모듈 통합 관리
```

#### 모듈 통합 관리 (`AuthModule`)
```typescript
export class AuthModule {
  private static _instance: AuthModule;
  private _router: Router;
  
  // Singleton Pattern
  public static getInstance(): AuthModule

  // 계층별 초기화
  private initializeRepositories(): void
  private initializeServices(): void      // DI 기반 서비스 생성
  private initializeController(): void
  private initializeRoutes(): void       // 라우트 설정

  public get router(): Router            // Express Router 반환
  public getModuleInfo()                 // 모듈 메타데이터
}
```

### 3. 계층별 아키텍처

#### Presentation Layer (Controllers)
- **책임**: HTTP 요청/응답 처리, 입력 검증, 응답 포맷팅
- **패턴**: Dependency Injection을 통한 Service 의존성 해결
- **보안**: JWT 토큰 검증, 권한 확인, CORS 처리

#### Business Logic Layer (Services)
- **Facade Service**: 외부 인터페이스 제공 (AuthService)
- **Domain Services**: 특화된 비즈니스 로직
  - AuthenticationService: 로그인/로그아웃
  - RegistrationService: 회원가입 프로세스
  - TokenService: JWT 토큰 생명주기 관리
  - PasswordService: 비밀번호 정책 및 재설정
  - ApprovalService: 승인 워크플로우

#### Data Access Layer (Repositories)
- **BaseRepository**: 공통 CRUD 인터페이스
- **Domain Repositories**: 도메인별 특화 쿼리
- **Transaction Support**: Prisma 트랜잭션 관리
- **Type Safety**: Prisma 자동 타입 생성 활용

#### Infrastructure Layer
- **PrismaService**: 데이터베이스 연결 관리 (Singleton)
- **Cache Service**: Redis 캐시 관리 (예정)
- **External Services**: 이메일, 파일 저장소 등

### 4. 공유 모듈 (`src/shared/`)

#### 미들웨어 (`shared/middleware/`)
- **errorHandler**: 전역 에러 처리
- **auth.middleware**: JWT 인증 및 권한 검증
- **rateLimiter**: API 속도 제한 (15분 100회)
- **validateRequest**: 입력 검증
- **requestLogger**: 요청 로깅

#### 유틸리티 (`shared/utils/`)
- **jwt.ts**: JWT 토큰 생성/검증
- **password.ts**: 비밀번호 해싱/검증
- **response.ts**: 표준 응답 포맷터
- **errors.ts**: 커스텀 에러 클래스
- **logger.ts**: Winston 로깅 설정

#### 인터페이스 (`shared/interfaces/`)
- **repository.interfaces.ts**: Repository 계약 정의
- 공통 타입 및 인터페이스

## 디렉터리 구조

```
backend/src/
├── core/                         # 핵심 시스템
│   ├── container.ts              # DI Container 설정
│   ├── config/                   # 설정 관리
│   │   └── config.ts             # 환경별 설정
│   └── bootstrap/                # 애플리케이션 부트스트랩
│       └── app.bootstrap.ts      # Express 앱 초기화
│
├── modules/                      # 도메인 모듈
│   ├── auth/                     # 인증 모듈 (완전 구현)
│   ├── user/                     # 사용자 관리 모듈 (구조만)
│   ├── project/                  # 프로젝트 관리 모듈 (구조만)
│   └── company/                  # 회사 관리 모듈 (구조만)
│
├── shared/                       # 공유 구성요소
│   ├── middleware/               # 공통 미들웨어
│   ├── utils/                    # 유틸리티 함수
│   ├── constants/                # 애플리케이션 상수
│   ├── interfaces/               # 공통 인터페이스
│   └── index.ts                  # Barrel Exports
│
├── infrastructure/               # 인프라스트럭처
│   ├── database/                 # 데이터베이스 계층
│   │   ├── prisma.service.ts     # Prisma 서비스 (Singleton)
│   │   ├── base.repository.ts    # 기본 Repository 클래스
│   │   └── repositories/         # 공통 Repository들
│   ├── cache/                    # 캐시 서비스
│   └── external-services/        # 외부 서비스 통합
│
├── app.ts                        # Express 애플리케이션 설정
├── server.ts                     # 서버 진입점
└── lib/                          # 외부 라이브러리 통합
    └── prisma.ts                 # Prisma 클라이언트 설정
```

### TypeScript Path Mapping
```json
{
  "paths": {
    "@/*": ["src/*"],
    "@modules/*": ["src/modules/*"],
    "@shared/*": ["src/shared/*"],
    "@infrastructure/*": ["src/infrastructure/*"],
    "@core/*": ["src/core/*"]
  }
}
```

## 데이터베이스 설계

### Prisma Schema 주요 모델

#### 사용자 및 인증 관련
```prisma
model User {
  id            String   @id @db.VarChar(50)
  email         String   @unique @db.VarChar(255)
  password_hash String   @db.VarChar(255)
  user_name     String   @db.VarChar(100)
  phone_number  String?  @db.VarChar(20)
  role_id       Int      // 1: SYSTEM_ADMIN, 2: COMPANY_MANAGER, 3: TEAM_MEMBER
  status_id     Int      // 1: ACTIVE, 2: INACTIVE, 3: PENDING
  company_id    String?  @db.VarChar(50)
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())
  
  // Relations
  company           Company?             @relation("CompanyEmployees")
  managedCompany    Company?             @relation("CompanyManager")
  refreshTokens     RefreshToken[]
  passwordResetTokens PasswordResetToken[]
  tokenBlacklist    TokenBlacklist[]
  // ... other relations
}

model Company {
  id                  String @id @db.VarChar(50)
  company_name        String @db.VarChar(200)
  company_description String? @db.VarChar(1000)
  manager_id          String? @unique @db.VarChar(50)
  invitation_code     String? @unique @db.VarChar(20)
  status_id           Int
  created_at          DateTime @default(now())
  
  manager    User?   @relation("CompanyManager")
  employees  User[]  @relation("CompanyEmployees")
  projects   Project[]
}
```

#### 토큰 관리
```prisma
model RefreshToken {
  id                 String    @id @db.VarChar(50)
  user_id            String    @db.VarChar(50)
  token_hash         String    @unique @db.VarChar(255)
  token_family       String    @db.VarChar(100)  // Token Rotation 지원
  expires_at         DateTime  @db.Timestamp(6)
  created_at         DateTime  @default(now())
  last_used_at       DateTime? @db.Timestamp(6)
  revoked_at         DateTime? @db.Timestamp(6)
  revoked_reason     String?   @db.VarChar(50)
  user_agent         String?   @db.VarChar(500)
  device_fingerprint String?   @db.VarChar(255)
}

model TokenBlacklist {
  id             String   @id @db.VarChar(50)
  jti            String   @unique @db.VarChar(100)
  token_type     String   @db.VarChar(20)
  user_id        String?  @db.VarChar(50)
  expires_at     DateTime @db.Timestamp(6)
  blacklisted_at DateTime @default(now())
  reason         String?  @db.VarChar(100)
}
```

### 데이터베이스 관계
- **Users ↔ Companies**: Many-to-One (직원), One-to-One (매니저)
- **Companies ↔ Projects**: One-to-Many
- **Projects ↔ Tasks**: One-to-Many
- **Users ↔ Tasks**: Many-to-Many (할당)
- **Users ↔ RefreshTokens**: One-to-Many
- **모든 활동**: ActivityLog로 추적

## API 구조

### 인증 API (완전 구현)
```
POST /api/v1/auth/signup/company-manager    # 회사 관리자 회원가입
POST /api/v1/auth/signup/team-member        # 팀원 회원가입
POST /api/v1/auth/login                     # 로그인
POST /api/v1/auth/logout                    # 로그아웃 (인증 필요)
POST /api/v1/auth/refresh                   # 토큰 갱신
POST /api/v1/auth/password/forgot           # 비밀번호 재설정 요청
GET  /api/v1/auth/password/verify           # 재설정 토큰 검증
POST /api/v1/auth/password/reset            # 비밀번호 재설정
POST /api/v1/auth/admin/approve/company     # 회사 승인 (시스템 관리자)
POST /api/v1/auth/manager/approve/member    # 팀원 승인 (회사 관리자)
```

### 기타 API (구조만 준비)
```
/api/v1/users       # 사용자 관리
/api/v1/projects    # 프로젝트 관리
/api/v1/tasks       # 작업 관리
/api/v1/companies   # 회사 관리
/api/v1/logs        # 활동 로그
```

### 공통 엔드포인트
```
GET /health         # 헬스 체크
GET /api/docs      # API 문서 (개발 환경)
```

## 보안 시스템

### 1. JWT 이중 토큰 전략

#### Access Token (15분)
- **목적**: API 접근 권한 제공
- **저장**: 클라이언트 메모리 (localStorage 금지)
- **포함 정보**: user_id, email, role_id, company_id, status_id, jti
- **검증**: 모든 보호된 엔드포인트에서 필수

#### Refresh Token (30일)
- **목적**: Access Token 갱신
- **저장**: HttpOnly Cookie (XSS 방지)
- **보안**: Token Family + Rotation으로 탈취 감지
- **관리**: 사용 시 새 토큰 패밀리 생성

### 2. Token Rotation 메커니즘
```typescript
// 토큰 갱신 시 보안 강화
async rotateTokens(refreshToken: string) {
  // 1. 기존 토큰 검증
  // 2. 토큰 패밀리 확인 (탈취 감지)
  // 3. 새로운 토큰 패밀리 생성
  // 4. 기존 패밀리 모든 토큰 무효화
  // 5. 새 Access Token + Refresh Token 발급
}
```

### 3. 권한 시스템

#### 역할 기반 접근 제어
- **SYSTEM_ADMIN (1)**: 전체 시스템 관리
- **COMPANY_MANAGER (2)**: 회사 내 관리
- **TEAM_MEMBER (3)**: 개인 작업 영역

#### 상태 기반 접근 제어
- **ACTIVE (1)**: 정상 사용 가능
- **INACTIVE (2)**: 사용 정지
- **PENDING (3)**: 승인 대기

#### 미들웨어 보안 체인
```typescript
// 인증 필요 엔드포인트 예제
router.post('/admin/approve/company',
  authenticateToken,        // JWT 토큰 검증
  requireActiveUser,        // 활성 사용자 확인
  requireSystemAdmin,       // 시스템 관리자 권한
  validateRequest,          // 입력 검증
  AuthController.approve    // 비즈니스 로직
);
```

### 4. 보안 미들웨어 스택

#### Helmet.js 보안 헤더
```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  noSniff: true,
  xssFilter: true
}));
```

#### CORS 정책
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Rate Limiting
- **Window**: 15분
- **Limit**: IP당 100회
- **Scope**: `/api/v1/*` 경로
- **Headers**: 남은 요청 수, 리셋 시간 제공

## 데이터 플로우 워크플로우

### 1. 요청 처리 파이프라인
```
HTTP Request
    ↓
[Security Headers] (helmet)
    ↓
[CORS Policy] (cors)
    ↓
[Request Parsing] (express.json, urlencoded)
    ↓
[Request Logging] (morgan, winston)
    ↓
[Rate Limiting] (express-rate-limit)
    ↓
[Route Matching] (Express Router)
    ↓
[Input Validation] (express-validator)
    ↓
[JWT Authentication] (authenticateToken)
    ↓
[Authorization] (requireRole, requireSameCompany)
    ↓
[Controller] (DI Injection)
    ↓
[Service Layer] (Business Logic)
    ↓
[Repository Layer] (Data Access)
    ↓
[Database] (Prisma + PostgreSQL)
    ↓
[Response Formatting] (ResponseFormatter)
    ↓
[Error Handling] (errorHandler)
    ↓
HTTP Response
```

### 2. 인증 플로우
```
Login Request
    ↓
[Validate Credentials] (AuthenticationService)
    ↓
[Generate Token Pair] (TokenService)
    ↓
[Store Refresh Token] (TokenRepository)
    ↓
[Set HttpOnly Cookie] (Controller)
    ↓
[Return Access Token] (Response)

Token Refresh
    ↓
[Validate Refresh Token] (TokenService)
    ↓
[Check Token Family] (Security)
    ↓
[Rotate Token Family] (Token Rotation)
    ↓
[Generate New Tokens] (TokenService)
    ↓
[Update Cookie] (Controller)
```

### 3. 에러 처리 플로우
```
Error Occurrence
    ↓
[Prisma Error Detection] (prismaErrorHandler)
    ↓
[ApiError Transformation] (Custom Errors)
    ↓
[Winston Logging] (Structured Logs)
    ↓
[Response Formatting] (Error Response)
    ↓
[Environment-based Details] (Dev vs Prod)
```

## 개발 워크플로우

### 1. 개발 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 2. 코드 품질 검사
```bash
# 린팅 검사
npm run lint

# 자동 수정
npm run lint:fix

# 타입 체크 (빌드)
npm run build
```

### 3. 테스트 실행
```bash
# 단위 테스트
npm test

# Watch 모드
npm run test:watch

# 커버리지 포함
npm run test:coverage
```

### 4. 데이터베이스 관리
```bash
# Prisma Studio (GUI)
npx prisma studio

# 스키마 동기화
npx prisma generate

# 마이그레이션 생성
npx prisma migrate dev --name feature_name
```

### 5. 프로덕션 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## 코드 컨벤션

### TypeScript 설정
```json
{
  "strict": true,
  "strictPropertyInitialization": false,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### 명명 규칙
- **클래스**: PascalCase (UserService, AuthController)
- **함수/변수**: camelCase (getUserData, isValidToken)
- **상수**: UPPER_SNAKE_CASE (JWT_SECRET, MAX_RETRY_COUNT)
- **인터페이스**: PascalCase, 'I' 접두사 금지 (UserRepository, AuthService)
- **타입**: PascalCase (LoginRequestDto, AuthenticatedRequest)

### 파일 구조
```typescript
// 1. 외부 라이브러리 import
import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';

// 2. 내부 모듈 import (@paths 사용)
import { AuthService } from '@modules/auth/services/auth.service';
import { ResponseFormatter } from '@shared/utils/response';

// 3. 타입 import (마지막)
import { LoginRequestDto } from '@modules/auth/dto/request';

@injectable()
export class AuthController {
  constructor(
    @inject('AuthService') private authService: AuthService
  ) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // 비즈니스 로직
    } catch (error) {
      next(error);
    }
  }
}
```

### Git 커밋 메시지
- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **refactor**: 코드 리팩토링
- **docs**: 문서 수정
- **test**: 테스트 추가/수정
- **chore**: 빌드 시스템, 의존성 업데이트

## 환경 설정

### 환경 변수 (.env)
```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/project_manager

# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_RESET_SECRET=your-reset-secret-key-min-32-chars

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# Cache (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_DIR=logs
```

### Docker 개발 환경
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: project_manager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/project_manager
```

## 성능 최적화

### 1. 데이터베이스 최적화
- **인덱스**: 자주 조회되는 컬럼에 인덱스 설정
- **쿼리 최적화**: Prisma의 선택적 필드 로딩
- **커넥션 풀**: Prisma 커넥션 풀 설정
- **트랜잭션**: 일관성이 필요한 작업의 트랜잭션 처리

### 2. 캐싱 전략
- **Redis**: 세션, 임시 데이터 캐싱 (구현 예정)
- **토큰 블랙리스트**: 메모리 캐싱으로 성능 향상
- **쿼리 결과**: 자주 조회되는 데이터 캐싱

### 3. 보안과 성능 균형
- **Rate Limiting**: API 남용 방지 + 서버 보호
- **JWT 만료시간**: 보안과 사용성의 균형 (15분/30일)
- **압축**: gzip 압축으로 응답 크기 최소화

## 향후 확장 계획

### 1. 미구현 모듈 완성
- **User Module**: 사용자 프로필 관리
- **Project Module**: 프로젝트 생명주기 관리
- **Company Module**: 회사 설정 및 관리
- **Task Module**: 작업 할당 및 추적

### 2. 고급 기능 추가
- **WebSocket**: 실시간 알림 시스템
- **File Upload**: 파일 첨부 기능
- **Email Service**: 이메일 발송 시스템
- **Audit Log**: 상세 감사 로그
- **API Rate Limiting**: 사용자별 제한
- **Monitoring**: APM 도구 연동

### 3. 인프라 개선
- **Redis Clustering**: 고가용성 캐시
- **Database Sharding**: 대용량 데이터 처리
- **Microservices**: 모듈별 서비스 분리
- **CI/CD**: 자동화된 배포 파이프라인

## 문제 해결 가이드

### 1. 일반적인 문제
- **DI Container 오류**: `reflect-metadata` import 확인
- **Prisma 연결 오류**: DATABASE_URL 환경 변수 확인
- **JWT 토큰 오류**: 비밀키 길이 (최소 32자) 확인
- **CORS 오류**: CORS_ORIGIN 설정 확인

### 2. 개발 도구
- **Prisma Studio**: 데이터베이스 GUI 탐색
- **Winston Logs**: 구조화된 로그 분석
- **Jest Coverage**: 테스트 커버리지 확인
- **ESLint**: 코드 품질 검사

### 3. 모니터링
```typescript
// 헬스 체크 엔드포인트
GET /health
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

이 문서는 ProjectManager 백엔드 시스템의 완전한 가이드입니다. 추가 질문이나 구체적인 구현 사항에 대해서는 코드 주석과 테스트 케이스를 참조하시기 바랍니다.