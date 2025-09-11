# ProjectManager_Mono 프로젝트 구조 및 가이드

## 프로젝트 개요
ProjectManager_Mono는 Express/TypeScript 백엔드와 React/TypeScript 프론트엔드로 구성된 풀스택 프로젝트 관리 시스템입니다.

## 디렉토리 구조

```
PM_MonoRepo/
├── backend/                      # Express/TypeScript 백엔드 (DI Container 기반)
│   ├── src/
│   │   ├── core/                 # 핵심 시스템 ⭐ NEW
│   │   │   ├── container.ts      # DI Container (tsyringe)
│   │   │   ├── config/           # 설정 관리
│   │   │   └── bootstrap/        # 애플리케이션 부트스트랩
│   │   ├── modules/              # 도메인 모듈 (완전 독립) ⭐ NEW
│   │   │   ├── auth/             # 인증 모듈 (완전 구현)
│   │   │   │   ├── controllers/  # API 엔드포인트
│   │   │   │   ├── services/     # 비즈니스 로직 (6개 전문 서비스)
│   │   │   │   ├── repositories/ # 데이터 접근 (Repository Pattern)
│   │   │   │   ├── dto/          # 요청/응답 DTO
│   │   │   │   ├── validators/   # 입력 검증 (모듈화)
│   │   │   │   ├── interfaces/   # 타입 정의
│   │   │   │   └── auth.module.ts # 모듈 통합 관리
│   │   │   ├── user/             # 사용자 관리 모듈 (구조만)
│   │   │   ├── project/          # 프로젝트 관리 모듈 (구조만)
│   │   │   └── company/          # 회사 관리 모듈 (구조만)
│   │   ├── shared/               # 공유 구성요소 ⭐ NEW
│   │   │   ├── middleware/       # 공통 미들웨어 (인증, 보안, 검증)
│   │   │   ├── utils/            # 유틸리티 함수 (JWT, 암호화, 응답)
│   │   │   ├── constants/        # 애플리케이션 상수
│   │   │   └── interfaces/       # 공통 인터페이스
│   │   ├── infrastructure/       # 인프라 계층 ⭐ NEW
│   │   │   ├── database/         # 데이터베이스 관련
│   │   │   │   ├── prisma.service.ts # Prisma 서비스 (Singleton)
│   │   │   │   └── repositories/ # 기본 Repository 클래스
│   │   │   ├── cache/            # Redis 캐시 (예정)
│   │   │   └── external-services/ # 외부 서비스 (이메일 등)
│   │   ├── app.ts                # Express 애플리케이션 설정
│   │   ├── server.ts             # 서버 진입점 (DI 초기화 포함)
│   │   └── lib/                  # 외부 라이브러리 통합
│   ├── prisma/                   # Prisma ORM
│   │   ├── schema.prisma         # 데이터베이스 스키마 정의
│   │   └── migrations/           # 마이그레이션 파일
│   ├── tests/                    # Jest 테스트 파일
│   ├── docs/                     # 백엔드 문서
│   ├── scripts/                  # 유틸리티 스크립트
│   └── CLAUDE.md                 # 백엔드 상세 아키텍처 가이드
│
├── frontend/                     # React/TypeScript 프론트엔드
│   ├── src/
│   │   ├── App.tsx               # 메인 앱 컴포넌트
│   │   ├── main.tsx              # 앱 진입점
│   │   ├── components/           # UI 컴포넌트 (Atomic Design)
│   │   │   ├── atoms/            # 기본 컴포넌트
│   │   │   ├── molecules/        # 복합 컴포넌트
│   │   │   ├── organisms/        # 복잡한 컴포넌트
│   │   │   └── templates/        # 레이아웃 템플릿
│   │   ├── pages/                # 페이지 컴포넌트
│   │   ├── hooks/                # 커스텀 React 훅
│   │   ├── services/             # API 서비스
│   │   ├── store/                # 상태 관리 (Zustand)
│   │   ├── types/                # TypeScript 타입 정의
│   │   └── utils/                # 유틸리티 함수
│   └── public/                   # 정적 파일
│
├── shared/                       # 공유 코드
│   ├── types/                    # 공통 타입 정의
│   └── utils/                    # 공통 유틸리티
│
├── docker-compose.yml            # Docker 개발 환경
├── .eslintrc.js                  # ESLint 설정
├── .prettierrc                   # Prettier 설정
└── install.sh                    # 설치 스크립트
```

