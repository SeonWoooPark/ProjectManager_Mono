# Backend API 완전 분석 리포트 (2025.01)

## 1. API 기본 구조

### Base URL
- Development: `http://localhost:15000/api/v1`
- Production: 환경변수 `API_URL` 설정 필요

### 응답 형식

#### 성공 응답
```typescript
{
  success: true,
  data: T,
  message?: string  // 선택적
}
```

#### 에러 응답
```typescript
{
  success: false,
  error: {
    code: string,      // ERROR_CODE
    message: string,   // 한글 에러 메시지
    details?: any      // 추가 정보
  },
  timestamp: string    // ISO 8601
}
```

## 2. 인증 시스템 (JWT)

### 토큰 전략
- **Access Token**: 15분, Bearer 헤더로 전송
- **Refresh Token**: 30일, HttpOnly Cookie
- **Token Rotation**: 리프레시 시 새 토큰 쌍 발급

### 인증 헤더
```
Authorization: Bearer {access_token}
```

## 3. API 엔드포인트 상세

### Auth Module (/api/v1/auth)

#### 공개 API (인증 불필요)
| Method | Endpoint | 설명 | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | /signup/company-manager | 회사 관리자 가입 | CompanyManagerSignupDto | SignupResponseDto |
| POST | /signup/team-member | 팀원 가입 | TeamMemberSignupDto | SignupResponseDto |
| POST | /login | 로그인 | LoginRequestDto | LoginResponseDto |
| POST | /refresh | 토큰 갱신 | Cookie: refresh_token | TokenRefreshResponseDto |
| POST | /password/forgot | 비밀번호 재설정 요청 | ForgotPasswordDto | PasswordResetResponseDto |
| GET | /password/verify | 재설정 토큰 검증 | Query: token | VerifyTokenResponseDto |
| POST | /password/reset | 비밀번호 재설정 | ResetPasswordDto | PasswordResetResponseDto |

#### 보호된 API (JWT 필요)
| Method | Endpoint | 설명 | 권한 | Request Body | Response |
|--------|----------|------|------|--------------|----------|
| POST | /logout | 로그아웃 | ALL | - | LogoutResponseDto |
| POST | /admin/approve/company | 회사 승인 | SYSTEM_ADMIN | CompanyApprovalDto | ApprovalResponseDto |
| POST | /manager/approve/member | 팀원 승인 | COMPANY_MANAGER | MemberApprovalDto | ApprovalResponseDto |

### Projects Module (/api/v1/projects)

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| POST | / | 프로젝트 생성 | COMPANY_MANAGER | CreateProjectDto | ProjectDto |
| GET | / | 프로젝트 목록 | ALL | Query: page, limit, status_id | PaginatedProjects |
| GET | /:project_id | 프로젝트 상세 | ALL | - | ProjectDetailDto |
| GET | /:project_id/tasks | 프로젝트 작업 목록 | ALL | Query: status_id, assignee_id | TaskListDto |
| GET | /:project_id/members | 프로젝트 멤버 | ALL | - | MemberListDto |
| PATCH | /:project_id | 프로젝트 수정 | COMPANY_MANAGER | UpdateProjectDto | ProjectDto |
| DELETE | /:project_id | 프로젝트 삭제 | COMPANY_MANAGER | - | { message: string } |
| POST | /:project_id/tasks | 작업 생성 | COMPANY_MANAGER | CreateTaskDto | TaskDto |

### Tasks Module (/api/v1/tasks)

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | /assigned | 할당된 작업 목록 | ALL | Query: status_id | TaskListDto |
| PATCH | /:task_id/status | 작업 상태 변경 | ALL | StatusChangeDto | TaskDto |
| PATCH | /:task_id | 작업 수정 | ALL | UpdateTaskDto | TaskDto |

### Members Module (/api/v1/members)

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | / | 회사 멤버 목록 | ALL | Query: page, limit | MemberListDto |
| GET | /pending | 승인 대기 멤버 | COMPANY_MANAGER | - | PendingMemberListDto |
| GET | /projects/:project_id | 프로젝트별 멤버 | ALL | - | ProjectMemberListDto |

