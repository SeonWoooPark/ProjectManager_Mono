# ProjectManager 백엔드 아키텍처 가이드

**DI Container 기반 모듈형 Clean Architecture로 설계된 Express/TypeScript 애플리케이션**

## 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| **Runtime** | Node.js + TypeScript | 18+ / 5.4 | 실행 환경 |
| **Framework** | Express.js | 4.19 | 웹 프레임워크 |
| **Database** | PostgreSQL + Prisma | 15 / 6.15 | ORM 및 DB |
| **DI Container** | tsyringe + reflect-metadata | 4.10 / 0.2 | 의존성 주입 |
| **Security** | JWT + bcryptjs + helmet | 9.0 / 2.4 / 7.1 | 인증/보안 |
| **Testing** | Jest + Supertest | 29.7 / 6.3 | 테스트 프레임워크 |
| **Build** | tsx (dev) + tsc (prod) | 4.7 / 5.4 | 빌드 도구 |

## 폴더 구조

```
backend/src/
├── core/                    # 핵심 시스템 📋 [상세 가이드](src/core/CLAUDE.md)
│   ├── container.ts         # DI Container (의존성 주입 중앙 관리)
│   ├── config/              # 환경별 설정
│   └── bootstrap/           # 애플리케이션 부트스트랩
├── modules/                 # 도메인 모듈 📋 [상세 가이드](src/modules/CLAUDE.md)
│   ├── auth/                # 인증 모듈 ✅ 완전 구현
│   │   ├── auth.module.ts   # 모듈 통합 관리
│   │   ├── controllers/     # API 엔드포인트
│   │   ├── services/        # 비즈니스 로직 (6개 전문 서비스)
│   │   ├── repositories/    # 데이터 접근
│   │   ├── dto/            # 요청/응답 DTO
│   │   ├── validators/      # 입력 검증
│   │   ├── middleware/      # 인증 미들웨어 (shared에서 이동)
│   │   ├── utils/          # JWT, 비밀번호 유틸리티 (shared에서 이동)
│   │   └── interfaces/     # 인증 관련 타입 정의 (shared에서 이동)
│   ├── members/            # 멤버 관리 (구조만)
│   └── task/               # 태스크 관리 (구조만)
├── shared/                 # 공유 구성요소 📋 [상세 가이드](src/shared/CLAUDE.md)
│   ├── middleware/         # 보안, 검증, 로깅 미들웨어 (인증은 auth 모듈로 이동)
│   ├── utils/             # 응답 포맷, 로깅, 에러 유틸리티 (JWT/암호화는 auth 모듈로 이동)
│   └── interfaces/        # 공통 타입 정의 (인증 타입은 auth 모듈로 이동)
├── infrastructure/         # 인프라 계층 📋 [상세 가이드](src/infrastructure/CLAUDE.md)
│   ├── database/          # 데이터베이스 계층 (Prisma, Repository Pattern)
│   ├── cache/            # 캐시 계층 (Redis/InMemory)
│   └── external-services/ # 외부 서비스 연동 (Email 등)
├── app.ts                 # Express 앱 설정
└── server.ts              # 서버 진입점
```

## 핵심 아키텍처

### 1. DI Container 패턴 (`src/core/container.ts`)

```typescript
// 의존성 주입 중앙 관리
class DIContainer {
  async initialize() {
    this.registerInfrastructure();  // Database, Cache
    this.registerRepositories();    // Data Access
    this.registerServices();        // Business Logic  
    this.registerControllers();     // API Handlers
  }
}

// 의존성 해결
@injectable()
export class AuthService {
  constructor(
    @inject('AuthenticationService') private authenticationService,
    @inject('TokenService') private tokenService
  ) {}
}
```

### 2. 모듈 시스템 (`AuthModule`)

```typescript
export class AuthModule {
  // Singleton 패턴으로 모듈 관리
  public static getInstance(): AuthModule
  
  // 계층별 초기화
  private initializeRepositories()  // Repository Layer
  private initializeServices()      // Service Layer (DI)
  private initializeController()    // Controller Layer
  private initializeRoutes()        // Express Routes
  
  public get router(): Router       // Express Router 반환
}
```

### 3. Service Layer 분해 (824줄 → 6개 전문 서비스)

- **AuthenticationService**: 로그인/로그아웃 
- **TokenService**: JWT 토큰 생명주기 관리
- **PasswordService**: 비밀번호 정책 및 재설정
- **RegistrationService**: 회원가입 프로세스
- **ApprovalService**: 승인 워크플로우
- **AuthService**: Facade Pattern (통합 인터페이스)

## API 엔드포인트 (Auth Module - 완전 구현)

### 공개 API
```
POST /api/v1/auth/signup/company-manager  # 회사 관리자 회원가입
POST /api/v1/auth/signup/team-member      # 팀원 회원가입  
POST /api/v1/auth/login                   # 로그인
POST /api/v1/auth/refresh                 # 토큰 갱신
POST /api/v1/auth/password/forgot         # 비밀번호 재설정 요청
GET  /api/v1/auth/password/verify         # 재설정 토큰 검증
POST /api/v1/auth/password/reset          # 비밀번호 재설정
```

### 보호된 API (JWT 인증 필요)
```
POST /api/v1/auth/logout                  # 로그아웃
POST /api/v1/auth/admin/approve/company   # 회사 승인 (SYSTEM_ADMIN)
POST /api/v1/auth/manager/approve/member  # 팀원 승인 (COMPANY_MANAGER)
```