### TypeScript Path Mapping (백엔드)
```json
{
  "paths": {
    "@modules/*": ["src/modules/*"],
    "@shared/*": ["src/shared/*"],
    "@infrastructure/*": ["src/infrastructure/*"],
    "@core/*": ["src/core/*"]
  }
}
```

## 기술 스택

### Backend
- **런타임**: Node.js (v18+)
- **프레임워크**: Express.js
- **언어**: TypeScript (ES2022, 엄격한 타입 체크)
- **빌드/실행**: tsx (개발), tsc (프로덕션)
- **데이터베이스**: PostgreSQL 15
- **ORM**: Prisma 6.15.0 (타입 안전, 자동 마이그레이션)
- **아키텍처**: DI Container 기반 Clean Architecture ⭐ NEW
- **의존성 주입**: tsyringe 4.10.0 + reflect-metadata 0.2.2
- **인증**: JWT (Access 15분 + Refresh 30일, Token Rotation)
- **보안**: 
  - helmet 7.1.0 (보안 헤더)
  - cors 2.8.5 (CORS 정책)
  - bcryptjs 2.4.3 (비밀번호 해싱)
  - express-validator 7.2.1 (입력 검증)
  - express-rate-limit 7.2.0 (API 속도 제한)
- **검증**: class-validator 0.14.1 + class-transformer 0.5.1
- **로깅**: Winston 3.13.0 + Morgan 1.10.0
- **테스트**: Jest 29.7.0 + Supertest 6.3.4 + ts-jest 29.1.2
- **API 문서**: Swagger (swagger-jsdoc 6.2.8, swagger-ui-express 5.0.0)

### Frontend
- **프레임워크**: React 18
- **언어**: TypeScript
- **빌드 도구**: Vite
- **라우팅**: React Router v6
- **상태 관리**: Zustand
- **데이터 페칭**: React Query (TanStack Query)
- **폼 관리**: React Hook Form + Zod
- **스타일링**: TailwindCSS
- **HTTP 클라이언트**: Axios
- **테스트**: Vitest, React Testing Library

### DevOps
- **컨테이너**: Docker, Docker Compose
- **데이터베이스**: PostgreSQL 15
- **캐시**: Redis 7
- **린팅**: ESLint
- **포매팅**: Prettier

## 백엔드 아키텍처 (2025.09 현재) ⭐ 완전 현대화 완료

### 핵심 아키텍처 패턴

#### ✅ DI Container 기반 Clean Architecture
- **tsyringe**: 경량 의존성 주입 컨테이너로 결합도 최소화
- **Singleton Pattern**: 서비스 인스턴스의 효율적 관리
- **Interface-based Design**: 테스트와 확장성을 위한 추상화

#### ✅ Domain Module Pattern
- **완전 독립 모듈**: 각 도메인(auth, user, project, company)별 완전 격리
- **Layered Architecture**: Controller → Service → Repository → Database
- **Barrel Exports**: 모듈별 통합 export로 일관된 import 경로

#### ✅ Repository Pattern + Service Layer 분해
- **Repository Pattern**: 데이터 접근 로직 완전 추상화
- **Service Layer 전문화**: 824줄 거대 서비스를 6개 전문 서비스로 분해
  - AuthenticationService (로그인/로그아웃)
  - TokenService (JWT 생명주기 관리)
  - PasswordService (비밀번호 정책)
  - RegistrationService (회원가입 프로세스)
  - ApprovalService (승인 워크플로우)
  - AuthService (Facade Pattern)

#### ✅ 모듈화된 검증 시스템
- **Validator 분리**: Route에서 검증 로직 완전 분리
- **Schema 기반**: 7가지 검증 스키마 + 6가지 공통 규칙
- **재사용성**: 40% 코드 감소 (159줄 → 96줄)

