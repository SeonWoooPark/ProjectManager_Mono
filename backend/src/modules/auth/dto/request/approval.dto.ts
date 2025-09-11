export interface CompanyApprovalRequestDto {
  company_id: string;
  action: 'approve' | 'reject';
  comment?: string;
  generate_invitation_code?: boolean;
}

export interface MemberApprovalRequestDto {
  user_id: string;
  action: 'approve' | 'reject';
  comment?: string;
}