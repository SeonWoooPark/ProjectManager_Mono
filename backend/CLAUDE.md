# Backend 애플리케이션 구조 및 가이드

## 개요

Express.js와 TypeScript를 기반으로 한 RESTful API 서버입니다. Prisma ORM을 사용하여 PostgreSQL 데이터베이스와 통신하며, JWT 기반 인증을 제공합니다.

## 디렉토리 구조

```
backend/
├── src/
│   ├── app.ts                 # Express 애플리케이션 설정
│   ├── server.ts              # 서버 진입점 및 초기화
│   ├── config/                # 설정 관리
│   │   └── config.ts          # 환경 변수 및 설정
│   ├── controllers/           # 요청 핸들러
│   │   └── auth.controller.ts # 인증 컨트롤러
│   ├── lib/                   # 외부 라이브러리 통합
│   │   ├── prisma.ts          # Prisma 클라이언트 인스턴스
│   │   └── prisma.template.ts # Prisma 템플릿
│   ├── middleware/            # Express 미들웨어
│   │   ├── auth.middleware.ts # JWT 인증 미들웨어
│   │   ├── dbConstraintValidator.ts # DB 제약 조건 검증
│   │   ├── errorHandler.ts    # 에러 핸들링
│   │   ├── notFoundHandler.ts # 404 처리
│   │   ├── rateLimiter.ts     # API 속도 제한
│   │   ├── requestLogger.ts   # 요청 로깅
│   │   └── validateRequest.ts # 입력 검증
│   ├── models/                # 데이터 모델 정의
│   ├── repositories/          # 데이터 접근 계층
│   ├── routes/                # API 라우트 정의
│   │   ├── index.ts           # 라우트 통합
│   │   └── auth.routes.ts     # 인증 라우트
│   ├── services/              # 비즈니스 로직
│   │   └── auth.service.ts    # 인증 서비스
│   ├── subscribers/           # 이벤트 리스너
│   ├── tests/                 # 단위 및 통합 테스트
│   ├── types/                 # TypeScript 타입 정의
│   │   └── auth.types.ts      # 인증 타입 정의
│   └── utils/                 # 유틸리티 함수
│       ├── dbConstraints.ts   # DB 제약 조건 유틸리티
│       ├── errors.ts          # 커스텀 에러 클래스
│       ├── jwt.ts             # JWT 토큰 관리
│       ├── logger.ts          # Winston 로거 설정
│       ├── password.ts        # 비밀번호 유틸리티
│       ├── prismaErrorHandler.ts # Prisma 에러 처리
│       └── response.ts        # 응답 포매터
├── prisma/
│   ├── schema.prisma          # Prisma 스키마 정의
│   ├── schema.prisma.template # Prisma 스키마 템플릿
│   ├── seed.ts               # 시드 데이터 스크립트
│   └── migrations/            # Prisma 마이그레이션 히스토리
├── dist/                      # 컴파일된 JavaScript 파일
├── logs/                      # 애플리케이션 로그 파일
├── scripts/                   # 유틸리티 스크립트
│   └── seed-admin.ts         # 관리자 시드 스크립트
├── backup/                    # 백업 디렉토리
├── docs/                      # API 문서
│   ├── login.md              # 로그인 API 문서
│   └── project_task.md       # 프로젝트/작업 API 문서
├── tests/                     # 통합 테스트
├── .env                       # 환경 변수
├── .env.example              # 환경 변수 예시
├── package.json              # 프로젝트 의존성
├── tsconfig.json             # TypeScript 설정
└── Dockerfile                # Docker 이미지 정의
```

## 기술 스택 상세

### 핵심 프레임워크

- **Express.js**: 웹 서버 프레임워크
- **TypeScript**: 타입 안정성을 위한 JavaScript 슈퍼셋
- **Prisma**: 차세대 ORM (Type-safe database access)
- **tsx**: TypeScript 실행 및 개발 서버

### 인증 및 보안

- **jsonwebtoken**: JWT 토큰 생성 및 검증
- **bcryptjs**: 비밀번호 해싱 (Salt rounds: 10)
- **helmet**: 보안 HTTP 헤더 설정
- **cors**: Cross-Origin Resource Sharing 관리
- **express-rate-limit**: API 호출 제한
- **express-validator**: 입력 검증 및 삭제

### 데이터베이스

- **PostgreSQL**: 메인 데이터베이스
- **Prisma Client**: 타입 안전 데이터베이스 클라이언트
- **Redis**: 캐싱 및 세션 관리 (예정)

### 로깅 및 모니터링

