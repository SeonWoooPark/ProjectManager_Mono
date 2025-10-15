import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { TaskSummary } from '@/types/tasks.types';
import type { UpdateTaskDto } from '@/types/tasks.types';

// TaskSummary와 호환 가능한 최소 필드 타입
type TaskEditData = Pick<TaskSummary, 'id' | 'task_name' | 'task_description' | 'start_date' | 'end_date' | 'progress_rate'>;

interface TaskEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskEditData;
  onSubmit: (taskId: string, data: UpdateTaskDto) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function TaskEditDialog({
  isOpen,
  onClose,
  task,
  onSubmit,
  isLoading,
  readOnly = false
}: TaskEditDialogProps) {
  const [formData, setFormData] = useState({
    task_name: task.task_name,
    task_description: task.task_description || '',
    start_date: task.start_date ? new Date(task.start_date) : undefined,
    end_date: task.end_date ? new Date(task.end_date) : undefined,
    progress_rate: task.progress_rate,
  });

  const [endDateOpen, setEndDateOpen] = useState(false);

  // task가 변경되면 폼 데이터 리셋
  useEffect(() => {
    setFormData({
      task_name: task.task_name,
      task_description: task.task_description || '',
      start_date: task.start_date ? new Date(task.start_date) : undefined,
      end_date: task.end_date ? new Date(task.end_date) : undefined,
      progress_rate: task.progress_rate,
    });
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 변경된 필드만 전송
    const changes: UpdateTaskDto = {};
    if (formData.task_name !== task.task_name) {
      changes.task_name = formData.task_name;
    }
    if (formData.task_description !== (task.task_description || '')) {
      changes.task_description = formData.task_description;
    }

    // Date 객체를 ISO string으로 변환하여 비교 및 전송
    const newEndDate = formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : '';
    const oldEndDate = task.end_date || '';
    if (newEndDate !== oldEndDate) {
      changes.end_date = newEndDate;
    }

    if (formData.progress_rate !== task.progress_rate) {
      changes.progress_rate = formData.progress_rate;
    }

    // 변경된 필드가 없으면 알림
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    onSubmit(task.id, changes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{readOnly ? '작업 상세 정보' : '작업 수정'}</DialogTitle>
          <DialogDescription>
            {readOnly ? '프로젝트에 배정된 작업의 상세 정보입니다' : '프로젝트에 배정된 작업을 수정합니다'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 작업명 */}
          <div className="space-y-2">
            <Label htmlFor="task_name">
              작업 제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task_name"
              value={formData.task_name}
              onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
              required
              disabled={readOnly}
            />
          </div>

          {/* 작업 설명 */}
          <div className="space-y-2">
            <Label htmlFor="task_description">작업 설명</Label>
            <Textarea
              id="task_description"
              value={formData.task_description}
              onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
              rows={3}
              placeholder="작업에 대한 상세 설명을 입력하세요"
              disabled={readOnly}
            />
          </div>

          {/* 시작일 & 마감일 */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              {/* 시작일 (읽기 전용) */}
              <div className="space-y-2">
                <Label>시작일</Label>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-transparent',
                    !formData.start_date && 'text-muted-foreground'
                  )}
                  disabled
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date
                    ? format(formData.start_date, 'PPP', { locale: ko })
                    : '시작일 없음'}
                </Button>
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
                      disabled={readOnly}
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
            <p className="text-sm text-muted-foreground mt-1">
              시작일은 수정할 수 없습니다.
            </p>
          </div>

          {/* 진행률 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="progress_rate">진행률</Label>
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
              disabled={readOnly}
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            {readOnly ? (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                닫기
              </Button>
            ) : (
              <>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? '수정 중...' : '수정'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-transparent"
                  disabled={isLoading}
                >
                  취소
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