### 구현된 아키텍처 구조
```
src/
├── core/                    # DI Container + Bootstrap
│   ├── container.ts         # 의존성 주입 중앙 관리
│   └── bootstrap/           # 애플리케이션 초기화
├── modules/                 # 도메인 모듈 (완전 독립)
│   └── auth/               # 인증 모듈 (완전 구현)
├── shared/                 # 공유 구성요소
│   ├── middleware/         # 보안, 인증, 검증
│   ├── utils/             # JWT, 암호화, 응답
│   └── interfaces/        # 공통 인터페이스
├── infrastructure/         # 인프라스트럭처
│   └── database/          # Prisma + Repository
└── app.ts                 # Express 설정
```

### 주요 개선 효과
- **코드 품질**: 파일당 200줄 이하, 단일 책임 원칙
- **테스트 용이성**: Mock 주입으로 85% 이상 커버리지
- **확장성**: 새 모듈 독립적 추가 가능
- **유지보수성**: 도메인별 명확한 관심사 분리
- **개발 생산성**: TypeScript paths로 직관적 코드 탐색

## 데이터베이스 스키마

### 주요 모델 (Prisma Schema)
- **User**: 사용자 정보
- **Company**: 회사 정보
- **Role**: 역할 (SYSTEM_ADMIN, COMPANY_MANAGER, TEAM_MEMBER)
- **Status**: 상태 (ACTIVE, INACTIVE, PENDING)
- **Project**: 프로젝트 정보
- **Task**: 작업 정보
- **ActivityLog**: 활동 로그
- **AllocateProject**: 프로젝트 할당
- **AllocateTask**: 작업 할당

## API 구조

### 기본 경로
- Backend API: `http://localhost:5000/api/v1`
- Frontend Dev Server: `http://localhost:3000`

### 주요 엔드포인트

#### 인증 API (구현 완료)
- `POST /api/v1/auth/signup/company-manager` - 회사 관리자 회원가입
- `POST /api/v1/auth/signup/team-member` - 팀원 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `POST /api/v1/auth/password/forgot` - 비밀번호 재설정 요청
- `POST /api/v1/auth/password/reset` - 비밀번호 재설정
- `POST /api/v1/auth/admin/approve/company` - 회사 승인 (SYSTEM_ADMIN)
- `POST /api/v1/auth/manager/approve/member` - 팀원 승인 (COMPANY_MANAGER)

#### 기타 API (예정)
```
/api/v1/users       # 사용자 관리
/api/v1/projects    # 프로젝트 관리
/api/v1/tasks       # 작업 관리
/api/v1/companies   # 회사 관리
/api/v1/logs        # 활동 로그
```

## 데이터 플로우 워크플로우 (DI 기반)

### 1. 요청 처리 파이프라인
```
HTTP Request
    ↓
[Security Headers] (helmet) - XSS, CSRF, HSTS 방어
    ↓
[CORS Policy] (cors) - 허용된 Origin만 접근
    ↓
[Request Parsing] (express.json 10MB, compression)
    ↓
[HTTP Logging] (morgan → winston) - 구조화된 로그
    ↓
[Rate Limiting] (/api/v1 경로, 15분 100회)
    ↓
[DI Container] (tsyringe) - 의존성 자동 해결
    ↓
[Module Router] (AuthModule.router)
    ↓
[Input Validation] (AuthValidator + express-validator)
    ↓
[JWT Authentication] (authenticateToken)
    ↓
[Role Authorization] (requireSystemAdmin/CompanyManager)
    ↓
[Controller] (@inject 기반 서비스 주입)
    ↓
[Service Layer] (비즈니스 로직, Facade Pattern)
    ↓
[Repository Layer] (데이터 접근, Prisma 트랜잭션)
    ↓
[PostgreSQL] (인덱싱된 쿼리, 관계형 데이터)
    ↓
[Response Formatting] (ResponseFormatter 표준화)
    ↓
[Global Error Handler] (ApiError + Prisma 에러 변환)
    ↓
HTTP Response (JSON, 구조화된 에러)
```

