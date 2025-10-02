import type { FormEvent } from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useCompanyMembers } from '@/services/members/membersQueries';
import { projectsService } from '@/services/projects/projectsService';
import { projectsQueryKeys } from '@/services/projects/projectsQueries';
import { useToast } from '@components/ui/use-toast';
import { useAuthStore } from '@store/authStore';

interface FormState {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  selectedMembers: string[];
}

export function CreateProjectForm() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedMembers: [],
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
  } = useCompanyMembers({ status_id: 1, role_id: 3 }); // ACTIVE한 Team Member만

  const availableMembers = useMemo(() => membersData?.members ?? [], [membersData?.members]);
  const currentUser  = useAuthStore((state) => state.user); // 현재 사용자 정보

  const mutation = useMutation({
    mutationFn: () => {
      const memberIds = [...formData.selectedMembers];

      // ✅ 회사 관리자 추가 (중복 방지)
      if (currentUser?.role_id === 2 && !memberIds.includes(currentUser.id)) {
        memberIds.unshift(currentUser.id);
      }
      return projectsService.createProject({
        project_name: formData.name,
        project_description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        member_ids: memberIds,
      });
    },
    onSuccess: () => {
      toast({ title: '프로젝트가 성공적으로 생성되었습니다.' });
      queryClient.invalidateQueries({ queryKey: projectsQueryKeys.list(undefined) });
      navigate('/admin/company/projects');
    },
    onError: () => {
      toast({ title: '프로젝트 생성에 실패했습니다.', variant: 'destructive' });
    },
  });

  const handleMemberToggle = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter((id) => id !== memberId)
        : [...prev.selectedMembers, memberId],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  if (membersLoading) {
    return <LoadingSpinner />;
  }

  if (membersError) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        팀원 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">프로젝트 이름</Label>
        <Input
          id="name"
          placeholder="프로젝트 이름을 입력하세요"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">프로젝트 설명</Label>
        <Textarea
          id="description"
          placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>팀원 선택</Label>
        <div className="border rounded-lg p-4 space-y-3 max-h-48 overflow-y-auto">
          {availableMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              등록된 팀원이 없습니다. 먼저 팀원을 초대하세요.
            </p>
          ) : (
            availableMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <Checkbox
                  id={member.id}
                  checked={formData.selectedMembers.includes(member.id)}
                  onCheckedChange={() => handleMemberToggle(member.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={member.id} className="text-sm font-medium cursor-pointer">
                    {member.user_name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {member.role_name} • {member.email}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          선택된 팀원: {formData.selectedMembers.length}명
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="startDate">시작일</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">종료일</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending} className="flex-1">
          {mutation.isPending ? '생성 중...' : '프로젝트 생성'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="bg-transparent"
        >
          취소
        </Button>
      </div>
    </form>
  );
}
