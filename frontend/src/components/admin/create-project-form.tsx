import type { FormEvent } from 'react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { Checkbox } from '@components/ui/checkbox';
import { Calendar } from '@components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useCompanyMembers } from '@/services/members/membersQueries';
import { useCreateProject } from '@/services/projects/projectsMutations';
import { useToast } from '@components/ui/use-toast';
import { useAuthStore } from '@store/authStore';

interface FormState {
  name: string;
  description: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  selectedMembers: string[];
}

export function CreateProjectForm() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    startDate: undefined,
    endDate: undefined,
    selectedMembers: [],
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
  } = useCompanyMembers({ status_id: 1, role_id: 3 }); // ACTIVE한 Team Member만

  const availableMembers = useMemo(() => membersData?.members ?? [], [membersData?.members]);
  const currentUser = useAuthStore((state) => state.user); // 현재 사용자 정보

  const mutation = useCreateProject();

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

    const memberIds = [...formData.selectedMembers];

    // 회사 관리자 추가 (중복 방지)
    if (currentUser?.role_id === 2 && !memberIds.includes(currentUser.id)) {
      memberIds.unshift(currentUser.id);
    }

    mutation.mutate(
      {
        project_name: formData.name,
        project_description: formData.description,
        start_date: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : '',
        end_date: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : '',
        member_ids: memberIds,
      },
      {
        onSuccess: () => {
          toast({ title: '프로젝트가 성공적으로 생성되었습니다.' });
          navigate('/admin/company/projects');
        },
        onError: () => {
          toast({ title: '프로젝트 생성에 실패했습니다.', variant: 'destructive' });
        },
      }
    );
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
        <div className="space-y-2">
          <Label>
            시작일 <span className="text-destructive">*</span>
          </Label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal bg-transparent',
                  !formData.startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, 'PPP', { locale: ko }) : '시작일 선택'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => {
                  setFormData({ ...formData, startDate: date });
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
                  !formData.endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.endDate ? format(formData.endDate, 'PPP', { locale: ko }) : '종료일 선택'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => {
                  setFormData({ ...formData, endDate: date });
                  setEndDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