- **winston**: 구조화된 로깅
- **morgan**: HTTP 요청 로깅

### API 문서화

- **swagger-jsdoc**: Swagger 문서 생성
- **swagger-ui-express**: Swagger UI 제공

### 테스팅

- **Jest**: 테스트 프레임워크
- **Supertest**: HTTP 통합 테스트
- **ts-jest**: TypeScript Jest 지원

### 개발 도구

- **ESLint**: 코드 린팅
- **Prettier**: 코드 포매팅
- **tsx**: 개발 서버 및 핫 리로딩

## JWT 인증 시스템 상세

### 토큰 전략

- **Access Token**: 15분 유효기간, API 요청 인증용
- **Refresh Token**: 30일 유효기간, HttpOnly 쿠키 저장
- **Reset Token**: 1시간 유효기간, 비밀번호 재설정용
- **Token Rotation**: 보안 강화를 위한 토큰 순환
- **Token Blacklist**: 로그아웃 및 취소된 토큰 관리

### 역할 기반 접근 제어 (RBAC)

```
SYSTEM_ADMIN (roleId: 1)
  ├─ 모든 권한
  ├─ 회사 승인/거부
  └─ 시스템 관리

COMPANY_MANAGER (roleId: 2)
  ├─ 회사 내 모든 권한
  ├─ 팀원 승인/거부
  └─ 프로젝트 관리

TEAM_MEMBER (roleId: 3)
  ├─ 할당된 프로젝트 접근
  └─ 개인 정보 관리
```

### 사용자 상태 관리

- **ACTIVE (statusId: 1)**: 활성 사용자
- **INACTIVE (statusId: 2)**: 비활성 사용자
- **PENDING (statusId: 3)**: 승인 대기 중

## 인증 API 엔드포인트

### 공개 엔드포인트 (인증 불필요)

| Method | Endpoint                              | 설명                           |
| ------ | ------------------------------------- | ------------------------------ |
| POST   | `/api/v1/auth/signup/company-manager` | 회사 관리자 회원가입           |
| POST   | `/api/v1/auth/signup/team-member`     | 팀원 회원가입 (초대 코드 필요) |
| POST   | `/api/v1/auth/login`                  | 로그인                         |
| POST   | `/api/v1/auth/refresh`                | 토큰 갱신                      |
| POST   | `/api/v1/auth/password/forgot`        | 비밀번호 재설정 요청           |
| GET    | `/api/v1/auth/password/verify`        | 재설정 토큰 검증               |
| POST   | `/api/v1/auth/password/reset`         | 비밀번호 재설정                |

### 보호된 엔드포인트 (인증 필요)

| Method | Endpoint                              | 필요 권한       | 설명      |
| ------ | ------------------------------------- | --------------- | --------- |
| POST   | `/api/v1/auth/logout`                 | 모든 사용자     | 로그아웃  |
| POST   | `/api/v1/auth/admin/approve/company`  | SYSTEM_ADMIN    | 회사 승인 |
| POST   | `/api/v1/auth/manager/approve/member` | COMPANY_MANAGER | 팀원 승인 |

## 데이터베이스 모델

### 주요 엔티티

```prisma
- User                 # 사용자 정보
- Company             # 회사 정보
- Role                # 역할 정보 (SYSTEM_ADMIN, COMPANY_MANAGER, TEAM_MEMBER)
- Status              # 상태 정보 (ACTIVE, INACTIVE, PENDING)
- Project             # 프로젝트 정보
- Task                # 작업 정보
- ActivityLog         # 활동 로그
- AllocateProject     # 프로젝트 할당
- AllocateTask        # 작업 할당
```

### 관계

- User ↔ Company: Many-to-One
- User ↔ Role: Many-to-One
- User ↔ Status: Many-to-One
- User ↔ Project: Many-to-Many (through AllocateProject)
- User ↔ Task: Many-to-Many (through AllocateTask)
- Project ↔ Task: One-to-Many
- All entities → ActivityLog: One-to-Many

## API 워크플로우

### 1. 요청 처리 흐름 (상세)

