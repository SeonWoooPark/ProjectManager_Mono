export interface TaskSummary {
  id: string;
  task_name: string;
  task_description: string | null;
  project_id: string;
  project_name: string;
  assignee_id: string | null;
  status_id: number | null;
  status_name: string | null;
  start_date: string | null;
  end_date: string | null;
  progress_rate: number;
  days_remaining: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskStatistics {
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  completed: number;
}

export interface AssignedTasksResponse {
  tasks: TaskSummary[];
  total: number;
  statistics: TaskStatistics;
}

// 작업 생성 요청 DTO
export interface CreateTaskDto {
  task_name: string;
  task_description?: string;
  assignee_id: string;
  start_date: string;  // ISO 8601 형식
  end_date: string;    // ISO 8601 형식
}

// 작업 상세 응답 DTO
export interface TaskDto {
  id: string;
  task_name: string;
  task_description: string | null;
  project_id: string;
  assignee_id: string;
  status_id: number;
  start_date: string;
  end_date: string;
  progress_rate: number;
  created_at: string;
  updated_at: string;
}

// 작업 수정 요청 DTO
export interface UpdateTaskDto {
  task_name?: string;
  task_description?: string;
  end_date?: string;           // ISO 8601 (start_date 수정 불가)
  progress_rate?: number;      // 0-100
  assignee_id?: string;
}

// 작업 수정 응답 DTO
export interface UpdatedTaskDto {
  id: string;
  task_name: string;
  task_description: string | null;
  project_id: string;
  assignee_id: string | null;
  assignee_name: string | null;
  start_date: string | null;
  end_date: string | null;
  progress_rate: number;
  status_id: number | null;
  updated_at: string;
}
