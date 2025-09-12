# Backend Modules 아키텍처 가이드

**DI Container 기반 모듈 시스템으로 구현된 도메인 모듈들의 구조와 워크플로우**

## 📁 전체 구조

```
backend/src/modules/
├── index.ts                     # 모듈 통합 Export
├── auth/                        # ✅ 인증/인가 모듈 (완전 구현)
│   ├── auth.module.ts          # DI Container 기반 모듈 설정
│   ├── controllers/            # API 엔드포인트 (10개)
│   ├── services/               # 비즈니스 로직 (6개 전문 서비스)
│   ├── repositories/           # 데이터 접근 계층
│   ├── dto/                    # 데이터 전송 객체
│   ├── validators/             # 입력 검증
│   └── interfaces/             # 타입 정의
├── task/                       # 🚧 작업 관리 모듈 (개발 예정)
│   └── middleware/
└── members/                    # 🚧 팀원 관리 모듈 (개발 예정)
    ├── middleware/
    └── services/
```

## 🏗️ 모듈 시스템 설계 원칙

### 1. DI Container 기반 아키텍처
- **Singleton Pattern**: 모듈당 하나의 인스턴스로 메모리 효율성 확보
- **의존성 주입**: 계층 간 결합도 최소화 및 테스트 용이성 확보
- **모듈 격리**: 각 도메인별 완전 독립 모듈로 운영

### 2. 계층 분리 아키텍처
```
요청 → Controller → Service → Repository → Database
     ↑             ↑         ↑
 API 계층      비즈니스 로직   데이터 계층
```

### 3. Service 분해 전략
- **기존**: 824줄 거대 AuthService (God Object Anti-pattern)
- **현재**: 6개 전문 서비스로 분해 (Single Responsibility Principle)
- **Facade Pattern**: AuthService가 통합 인터페이스 제공

## 🎯 Auth 모듈 심화 분석

### 모듈 구조와 책임

```typescript
// auth.module.ts - DI Container 설정 및 모듈 통합
export class AuthModule {
  private static _instance: AuthModule;
  
  // Repository 계층
  private _userRepository: UserRepository;
  private _companyRepository: CompanyRepository;
  private _tokenRepository: TokenRepository;
  
  // Service 계층 (6개 전문 서비스)
  private _authService: AuthService;              // Facade
  private _authenticationService: AuthenticationService;
  private _tokenService: TokenService;
  private _passwordService: PasswordService;
  private _registrationService: RegistrationService;
  private _approvalService: ApprovalService;
}
```

### 6개 전문 서비스 분석

| 서비스 | 책임 | 주요 기능 |
|--------|------|-----------|
| **AuthService** | Facade Pattern | 모든 Auth 작업의 단일 진입점 |
| **AuthenticationService** | 인증 처리 | 로그인, 로그아웃, 세션 관리 |
| **TokenService** | 토큰 관리 | JWT 생성, 갱신, 검증, Rotation |
| **PasswordService** | 비밀번호 관리 | 해싱, 재설정, 검증 |
| **RegistrationService** | 회원가입 처리 | 사용자, 회사 등록 |
| **ApprovalService** | 승인 프로세스 | 회사 승인, 팀원 승인 |

### API 엔드포인트 (10개)

#### 공개 API (인증 불필요)
```typescript
POST /auth/signup/company-manager    // 회사 관리자 회원가입
POST /auth/signup/team-member       // 팀원 회원가입  
POST /auth/login                    // 로그인
POST /auth/refresh                  // 토큰 갱신
POST /auth/password/forgot          // 비밀번호 재설정 요청
GET  /auth/password/verify          // 재설정 토큰 검증
POST /auth/password/reset           // 비밀번호 재설정
```

#### 보호된 API (JWT 인증 필요)
```typescript
POST /auth/logout                        // 로그아웃
POST /auth/admin/approve/company         // 회사 승인 (SYSTEM_ADMIN)
POST /auth/manager/approve/member        // 팀원 승인 (COMPANY_MANAGER)
```

## 🔄 워크플로우 분석

### 1. 회원가입 워크플로우
```
클라이언트 요청
    ↓
AuthController.signupCompanyManager()
    ↓
AuthService.signupCompanyManager() [Facade]
    ↓
RegistrationService.registerCompanyManager()
    ↓
- CompanyRepository.createCompany()
- UserRepository.createUser()
- PasswordService.hashPassword()
    ↓
데이터베이스 저장
    ↓
응답 반환 (success: true)
```

### 2. 로그인 워크플로우
```
클라이언트 요청 (email, password)
    ↓
AuthValidator.validateLogin() [입력 검증]
    ↓
AuthController.login()
    ↓
AuthService.login() [Facade]
    ↓
AuthenticationService.login()
    ↓
- UserRepository.findByEmail()
- PasswordService.comparePassword()
- TokenService.generateTokens()
    ↓
JWT 토큰 쌍 생성 (Access + Refresh)
    ↓
HttpOnly Cookie 설정 (Refresh Token)
    ↓
응답 반환 (accessToken, user info)
```

