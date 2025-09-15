# Auth API E2E 테스트 가이드

## 개요
이 E2E 테스트는 `/backend/docs/login.md`에 명세된 인증 API들의 선후 관계를 고려하여 작성되었습니다.

## 테스트 구조

```
src/tests/
├── setup.ts              # Jest 전역 설정
├── helpers/
│   └── test-helper.ts    # 테스트 유틸리티 함수
├── e2e/
│   └── auth.e2e.test.ts  # 인증 API E2E 테스트
└── fixtures/             # 테스트 데이터 (필요시)
```

## 사전 준비

### 1. 테스트 데이터베이스 생성
```bash
# PostgreSQL에서 테스트 DB 생성
createdb project_manager_test
```

### 2. 환경 변수 설정
`.env.test` 파일이 자동 생성되어 있습니다. 필요시 수정하세요:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/project_manager_test
```

### 3. 테스트 DB 마이그레이션
```bash
# 테스트 DB에 스키마 적용
DATABASE_URL="postgresql://user:password@localhost:5432/project_manager_test" npx prisma migrate deploy
```

## 테스트 실행

### 전체 E2E 테스트 실행
```bash
npm run test:e2e
```

### Watch 모드로 실행
```bash
npm run test:e2e:watch
```

### 일반 단위 테스트 실행
```bash
npm test
```

## 테스트 시나리오 (선후 관계)

### 1. 회원가입 및 승인 플로우
```
1. 시스템 관리자 계정 생성 (필수 선행)
   ↓
2. 회사 관리자 회원가입
   ↓
3. 시스템 관리자의 회사 승인 → 초대 코드 생성
   ↓
4. 초대 코드로 팀원 회원가입
   ↓
5. 회사 관리자의 팀원 승인
```

### 2. 로그인 및 토큰 관리
```
1. 로그인 → Access Token + Refresh Token 발급
   ↓
2. Access Token으로 API 호출
   ↓
3. Refresh Token으로 Access Token 갱신 (Token Rotation)
   ↓
4. 로그아웃 → 모든 토큰 무효화
```

### 3. 비밀번호 재설정
```
1. 비밀번호 재설정 요청
   ↓
2. 재설정 토큰 검증
   ↓
3. 새 비밀번호 설정
   ↓
4. 모든 Refresh Token 자동 무효화
```

## 주요 테스트 케이스

### 회원가입 및 승인
- ✅ 회사 관리자 회원가입
- ✅ 승인 전 로그인 차단
- ✅ 시스템 관리자의 회사 승인
- ✅ 초대 코드 생성 확인
- ✅ 초대 코드로 팀원 가입
- ✅ 회사 관리자의 팀원 승인

### 인증 및 권한
- ✅ 정상 로그인
- ✅ 잘못된 자격증명 처리
- ✅ JWT Access Token 발급
- ✅ Refresh Token Cookie 설정
- ✅ Token Refresh (Rotation)
- ✅ 로그아웃 및 토큰 무효화

### 비밀번호 관리
- ✅ 재설정 요청
- ✅ 토큰 검증
- ✅ 비밀번호 정책 검증
- ✅ 재설정 완료
- ✅ 토큰 일회성 보장

### 보안 검증
- ✅ 권한별 API 접근 제어
- ✅ 회사간 격리
- ✅ 입력 유효성 검증
- ✅ 중복 방지 (이메일, 회사명)

## 테스트 헬퍼 함수

### TestHelper 클래스 주요 메서드
```typescript
// 테스트 데이터 생성
createSystemAdmin()           // 시스템 관리자 생성
createCompanyWithManager()     // 회사 및 관리자 생성
createTeamMember()            // 팀원 생성
approveCompany()              // 회사 승인 처리
approveUser()                 // 사용자 승인 처리

// 토큰 생성
generateAccessToken()         // JWT Access Token 생성
generateRefreshToken()        // Refresh Token 생성
generateResetToken()          // 비밀번호 재설정 토큰 생성

// API 요청
post()                        // POST 요청
postWithAuth()               // 인증된 POST 요청
postWithCookie()             // Cookie 포함 POST 요청
get()                        // GET 요청
getWithAuth()                // 인증된 GET 요청

// 데이터베이스
cleanDatabase()              // DB 초기화
seedTestData()              // 테스트 데이터 시드
```

## 주의사항

1. **테스트 격리**: 각 테스트는 독립적으로 실행되며, afterEach에서 DB를 정리합니다.
2. **순차 실행**: E2E 테스트는 `--runInBand` 옵션으로 순차 실행됩니다.
3. **타임아웃**: 복잡한 테스트를 위해 30초 타임아웃이 설정되어 있습니다.
4. **환경 분리**: 반드시 테스트 전용 DB를 사용하세요.

## 트러블슈팅

### DB 연결 오류
```bash
# .env.test 파일 확인
# DATABASE_URL이 테스트 DB를 가리키는지 확인
```

### 마이그레이션 오류
```bash
# 테스트 DB에 최신 스키마 적용
DATABASE_URL="..." npx prisma migrate reset --force
```

### 테스트 실패
```bash
# 개발 서버가 실행 중이면 종료
# 포트 충돌 방지를 위해 테스트는 다른 포트(5001) 사용
```