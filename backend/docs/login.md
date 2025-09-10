# JWT 기반 인증 시스템 API 명세서

## 목차
1. [회원가입 API](#1-회원가입-api)
2. [승인 API](#2-승인-api)
3. [로그인/인증 API](#3-로그인인증-api)
4. [비밀번호 관리 API](#4-비밀번호-관리-api)

---

## 1. 회원가입 API

### 1.1 회사 관리자 회원가입

**Endpoint:** `POST /api/v1/auth/signup/company-manager`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "user": {
    "email": "manager@company.com",
    "password": "SecurePass123!",
    "user_name": "김관리",
    "phone_number": "010-1234-5678"
  },
  "company": {
    "company_name": "테크스타트업",
    "company_description": "AI 기반 솔루션 개발 회사"
  }
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "manager@company.com",
      "user_name": "김관리",
      "role_id": 2,
      "role_name": "COMPANY_MANAGER",
      "status_id": 3,
      "status_name": "PENDING"
    },
    "company": {
      "id": "cmp_xyz789",
      "company_name": "테크스타트업",
      "status_id": 3,
      "status_name": "PENDING",
      "invitation_code": null
    },
    "message": "회원가입이 완료되었습니다. 시스템 관리자의 승인을 기다려주세요."
  }
}
```

#### Business Logic
1. **이메일 중복 검증**
   - `SELECT * FROM users WHERE email = ?`
   - 존재하면 409 Conflict 반환

2. **회사명 중복 검증**
   - `SELECT * FROM companies WHERE company_name = ?`
   - 존재하면 409 Conflict 반환

3. **비밀번호 해싱**
   - bcrypt로 비밀번호 해시 생성 (cost factor: 10)

4. **회사 데이터 생성**
   ```sql
   INSERT INTO companies (id, company_name, company_description, status_id, created_at)
   VALUES (?, ?, ?, 3, NOW())
   ```

5. **사용자 데이터 생성**
   ```sql
   INSERT INTO users (id, email, password_hash, user_name, phone_number, 
                      role_id, status_id, company_id, created_at)
   VALUES (?, ?, ?, ?, ?, 2, 3, ?, NOW())
   ```

6. **회사 관리자 설정**
   ```sql
   UPDATE companies SET manager_id = ? WHERE id = ?
   ```

---

### 1.2 일반 팀원 회원가입

**Endpoint:** `POST /api/v1/auth/signup/team-member`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "user": {
    "email": "member@company.com",
    "password": "SecurePass456!",
    "user_name": "이팀원",
    "phone_number": "010-5678-1234"
  },
  "invitation_code": "INV-ABC123"
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_def456",
      "email": "member@company.com",
      "user_name": "이팀원",
      "role_id": 3,
      "role_name": "TEAM_MEMBER",
      "status_id": 3,
      "status_name": "PENDING"
    },
    "company": {
      "id": "cmp_xyz789",
      "company_name": "테크스타트업"
    },
    "message": "회원가입이 완료되었습니다. 회사 관리자의 승인을 기다려주세요."
  }
}
```

#### Business Logic
1. **이메일 중복 검증**
   ```sql
   SELECT COUNT(*) FROM users WHERE email = ?
   ```

2. **초대 코드 검증**
   ```sql
   SELECT id, company_name FROM companies 
   WHERE invitation_code = ? AND status_id = 1
   ```
   - 없으면 404 Not Found 반환

3. **비밀번호 해싱**
   - bcrypt 해시 생성

4. **사용자 생성**
   ```sql
   INSERT INTO users (id, email, password_hash, user_name, phone_number, 
                      role_id, status_id, company_id, created_at)
   VALUES (?, ?, ?, ?, ?, 3, 3, ?, NOW())
   ```

---

## 2. 승인 API

### 2.1 시스템 관리자의 회사 승인

**Endpoint:** `POST /api/v1/admin/approve/company`

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

#### Request Body
```json
{
  "company_id": "cmp_xyz789",
  "action": "approve",
  "comment": "승인되었습니다",
  "generate_invitation_code": true
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "cmp_xyz789",
      "company_name": "테크스타트업",
      "status_id": 1,
      "status_name": "ACTIVE",
      "invitation_code": "INV-XYZ789",
      "manager_id": "usr_abc123"
    },
    "manager": {
      "id": "usr_abc123",
      "email": "manager@company.com",
      "status_id": 1,
      "status_name": "ACTIVE"
    },
    "approved_at": "2025-02-01T10:00:00Z",
    "approved_by": "usr_system_admin"
  }
}
```

#### Business Logic
1. **JWT 토큰 검증**
   - Access Token에서 role_id 추출
   - `role_id !== 1` 이면 403 Forbidden

2. **회사 및 관리자 조회**
   ```sql
   SELECT c.*, u.* FROM companies c
   JOIN users u ON c.manager_id = u.id
   WHERE c.id = ?
   ```

3. **승인 처리 (action = 'approve')**
   ```sql
   BEGIN TRANSACTION;
   
   -- 회사 상태 변경
   UPDATE companies SET status_id = 1 WHERE id = ?;
   
   -- 관리자 상태 변경
   UPDATE users SET status_id = 1 WHERE id = ?;
   
   -- 초대 코드 생성 (선택적)
   UPDATE companies SET invitation_code = ? WHERE id = ?;
   
   COMMIT;
   ```

4. **거부 처리 (action = 'reject')**
   ```sql
   UPDATE companies SET status_id = 2 WHERE id = ?;
   UPDATE users SET status_id = 2 WHERE id = ?;
   ```

---

### 2.2 회사 관리자의 팀원 승인

**Endpoint:** `POST /api/v1/manager/approve/member`

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

#### Request Body
```json
{
  "user_id": "usr_def456",
  "action": "approve",
  "comment": "팀원으로 승인합니다"
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_def456",
      "email": "member@company.com",
      "user_name": "이팀원",
      "status_id": 1,
      "status_name": "ACTIVE",
      "company_id": "cmp_xyz789"
    },
    "approved_at": "2025-02-01T11:00:00Z",
    "approved_by": "usr_abc123"
  }
}
```

#### Business Logic
1. **권한 검증**
   - JWT에서 role_id와 company_id 추출
   - `role_id !== 2` 이면 403 Forbidden

2. **회사 일치 검증**
   ```sql
   SELECT company_id FROM users WHERE id = ?
   -- 요청자와 대상 사용자의 company_id 비교
   ```

3. **상태 업데이트**
   ```sql
   UPDATE users SET status_id = ? WHERE id = ?
   -- approve: status_id = 1
   -- reject: status_id = 2
   ```

---

## 3. 로그인/인증 API

### 3.1 사용자 로그인

**Endpoint:** `POST /api/v1/auth/login`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "manager@company.com",
  "password": "SecurePass123!"
}
```

#### Response Headers
```http
Content-Type: application/json
Set-Cookie: refresh_token={token}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/api/v1/auth
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "usr_abc123",
      "email": "manager@company.com",
      "user_name": "김관리",
      "role_id": 2,
      "role_name": "COMPANY_MANAGER",
      "status_id": 1,
      "status_name": "ACTIVE",
      "company_id": "cmp_xyz789",
      "company_name": "테크스타트업"
    }
  }
}
```

#### Business Logic
1. **사용자 조회**
   ```sql
   SELECT u.*, r.role_name, us.status_name, c.company_name
   FROM users u
   JOIN roles r ON u.role_id = r.id
   JOIN users_status us ON u.status_id = us.id
   LEFT JOIN companies c ON u.company_id = c.id
   WHERE u.email = ?
   ```

2. **비밀번호 검증**
   ```javascript
   const isValid = await bcrypt.compare(password, user.password_hash);
   ```

3. **계정 상태 확인**
   - PENDING (3): 403 에러 - "승인 대기 중입니다"
   - INACTIVE (2): 403 에러 - "비활성 계정입니다"
   - ACTIVE (1): 로그인 진행

4. **Access Token 생성**
   ```javascript
   const accessToken = jwt.sign({
     sub: user.id,
     email: user.email,
     role_id: user.role_id,
     company_id: user.company_id,
     status_id: user.status_id,
     jti: generateUUID(),
     iat: Math.floor(Date.now() / 1000),
     exp: Math.floor(Date.now() / 1000) + 900 // 15분
   }, JWT_SECRET);
   ```

5. **Refresh Token 생성 및 저장**
   ```sql
   INSERT INTO refresh_tokens 
   (id, user_id, token_hash, token_family, expires_at, created_at, ip_address, user_agent)
   VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), ?, ?)
   ```

6. **HttpOnly Cookie 설정**

---

### 3.2 Access Token 갱신

**Endpoint:** `POST /api/v1/auth/refresh`

#### Request Headers
```http
Cookie: refresh_token={token}
```

#### Request Body
```
없음
```

#### Response Headers
```http
Content-Type: application/json
Set-Cookie: refresh_token={new_token}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/api/v1/auth
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  }
}
```

#### Business Logic
1. **Refresh Token 추출 및 검증**
   ```sql
   SELECT * FROM refresh_tokens 
   WHERE token_hash = SHA256(?) 
   AND revoked_at IS NULL 
   AND expires_at > NOW()
   ```

2. **Token Rotation**
   ```sql
   BEGIN TRANSACTION;
   
   -- 기존 토큰 무효화
   UPDATE refresh_tokens 
   SET revoked_at = NOW(), revoked_reason = 'token_rotation'
   WHERE id = ?;
   
   -- 새 Refresh Token 생성
   INSERT INTO refresh_tokens 
   (id, user_id, token_hash, token_family, expires_at, created_at)
   VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NOW());
   
   COMMIT;
   ```

3. **재사용 감지**
   ```sql
   -- 이미 revoked된 토큰 사용 시
   UPDATE refresh_tokens 
   SET revoked_at = NOW(), revoked_reason = 'suspicious_activity'
   WHERE token_family = ?;
   ```

4. **새 Access Token 발급**

---

### 3.3 로그아웃

**Endpoint:** `POST /api/v1/auth/logout`

#### Request Headers
```http
Authorization: Bearer {access_token}
Cookie: refresh_token={token}
```

#### Request Body
```
없음
```

#### Response Headers
```http
Content-Type: application/json
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/api/v1/auth
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

