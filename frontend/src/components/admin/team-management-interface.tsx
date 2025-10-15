import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import { Search, MoreHorizontal, UserPlus, Settings } from 'lucide-react';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useCompanyMembers, usePendingMembers } from '@/services/members/membersQueries';
import { useApproveMember } from '@/services/auth/authMutations';
import type { MemberSummary } from '@/types/members.types';

const AVAILABLE_PERMISSIONS = [
  '프로젝트 생성',
  '프로젝트 수정',
  '프로젝트 삭제',
  '작업 생성',
  '작업 수정',
  '작업 삭제',
  '팀원 초대',
  '팀원 관리',
  '역할 관리',
  '회사 설정',
];

const ROLE_LABELS: Record<string, string> = {
  SYSTEM_ADMIN: '시스템 관리자',
  COMPANY_MANAGER: '회사 관리자',
  TEAM_MEMBER: '팀원',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  PENDING: '승인 대기',
};

export function TeamManagementInterface() {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
  } = useCompanyMembers();

  const {
    data: pendingMembersData,
    isLoading: pendingLoading,
    isError: pendingError,
  } = usePendingMembers();

  const approveMemberMutation = useApproveMember();

  const teamMembers: MemberSummary[] = membersData?.members ?? [];

  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    teamMembers.forEach((member) => roles.add(member.role_name));
    return Array.from(roles);
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        member.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role_name === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status_name === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, roleFilter, statusFilter]);

  const joinRequests = useMemo(() => {
    const pendingMembers = pendingMembersData?.pending_members ?? [];
    return pendingMembers.map((member) => ({
      id: member.id,
      name: member.user_name,
      email: member.email,
      requestedRole: ROLE_LABELS[member.role_name] ?? member.role_name,
      inviteCode: '-',
      requestDate: member.created_at ? member.created_at.slice(0, 10) : '알 수 없음',
      invitedBy: '관리자',
    }));
  }, [pendingMembersData?.pending_members]);

  const handleMemberManagement = (member: MemberSummary) => {
    console.log('Member management:', member);
    // TODO: 멤버 관리 기능 구현 필요
  };

  const handleApproveRequest = (requestId: string) => {
    approveMemberMutation.mutate({
      user_id: requestId,
      action: 'approve',
    });
  };

  const handleRejectRequest = (requestId: string) => {
    approveMemberMutation.mutate({
      user_id: requestId,
      action: 'reject',
    });
  };

  const handleCreateRole = () => {
    console.log('Creating new role:', newRole);
    setIsRoleDialogOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const togglePermission = (permission: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (membersLoading || pendingLoading) {
    return <LoadingSpinner />;
  }

  if (membersError || pendingError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">팀원 정보를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">팀원 관리</h1>
          <p className="text-muted-foreground">팀원의 역할, 권한, 상태를 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                신규 역할 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>새 역할 생성</DialogTitle>
                <DialogDescription>새로운 팀원 역할을 생성하고 권한을 설정하세요.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="roleName">역할 이름</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="예: 시니어 개발자, 프로젝트 매니저"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="roleDescription">역할 설명</Label>
                  <Textarea
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="이 역할의 책임과 업무를 설명해주세요"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>권한 설정</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newRole.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={permission} className="text-sm font-normal">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">선택된 권한: {newRole.permissions.length}개</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateRole}>
                  역할 생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            팀원 초대
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>팀원 개요</CardTitle>
          <CardDescription>현재 등록된 팀원의 역할과 상태를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">총 팀원 수</div>
              <div className="text-2xl font-bold text-foreground">{teamMembers.length}명</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">활성 팀원</div>
              <div className="text-2xl font-bold text-foreground">
                {teamMembers.filter((member) => member.status_name === 'ACTIVE').length}명
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">승인 대기</div>
              <div className="text-2xl font-bold text-foreground">{joinRequests.length}명</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">평균 프로젝트 참여</div>
              <div className="text-2xl font-bold text-foreground">
                {teamMembers.length > 0
                  ? (teamMembers.reduce((sum, member) => sum + member.projects_assigned, 0) / teamMembers.length).toFixed(1)
                  : '0.0'}개
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>팀원 목록</CardTitle>
              <CardDescription>필터와 검색을 이용해 팀원을 관리하세요</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름 또는 이메일 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="역할" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role] ?? role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="INACTIVE">비활성</SelectItem>
                <SelectItem value="PENDING">승인 대기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead className="text-center">참여 프로젝트</TableHead>
                  <TableHead className="text-center">완료 작업</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9 border">
                          <AvatarFallback>{member.user_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{member.user_name}</p>
                          <p className="text-xs text-muted-foreground">가입: {member.created_at.slice(0, 10)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ROLE_LABELS[member.role_name] ?? member.role_name}</Badge>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell className="text-center">{member.projects_assigned}</TableCell>
                    <TableCell className="text-center">{member.tasks_completed}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={member.status_name === 'ACTIVE' ? 'default' : 'outline'}
                        className={member.status_name === 'ACTIVE' ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {STATUS_LABELS[member.status_name] ?? member.status_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMemberManagement(member)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">조건에 맞는 팀원이 없습니다.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {joinRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>가입 요청</CardTitle>
            <CardDescription>팀원 가입 요청을 검토하고 승인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">{request.name}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-xs text-muted-foreground">요청일: {request.requestDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                      승인
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                      거부
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
