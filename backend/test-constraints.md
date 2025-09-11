# 데이터베이스 제약조건 검증 테스트 가이드

## 구현 완료 항목

### 1. 데이터베이스 제약조건 분석
- PostgreSQL MCP를 사용하여 모든 테이블의 DDL 및 제약조건 확인 완료
- Primary Keys, Foreign Keys, Unique Constraints, Check Constraints 확인

### 2. 제약조건 검증 유틸리티 (`src/utils/dbConstraints.ts`)
- ID 형식 검증 (usr_*, cmp_*, prj_*, tsk_* 등)
- 범위 검증 (진행률 0-100, 상태 ID 범위 등)
- 날짜 검증 (종료일 > 시작일)
- 문자열 길이 검증
- IP 주소 형식 검증
- 열거형 값 검증

### 3. 데이터베이스 에러 처리 (`src/utils/errors.ts`)
- `DatabaseConstraintError` 기본 클래스
- `ForeignKeyViolationError` - 외래키 위반
- `UniqueConstraintViolationError` - 유니크 제약 위반
- `CheckConstraintViolationError` - 체크 제약 위반
- `InvalidIdFormatError` - ID 형식 오류
- `DataLengthExceededError` - 데이터 길이 초과
- `InvalidRangeError` - 범위 오류
- `InvalidDateRangeError` - 날짜 범위 오류
- `InvalidEnumValueError` - 열거형 값 오류
- `NotNullViolationError` - NOT NULL 위반

### 4. 입력 검증 미들웨어 (`src/middleware/dbConstraintValidator.ts`)
- `validateCompanyManagerSignup` - 회사 관리자 회원가입 검증
- `validateTeamMemberSignup` - 팀원 회원가입 검증
- `validateProjectCreation` - 프로젝트 생성 검증
- `validateTaskCreation` - 작업 생성 검증
- `validateIdParam` - ID 파라미터 검증
- `validateProgressUpdate` - 진행률 업데이트 검증
- `validateStatusUpdate` - 상태 업데이트 검증

### 5. Prisma 에러 핸들러 (`src/utils/prismaErrorHandler.ts`)
- Prisma 에러를 커스텀 에러로 변환
- P2002 (Unique constraint) → `UniqueConstraintViolationError`
- P2003 (Foreign key) → `ForeignKeyViolationError`
- P2011/P2012 (Null constraint) → `NotNullViolationError`
- 기타 Prisma 에러 처리

### 6. Auth Service 업데이트 (`src/services/auth.service.ts`)
- ID 생성 시 올바른 패턴 사용 (usr_*, cmp_* 등)
- 데이터베이스 작업 전 제약조건 검증
- `DbConstraintValidator` 사용한 사전 검증

### 7. Auth Routes 업데이트 (`src/routes/auth.routes.ts`)
- 회원가입 라우트에 DB 제약조건 검증 미들웨어 추가
- ID 형식 검증 추가 (company_id, user_id)

### 8. Error Handler 미들웨어 업데이트 (`src/middleware/errorHandler.ts`)
- `ApiError` 및 `DatabaseConstraintError` 처리
- Prisma 에러 자동 변환
- 상세한 에러 정보 제공

## 테스트 시나리오

### 1. 회사 관리자 회원가입 테스트

#### 성공 케이스
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup/company-manager \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "manager@company.com",
      "password": "SecurePass123!",
      "user_name": "김관리자",
      "phone_number": "010-1234-5678"
    },
    "company": {
      "company_name": "테스트 회사",
      "company_description": "테스트 회사 설명"
    }
  }'
```

#### 실패 케이스 - 이메일 형식 오류
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup/company-manager \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "invalid-email",
      "password": "SecurePass123!",
      "user_name": "김관리자"
    },
    "company": {
      "company_name": "테스트 회사"
    }
  }'
# 예상 응답: "올바른 이메일 형식이 아닙니다"
```

#### 실패 케이스 - 회사명 길이 초과 (200자 제한)
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup/company-manager \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "manager@company.com",
      "password": "SecurePass123!",
      "user_name": "김관리자"
    },
    "company": {
      "company_name": "'$(printf 'a%.0s' {1..201})'"
    }
  }'
