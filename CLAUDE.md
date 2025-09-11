# ProjectManager_Mono 프로젝트 구조 및 가이드

## 프로젝트 개요
ProjectManager_Mono는 Express/TypeScript 백엔드와 React/TypeScript 프론트엔드로 구성된 풀스택 프로젝트 관리 시스템입니다.

## 디렉토리 구조

```
PM_MonoRepo/
├── backend/                # Express/TypeScript 백엔드 애플리케이션
│   ├── src/
│   │   ├── app.ts         # Express 앱 설정
│   │   ├── server.ts      # 서버 진입점
│   │   ├── config/        # 설정 파일
│   │   ├── controllers/   # 라우트 컨트롤러
│   │   │   └── auth.controller.ts  # 인증 컨트롤러
│   │   ├── entities/      # TypeORM 엔티티 (레거시, 미사용)
│   │   ├── lib/          # 외부 라이브러리 통합
│   │   │   └── prisma.ts  # Prisma 클라이언트
│   │   ├── middleware/    # Express 미들웨어
│   │   │   ├── auth.middleware.ts  # JWT 인증
│   │   │   ├── errorHandler.ts     # 에러 처리
│   │   │   ├── rateLimiter.ts      # API 속도 제한
│   │   │   └── validateRequest.ts  # 입력 검증
│   │   ├── migrations/    # TypeORM 마이그레이션 (레거시)
│   │   ├── models/        # 데이터 모델
│   │   ├── repositories/  # 데이터 접근 계층
│   │   ├── routes/        # API 라우트 정의
│   │   │   ├── index.ts   # 라우트 통합
│   │   │   └── auth.routes.ts  # 인증 라우트
│   │   ├── services/      # 비즈니스 로직
│   │   │   └── auth.service.ts  # 인증 서비스
│   │   ├── subscribers/   # 이벤트 구독자
│   │   ├── tests/         # 테스트 파일
│   │   ├── types/         # TypeScript 타입 정의
│   │   │   └── auth.types.ts  # 인증 타입
│   │   └── utils/         # 유틸리티 함수
│   │       ├── errors.ts  # 커스텀 에러
│   │       ├── jwt.ts     # JWT 유틸리티
│   │       ├── password.ts # 비밀번호 해싱
│   │       └── response.ts # 응답 포매터
│   ├── prisma/
│   │   ├── schema.prisma  # Prisma 스키마 정의
│   │   └── migrations/    # Prisma 마이그레이션
│   ├── dist/              # 컴파일된 JavaScript 파일
│   ├── logs/              # 애플리케이션 로그
│   ├── scripts/           # 유틸리티 스크립트
│   │   └── seed-admin.ts  # 관리자 시드
│   └── backup/            # 백업 파일
│
├── frontend/              # React/TypeScript 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── App.tsx        # 메인 앱 컴포넌트
│   │   ├── main.tsx       # 앱 진입점
│   │   ├── components/    # UI 컴포넌트 (Atomic Design)
│   │   │   ├── atoms/     # 기본 컴포넌트
│   │   │   ├── molecules/ # 복합 컴포넌트
│   │   │   ├── organisms/ # 복잡한 컴포넌트
│   │   │   └── templates/ # 레이아웃 템플릿
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 React 훅
│   │   ├── services/      # API 서비스
│   │   ├── store/         # 상태 관리 (Zustand)
│   │   ├── types/         # TypeScript 타입 정의
│   │   └── utils/         # 유틸리티 함수
│   └── public/            # 정적 파일
│
├── shared/                # 공유 코드
│   ├── types/             # 공통 타입 정의
│   └── utils/             # 공통 유틸리티
│
├── docker-compose.yml     # Docker 컨테이너 설정
├── .eslintrc.js          # ESLint 설정
├── .prettierrc           # Prettier 설정
└── install.sh            # 설치 스크립트
```

## 기술 스택

### Backend
- **런타임**: Node.js (v18+)
- **프레임워크**: Express.js
- **언어**: TypeScript
- **빌드/실행**: tsx (TypeScript 실행 도구)
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma (타입 안전 ORM)
- **캐시**: Redis (예정)
- **인증**: JWT (Access Token 15분, Refresh Token 30일 with Token Rotation)
- **보안**: 
  - helmet (보안 헤더)
  - cors (Cross-Origin 정책)
  - bcryptjs (비밀번호 해싱)
  - express-validator (입력 검증)
  - express-rate-limit (API 속도 제한)
- **API 문서**: Swagger (swagger-jsdoc, swagger-ui-express)
- **로깅**: Winston + Morgan
- **테스트**: Jest, Supertest

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

## Request/Response 처리 워크플로우

### 1. 미들웨어 체인 구조
```
app.ts (Express Application)
├── 글로벌 미들웨어 (모든 요청)
│   ├── helmet() - 보안 헤더 설정
│   ├── cors() - CORS 정책 적용
│   ├── compression() - 응답 압축
│   ├── cookieParser() - 쿠키 파싱
│   ├── express.json() - JSON 파싱 (10mb 제한)
│   ├── express.urlencoded() - URL 인코딩 파싱
│   ├── morgan() - HTTP 로깅 → Winston
│   ├── requestLogger - 커스텀 요청 로깅
│   └── rateLimiter - API 속도 제한 (/api/v1 경로)
│
├── 라우트별 미들웨어
│   ├── 입력 검증 (express-validator)
│   ├── DB 제약 검증 (dbConstraintValidator)
│   └── 인증/인가 미들웨어
│       ├── authenticateToken - JWT 토큰 검증
│       ├── requireSystemAdmin - 시스템 관리자 확인
│       ├── requireCompanyManager - 회사 관리자 확인
│       └── requireSameCompany - 같은 회사 소속 확인
│
└── 에러 처리 미들웨어
    ├── notFoundHandler - 404 처리
    └── errorHandler - 전역 에러 처리
```

### 2. 인증 플로우 상세

#### JWT 토큰 검증 프로세스 (authenticateToken)
1. Authorization 헤더에서 Bearer 토큰 추출
2. 토큰 블랙리스트 확인
3. JWT 검증 및 디코드
4. 사용자 정보 DB 조회
5. req.user에 사용자 정보 주입
6. 다음 미들웨어로 진행

#### 역할 기반 접근 제어
- **requireSystemAdmin**: role_id === 1 확인
- **requireCompanyManager**: role_id === 2 확인  
- **requireSameCompany**: req.user.company_id === target.company_id 확인
- **requireActiveUser**: status_id === 1 (ACTIVE) 확인

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

### 1. 환경 설정
```bash
# 전체 의존성 설치
./install.sh

# 또는 개별 설치
cd backend && npm install
cd frontend && npm install
```

### 2. 데이터베이스 설정
```bash
# Docker로 PostgreSQL과 Redis 실행
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