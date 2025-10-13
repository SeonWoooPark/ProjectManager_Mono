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
import { Calendar } from '@components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@components/ui/use-toast';
import { projectsService } from '@/services/projects/projectsService';
import { projectsQueryKeys } from '@/services/projects/projectsQueries';
import { useCompanyMembers } from '@/services/members/membersQueries';
import type { ProjectDetail } from '@/types/projects.types';
import type { ProjectMemberStatus } from '@/types/members.types'; // ← 추가
import { Slider } from '@components/ui/slider';
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
  { value: 2, label: '진행 중', color: 'text-gray-500' },
  { value: 3, label: '완료', color: 'text-gray-500' },
  { value: 4, label: '보류', color: 'text-gray-500' },
  { value: 5, label: '취소', color: 'text-gray-500' },
];

export function ProjectSettingsForm({ project, currentMembers }: ProjectSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    project_name: project.project_name,
    project_description: project.project_description || '',
    start_date: project.start_date ? new Date(project.start_date) : undefined,
    end_date: project.end_date ? new Date(project.end_date) : undefined,
    status_id: project.status_id || 1,
    progress_rate: project.progress_rate || 0,
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

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
      const member_ids_to_remove = currentMemberIds.filter((id) => !selectedMemberIds.includes(id));

      return projectsService.updateProject(project.id, {
        project_name: formData.project_name,
        project_description: formData.project_description,
        end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : '',
        status_id: formData.status_id,
        progress_rate: formData.progress_rate,
        member_ids_to_add,
        member_ids_to_remove,
      });
    },
    onSuccess: (updatedProject) => {
      // 1. 서버 응답으로 프로젝트 상세 캐시 즉시 업데이트
      queryClient.setQueryData(projectsQueryKeys.detail(project.id), updatedProject);

      // 2. 멤버 정보는 별도 엔드포인트이므로 refetch 트리거
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.members(project.id),
      });

      // 3. 프로젝트 목록 캐시도 갱신 (목록 페이지 동기화)
      queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.all,
      });

      toast({ title: '프로젝트가 성공적으로 수정되었습니다.' });
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
              <Label>시작일 (수정 불가)</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled
                    className={cn(
                      'w-full justify-start text-left font-normal bg-transparent',
                      !formData.start_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date
                      ? format(formData.start_date, 'PPP', { locale: ko })
                      : '시작일 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => {
                      setFormData({ ...formData, start_date: date });
                      setStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>
                종료일 <span className="text-destructive">*</span>
              </Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-transparent',
                      !formData.end_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date
                      ? format(formData.end_date, 'PPP', { locale: ko })
                      : '종료일 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => {
                      setFormData({ ...formData, end_date: date });
                      setEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

          {/* TODO(human): 프로젝트 진행률 입력 필드 추가
              - Number Input 또는 Slider 중 선택
              - 0-100 범위 제한
              - 현재 값 표시
          */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="progress_rate">프로젝트 진행률</Label>
              <span className="text-sm font-medium">{formData.progress_rate}%</span>
            </div>
            <Slider
              id="progress_rate"
              min={0}
              max={100}
              step={1}
              value={[formData.progress_rate]}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  progress_rate: value[0],
                })
              }
              className="w-full"
            />
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
