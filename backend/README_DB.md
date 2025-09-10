# PostgreSQL 데이터베이스 연결 가이드

## 설정 완료 항목

### 1. 설치된 패키지
- `typeorm`: TypeScript ORM 프레임워크
- `pg`: PostgreSQL Node.js 클라이언트
- `reflect-metadata`: TypeORM 데코레이터를 위한 메타데이터 라이브러리
- `@types/pg`: PostgreSQL 타입 정의

### 2. 환경 변수 설정 (.env)
```env
# Database (PostgreSQL)
DATABASE_URI=postgresql://dbuser:dbpassword123@localhost:5432/pm_database
DB_HOST=localhost           # PostgreSQL 호스트 주소
DB_PORT=5432               # PostgreSQL 포트 (기본값: 5432)
DB_NAME=pm_database        # 데이터베이스 이름
DB_USER=dbuser             # 데이터베이스 사용자명
DB_PASSWORD=dbpassword123  # 데이터베이스 비밀번호
DB_SSL=false               # SSL 연결 여부
DB_SYNCHRONIZE=true        # 개발 환경: true, 프로덕션: false
DB_LOGGING=true            # SQL 쿼리 로깅 여부
```

⚠️ **중요**: 실제 사용 시 위의 값들을 실제 데이터베이스 정보로 변경해주세요.

### 3. 프로젝트 구조
```
backend/
├── src/
│   ├── config/
│   │   └── data-source.ts    # TypeORM 데이터소스 설정
│   ├── entities/
│   │   └── User.ts           # User 엔티티 예제
│   ├── repositories/
│   │   └── user.repository.ts # TypeORM 통합 Repository
│   ├── migrations/           # 데이터베이스 마이그레이션
│   ├── subscribers/          # TypeORM 이벤트 구독자
│   └── server.ts            # DB 연결 통합된 서버 파일
```

## PostgreSQL 설치 및 설정

### 1. PostgreSQL 설치

#### macOS
```bash
# Homebrew 사용
brew install postgresql@15
brew services start postgresql@15

# 또는 PostgreSQL.app 사용 (권장)
# https://postgresapp.com/ 에서 다운로드
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
PostgreSQL 공식 웹사이트에서 설치 프로그램 다운로드:
https://www.postgresql.org/download/windows/

### 2. 데이터베이스 및 사용자 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE pm_database;

# 사용자 생성
CREATE USER dbuser WITH PASSWORD 'dbpassword123';

# 권한 부여
GRANT ALL PRIVILEGES ON DATABASE pm_database TO dbuser;

# 연결 권한 부여
GRANT CONNECT ON DATABASE pm_database TO dbuser;

# 스키마 권한 부여
\c pm_database
GRANT ALL ON SCHEMA public TO dbuser;

# 종료
\q
```

### 3. 연결 테스트

```bash
# 생성한 사용자로 데이터베이스 접속 테스트
psql -h localhost -U dbuser -d pm_database
```

## 서버 실행

### 개발 환경
```bash
# 개발 서버 실행 (자동 재시작)
npm run dev
```

### 프로덕션 환경
```bash
# TypeScript 컴파일
npm run build

# 프로덕션 서버 실행
npm run start:prod
```

## 마이그레이션 관리

### 마이그레이션 생성
```bash
# 빈 마이그레이션 파일 생성
npm run migration:create src/migrations/CreateUserTable

# 엔티티 변경사항 기반 자동 생성
npm run migration:generate src/migrations/UpdateUserTable
```

### 마이그레이션 실행
```bash
# 마이그레이션 실행
npm run migration:run

# 마이그레이션 되돌리기
npm run migration:revert

# 마이그레이션 상태 확인
npm run migration:show
```

## 주요 기능

### 1. TypeORM 통합
- Entity 기반 데이터 모델링
- Repository 패턴 구현
- 자동 마이그레이션 지원

### 2. User Entity 기능
- UUID 기본 키
- 비밀번호 자동 해싱 (bcrypt)
- Soft delete 지원
- 타임스탬프 자동 관리

### 3. UserRepository 메서드
- `findAll()`: 모든 활성 사용자 조회
- `findById(id)`: ID로 사용자 조회
- `findByEmail(email)`: 이메일로 사용자 조회
- `create(data)`: 새 사용자 생성
- `update(id, data)`: 사용자 정보 수정
- `delete(id)`: Soft delete
- `hardDelete(id)`: 실제 삭제
- `search(query)`: 사용자 검색

## 보안 권장사항

1. **프로덕션 환경 설정**
   - `DB_SYNCHRONIZE=false` 설정 (수동 마이그레이션 사용)
   - `DB_LOGGING=false` 설정 (성능 향상)
   - 강력한 비밀번호 사용

2. **SSL 연결**
   - 프로덕션에서는 `DB_SSL=true` 권장
   - 인증서 파일 경로 설정 필요

3. **환경 변수 관리**
   - `.env` 파일을 `.gitignore`에 추가
   - 프로덕션에서는 환경 변수 직접 설정

## 트러블슈팅

### 연결 오류
```
ECONNREFUSED 127.0.0.1:5432
```
→ PostgreSQL 서비스가 실행 중인지 확인

### 인증 실패
```
password authentication failed for user
```
→ 사용자명과 비밀번호 확인, pg_hba.conf 설정 확인

### 데이터베이스 없음
```
database "pm_database" does not exist
```
→ 데이터베이스 생성 명령 실행

## 추가 리소스
- [TypeORM 공식 문서](https://typeorm.io/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL Tutorial](https://node-postgres.com/)