```
Client Request
    ↓
Express Server (app.ts)
    ↓
Global Middleware Chain
    ├─ helmet (보안 헤더 설정)
    ├─ cors (CORS 정책 적용)
    ├─ compression (응답 압축)
    ├─ cookieParser (쿠키 파싱)
    ├─ express.json (JSON 파싱, 10mb 제한)
    ├─ express.urlencoded (URL 인코딩 파싱)
    ├─ morgan (HTTP 요청 로깅 → Winston)
    ├─ requestLogger (커스텀 요청 로깅)
    └─ rateLimiter (API 속도 제한: 15분당 100회)
    ↓
Router (/api/v1)
    ├─ /health (헬스체크)
    └─ /auth/* (인증 라우트)
    ↓
Route-specific Middleware
    ├─ Validation (express-validator)
    │   ├─ body() 검증
    │   ├─ query() 검증
    │   └─ validateRequest 미들웨어
    ├─ DB Constraint Validation
    │   ├─ validateCompanyManagerSignup
    │   └─ validateTeamMemberSignup
    └─ Authentication/Authorization
        ├─ authenticateToken (JWT 검증)
        ├─ requireSystemAdmin
        ├─ requireCompanyManager
        └─ requireSameCompany
    ↓
Controller (auth.controller.ts)
    ├─ Request DTO 추출
    ├─ Service 메서드 호출
    └─ ResponseFormatter 사용
    ↓
Service Layer (auth.service.ts)
    ├─ 비즈니스 로직 실행
    ├─ Prisma 트랜잭션 처리
    ├─ JWT 토큰 생성/검증
    ├─ 비밀번호 해싱/검증
    └─ 에러 처리 (ApiError throw)
    ↓
Database (PostgreSQL via Prisma)
    └─ 데이터 CRUD 작업
    ↓
Response Processing
    ├─ Success: ResponseFormatter.success()
    └─ Error: errorHandler 미들웨어
        ├─ Prisma 에러 처리
        ├─ ApiError 처리
        └─ 일반 에러 처리
```

### 2. 인증 플로우 상세

#### 로그인 프로세스

```typescript
1. POST /api/v1/auth/login
2. 이메일/비밀번호 검증
3. bcrypt로 비밀번호 확인
4. Access Token 생성 (15분)
5. Refresh Token 생성 (30일)
6. Refresh Token을 HttpOnly 쿠키로 설정
7. Access Token을 응답 본문으로 전송
```

#### 토큰 갱신 (Token Rotation)

```typescript
1. POST /api/v1/auth/refresh
2. HttpOnly 쿠키에서 Refresh Token 추출
3. 토큰 유효성 검증
4. 토큰 패밀리 확인
5. 새로운 Access Token 생성
6. 새로운 Refresh Token 생성 (같은 패밀리)
7. 이전 Refresh Token 무효화
8. 새 토큰들 반환
```

#### 로그아웃 프로세스

```typescript
1. POST /api/v1/auth/logout
2. Access Token 추출 및 검증
3. Access Token을 블랙리스트에 추가
4. Refresh Token 취소
5. HttpOnly 쿠키 제거
6. 성공 응답 반환
```

### 3. 에러 처리 아키텍처

#### 에러 클래스 계층

```typescript
// utils/errors.ts의 커스텀 에러 클래스
ApiError (기본 클래스)
├── ValidationError (400)
├── AuthenticationError (401)
├── TokenExpiredError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
└── TooManyRequestsError (429)

// middleware/errorHandler.ts의 에러 처리
AppError (레거시 클래스)
└── 일반적인 에러 처리
```

#### 에러 처리 플로우

1. **Service Layer**: ApiError throw
2. **Controller**: next(error)로 에러 전달
3. **Error Handler Middleware**:
   - Prisma 에러 감지 및 변환
   - ApiError 형식화
   - Winston 로깅
   - 클라이언트 응답

#### 에러 응답 형식

```typescript
// 성공 응답 (ResponseFormatter)
{
  "success": true,
  "data": { ... },
  "message": "선택적 메시지"
}

// 에러 응답 (ErrorResponseDto)
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }  // 선택적
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// 검증 에러 응답
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "유효성 검사 실패",
    "details": {
      "field": "email",
      "reason": "유효한 이메일을 입력해주세요"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 개발 가이드

### 환경 설정

```bash
# 환경 변수 설정
cp .env.example .env

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev
```

### 개발 서버 실행

```bash
# 개발 모드 (tsx watch)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start
```

### 데이터베이스 작업

```bash
# 새 마이그레이션 생성
npx prisma migrate dev --name migration_name

# 마이그레이션 상태 확인
npx prisma migrate status

# Prisma Studio (GUI) 실행
npx prisma studio

# 데이터베이스 리셋
npx prisma migrate reset
```

### 테스트 실행

```bash
# 전체 테스트
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## Prisma ORM 활용 패턴

### 트랜잭션 처리

