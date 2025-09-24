import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectHeaderProps {
  name: string;
  description: string;
  status: string;
  onCreateTask?: () => void;
  returnPath?: string;
  returnLabel?: string;
}

export function ProjectHeader({
  name,
  description,
  status,
  onCreateTask,
  returnPath = '/dashboard/member/projects',
  returnLabel = '프로젝트 목록으로 돌아가기',
}: ProjectHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        onClick={() => navigate(returnPath)}
        className="p-0 h-auto hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {returnLabel}
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{name}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={status === '진행 중' ? 'default' : 'secondary'}>{status}</Badge>
          </div>
        </div>
        <div className="flex flex-row items-end gap-3">
          {onCreateTask && (
            <Button onClick={onCreateTask} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />새 작업 만들기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
