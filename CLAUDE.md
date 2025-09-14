# ProjectManager 풀스택 프로젝트 가이드

**DI Container 기반 백엔드와 React 프론트엔드로 구성된 모던 프로젝트 관리 시스템**

## 기술 스택

| 영역 | 기술 | 버전 | 용도 |
|-----|------|------|------|
| **Backend** | Express + TypeScript + Prisma | 4.19 / 5.4 / 6.15 | API 서버 |
| **Frontend** | React + TypeScript + Vite | 18 / 5.4 / 4.5 | 웹 애플리케이션 |
| **Database** | PostgreSQL + Redis | 15 / 7 | 데이터 저장 |
| **Architecture** | DI Container (tsyringe) | 4.10 | 의존성 주입 |
| **Security** | JWT + bcrypt + helmet | 9.0 / 2.4 / 7.1 | 인증/보안 |
| **DevOps** | Docker + ESLint + Jest | - / 8.57 / 29.7 | 개발 환경 |

## 프로젝트 구조

```
PM_MonoRepo/
├── backend/                    # Express/TypeScript API 서버
│   ├── src/
│   │   ├── core/              # DI Container + 설정
│   │   ├── modules/           # 도메인 모듈 (auth ✅ 완전구현)
│   │   ├── shared/            # 공통 미들웨어/유틸리티 (인증 관련은 auth 모듈로 이동)  
│   │   ├── infrastructure/    # DB/캐시 계층
│   │   └── app.ts             # Express 앱 설정
│   ├── prisma/                # 데이터베이스 스키마
│   └── CLAUDE.md              # 백엔드 상세 아키텍처 가이드
│
├── frontend/                   # React/TypeScript 웹앱
│   ├── src/
│   │   ├── components/        # UI 컴포넌트 (Atomic Design)
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── hooks/             # 커스텀 React 훅
│   │   ├── store/             # 상태 관리 (Zustand)
│   │   └── services/          # API 서비스
│   └── public/                # 정적 파일
│
├── shared/                     # 공통 타입/유틸리티
└── docker-compose.yml          # 개발 환경
```

## 백엔드 아키텍처 (요약)

### 핵심 패턴
- **DI Container**: tsyringe 기반 의존성 주입으로 결합도 최소화
- **모듈 시스템**: 도메인별 완전 독립 모듈 (auth, user, project, company)
- **계층 아키텍처**: Controller → Service → Repository → Database
- **Service 분해**: 824줄 거대 서비스를 6개 전문 서비스로 분해

### Auth 모듈 (완전 구현)
```
modules/auth/
├── controllers/     # API 엔드포인트 (10개)
├── services/        # 비즈니스 로직 (6개 전문 서비스)
├── repositories/    # 데이터 접근 (Repository Pattern)
├── dto/            # 요청/응답 DTO
├── validators/      # 입력 검증
└── auth.module.ts  # 모듈 통합 관리
```

**상세 아키텍처는 `backend/CLAUDE.md` 참조**

## API 엔드포인트

### 인증 API (완전 구현)
```bash
# 공개 API
POST /api/v1/auth/signup/company-manager  # 회사 관리자 회원가입
POST /api/v1/auth/signup/team-member      # 팀원 회원가입
POST /api/v1/auth/login                   # 로그인
POST /api/v1/auth/refresh                 # 토큰 갱신
POST /api/v1/auth/password/forgot         # 비밀번호 재설정 요청
POST /api/v1/auth/password/reset          # 비밀번호 재설정

# 보호된 API (JWT 인증 필요)
POST /api/v1/auth/logout                  # 로그아웃
POST /api/v1/auth/admin/approve/company   # 회사 승인 (SYSTEM_ADMIN)
POST /api/v1/auth/manager/approve/member  # 팀원 승인 (COMPANY_MANAGER)
```

### 기타 API (예정)
```bash
/api/v1/users       # 사용자 관리
/api/v1/projects    # 프로젝트 관리  
/api/v1/tasks       # 작업 관리
/api/v1/companies   # 회사 관리
```

## 보안 시스템

### JWT 이중 토큰 전략
- **Access Token**: 15분, API 접근용
- **Refresh Token**: 30일, HttpOnly Cookie, Token Rotation

### 보안 미들웨어 스택
```
Helmet (보안 헤더) → CORS → Rate Limiting (15분/100회) 
→ JWT 인증 → 권한 검증 → 입력 검증 → 비즈니스 로직
```

### 권한 시스템
- **SYSTEM_ADMIN (1)**: 전체 시스템 관리
- **COMPANY_MANAGER (2)**: 회사 내 관리
- **TEAM_MEMBER (3)**: 개인 작업 영역

## 데이터베이스

### 주요 모델 (Prisma)
- **User**: 사용자 정보 (email, password_hash, role_id, status_id, company_id)
- **Company**: 회사 정보 (company_name, manager_id, invitation_code)
- **RefreshToken**: 토큰 관리 (token_hash, token_family, expires_at)
- **Project**: 프로젝트 정보
- **Task**: 작업 정보  
- **ActivityLog**: 활동 로그

## 개발 워크플로우

### 환경 설정
```bash
# 프로젝트 클론 및 의존성 설치
git clone <repository-url>
cd PM_MonoRepo
./install.sh

# 환경 변수 설정
cd backend && cp .env.example .env
# .env 파일 수정 (DATABASE_URL, JWT_SECRET 등)

# PostgreSQL + Redis 실행 (Docker)
docker-compose up postgres redis -d

# Prisma 마이그레이션 및 스키마 생성
cd backend
npx prisma migrate dev
npx prisma generate
```

### 개발 서버 실행
```bash
# Backend (포트 5000)
cd backend && npm run dev

# Frontend (포트 3000)  
cd frontend && npm run dev

# 또는 Docker Compose로 전체 실행
docker-compose up
```

### 유용한 명령어
```bash
# 테스트
npm test                    # Jest 테스트 실행
npm run test:coverage      # 테스트 커버리지

# 빌드
npm run build              # 프로덕션 빌드
npm run lint               # ESLint 검사

# 데이터베이스
npx prisma studio          # DB GUI
npx prisma migrate dev     # 마이그레이션 적용
```

## 환경 변수

### Backend (.env)
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

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

## 표준 응답 형식

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

## 코드 컨벤션

### TypeScript
- 엄격한 타입 체크 활성화
- 인터페이스 이름은 'I' 접두사 사용 금지
- Path Mapping: `@modules/*`, `@shared/*`, `@infrastructure/*`, `@core/*`

### Git 커밋 메시지
- `feat`: 새로운 기능
- `fix`: 버그 수정  
- `docs`: 문서 수정
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 기타 변경사항

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
  "environment": "development"
}
```

---

**2025.09 현재 구현 상태**: Auth 모듈 완전 구현 완료 (10개 API, DI Container 기반 아키텍처)  
**상세 백엔드 아키텍처**: `backend/CLAUDE.md` 참조