# 예상 응답: "회사 이름은 200자를 초과할 수 없습니다"
```

### 2. 팀원 회원가입 테스트

#### 실패 케이스 - 잘못된 초대 코드 형식
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup/team-member \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "member@company.com",
      "password": "SecurePass123!",
      "user_name": "김팀원"
    },
    "invitation_code": "invalid-code"
  }'
# 예상 응답: "초대 코드 형식이 올바르지 않습니다 (INV-로 시작하고 6자 이상의 대문자/숫자)"
```

### 3. 회사 승인 테스트

#### 실패 케이스 - 잘못된 회사 ID 형식
```bash
curl -X POST http://localhost:5000/api/v1/auth/admin/approve/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "company_id": "wrong-id-format",
    "action": "approve"
  }'
# 예상 응답: "올바른 회사 ID 형식이 아닙니다"
```

### 4. 프로젝트 생성 테스트 (추가 구현 시)

#### 실패 케이스 - 날짜 범위 오류
```json
{
  "project_name": "테스트 프로젝트",
  "start_date": "2024-01-01",
  "end_date": "2023-12-31",
  "company_id": "cmp_abc123"
}
# 예상 응답: "종료일은 시작일보다 이후여야 합니다"
```

#### 실패 케이스 - 진행률 범위 오류
```json
{
  "project_name": "테스트 프로젝트",
  "progress_rate": 150,
  "company_id": "cmp_abc123"
}
# 예상 응답: "진행률은 0에서 100 사이여야 합니다"
```

## 주요 제약조건 목록

### ID 형식 패턴
- 사용자: `usr_[a-zA-Z0-9]{6,}`
- 회사: `cmp_[a-zA-Z0-9]{6,}`
- 프로젝트: `prj_[a-zA-Z0-9]{6,}`
- 작업: `tsk_[a-zA-Z0-9]{6,}`
- 초대 코드: `INV-[A-Z0-9]{6,}`

### 문자열 길이 제한
- 이메일: 최대 255자
- 사용자 이름: 최대 100자
- 회사 이름: 최대 200자
- 프로젝트 이름: 최대 200자
- 작업 이름: 최대 200자
- 회사 설명: 최대 1000자
- 프로젝트 설명: 최대 2000자
- 작업 설명: 최대 2000자
- 코멘트: 최대 1000자

### 범위 제약
- 진행률: 0-100
- 사용자 상태 ID: 1 이상
- 회사 상태 ID: 1 이상
- 프로젝트 상태 ID: 1-5
- 작업 상태 ID: 1-5
- 역할 ID: 1, 2, 3 (SYSTEM_ADMIN, COMPANY_MANAGER, TEAM_MEMBER)

### 날짜 제약
- 종료일 > 시작일
- 만료 시간 > 생성 시간

### 외래키 제약 (CASCADE 정책)
- 사용자 삭제 시:
  - 관련 활동 로그 삭제 (CASCADE)
  - 관련 리프레시 토큰 삭제 (CASCADE)
  - 관련 비밀번호 재설정 토큰 삭제 (CASCADE)
- 회사 삭제 시:
  - 관련 프로젝트 삭제 (CASCADE)
  - 관련 사용자의 company_id NULL 설정 (SET NULL)
- 프로젝트 삭제 시:
  - 관련 작업 삭제 (CASCADE)
  - 관련 활동 로그 삭제 (CASCADE)

## 개발자 참고사항

1. **사전 검증 vs 사후 처리**
   - 미들웨어에서 사전 검증 (빠른 실패)
   - Prisma 에러 핸들러로 데이터베이스 레벨 제약 처리 (안전망)

2. **ID 생성**
   - `IdValidator.generateId()` 사용하여 올바른 패턴의 ID 생성
   - crypto.randomUUID() 사용 금지 (패턴 불일치)

3. **에러 응답 형식**
   ```json
   {
     "success": false,
     "message": "에러 메시지",
     "code": "ERROR_CODE",
     "details": {
       "field": "필드명",
       "constraint": "제약조건명"
     }
   }
   ```

4. **확장 가능성**
   - 새로운 엔티티 추가 시 `dbConstraints.ts`에 검증 함수 추가
   - 새로운 제약조건 추가 시 `CONSTRAINTS` 객체 업데이트
   - 새로운 에러 타입 필요 시 `errors.ts`에 클래스 추가