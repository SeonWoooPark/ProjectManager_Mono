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