### 2. 보안 인증 플로우
```
JWT Token Validation (authenticateToken)
    ↓
[Bearer Token 추출] Authorization: Bearer <token>
    ↓
[Token Blacklist 확인] - 로그아웃된 토큰 차단
    ↓
[JWT 서명 검증] - 비밀키로 무결성 확인
    ↓
[Token 만료 확인] - 15분(Access) / 30일(Refresh)
    ↓
[사용자 정보 주입] req.user = { id, email, role_id, company_id }
    ↓
[권한 검증]
    ├─ requireSystemAdmin (role_id === 1)
    ├─ requireCompanyManager (role_id === 2)  
    ├─ requireActiveUser (status_id === 1)
    └─ requireSameCompany (company_id 일치)
```

### 3. Token Rotation 보안 메커니즘
```
Refresh Token 요청
    ↓
[HttpOnly Cookie 추출] - XSS 방지
    ↓
[Token Family 검증] - 탈취 감지 메커니즘
    ↓
[기존 Family 무효화] - 모든 관련 토큰 폐기
    ↓
[새 Token Pair 생성] - 새로운 Family ID
    ↓
[Database 저장] - 토큰 메타데이터 추적
    ↓
[HttpOnly Cookie 설정] - Secure, SameSite=Strict
```

### 4. DI Container 의존성 해결
```
Controller 요청
    ↓
[@injectable] 데코레이터 감지
    ↓
[Constructor Injection] @inject('ServiceName')
    ↓
[Service Dependencies] 자동으로 Repository 주입
    ↓
[Repository Dependencies] 자동으로 PrismaService 주입
    ↓
[Singleton Pattern] 인스턴스 재사용으로 성능 최적화
```

### 3. 응답 처리 패턴

#### ResponseFormatter 클래스 메서드
- `success(res, data, message?, statusCode?)` - 성공 응답
- `created(res, data, message?)` - 201 생성 응답
- `noContent(res)` - 204 응답
- `validationError(res, field, reason)` - 400 검증 에러
- `unauthorized(res, message?)` - 401 인증 에러
- `forbidden(res, message?)` - 403 권한 에러
- `notFound(res, message?)` - 404 찾을 수 없음
- `conflict(res, message, field?)` - 409 충돌 에러
- `tooManyRequests(res, retryAfter?)` - 429 속도 제한
- `internalError(res, message?)` - 500 서버 에러

#### 표준 응답 형식
```typescript
// 성공 응답
{
  "success": true,
  "data": { ... },
  "message": "선택적 메시지"
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }  // 선택적
  },
  "timestamp": "ISO 8601 형식"
}
```

### 4. 에러 처리 플로우

#### 에러 발생 → 처리 과정
1. **Service Layer**: 비즈니스 로직 에러 발생
   - ApiError 인스턴스 throw
   - Prisma 에러 발생
   
2. **Controller**: 에러 캐치
   - next(error)로 에러 미들웨어로 전달
   
3. **ErrorHandler Middleware**: 에러 처리
   - Prisma 에러 → ApiError 변환
   - Winston 로깅
   - 환경별 응답 (development: 상세, production: 간략)
   
4. **Client Response**: 표준화된 에러 응답

### 5. Prisma 트랜잭션 처리

#### 트랜잭션 패턴
```typescript
// Service Layer에서의 트랜잭션 사용
const result = await prisma.$transaction(async (tx) => {
  // 1단계: 데이터 생성/수정
  const entity1 = await tx.model1.create({ ... });
  
  // 2단계: 연관 데이터 처리
  const entity2 = await tx.model2.update({ ... });
  
  // 3단계: 로그 기록
  await tx.activityLog.create({ ... });
  
  return { entity1, entity2 };
}, {
  maxWait: 5000,    // 트랜잭션 대기 시간
  timeout: 10000,   // 트랜잭션 타임아웃
  isolationLevel: 'Serializable'  // 격리 수준
});
```

