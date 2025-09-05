# Full-Stack TypeScript Application

확장 가능한 Express + TypeScript 백엔드와 React + TypeScript 프론트엔드 애플리케이션입니다.

## 🏗 프로젝트 구조

```
.
├── backend/           # Express + TypeScript 백엔드
├── frontend/          # React + TypeScript + Vite 프론트엔드
├── shared/            # 공유 타입 및 유틸리티
└── docker-compose.yml # Docker 개발 환경
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- Docker & Docker Compose (선택사항)

### 설치

1. 의존성 설치:

```bash
# 백엔드
cd backend
npm install

# 프론트엔드
cd frontend
npm install
```

2. 환경 변수 설정:

```bash
# 백엔드 환경 변수
cp backend/.env.example backend/.env

# 필요시 프론트엔드 환경 변수도 설정
```

### 개발 서버 실행

#### 방법 1: 개별 실행

```bash
# 백엔드 (터미널 1)
cd backend
npm run dev

# 프론트엔드 (터미널 2)
cd frontend
npm run dev
```

#### 방법 2: Docker Compose 사용

```bash
docker-compose up
```

## 📦 기술 스택

### 백엔드

- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT
- **Validation**: class-validator
- **Logging**: Winston
- **API Docs**: Swagger

### 프론트엔드

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **API**: Axios + React Query
- **Forms**: React Hook Form + Zod

## 📁 주요 디렉토리 구조

### 백엔드 구조

```
backend/src/
├── controllers/      # API 엔드포인트 핸들러
├── services/         # 비즈니스 로직
├── repositories/     # 데이터 액세스 레이어
├── middleware/       # Express 미들웨어
├── config/           # 설정 관리
├── types/            # TypeScript 타입
└── utils/            # 유틸리티 함수
```

### 프론트엔드 구조

```
frontend/src/
├── components/       # UI 컴포넌트 (Atomic Design)
│   ├── atoms/        # 기본 컴포넌트
│   ├── molecules/    # 복합 컴포넌트
│   ├── organisms/    # 복잡한 컴포넌트
│   └── templates/    # 페이지 템플릿
├── pages/            # 페이지 컴포넌트
├── services/         # API 서비스
├── store/            # 상태 관리
├── hooks/            # Custom Hooks
└── utils/            # 유틸리티 함수
```

## 🔧 주요 기능

- ✅ JWT 기반 인증/인가
- ✅ RESTful API 설계
- ✅ TypeScript 전체 적용
- ✅ 레이어드 아키텍처 (Controller → Service → Repository)
- ✅ 중앙 집중식 에러 핸들링
- ✅ Request 유효성 검증
- ✅ Rate Limiting
- ✅ 로깅 시스템
- ✅ Hot Module Replacement (HMR)
- ✅ API 프록시 설정
- ✅ 코드 분할 및 Lazy Loading
- ✅ Protected Routes
- ✅ 반응형 디자인

## 📝 API 엔드포인트

### 인증

- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `POST /api/v1/auth/refresh` - 토큰 갱신

### 사용자

- `GET /api/v1/users` - 전체 사용자 조회 (관리자)
- `GET /api/v1/users/profile` - 내 프로필 조회
- `PUT /api/v1/users/profile` - 프로필 수정
- `DELETE /api/v1/users/:id` - 사용자 삭제 (관리자)

## 🧪 테스트

```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test
```

## 📦 빌드

```bash
# 백엔드 빌드
cd backend
npm run build

# 프론트엔드 빌드
cd frontend
npm run build
```

## 🚀 배포

Docker를 사용한 배포:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 라이선스

MIT# ProjectManager_Mono