#### Business Logic
1. **Access Token JTI 추출**
   ```javascript
   const decoded = jwt.verify(accessToken, JWT_SECRET);
   const jti = decoded.jti;
   ```

2. **Access Token 블랙리스트 등록**
   ```sql
   INSERT INTO token_blacklist 
   (id, jti, token_type, user_id, expires_at, blacklisted_at, reason)
   VALUES (?, ?, 'access', ?, ?, NOW(), 'logout')
   ```

3. **Refresh Token 무효화**
   ```sql
   UPDATE refresh_tokens 
   SET revoked_at = NOW(), revoked_reason = 'logout'
   WHERE token_hash = SHA256(?)
   ```

4. **Cookie 삭제**

---

## 4. 비밀번호 관리 API

### 4.1 비밀번호 재설정 요청

**Endpoint:** `POST /api/v1/auth/password/forgot`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "manager@company.com"
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "message": "이메일이 등록되어 있다면 비밀번호 재설정 링크가 발송됩니다"
}
```

#### Business Logic
1. **사용자 조회**
   ```sql
   SELECT id, email FROM users WHERE email = ?
   ```

2. **기존 토큰 무효화**
   ```sql
   UPDATE password_reset_tokens 
   SET used_at = NOW() 
   WHERE user_id = ? AND used_at IS NULL
   ```

3. **JWT 재설정 토큰 생성**
   ```javascript
   const resetToken = jwt.sign({
     sub: user.id,
     purpose: 'password_reset',
     jti: generateUUID(),
     iat: Math.floor(Date.now() / 1000),
     exp: Math.floor(Date.now() / 1000) + 3600 // 1시간
   }, JWT_SECRET);
   ```

4. **토큰 저장**
   ```sql
   INSERT INTO password_reset_tokens 
   (id, user_id, jti, token_hash, expires_at, created_at, ip_address)
   VALUES (?, ?, ?, SHA256(?), DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW(), ?)
   ```

5. **재설정 URL 반환**
   - Response에 재설정 URL 포함: `https://app.domain.com/reset-password?token={jwt}`

