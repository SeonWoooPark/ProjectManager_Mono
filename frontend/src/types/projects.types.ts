export interface ProjectMemberSummary {
  user_id: string;
  user_name: string;
  email: string;
}

export interface ProjectSummary {
  id: string;
  project_name: string;
  project_description: string | null;
  start_date: string;
  end_date: string;
  progress_rate: number;
  status_id: number | null;
  status_name: string | null;
  completed_tasks: number;
  incomplete_tasks: number;
  total_tasks: number;
  allocated_members: ProjectMemberSummary[];
}

export interface ProjectListResponse {
  projects: ProjectSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ProjectStatistics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  review_tasks: number;
  cancelled_tasks: number;
}

export interface ProjectMemberDetail extends ProjectMemberSummary {
  role_name: string | null;
  allocated_at: string;
}

export interface ProjectDetail extends ProjectSummary {
  company_id: string;
  created_at: string;
  updated_at: string;
  statistics: ProjectStatistics;
  allocated_members: ProjectMemberDetail[];
}

export interface ProjectDetailResponse {
  project: ProjectDetail;
}

export interface ProjectTasksFilters {
  status_id?: number;
  assignee_id?: string;
}

export interface ProjectTaskSummary {
  id: string;
  project_id: string;
  task_name: string;
  task_description: string | null;
  assignee_id: string | null;
  assignee_name: string | null;
  status_id: number | null;
  status_name: string | null;
  start_date: string | null;
  end_date: string | null;
  progress_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTasksResponse {
  project_id: string;
  tasks: ProjectTaskSummary[];
  total: number;
}

export interface ProjectMemberStats extends ProjectMemberDetail {
  status_name: string | null;
  tasks_in_project: number;
  completed_tasks: number;
  current_task_status: {
    todo: number;
    in_progress: number;
    review: number;
    completed: number;
  };
}

export interface ProjectMembersResponse {
  project_id: string;
  project_name: string | null;
  members: ProjectMemberStats[];
  total_members: number;
}
