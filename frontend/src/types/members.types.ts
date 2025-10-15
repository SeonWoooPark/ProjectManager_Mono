export interface MemberSummary {
  id: string;
  email: string;
  user_name: string;
  phone_number: string | null;
  role_id: number;
  role_name: string;
  status_id: number;
  status_name: string;
  created_at: string;
  projects_assigned: number;
  tasks_assigned: number;
  tasks_completed: number;
}

export interface MemberStatistics {
  total_members: number;
  active_members: number;
  pending_members: number;
  managers: number;
  team_members: number;
}

export interface MembersListResponse {
  members: MemberSummary[];
  total: number;
  statistics: MemberStatistics;
}

export interface ProjectMemberStatus {
  id: string;
  email: string;
  user_name: string;
  role_name: string;
  status_name: string;
  allocated_at: string;
  tasks_in_project: number;
  completed_tasks: number;
  current_task_status: {
    todo: number;
    in_progress: number;
    review: number;
    completed: number;
  };
}

export interface ProjectMembersPayload {
  project_id: string;
  project_name: string | null;
  members: ProjectMemberStatus[];
  total_members: number;
}

export interface PendingMember {
  id: string;
  email: string;
  user_name: string;
  phone_number: string | null;
  role_id: number;
  role_name: string;
  status_id: number;
  status_name: string;
  created_at: string;
  days_waiting: number;
}

export interface PendingMembersResponse {
  pending_members: PendingMember[];
  total: number;
}

// ===== Mutations DTOs =====

export interface UpdateMemberStatusDto {
  userId: string;
  status_id: 1 | 2; // 1: ACTIVE, 2: INACTIVE
}

export interface UpdateMemberProfileDto {
  userId: string;
  user_name?: string;
  phone_number?: string;
  email?: string;
}

export interface MemberDto {
  user_id: number;
  email: string;
  user_name: string;
  phone_number: string | null;
  role_id: number;
  status_id: number;
  company_id: number;
  created_at: string;
  updated_at: string;
}