---

### 4.2 재설정 토큰 검증

**Endpoint:** `GET /api/v1/auth/password/verify`

#### Request Headers
```
없음
```

#### Query Parameters
```
token={jwt_token}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "data": {
    "valid": true,
    "email": "man***@company.com",
    "expires_at": "2025-02-01T12:00:00Z"
  }
}
```

#### Business Logic
1. **JWT 서명 검증**
   ```javascript
   const decoded = jwt.verify(token, JWT_SECRET);
   ```

2. **DB 토큰 확인**
   ```sql
   SELECT * FROM password_reset_tokens 
   WHERE jti = ? 
   AND used_at IS NULL 
   AND expires_at > NOW()
   ```

3. **이메일 마스킹**
   ```javascript
   const maskedEmail = email.replace(/^(.{3}).*(@.*)$/, '$1***$2');
   ```

---

### 4.3 새 비밀번호 설정

**Endpoint:** `POST /api/v1/auth/password/reset`

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "NewSecurePass789!",
  "confirm_password": "NewSecurePass789!"
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (200 OK)
```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 변경되었습니다"
}
```

#### Business Logic
1. **토큰 재검증**
   ```sql
   SELECT user_id FROM password_reset_tokens 
   WHERE jti = ? AND used_at IS NULL AND expires_at > NOW()
   ```

