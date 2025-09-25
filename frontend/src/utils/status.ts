export type TaskStatusKey = 'todo' | 'inProgress' | 'review' | 'completed' | 'cancelled';

const TASK_STATUS_LABELS: Record<TaskStatusKey, string> = {
  todo: '할 일',
  inProgress: '진행 중',
  review: '검토 중',
  completed: '완료',
  cancelled: '취소',
};

const TASK_STATUS_COLOR_CLASSES: Record<TaskStatusKey, string> = {
  todo: 'bg-gray-100 text-gray-800',
  inProgress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const TASK_STATUS_NAME_TO_KEY: Record<string, TaskStatusKey> = {
  TODO: 'todo',
  'TO DO': 'todo',
  'IN_PROGRESS': 'inProgress',
  'IN PROGRESS': 'inProgress',
  'IN-PROGRESS': 'inProgress',
  INPROGRESS: 'inProgress',
  REVIEW: 'review',
  'IN_REVIEW': 'review',
  'IN REVIEW': 'review',
  'IN-REVIEW': 'review',
  COMPLETED: 'completed',
  DONE: 'completed',
  FINISHED: 'completed',
  CANCELLED: 'cancelled',
  CANCELED: 'cancelled',
};

export function toTaskStatusKey(statusName: string | null | undefined): TaskStatusKey {
  if (!statusName) return 'todo';
  const normalized = statusName.trim().toUpperCase();
  return TASK_STATUS_NAME_TO_KEY[normalized] || 'todo';
}

export function taskStatusLabel(status: TaskStatusKey): string {
  return TASK_STATUS_LABELS[status];
}

export function taskStatusBadgeClass(status: TaskStatusKey): string {
  return TASK_STATUS_COLOR_CLASSES[status];
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: '계획 중',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  ON_HOLD: '보류',
  CANCELLED: '취소',
  ARCHIVED: '보관됨',
};

export function projectStatusLabel(statusName: string | null | undefined): string {
  if (!statusName) return '상태 미정';
  const normalized = statusName.trim().toUpperCase();
  return PROJECT_STATUS_LABELS[normalized] || statusName;
}

export function projectStatusBadgeVariant(statusName: string | null | undefined): 'default' | 'secondary' | 'outline' {
  const normalized = statusName?.trim().toUpperCase();
  switch (normalized) {
    case 'IN_PROGRESS':
    case 'PLANNING':
      return 'default';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
    case 'ON_HOLD':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function countTasksByStatus(tasks: Array<{ status_name: string | null | undefined }>) {
  return tasks.reduce(
    (acc, task) => {
      const key = toTaskStatusKey(task.status_name);
      acc[key] += 1;
      return acc;
    },
    { todo: 0, inProgress: 0, review: 0, completed: 0, cancelled: 0 } as Record<TaskStatusKey, number>
  );
}

export const DEFAULT_TASK_PRIORITY_LABEL = '중간';