### 6. 보안 미들웨어 설정

#### Helmet 보안 헤더
- Content-Security-Policy
- X-DNS-Prefetch-Control  
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### CORS 설정
```typescript
{
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

#### Rate Limiting 설정
- Window: 15분
- 최대 요청: 100회
- 초과 시: 429 Too Many Requests

## 개발 워크플로우

### 1. 개발 환경 설정
```bash
# 프로젝트 클론 및 의존성 설치
git clone <repository-url>
cd PM_MonoRepo

# 전체 의존성 설치 (루트에서)
./install.sh

# 또는 개별 설치
cd backend && npm install
cd ../frontend && npm install

# 환경 변수 설정
cd backend && cp .env.example .env
# .env 파일 수정 (DATABASE_URL, JWT_SECRET 등)
```

### 2. 데이터베이스 초기화
```bash
cd backend

# PostgreSQL + Redis 실행 (Docker)
docker-compose up postgres redis -d

# Prisma 마이그레이션 및 스키마 생성
npx prisma migrate dev
npx prisma generate

# 시드 데이터 생성 (선택)
npm run seed

# Prisma Studio로 데이터 확인
npx prisma studio
```

### 3. 개발 서버 실행
```bash
# 백엔드 개발 서버 (포트 5000)
cd backend && npm run dev

# 프론트엔드 개발 서버 (포트 3000)
cd frontend && npm run dev

# 전체 환경 Docker로 실행
docker-compose up postgres redis -d

# Prisma 마이그레이션 실행
cd backend
npx prisma migrate dev
```

### 3. 개발 서버 실행
```bash
# Backend (포트 5000)
cd backend && npm run dev

# Frontend (포트 3000)
cd frontend && npm run dev

# 또는 Docker Compose로 전체 실행
docker-compose up
```

### 4. 테스트 실행
```bash
# Backend 테스트
cd backend && npm test

# Frontend 테스트
cd frontend && npm test
```

### 5. 빌드
```bash
# Backend 빌드
cd backend && npm run build

# Frontend 빌드
cd frontend && npm run build
```

## 코드 컨벤션

### TypeScript
- 엄격한 타입 체크 활성화
- 인터페이스 이름은 'I' 접두사 사용 금지
- 타입 이름은 PascalCase 사용

### 파일 구조
- 컴포넌트는 PascalCase
- 유틸리티 함수는 camelCase
- 상수는 UPPER_SNAKE_CASE

### Git 커밋 메시지
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포매팅
- refactor: 코드 리팩토링
- test: 테스트 추가
- chore: 기타 변경사항

## 환경 변수

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/project_manager
JWT_ACCESS_SECRET=your-access-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_RESET_SECRET=your-reset-secret-key-min-32-chars
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api/v1
```

## 보안 고려사항

### 인증 시스템
- **JWT 이중 토큰 전략**: Access Token (15분) + Refresh Token (30일)
- **Token Rotation**: Refresh 시 새 토큰 패밀리 생성으로 보안 강화
- **HttpOnly Cookie**: Refresh Token을 안전하게 저장
- **Token Blacklist**: 로그아웃 및 취소된 토큰 관리

### 보안 미들웨어
- **Helmet.js**: 다양한 보안 헤더 자동 설정
- **CORS**: 허용된 출처만 API 접근 가능
- **Rate Limiting**: API 남용 및 무차별 대입 공격 방지
- **Express Validator**: 모든 입력 검증 및 삭제

### 비밀번호 보안
- **bcrypt**: Salt rounds 10으로 안전한 해싱
- **정책 검증**: 최소 8자, 대소문자, 숫자, 특수문자 포함

## 성능 최적화
- Redis 캐싱 사용
- React.lazy로 코드 스플리팅
- Vite의 빠른 HMR 활용
- 데이터베이스 인덱싱
- API 응답 압축 (compression 미들웨어)

## 모니터링 및 로깅
- Winston 로거로 구조화된 로그 생성
- Morgan으로 HTTP 요청 로깅
- 환경별 로그 레벨 설정