### 3. 토큰 갱신 워크플로우
```
클라이언트 요청 (Refresh Token in Cookie)
    ↓
AuthController.refreshToken()
    ↓
AuthService.refreshToken() [Facade]
    ↓
TokenService.rotateTokens()
    ↓
- 기존 Refresh Token 검증
- Token Family 확인 (보안)
- 새로운 토큰 쌍 생성
- 기존 토큰 무효화
    ↓
새로운 토큰 반환 + Cookie 업데이트
```

## 🛡️ 보안 시스템

### JWT 이중 토큰 전략
```typescript
// Access Token
- 수명: 15분
- 용도: API 접근
- 저장: 메모리 (XSS 방지)

// Refresh Token  
- 수명: 30일
- 용도: Access Token 갱신
- 저장: HttpOnly Cookie (CSRF 방지)
- 보안: Token Rotation (재사용 공격 방지)
```

### 권한 시스템
```typescript
enum UserRole {
  SYSTEM_ADMIN = 1,      // 전체 시스템 관리
  COMPANY_MANAGER = 2,   // 회사 내 관리
  TEAM_MEMBER = 3        // 개인 작업 영역
}
```

### 보안 미들웨어 스택
```
요청 → Helmet → CORS → Rate Limiting → JWT 인증 → 권한 검증 → 비즈니스 로직
```

## 🧪 테스트 아키텍처

### Repository 테스트
```typescript
// __tests__/user.repository.test.ts
- 데이터베이스 CRUD 작업 검증
- Mock 데이터를 통한 격리 테스트

// __mocks__/user.repository.mock.ts  
- 실제 DB 없이 테스트 가능
- 빠른 단위 테스트 실행
```

## 📊 데이터 흐름 및 DTO 시스템

### 요청 DTO (Request)
```typescript
// dto/request/
├── signup.dto.ts        // 회원가입 데이터
├── login.dto.ts         // 로그인 데이터
├── password.dto.ts      // 비밀번호 관련 데이터
└── approval.dto.ts      // 승인 관련 데이터
```

### 응답 DTO (Response)
```typescript
// dto/response/
└── auth.dto.ts          // 인증 응답 데이터
```

### 입력 검증 시스템
```typescript
// validators/
├── auth.validator.ts    // 검증 규칙 정의
├── base.validator.ts    // 공통 검증 로직
└── schemas/
    └── auth.schema.ts   // Joi 스키마 정의
```

## 🔮 미래 확장 계획

### Task 모듈 (개발 예정)
```
modules/task/
├── task.module.ts              # 모듈 설정
├── controllers/                # 작업 관리 API
├── services/                   # 작업 비즈니스 로직
├── repositories/               # 작업 데이터 접근
├── dto/                        # 작업 관련 DTO
└── validators/                 # 작업 입력 검증
```

### Members 모듈 (개발 예정)
```
modules/members/
├── members.module.ts           # 모듈 설정  
├── controllers/                # 팀원 관리 API
├── services/                   # 팀원 비즈니스 로직
├── repositories/               # 팀원 데이터 접근
├── dto/                        # 팀원 관련 DTO
└── validators/                 # 팀원 입력 검증
```

## 🎯 개발 가이드라인

### 새 모듈 추가 시
1. **모듈 구조 생성**: auth 모듈 패턴을 따라 디렉토리 구조 생성
2. **Module 클래스 생성**: Singleton + DI Container 패턴 적용
3. **계층별 구현**: Repository → Service → Controller 순서
4. **DTO 및 Validation**: 타입 안전성과 입력 검증 확보
5. **테스트 작성**: Mock을 활용한 단위 테스트
6. **index.ts 업데이트**: 새 모듈을 exports에 추가

### 코드 품질 기준
- **Single Responsibility**: 각 서비스는 하나의 책임만
- **Dependency Injection**: 직접 의존성 생성 금지
- **Type Safety**: 모든 데이터에 타입 정의
- **Error Handling**: 일관된 에러 처리 패턴
- **Testing**: 최소 80% 코드 커버리지

## 🚀 성능 최적화

### Singleton Pattern 효과
- **메모리 효율성**: 모듈당 단일 인스턴스
- **빠른 접근**: 인스턴스 재생성 비용 제거

### 서비스 분해의 이점
- **병렬 처리**: 독립적인 서비스들의 동시 실행 가능
- **캐시 최적화**: 서비스별 특화된 캐싱 전략
- **확장성**: 필요 시 서비스별 독립 스케일링

## 📝 핵심 파일 경로

### 모듈 진입점
- `modules/index.ts` - 전체 모듈 통합
- `modules/auth/auth.module.ts` - Auth 모듈 DI Container

### 주요 서비스
- `modules/auth/services/auth.service.ts` - Facade 서비스
- `modules/auth/services/authentication.service.ts` - 인증 로직
- `modules/auth/services/token.service.ts` - 토큰 관리

### API 계층
- `modules/auth/controllers/auth.controller.ts` - REST API 엔드포인트

### 데이터 계층
- `modules/auth/repositories/user.repository.ts` - 사용자 데이터 접근
- `modules/auth/repositories/token.repository.ts` - 토큰 데이터 접근

---

**작성일**: 2025.09  
**현재 상태**: Auth 모듈 완전 구현, Task/Members 모듈 개발 대기  
**아키텍처**: DI Container + 계층 분리 + Service 분해 패턴