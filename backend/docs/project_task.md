# 프로젝트 관리 시스템 API 명세서 v2.0

## 목차
1. [프로젝트 관련 API](#1-프로젝트-관련-api)
2. [작업(Task) 관련 API](#2-작업task-관련-api)
3. [팀원 관리 API](#3-팀원-관리-api)

---

## 1. 프로젝트 관련 API

### 1.1 프로젝트 생성

**Endpoint:** `POST /api/v1/projects`

#### Request Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
```json
{
  "project_name": "신제품 개발 프로젝트",
  "project_description": "2025년 상반기 신제품 개발을 위한 프로젝트",
  "start_date": "2025-02-01",
  "end_date": "2025-06-30",
  "member_ids": ["usr_abc123", "usr_def456", "usr_ghi789"]
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
    "id": "prj_xyz123",
    "project_name": "신제품 개발 프로젝트",
    "project_description": "2025년 상반기 신제품 개발을 위한 프로젝트",
    "start_date": "2025-02-01",
    "end_date": "2025-06-30",
    "company_id": "cmp_abc789",
    "progress_rate": 0,
    "status_id": 1,
    "status_name": "준비중",
    "created_at": "2025-02-01T09:00:00Z",
    "allocated_members": [
      {
        "user_id": "usr_abc123",
        "user_name": "김개발",
        "role_name": "TEAM_MEMBER"
      },
      {
        "user_id": "usr_def456",
        "user_name": "이디자인",
        "role_name": "TEAM_MEMBER"
      },
      {
        "user_id": "usr_ghi789",
        "user_name": "박기획",
        "role_name": "TEAM_MEMBER"
      }
    ]
  }
}
```

#### Business Logic
1. **권한 검증**
   - JWT에서 role_id 추출
   - `role_id !== 2 (COMPANY_MANAGER)` 이면 403 Forbidden

2. **날짜 유효성 검증**
   ```sql
   -- 종료일이 시작일보다 뒤인지 확인
   IF end_date <= start_date THEN
     RETURN 400 Bad Request
   END IF
   ```

3. **프로젝트 생성**
   ```sql
   INSERT INTO projects (id, project_name, project_description, 
                         start_date, end_date, company_id, 
                         progress_rate, status_id, created_at)
   VALUES (?, ?, ?, ?, ?, ?, 0, 1, NOW())
   ```

4. **팀원 할당**
   ```sql
   -- 각 member_id에 대해 반복
   INSERT INTO allocate_projects (id, user_id, project_id, allocated_at)
   VALUES (?, ?, ?, NOW())
   ```

---

### 1.2 회사 전체 프로젝트 조회

**Endpoint:** `GET /api/v1/projects`

#### Request Headers
```http
Authorization: Bearer {access_token}
```

#### Query Parameters
```
page=1&limit=20&status_id=2
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
    "projects": [
      {
        "id": "prj_xyz123",
        "project_name": "신제품 개발 프로젝트",
        "project_description": "2025년 상반기 신제품 개발을 위한 프로젝트",
        "start_date": "2025-02-01",
        "end_date": "2025-06-30",
        "progress_rate": 35.5,
        "status_id": 2,
        "status_name": "진행중",
        "completed_tasks": 7,
        "incomplete_tasks": 13,
        "total_tasks": 20,
        "allocated_members": [
          {
            "user_id": "usr_abc123",
            "user_name": "김개발",
            "email": "kim@company.com"
          },
          {
            "user_id": "usr_def456",
            "user_name": "이디자인",
            "email": "lee@company.com"
          }
        ]
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "total_pages": 1
    }
  }
}
```

#### Business Logic
1. **회사 식별**
   ```sql
   -- JWT에서 company_id 추출
   SELECT company_id FROM users WHERE id = ?
   ```

2. **프로젝트 목록 조회**
   ```sql
   SELECT p.*, ps.status_name,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN ts.status_name = 'Completed' THEN t.id END) as completed_tasks,
          COUNT(DISTINCT CASE WHEN ts.status_name != 'Completed' THEN t.id END) as incomplete_tasks
   FROM projects p
   LEFT JOIN project_status ps ON p.status_id = ps.id
   LEFT JOIN tasks t ON p.id = t.project_id
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   WHERE p.company_id = ?
   GROUP BY p.id
   ORDER BY p.created_at DESC
   LIMIT ? OFFSET ?
   ```

3. **팀원 정보 조회**
   ```sql
   SELECT u.id, u.user_name, u.email
   FROM allocate_projects ap
   JOIN users u ON ap.user_id = u.id
   WHERE ap.project_id = ?
   ```

---

### 1.3 특정 프로젝트 상세 조회

**Endpoint:** `GET /api/v1/projects/{project_id}`

#### Request Headers
```http
Authorization: Bearer {access_token}
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
    "id": "prj_xyz123",
    "project_name": "신제품 개발 프로젝트",
    "project_description": "2025년 상반기 신제품 개발을 위한 프로젝트",
    "start_date": "2025-02-01",
    "end_date": "2025-06-30",
    "company_id": "cmp_abc789",
    "progress_rate": 35.5,
    "status_id": 2,
    "status_name": "진행중",
    "created_at": "2025-02-01T09:00:00Z",
    "updated_at": "2025-02-10T15:30:00Z",
    "statistics": {
      "total_tasks": 20,
      "completed_tasks": 7,
      "in_progress_tasks": 6,
      "todo_tasks": 5,
      "review_tasks": 2,
      "cancelled_tasks": 0
    },
    "allocated_members": [
      {
        "user_id": "usr_abc123",
        "user_name": "김개발",
        "email": "kim@company.com",
        "role_name": "TEAM_MEMBER",
        "allocated_at": "2025-02-01T09:00:00Z"
      }
    ]
  }
}
```

#### Business Logic
1. **권한 확인**
   ```sql
   -- 프로젝트가 사용자의 회사 소속인지 확인
   SELECT p.* FROM projects p
   JOIN users u ON u.company_id = p.company_id
   WHERE p.id = ? AND u.id = ?
   ```

2. **프로젝트 상세 정보 조회**
   ```sql
   SELECT p.*, ps.status_name
   FROM projects p
   LEFT JOIN project_status ps ON p.status_id = ps.id
   WHERE p.id = ?
   ```

3. **작업 통계 조회**
   ```sql
   SELECT ts.status_name, COUNT(t.id) as count
   FROM tasks t
   JOIN tasks_status ts ON t.status_id = ts.id
   WHERE t.project_id = ?
   GROUP BY ts.status_name
   ```

---

### 1.4 프로젝트 관련 작업들 조회

**Endpoint:** `GET /api/v1/projects/{project_id}/tasks`

#### Request Headers
```http
Authorization: Bearer {access_token}
```

#### Query Parameters
```
status_id=2&assignee_id=usr_abc123
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
    "project_id": "prj_xyz123",
    "tasks": [
      {
        "id": "tsk_aaa111",
        "task_name": "UI 디자인 작업",
        "task_description": "메인 화면 UI 디자인",
        "assignee_id": "usr_abc123",
        "assignee_name": "김개발",
        "status_id": 2,
        "status_name": "In Progress",
        "start_date": "2025-02-01",
        "end_date": "2025-02-15",
        "progress_rate": 60,
        "created_at": "2025-02-01T10:00:00Z",
        "updated_at": "2025-02-10T14:00:00Z"
      }
    ],
    "total": 20
  }
}
```

#### Business Logic
1. **프로젝트 접근 권한 확인**
   ```sql
   -- 사용자가 프로젝트에 할당되었거나 관리자인지 확인
   SELECT COUNT(*) FROM allocate_projects 
   WHERE project_id = ? AND user_id = ?
   
   -- 또는 회사 관리자인지 확인
   SELECT u.role_id FROM users u
   JOIN projects p ON p.company_id = u.company_id
   WHERE u.id = ? AND p.id = ? AND u.role_id = 2
   ```

2. **작업 목록 조회**
   ```sql
   SELECT t.*, ts.status_name, u.user_name as assignee_name
   FROM tasks t
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   LEFT JOIN users u ON t.assignee_id = u.id
   WHERE t.project_id = ?
   AND (? IS NULL OR t.status_id = ?)
   AND (? IS NULL OR t.assignee_id = ?)
   ORDER BY t.created_at DESC
   ```

---

### 1.5 프로젝트 정보 수정 [수정됨]

**Endpoint:** `PATCH /api/v1/projects/{project_id}`

#### Request Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body [progress_rate 추가됨]
```json
{
  "project_name": "신제품 개발 프로젝트 v2",
  "project_description": "수정된 프로젝트 설명",
  "end_date": "2025-07-31",
  "status_id": 2,
  "progress_rate": 45.5,
  "member_ids_to_add": ["usr_new123"],
  "member_ids_to_remove": ["usr_old456"]
}
```

#### Response Headers
```http
Content-Type: application/json
```

#### Response Body (200 OK) [progress_rate 추가됨]
```json
{
  "success": true,
  "data": {
    "id": "prj_xyz123",
    "project_name": "신제품 개발 프로젝트 v2",
    "project_description": "수정된 프로젝트 설명",
    "start_date": "2025-02-01",
    "end_date": "2025-07-31",
    "status_id": 2,
    "progress_rate": 45.5,
    "updated_at": "2025-02-15T10:00:00Z",
    "members_added": ["usr_new123"],
    "members_removed": ["usr_old456"]
  }
}
```

#### Business Logic [progress_rate 검증 로직 추가됨]
1. **권한 검증**
   - role_id = 2 (COMPANY_MANAGER)인지 확인

2. **날짜 유효성 검증**
   ```sql
   -- 새 종료일이 시작일보다 뒤인지 확인
   SELECT start_date FROM projects WHERE id = ?
   ```

3. **진행률 유효성 검증**
   ```sql
   -- 진행률이 0-100 범위인지 확인
   IF progress_rate < 0 OR progress_rate > 100 THEN
     RETURN 400 Bad Request
   END IF
   ```

4. **프로젝트 정보 업데이트**
   ```sql
   UPDATE projects 
   SET project_name = COALESCE(?, project_name),
       project_description = COALESCE(?, project_description),
       end_date = COALESCE(?, end_date),
       status_id = COALESCE(?, status_id),
       progress_rate = COALESCE(?, progress_rate),
       updated_at = NOW()
   WHERE id = ?
   ```

5. **팀원 추가**
   ```sql
   -- 팀원이 이미 할당되어 있는지 확인
   SELECT COUNT(*) FROM allocate_projects 
   WHERE project_id = ? AND user_id = ?
   
   -- 중복이 아닌 경우만 추가
   INSERT INTO allocate_projects (id, user_id, project_id, allocated_at)
   VALUES (?, ?, ?, NOW())
   ```

6. **팀원 제거**
   ```sql
   DELETE FROM allocate_projects 
   WHERE project_id = ? AND user_id = ?
   ```

7. **활동 로그 기록**
   ```sql
   INSERT INTO activity_logs (id, project_id, changed_by, 
                              action, details, created_at)
   VALUES (?, ?, ?, 'project_updated', 
          JSON_OBJECT('changes', ?), NOW())
   ```

---

### 1.6 프로젝트에 새 작업 생성

**Endpoint:** `POST /api/v1/projects/{project_id}/tasks`

#### Request Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
```json
{
  "task_name": "API 개발",
  "task_description": "사용자 인증 API 개발",
  "assignee_id": "usr_abc123",
  "start_date": "2025-02-15",
  "end_date": "2025-02-28"
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
    "id": "tsk_bbb222",
    "task_name": "API 개발",
    "task_description": "사용자 인증 API 개발",
    "project_id": "prj_xyz123",
    "assignee_id": "usr_abc123",
    "assignee_name": "김개발",
    "status_id": 1,
    "status_name": "Todo",
    "start_date": "2025-02-15",
    "end_date": "2025-02-28",
    "progress_rate": 0,
    "created_at": "2025-02-15T11:00:00Z"
  }
}
```

#### Business Logic
1. **프로젝트 존재 및 권한 확인**
   ```sql
   SELECT p.* FROM projects p
   WHERE p.id = ? AND p.company_id = ?
   ```

2. **담당자 검증**
   ```sql
   -- 담당자가 프로젝트에 할당된 팀원인지 확인
   SELECT COUNT(*) FROM allocate_projects
   WHERE project_id = ? AND user_id = ?
   ```

3. **날짜 유효성 검증**
   ```sql
   -- 작업 종료일이 시작일 이후인지 확인
   IF end_date < start_date THEN
     RETURN 400 Bad Request
   END IF
   ```

4. **작업 생성**
   ```sql
   INSERT INTO tasks (id, task_name, task_description, project_id, 
                     assignee_id, status_id, start_date, end_date, 
                     progress_rate, created_at)
   VALUES (?, ?, ?, ?, ?, 1, ?, ?, 0, NOW())
   ```

5. **활동 로그 기록**
   ```sql
   INSERT INTO activity_logs (id, task_id, project_id, changed_by, 
                              action, details, created_at)
   VALUES (?, ?, ?, ?, 'task_created', 
          JSON_OBJECT('task_name', ?), NOW())
   ```

---

## 2. 작업(Task) 관련 API

### 2.1 팀원에게 할당된 작업들 조회

**Endpoint:** `GET /api/v1/tasks/assigned`

#### Request Headers
```http
Authorization: Bearer {access_token}
```

#### Query Parameters
```
status_id=2&project_id=prj_xyz123
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
    "tasks": [
      {
        "id": "tsk_aaa111",
        "task_name": "UI 디자인 작업",
        "task_description": "메인 화면 UI 디자인",
        "project_id": "prj_xyz123",
        "project_name": "신제품 개발 프로젝트",
        "status_id": 2,
        "status_name": "In Progress",
        "start_date": "2025-02-01",
        "end_date": "2025-02-15",
        "progress_rate": 60,
        "days_remaining": 5,
        "created_at": "2025-02-01T10:00:00Z",
        "updated_at": "2025-02-10T14:00:00Z"
      }
    ],
    "statistics": {
      "total": 10,
      "todo": 3,
      "in_progress": 4,
      "review": 2,
      "completed": 1
    }
  }
}
```

#### Business Logic
1. **사용자 식별**
   - JWT에서 user_id 추출

2. **할당된 작업 조회**
   ```sql
   SELECT t.*, ts.status_name, p.project_name,
          DATEDIFF(t.end_date, CURDATE()) as days_remaining
   FROM tasks t
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   JOIN projects p ON t.project_id = p.id
   WHERE t.assignee_id = ?
   AND (? IS NULL OR t.status_id = ?)
   AND (? IS NULL OR t.project_id = ?)
   ORDER BY t.end_date ASC
   ```

3. **통계 조회**
   ```sql
   SELECT ts.status_name, COUNT(t.id) as count
   FROM tasks t
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   WHERE t.assignee_id = ?
   GROUP BY ts.status_name
   ```

---

### 2.2 작업 상태 변경

**Endpoint:** `PATCH /api/v1/tasks/{task_id}/status`

#### Request Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
```json
{
  "status_id": 3,
  "comment": "개발 완료, 리뷰 요청드립니다"
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
    "id": "tsk_aaa111",
    "task_name": "UI 디자인 작업",
    "previous_status": "In Progress",
    "new_status": "Review",
    "status_id": 3,
    "updated_at": "2025-02-12T16:00:00Z",
    "updated_by": "usr_abc123"
  }
}
```

#### Business Logic
1. **권한 확인**
   ```sql
   -- 작업 담당자이거나 회사 관리자인지 확인
   SELECT t.*, u.role_id 
   FROM tasks t
   JOIN users u ON u.id = ?
   WHERE t.id = ? 
   AND (t.assignee_id = ? OR u.role_id = 2)
   ```

2. **이전 상태 기록**
   ```sql
   SELECT t.status_id, ts.status_name 
   FROM tasks t
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   WHERE t.id = ?
   ```

3. **상태 업데이트**
   ```sql
   UPDATE tasks 
   SET status_id = ?, updated_at = NOW()
   WHERE id = ?
   ```

4. **Review 상태인 경우 검토 요청 생성**
   ```sql
   -- status_id = 3 (Review)인 경우
   INSERT INTO reviews (id, task_id, status_id, assignee_id, 
                       manager_id, comment, created_at)
   SELECT ?, ?, ?, ?, 
          (SELECT manager_id FROM companies c 
           JOIN projects p ON p.company_id = c.id 
           JOIN tasks t ON t.project_id = p.id 
           WHERE t.id = ?),
          ?, NOW()
   ```

5. **활동 로그 기록**
   ```sql
   INSERT INTO activity_logs (id, task_id, project_id, changed_by, 
                              action, details, created_at)
   VALUES (?, ?, 
          (SELECT project_id FROM tasks WHERE id = ?),
          ?, 'status_changed', 
          JSON_OBJECT('from', ?, 'to', ?, 'comment', ?), 
          NOW())
   ```

---

### 2.3 작업 정보 수정

**Endpoint:** `PATCH /api/v1/tasks/{task_id}`

#### Request Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### Request Body
```json
{
  "task_name": "UI/UX 디자인 작업",
  "task_description": "메인 화면 및 서브 화면 디자인",
  "end_date": "2025-02-20",
  "progress_rate": 75,
  "assignee_id": "usr_def456"
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
    "id": "tsk_aaa111",
    "task_name": "UI/UX 디자인 작업",
    "task_description": "메인 화면 및 서브 화면 디자인",
    "project_id": "prj_xyz123",
    "assignee_id": "usr_def456",
    "assignee_name": "이디자인",
    "start_date": "2025-02-01",
    "end_date": "2025-02-20",
    "progress_rate": 75,
    "status_id": 2,
    "updated_at": "2025-02-13T10:00:00Z"
  }
}
```

#### Business Logic
1. **권한 확인**
   - 회사 관리자(role_id = 2) 또는 현재 담당자인지 확인

2. **날짜 유효성 검증**
   ```sql
   -- 종료일이 시작일 이후인지 확인
   SELECT start_date FROM tasks WHERE id = ?
   
   IF new_end_date < start_date THEN
     RETURN 400 Bad Request
   END IF
   ```

3. **진행률 유효성 검증**
   ```sql
   -- 진행률이 0-100 범위인지 확인
   IF progress_rate < 0 OR progress_rate > 100 THEN
     RETURN 400 Bad Request
   END IF
   ```

4. **담당자 변경 시 검증**
   ```sql
   -- 새 담당자가 프로젝트 팀원인지 확인
   SELECT COUNT(*) FROM allocate_projects ap
   JOIN tasks t ON t.project_id = ap.project_id
   WHERE t.id = ? AND ap.user_id = ?
   ```

5. **작업 정보 업데이트**
   ```sql
   UPDATE tasks 
   SET task_name = COALESCE(?, task_name),
       task_description = COALESCE(?, task_description),
       end_date = COALESCE(?, end_date),
       progress_rate = COALESCE(?, progress_rate),
       assignee_id = COALESCE(?, assignee_id),
       updated_at = NOW()
   WHERE id = ?
   ```

6. **활동 로그 기록**
   ```sql
   INSERT INTO activity_logs (id, task_id, project_id, changed_by, 
                              action, details, created_at)
   VALUES (?, ?, 
          (SELECT project_id FROM tasks WHERE id = ?),
          ?, 'task_updated', 
          JSON_OBJECT('changes', ?), 
          NOW())
   ```

---

## 3. 팀원 관리 API

### 3.1 회사 전체 팀원 조회

**Endpoint:** `GET /api/v1/members`

#### Request Headers
```http
Authorization: Bearer {access_token}
```

#### Query Parameters
```
status_id=1&role_id=3
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
    "members": [
      {
        "id": "usr_abc123",
        "email": "kim@company.com",
        "user_name": "김개발",
        "phone_number": "010-1234-5678",
        "role_id": 3,
        "role_name": "TEAM_MEMBER",
        "status_id": 1,
        "status_name": "ACTIVE",
        "created_at": "2025-01-15T09:00:00Z",
        "projects_assigned": 3,
        "tasks_assigned": 8,
        "tasks_completed": 5
      }
    ],
    "total": 15,
    "statistics": {
      "total_members": 15,
      "active_members": 12,
      "pending_members": 3,
      "managers": 1,
      "team_members": 14
    }
  }
}
```

#### Business Logic
1. **회사 식별**
   ```sql
   -- JWT에서 company_id 추출
   SELECT company_id FROM users WHERE id = ?
   ```

2. **팀원 목록 조회**
   ```sql
   SELECT u.*, r.role_name, us.status_name,
          COUNT(DISTINCT ap.project_id) as projects_assigned,
          COUNT(DISTINCT t.id) as tasks_assigned,
          COUNT(DISTINCT CASE WHEN ts.status_name = 'Completed' 
                THEN t.id END) as tasks_completed
   FROM users u
   JOIN roles r ON u.role_id = r.id
   JOIN users_status us ON u.status_id = us.id
   LEFT JOIN allocate_projects ap ON u.id = ap.user_id
   LEFT JOIN tasks t ON u.id = t.assignee_id
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   WHERE u.company_id = ?
   AND (? IS NULL OR u.status_id = ?)
   AND (? IS NULL OR u.role_id = ?)
   GROUP BY u.id
   ORDER BY u.created_at DESC
   ```

3. **통계 조회**
   ```sql
   SELECT 
     COUNT(*) as total_members,
     COUNT(CASE WHEN status_id = 1 THEN 1 END) as active_members,
     COUNT(CASE WHEN status_id = 3 THEN 1 END) as pending_members,
     COUNT(CASE WHEN role_id = 2 THEN 1 END) as managers,
     COUNT(CASE WHEN role_id = 3 THEN 1 END) as team_members
   FROM users
   WHERE company_id = ?
   ```

---

### 3.2 특정 프로젝트 참여 팀원 조회

**Endpoint:** `GET /api/v1/projects/{project_id}/members`

#### Request Headers
```http
Authorization: Bearer {access_token}
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
    "project_id": "prj_xyz123",
    "project_name": "신제품 개발 프로젝트",
    "members": [
      {
        "id": "usr_abc123",
        "email": "kim@company.com",
        "user_name": "김개발",
        "role_name": "TEAM_MEMBER",
        "status_name": "ACTIVE",
        "allocated_at": "2025-02-01T09:00:00Z",
        "tasks_in_project": 5,
        "completed_tasks": 2,
        "current_task_status": {
          "todo": 1,
          "in_progress": 2,
          "review": 0,
          "completed": 2
        }
      }
    ],
    "total_members": 5
  }
}
```

#### Business Logic
1. **프로젝트 접근 권한 확인**
   ```sql
   SELECT p.* FROM projects p
   WHERE p.id = ? AND p.company_id = ?
   ```

2. **프로젝트 팀원 조회**
   ```sql
   SELECT u.*, r.role_name, us.status_name, ap.allocated_at,
          COUNT(DISTINCT t.id) as tasks_in_project,
          COUNT(DISTINCT CASE WHEN ts.status_name = 'Completed' 
                THEN t.id END) as completed_tasks
   FROM allocate_projects ap
   JOIN users u ON ap.user_id = u.id
   JOIN roles r ON u.role_id = r.id
   JOIN users_status us ON u.status_id = us.id
   LEFT JOIN tasks t ON t.assignee_id = u.id AND t.project_id = ap.project_id
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   WHERE ap.project_id = ?
   GROUP BY u.id, ap.allocated_at
   ORDER BY ap.allocated_at ASC
   ```

3. **각 팀원의 작업 상태 조회**
   ```sql
   SELECT ts.status_name, COUNT(t.id) as count
   FROM tasks t
   LEFT JOIN tasks_status ts ON t.status_id = ts.id
   WHERE t.project_id = ? AND t.assignee_id = ?
   GROUP BY ts.status_name
   ```

---

### 3.3 가입 요청한 팀원들 조회

**Endpoint:** `GET /api/v1/members/pending`

#### Request Headers
```http
Authorization: Bearer {access_token}
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
    "pending_members": [
      {
        "id": "usr_new789",
        "email": "newmember@company.com",
        "user_name": "신입개발",
        "phone_number": "010-9876-5432",
        "role_id": 3,
        "role_name": "TEAM_MEMBER",
        "status_id": 3,
        "status_name": "PENDING",
        "created_at": "2025-02-14T10:00:00Z",
        "days_waiting": 2
      }
    ],
    "total": 3
  }
}
```

#### Business Logic
1. **권한 확인**
   ```sql
   -- 회사 관리자(role_id = 2)인지 확인
   SELECT role_id FROM users WHERE id = ?
   ```

2. **대기 중인 팀원 조회**
   ```sql
   SELECT u.*, r.role_name, us.status_name,
          DATEDIFF(NOW(), u.created_at) as days_waiting
   FROM users u
   JOIN roles r ON u.role_id = r.id
   JOIN users_status us ON u.status_id = us.id
   WHERE u.company_id = ? 
   AND u.status_id = 3  -- PENDING
   ORDER BY u.created_at ASC
   ```

3. **초대 코드 정보 확인**
   ```sql
   -- 해당 회사의 초대 코드 확인
   SELECT invitation_code FROM companies WHERE id = ?
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

### 에러 코드 목록

| 에러 코드 | 설명 | HTTP 상태 |
|-----------|------|-----------|
| INVALID_TOKEN | 유효하지 않은 토큰 | 401 |
| TOKEN_EXPIRED | 만료된 토큰 | 401 |
| INSUFFICIENT_PERMISSION | 권한 부족 | 403 |
| RESOURCE_NOT_FOUND | 리소스를 찾을 수 없음 | 404 |
| VALIDATION_ERROR | 유효성 검사 실패 | 400 |
| DUPLICATE_ENTRY | 중복된 데이터 | 409 |
| DATE_VALIDATION_ERROR | 날짜 유효성 오류 | 400 |
| PROGRESS_RATE_ERROR | 진행률 범위 오류 (0-100) | 400 |
| MEMBER_NOT_IN_PROJECT | 프로젝트 미할당 팀원 | 400 |
| SERVER_ERROR | 서버 내부 오류 | 500 |

---

## HTTP 상태 코드

| 코드 | 설명 | 사용 케이스 |
|------|------|------------|
| 200 | OK | 성공적인 조회/수정 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 유효성 검사 실패 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 중복 또는 충돌 |
| 500 | Internal Server Error | 서버 오류 |

---

## 공통 인증 헤더

모든 API 요청에는 JWT Access Token이 필요합니다:

```http
Authorization: Bearer {access_token}
```

### JWT 토큰 구조
```json
{
  "jti": "unique_token_id",
  "user_id": "usr_abc123",
  "company_id": "cmp_abc789",
  "role_id": 3,
  "exp": 1738339200,
  "iat": 1738332000
}
```

---

## 페이지네이션

목록 조회 API는 다음 쿼리 파라미터를 지원합니다:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20, 최대: 100)

### 페이지네이션 응답 형식
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

---

## 데이터 유효성 검증 규칙

### 날짜 검증
- 프로젝트: `end_date > start_date`
- 작업: `end_date >= start_date`
- 작업 날짜는 프로젝트 기간 내에 있어야 함

### 진행률 검증
- 범위: 0 ≤ progress_rate ≤ 100
- 소수점 첫째 자리까지 허용

### 권한 검증
- SYSTEM_ADMIN (role_id = 1): 시스템 전체 관리
- COMPANY_MANAGER (role_id = 2): 회사 내 모든 프로젝트/작업 관리
- TEAM_MEMBER (role_id = 3): 할당된 프로젝트/작업만 접근

---

## 버전 정보
- **문서 버전**: 2.0.0
- **API 버전**: v1
- **최종 수정일**: 2025-02-01
- **변경 사항**: 
  - 프로젝트 수정 API에 progress_rate 필드 추가
  - DB 스키마와의 정합성 개선
  - 에러 코드 체계 정비
  - 유효성 검증 로직 강화

이 문서는 프로젝트 관리 시스템의 핵심 API에 대한 상세한 기술 명세를 포함하고 있으며, 실제 구현 시 참고할 수 있는 완전한 가이드입니다.