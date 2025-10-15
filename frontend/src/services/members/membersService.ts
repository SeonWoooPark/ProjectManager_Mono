import api from '@/services/api';
import type {
  MembersListResponse,
  ProjectMembersPayload,
  PendingMembersResponse,
  UpdateMemberStatusDto,
  UpdateMemberProfileDto,
  MemberDto,
} from '@/types/members.types';
import type { SuccessResponse } from '@/types/auth.types';

export const membersService = {
  async listCompanyMembers(params?: { status_id?: number; role_id?: number }) {
    const response = await api.get<SuccessResponse<MembersListResponse>>('/members', {
      params,
    });
    return response.data.data;
  },

  async getProjectMembers(projectId: string) {
    const response = await api.get<SuccessResponse<ProjectMembersPayload>>(
      `/members/projects/${projectId}`
    );
    return response.data.data;
  },

  async listPendingMembers() {
    const response = await api.get<SuccessResponse<PendingMembersResponse>>('/members/pending');
    return response.data.data;
  },

  async updateMemberStatus({ userId, status_id }: UpdateMemberStatusDto) {
    const response = await api.patch<SuccessResponse<MemberDto>>(`/members/${userId}/status`, {
      status_id,
    });
    return response.data.data;
  },

  async updateMemberProfile({ userId, ...profileData }: UpdateMemberProfileDto) {
    const response = await api.patch<SuccessResponse<MemberDto>>(`/members/${userId}/profile`, {
      ...profileData,
    });
    return response.data.data;
  },
};
