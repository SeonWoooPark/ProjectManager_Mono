import { useState, useMemo, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { useToast } from '@components/ui/use-toast';
import { projectsService } from '@/services/projects/projectsService';
import { projectsQueryKeys } from '@/services/projects/projectsQueries';
import { useCompanyMembers } from '@/services/members/membersQueries';
import type { ProjectDetail } from '@/types/projects.types';
import type { ProjectMemberStatus } from '@/types/members.types'; // ← 추가

// interface ProjectMember {
//   user_id: string;
//   user_name: string;
//   email: string;
//   role_name: string;
// }

interface ProjectSettingsFormProps {
  project: ProjectDetail;
  currentMembers: ProjectMemberStatus[];
}

const PROJECT_STATUS_OPTIONS = [
  { value: 1, label: '시작 전', color: 'text-gray-500' },
  { value: 2, label: '진행 중', color: 'text-blue-500' },
  { value: 3, label: '완료', color: 'text-green-500' },
  { value: 4, label: '보류', color: 'text-yellow-500' },
  { value: 5, label: '취소', color: 'text-red-500' },
];

export function ProjectSettingsForm({ project, currentMembers }: ProjectSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    project_name: project.project_name,
    project_description: project.project_description || '',
    end_date: project.end_date,
    status_id: project.status_id || 1,
  });

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    currentMembers.map((m) => m.id)
  );

  // 회사의 모든 팀원 조회 (TEAM_MEMBER만)
  const { data: membersData } = useCompanyMembers({ status_id: 1, role_id: 3 });
  const availableMembers = useMemo(() => membersData?.members ?? [], [membersData?.members]);

  const mutation = useMutation({
    mutationFn: () => {
      const currentMemberIds = currentMembers.map((m) => m.id);
      const member_ids_to_add = selectedMemberIds.filter((id) => !currentMemberIds.includes(id));
      const member_ids_to_remove = currentMemberIds.filter(
        (id) => !selectedMemberIds.includes(id)
      );

      return projectsService.updateProject(project.id, {
        project_name: formData.project_name,
        project_description: formData.project_description,
        end_date: formData.end_date,
        status_id: formData.status_id,
        member_ids_to_add,
        member_ids_to_remove,
      });
    },
    onSuccess: () => {
      toast({ title: '프로젝트가 성공적으로 수정되었습니다.' });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(project.id) });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.members(project.id) });
    },
    onError: () => {
      toast({ title: '프로젝트 수정에 실패했습니다.', variant: 'destructive' });
    },
  });

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 정보</CardTitle>
          <CardDescription>프로젝트의 기본 정보를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_name">프로젝트 이름</Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_description">프로젝트 설명</Label>
            <Textarea
              id="project_description"
              value={formData.project_description}
              onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">시작일 (수정 불가)</Label>
              <Input id="start_date" type="date" value={project.start_date} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">종료일</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_id">프로젝트 상태</Label>
            <Select
              value={String(formData.status_id)}
              onValueChange={(value) => setFormData({ ...formData, status_id: Number(value) })}
            >
              <SelectTrigger id="status_id">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={String(status.value)}>
                    <span className={status.color}>{status.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>팀원 관리</CardTitle>
          <CardDescription>프로젝트에 참여하는 팀원을 추가하거나 제거합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
            {availableMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <Checkbox
                  id={member.id}
                  checked={selectedMemberIds.includes(member.id)}
                  onCheckedChange={() => handleMemberToggle(member.id)}
                />
                <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{member.user_name}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </Label>
              </div>
            ))}
            {availableMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                등록된 팀원이 없습니다.
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            선택된 팀원: {selectedMemberIds.length - 1}명
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>
    </form>
  );
}