2. **비밀번호 정책 검증**
   ```javascript
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
   if (!passwordRegex.test(newPassword)) {
     throw new Error('비밀번호 정책 위반');
   }
   ```

3. **비밀번호 일치 확인**
   ```javascript
   if (newPassword !== confirmPassword) {
     throw new Error('비밀번호가 일치하지 않습니다');
   }
   ```

4. **비밀번호 업데이트**
   ```sql
   BEGIN TRANSACTION;
   
   -- 비밀번호 변경
   UPDATE users 
   SET password_hash = ?, updated_at = NOW() 
   WHERE id = ?;
   
   -- 토큰 사용 처리
   UPDATE password_reset_tokens 
   SET used_at = NOW() 
   WHERE jti = ?;
   
   -- 모든 Refresh Token 무효화
   UPDATE refresh_tokens 
   SET revoked_at = NOW(), revoked_reason = 'password_change'
   WHERE user_id = ?;
   
   COMMIT;
   ```

---

## 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {
      "field": "필드명",
      "reason": "상세 사유"
    }
  },
  "timestamp": "2025-02-01T10:00:00Z"
}
```

## HTTP 상태 코드

| 코드 | 설명 | 사용 케이스 |
|------|------|------------|
| 200 | OK | 성공적인 요청 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 유효성 검사 실패 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 리소스 |
| 410 | Gone | 만료된 리소스 |
| 423 | Locked | 계정 잠금 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

---

## 보안 고려사항

### JWT 토큰 정책
- **Access Token**: 15분 유효
- **Refresh Token**: 30일 유효
- **Password Reset Token**: 1시간 유효

### 비밀번호 정책
- 최소 8자 이상
- 대문자 포함 필수
- 소문자 포함 필수
- 숫자 포함 필수
- 특수문자 포함 필수

### 보안 헤더
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 버전 정보
- **문서 버전**: 1.0.1
- **API 버전**: v1
- **최종 수정일**: 2025-02-01

이 문서는 JWT 기반 인증 시스템의 모든 API에 대한 상세한 기술 명세를 포함하고 있으며, 실제 구현 시 참고할 수 있는 완전한 가이드입니다.