## 보안 시스템

### JWT 이중 토큰 전략
- **Access Token**: 15분, API 접근용
- **Refresh Token**: 30일, HttpOnly Cookie, Token Rotation

### 보안 미들웨어 스택
```
Helmet (보안 헤더) → CORS → JSON 파싱 → Rate Limiting (15분/100회)
→ JWT 인증 → 권한 검증 → 입력 검증 → 비즈니스 로직
```

### 권한 시스템
- **SYSTEM_ADMIN (1)**: 전체 시스템 관리
- **COMPANY_MANAGER (2)**: 회사 내 관리  
- **TEAM_MEMBER (3)**: 개인 작업 영역

## 데이터 플로우

```
HTTP Request
    ↓
[Security Headers] helmet
    ↓
[CORS Policy] cors
    ↓
[Rate Limiting] 15분/100회
    ↓
[JWT Authentication] authenticateToken
    ↓
[Authorization] requireRole
    ↓
[Input Validation] express-validator
    ↓
[Controller] DI Injection
    ↓
[Service Layer] Business Logic
    ↓
[Repository Layer] Data Access
    ↓
[Database] Prisma + PostgreSQL
    ↓
[Response] JSON 표준 형식
```

## 데이터베이스 스키마 (Prisma)

### 핵심 모델
```prisma
model User {
  id            String   @id @db.VarChar(50)
  email         String   @unique
  password_hash String
  role_id       Int      // 1: ADMIN, 2: MANAGER, 3: MEMBER
  status_id     Int      // 1: ACTIVE, 2: INACTIVE, 3: PENDING
  company_id    String?
  // Relations: Company, RefreshTokens, etc.
}

model Company {
  id                  String @id @db.VarChar(50)  
  company_name        String
  manager_id          String? @unique
  invitation_code     String? @unique
  status_id           Int
  // Relations: Manager, Employees, Projects
}

model RefreshToken {
  id           String    @id
  user_id      String
  token_hash   String    @unique
  token_family String    // Token Rotation 지원
  expires_at   DateTime
  revoked_at   DateTime?
}
```

## 개발 워크플로우

### 환경 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정  
cp .env.example .env

# DB 마이그레이션
npx prisma migrate dev
npx prisma generate
```

### 개발 명령어
```bash
npm run dev         # 개발 서버 (포트 5000)
npm run build       # 프로덕션 빌드
npm run test        # Jest 테스트
npm run lint        # ESLint 검사
npx prisma studio   # DB GUI
```

### 환경 변수 (.env)
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/project_manager

# JWT 비밀키 (최소 32자)
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_RESET_SECRET=your-reset-secret-key-min-32-chars

BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
```

## TypeScript Path Mapping
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

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "선택적 메시지"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  },
  "timestamp": "ISO 8601"
}
```

## 문제 해결

### 일반적인 오류
- **DI Container 오류**: `reflect-metadata` import 확인
- **Prisma 연결 오류**: `DATABASE_URL` 환경 변수 확인  
- **JWT 토큰 오류**: 비밀키 길이 (최소 32자) 확인
- **CORS 오류**: `CORS_ORIGIN` 설정 확인

### 헬스 체크
```bash
GET /health
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 📚 추가 문서

각 모듈의 상세한 아키텍처와 구현 가이드는 아래 문서를 참조하세요:

### Core 모듈 상세 가이드
**DI Container 기반 의존성 주입과 애플리케이션 부트스트랩**
- 📋 **[Core 아키텍처 가이드](src/core/CLAUDE.md)**
  - DI Container 시스템 (tsyringe 기반)
  - 애플리케이션 부트스트랩 프로세스
  - 환경 설정 관리 시스템
  - 테스트 환경 구성 (Mock Container)
  - 의존성 등록 순서와 워크플로우

### Modules 계층 상세 가이드  
**도메인별 비즈니스 로직과 API 엔드포인트**
- 📋 **[Modules 아키텍처 가이드](src/modules/CLAUDE.md)**
  - Auth 모듈 완전 구현 (10개 API, 6개 전문 서비스)
  - Service 분해 전략 (Facade Pattern)
  - Controller-Service-Repository 계층 구조
  - DTO 시스템과 입력 검증
  - Task/Members 모듈 확장 계획

### Shared 모듈 상세 가이드
**횡단 관심사와 공통 기능 인프라스트럭처**
- 📋 **[Shared 아키텍처 가이드](src/shared/CLAUDE.md)**
  - 에러 처리 시스템 (계층적 에러 구조)
  - 미들웨어 체인 (검증, 로깅, 보안 헤더) - 인증은 auth 모듈로 이동
  - 공통 유틸리티와 응답 표준화
  - DB 제약조건 검증 시스템
  - 보안 시스템 (JWT, 비밀번호 관리)는 auth 모듈로 이동됨

### Infrastructure 계층 상세 가이드
**데이터베이스, 캐시, 외부 서비스 연동**
- 📋 **[Infrastructure 아키텍처 가이드](src/infrastructure/CLAUDE.md)**
  - 데이터베이스 계층 (PrismaService, BaseRepository, Repository Pattern)
  - 캐시 계층 (Redis/InMemory 캐시 시스템)
  - 외부 서비스 연동 (Email Service 등)
  - 워크플로우 및 의존성 관계
  - 확장성 및 베스트 프랙티스

---

**2025.09 현재 구현 상태**: Auth 모듈 완전 구현 완료 (10개 API, 6개 전문 서비스, DI Container 기반 아키텍처)