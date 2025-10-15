import api from '@/services/api';
import type { AssignedTasksResponse } from '@/types/tasks.types';
import type { SuccessResponse } from '@/types/auth.types';

export const tasksService = {
  async listAssigned(params?: { status_id?: number; project_id?: string }) {
    const response = await api.get<SuccessResponse<AssignedTasksResponse>>(
      '/tasks/assigned',
      { params }
    );
    return response.data.data;
  },
  async updateStatus(taskId: string, statusId: number, comment?: string) {
    const response = await api.patch<SuccessResponse<{
      id: string;
      task_name: string;
      previous_status: string | null;
      new_status: string | null;
      status_id: number | null;
      updated_at: string;
      updated_by: string;
    }>>(`/tasks/${taskId}/status`, { status_id: statusId, comment });
    return response.data.data;
  },

};