```typescript
// 회사와 관리자를 동시에 생성하는 트랜잭션
const result = await prisma.$transaction(async (tx) => {
  // 1. 회사 생성
  const company = await tx.company.create({
    data: {
      company_name: dto.company.company_name,
      company_description: dto.company.company_description,
    },
  });

  // 2. 사용자 생성
  const user = await tx.user.create({
    data: {
      email: dto.user.email,
      password: hashedPassword,
      user_name: dto.user.user_name,
      company_id: company.company_id,
      role_id: 2, // COMPANY_MANAGER
      status_id: 3, // PENDING
    },
  });

  return { company, user };
});
```

### 관계 조회

```typescript
// 사용자와 회사 정보를 함께 조회
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    company: true, // 회사 정보 포함
    role: true, // 역할 정보 포함
    status: true, // 상태 정보 포함
  },
});
```

### 조건부 업데이트

```typescript
// 상태가 PENDING인 사용자만 업데이트
await prisma.user.updateMany({
  where: {
    user_id: userId,
    status_id: 3, // PENDING
  },
  data: {
    status_id: 1, // ACTIVE
    updated_at: new Date(),
  },
});
```

### 존재 여부 확인

```typescript
// 이메일 중복 확인
const exists = await prisma.user.findUnique({
  where: { email },
  select: { user_id: true },
});

if (exists) {
  throw new ConflictError('이미 등록된 이메일입니다');
}
```

## 코드 작성 규칙

### 계층별 책임

- **Controller**: HTTP 요청/응답 처리
- **Service**: 비즈니스 로직 구현
- **Repository**: 데이터베이스 접근
- **Model**: 데이터 구조 정의
- **Middleware**: 횡단 관심사 처리

### 네이밍 컨벤션

- 파일명: camelCase (예: userController.ts)
- 클래스명: PascalCase (예: UserService)
- 함수명: camelCase (예: getUserById)
- 상수: UPPER_SNAKE_CASE (예: MAX_RETRY_COUNT)

### 에러 처리

```typescript
// 커스텀 에러 클래스 사용
class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 서비스에서 에러 throw
throw new ApiError(404, 'User not found');
```

### API 응답 형식

```typescript
// 성공 응답
{
  "success": true,
  "data": { ... },
  "message": "Success"
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 보안 구현 상세

### 비밀번호 보안

- **bcrypt 해싱**: Salt rounds 10으로 안전한 해싱
- **정책 검증**:
  - 최소 8자 이상
  - 대문자, 소문자, 숫자, 특수문자 포함
  - 일반적인 패턴 금지

### JWT 토큰 보안

- **HttpOnly 쿠키**: XSS 공격으로부터 Refresh Token 보호
- **Secure 플래그**: HTTPS 환경에서만 쿠키 전송
- **SameSite**: CSRF 공격 방지
- **Token Rotation**: 토큰 탈취 시 피해 최소화
- **블랙리스트**: 로그아웃된 토큰 무효화

### 요청 보안

- **Helmet**: 다양한 보안 헤더 자동 설정
- **CORS**: 허용된 출처만 API 접근 가능
- **Rate Limiting**: API 남용 및 무차별 대입 공격 방지
- **입력 검증**: express-validator로 모든 입력 검증 및 삭제

### 환경 변수 (필수)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/project_manager

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_RESET_SECRET=your-reset-secret-key-min-32-chars

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## 보안 베스트 프랙티스

1. 환경 변수로 민감한 정보 관리
2. JWT 토큰 적절한 만료 시간 설정
3. SQL Injection 방지 (Prisma 파라미터화 쿼리)
4. XSS 방지 (입력 검증)
5. Rate Limiting으로 DDoS 방지
6. HTTPS 사용 (프로덕션)

## 성능 최적화

1. 데이터베이스 인덱싱
2. Redis 캐싱 활용
3. 쿼리 최적화 (N+1 문제 방지)
4. 응답 압축 (compression 미들웨어)
5. 비동기 처리 활용

## 트러블슈팅

### 일반적인 문제 해결

1. **Prisma 클라이언트 에러**: `npx prisma generate` 실행
2. **마이그레이션 충돌**: `npx prisma migrate reset` 후 재실행
3. **포트 충돌**: .env에서 PORT 변경
4. **TypeScript 에러**: `npm run build`로 타입 체크

### 로그 확인

```bash
# 개발 로그
tail -f logs/development.log

# 에러 로그
tail -f logs/error.log
```

## CI/CD 파이프라인 (예정)

1. GitHub Actions 활용
2. 자동 테스트 실행
3. Docker 이미지 빌드
4. 스테이징/프로덕션 배포