## 4. DTO 구조

### 요청 DTO

#### CompanyManagerSignupRequestDto
```typescript
{
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  company: {
    company_name: string;
    company_description?: string;
  };
}
```

#### TeamMemberSignupRequestDto
```typescript
{
  user: {
    email: string;
    password: string;
    user_name: string;
    phone_number: string;
  };
  invitation_code: string;
}
```

#### LoginRequestDto
```typescript
{
  email: string;
  password: string;
}
```

### 응답 DTO

#### UserResponseDto
```typescript
{
  user_id: number;
  email: string;
  user_name: string;
  phone_number: string;
  role_id: number;  // 1: SYSTEM_ADMIN, 2: COMPANY_MANAGER, 3: TEAM_MEMBER
  status_id: number; // 1: ACTIVE, 2: INACTIVE, 3: PENDING
  company_id: number;
  company?: {
    company_id: number;
    company_name: string;
    company_description?: string;
  };
  role?: {
    role_id: number;
    role_name: string;
  };
  status?: {
    status_id: number;
    status_name: string;
  };
  created_at: Date;
  updated_at: Date;
}
```

#### LoginResponseDto (실제 응답)
```typescript
{
  user: UserResponseDto;
  access_token: string;      // JWT 토큰
  token_type: "Bearer";
  expires_in: 900;           // 15분 (초 단위)
  // refresh_token은 HttpOnly Cookie로 전송
}
```

## 5. 미들웨어 스택

### 실행 순서
1. **Helmet** - 보안 헤더 설정
2. **CORS** - Cross-Origin 요청 처리
3. **Compression** - 응답 압축
4. **Cookie Parser** - 쿠키 파싱
5. **Body Parser** - JSON/URL-encoded 파싱 (10MB 제한)
6. **Request Logger** - 요청 로깅
7. **Rate Limiter** - 요청 제한 (15분/100회)
8. **Authenticate Token** - JWT 검증
9. **Role Check** - 권한 확인
10. **Validation** - 입력값 검증
11. **Controller** - 비즈니스 로직

### 권한 체계
```typescript
enum UserRole {
  SYSTEM_ADMIN = 1,    // 전체 시스템 관리
  COMPANY_MANAGER = 2, // 회사 내 관리
  TEAM_MEMBER = 3      // 개인 작업
}

enum UserStatus {
  ACTIVE = 1,          // 활성
  INACTIVE = 2,        // 비활성
  PENDING = 3          // 승인 대기
}
```

## 6. 에러 코드

| Code | HTTP Status | 설명 |
|------|-------------|------|
| NO_TOKEN | 401 | 인증 토큰 없음 |
| TOKEN_EXPIRED | 401 | 토큰 만료 |
| INVALID_TOKEN | 401 | 유효하지 않은 토큰 |
| AUTHENTICATION_REQUIRED | 401 | 인증 필요 |
| FORBIDDEN | 403 | 권한 없음 |
| ACCOUNT_NOT_ACTIVE | 403 | 계정 비활성 |
| NOT_FOUND | 404 | 리소스 없음 |
| VALIDATION_ERROR | 400 | 입력값 검증 실패 |
| CONFLICT | 409 | 중복 데이터 |
| TOO_MANY_REQUESTS | 429 | 요청 제한 초과 |
| INTERNAL_SERVER_ERROR | 500 | 서버 오류 |

## 7. 특이사항 및 주의점

### 쿠키 설정
- Refresh Token은 HttpOnly Cookie로만 전송
- Path: `/api/v1/auth`
- SameSite: `strict`
- Secure: Production에서만 활성화

### Token Refresh 흐름
1. Access Token 만료 시 401 응답
2. `/api/v1/auth/refresh` 호출 (Cookie 자동 전송)
3. 새로운 Access/Refresh Token 쌍 발급
4. 기존 요청 재시도

### Validation
- 모든 입력값은 Joi 스키마로 검증
- 에러 시 필드명과 이유를 details에 포함

### 프로덕션 주의사항
- JWT Secret 최소 32자
- HTTPS 필수
- Rate Limiting 설정 확인
- CORS origin 설정 필수