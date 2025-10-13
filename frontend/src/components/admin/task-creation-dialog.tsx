import type React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Calendar } from '@components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useCreateTask } from '@/services/projects/projectsMutations';
import { useToast } from '@components/ui/use-toast';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TaskCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  teamMembers: TeamMember[];
  currentUser: {
    id: string;
    role: string;
  };
}

export function TaskCreationDialog({
  isOpen,
  onClose,
  projectId,
  teamMembers,
  currentUser,
}: TaskCreationDialogProps) {
  const { toast } = useToast();
  const createTaskMutation = useCreateTask();

  // 현재 사용자가 일반 팀 멤버인지 확인
  const isTeamMember = currentUser.role === 'TEAM_MEMBER';

  // 백엔드 API 요구사항에 맞춘 formData 구조
  const [formData, setFormData] = useState<{
    task_name: string;
    task_description: string;
    assignee_id: string | undefined;
    start_date: Date | undefined;
    end_date: Date | undefined;
  }>({
    task_name: '',
    task_description: '',
    assignee_id: isTeamMember ? currentUser.id : undefined, // 팀 멤버는 자신을 기본 담당자로 설정
    start_date: undefined,
    end_date: undefined,
  });

  // Popover 상태 관리
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (
      !formData.task_name ||
      !formData.assignee_id ||
      !formData.start_date ||
      !formData.end_date
    ) {
      toast({
        title: '입력 오류',
        description: '작업 제목, 담당자, 시작일, 마감일은 필수입니다.',
        variant: 'destructive',
      });
      return;
    }

    // 날짜 검증 (시작일이 마감일보다 늦으면 안 됨)
    if (formData.start_date > formData.end_date) {
      toast({
        title: '날짜 오류',
        description: '시작일은 마감일보다 늦을 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        projectId,
        data: {
          task_name: formData.task_name,
          task_description: formData.task_description || undefined,
          assignee_id: formData.assignee_id,
          start_date: formData.start_date.toISOString(),
          end_date: formData.end_date.toISOString(),
        },
      });

      toast({
        title: '작업 생성 완료',
        description: `${formData.task_name} 작업이 생성되었습니다.`,
      });

      onClose();

      // 폼 초기화
      setFormData({
        task_name: '',
        task_description: '',
        assignee_id: isTeamMember ? currentUser.id : undefined,
        start_date: undefined,
        end_date: undefined,
      });
    } catch (error) {
      toast({
        title: '작업 생성 실패',
        description: error instanceof Error ? error.message : '다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 작업 생성</DialogTitle>
          <DialogDescription>프로젝트에 새로운 작업을 추가합니다</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 작업 제목 (필수) */}
          <div className="space-y-2">
            <Label htmlFor="task_name">
              작업 제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task_name"
              placeholder="작업 제목을 입력하세요 (최대 200자)"
              value={formData.task_name}
              onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
              maxLength={200}
              required
            />
          </div>

          {/* 작업 설명 (선택) */}
          <div className="space-y-2">
            <Label htmlFor="task_description">작업 설명</Label>
            <Textarea
              id="task_description"
              placeholder="작업에 대한 상세한 설명을 입력하세요 (최대 2000자)"
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
              maxLength={2000}
              rows={3}
            />
          </div>

          {/* 담당자 (필수) */}
          <div className="space-y-2">
            <Label>
              담당자 <span className="text-destructive">*</span>
            </Label>
            {isTeamMember && (
              <p className="text-sm text-muted-foreground">
                팀 멤버는 본인이 담당자로 자동 지정됩니다
              </p>
            )}
            {!isTeamMember && (
              <Select
                value={formData.assignee_id ?? ''}
                onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="담당자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 시작일 & 마감일 (둘 다 필수) */}
          <div className="grid grid-cols-2 gap-4">
            {/* 시작일 */}
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

            {/* 마감일 */}
            <div className="space-y-2">
              <Label>
                마감일 <span className="text-destructive">*</span>
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
                      : '마감일 선택'}
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

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={createTaskMutation.isPending}>
              {createTaskMutation.isPending ? '생성 중...' : '작업 생성'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent"
              disabled={createTaskMutation.isPending}
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
