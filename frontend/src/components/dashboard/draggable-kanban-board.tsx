import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { TaskStatusKey } from '@/utils/status';

interface Task {
  id: string;
  title: string;
  assignee: string;
  isMyTask: boolean;
}

interface TaskColumn {
  todo: Task[];
  inProgress: Task[];
  review: Task[];
  completed: Task[];
  cancelled: Task[];
}

interface DraggableKanbanBoardProps {
  tasks: TaskColumn;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatusKey) => Promise<void>;
  onTaskClick?: (taskId: string) => void;
}

const columnConfig = [
  { key: 'todo' as keyof TaskColumn, title: '할 일', color: 'bg-gray-100 text-gray-800', statusKey: 'todo' as TaskStatusKey },
  { key: 'inProgress' as keyof TaskColumn, title: '진행 중', color: 'bg-blue-100 text-blue-800', statusKey: 'inProgress' as TaskStatusKey },
  { key: 'review' as keyof TaskColumn, title: '검토', color: 'bg-yellow-100 text-yellow-800', statusKey: 'review' as TaskStatusKey },
  { key: 'completed' as keyof TaskColumn, title: '완료', color: 'bg-green-100 text-green-800', statusKey: 'completed' as TaskStatusKey },
  { key: 'cancelled' as keyof TaskColumn, title: '취소', color: 'bg-red-100 text-red-800', statusKey: 'cancelled' as TaskStatusKey },
];

interface DraggableTaskCardProps {
  task: Task;
  onTaskClick?: (taskId: string) => void;
}

function DraggableTaskCard({ task, onTaskClick }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    // 드래그 중이 아닐 때만 클릭 이벤트 처리
    if (!isDragging && onTaskClick) {
      onTaskClick(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
        task.isMyTask ? 'bg-primary/5 border-primary/20' : 'bg-muted'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <h4 className="text-sm font-medium text-foreground mb-2">{task.title}</h4>
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6">
          <AvatarFallback className="text-xs">{task.assignee.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">{task.assignee}</span>
        {task.isMyTask && (
          <Badge variant="outline" className="text-xs ml-auto bg-primary/10 text-primary border-primary/20">
            내 작업
          </Badge>
        )}
      </div>
    </div>
  );
}

interface DroppableColumnProps {
  column: typeof columnConfig[0];
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

function DroppableColumn({ column, tasks, onTaskClick }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.key,
    data: {
      type: 'column',
    },
  });

  return (
    <Card className={`h-fit transition-colors ${isOver ? 'border-primary/40 bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {column.title}
          <Badge variant="secondary" className={column.color}>
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">작업이 없습니다</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DraggableKanbanBoard({ tasks, onTaskStatusChange, onTaskClick }: DraggableKanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    // 모든 컬럼에서 해당 작업 찾기
    for (const column of columnConfig) {
      const task = tasks[column.key].find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // 드롭된 위치가 컬럼인지 작업인지 확인
    let targetColumn: keyof TaskColumn | null = null;

    // 컬럼 위에 직접 드롭한 경우
    if (columnConfig.some((col) => col.key === overId)) {
      targetColumn = overId as keyof TaskColumn;
    } else {
      // 작업 위에 드롭한 경우, 해당 작업이 속한 컬럼 찾기
      for (const column of columnConfig) {
        if (tasks[column.key].some((t) => t.id === overId)) {
          targetColumn = column.key;
          break;
        }
      }
    }

    if (!targetColumn) return;

    // 현재 작업이 속한 컬럼 찾기
    let currentColumn: keyof TaskColumn | null = null;
    for (const column of columnConfig) {
      if (tasks[column.key].some((t) => t.id === taskId)) {
        currentColumn = column.key;
        break;
      }
    }

    // 같은 컬럼이면 아무것도 하지 않음
    if (currentColumn === targetColumn) return;

    // 상태 변경
    const newStatusConfig = columnConfig.find((col) => col.key === targetColumn);
    if (newStatusConfig && onTaskStatusChange) {
      await onTaskStatusChange(taskId, newStatusConfig.statusKey);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">작업 현황 (칸반 보드)</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>내 작업</span>
            <div className="w-3 h-3 bg-muted rounded-full ml-4"></div>
            <span>다른 팀원 작업</span>
            <Badge variant="outline" className="ml-4">드래그 앤 드롭으로 상태 변경</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columnConfig.map((column) => (
            <DroppableColumn key={column.key} column={column} tasks={tasks[column.key]} onTaskClick={onTaskClick} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div
              className={`p-3 rounded-lg border shadow-lg ${
                activeTask.isMyTask ? 'bg-primary/5 border-primary/20' : 'bg-muted'
              }`}
            >
              <h4 className="text-sm font-medium text-foreground mb-2">{activeTask.title}</h4>
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">{activeTask.assignee.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{activeTask.assignee}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
