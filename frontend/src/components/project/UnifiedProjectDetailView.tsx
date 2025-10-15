import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { ProjectInfoCards } from './ProjectInfoCards';
import { ProjectTabs } from './ProjectTabs';
import { TaskCreationDialog } from '@components/admin/task-creation-dialog';
import { AlertCircle } from 'lucide-react';
import { Button } from '@components/ui/button';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import {
  useProjectDetail,
  useProjectMembers,
  useProjectTasks,
} from '@/services/projects/projectsQueries';
import { useUpdateTaskStatus, useUpdateTask } from '@/services/tasks/tasksMutations';
import type { UpdateTaskDto } from '@/types/tasks.types';
import { useAuthStore } from '@/store/authStore';
import {
  projectStatusLabel,
  taskStatusLabel,
  toTaskStatusKey,
  toTaskStatusId,
  TaskStatusKey,
} from '@/utils/status';
import type { ProjectTaskSummary } from '@/types/projects.types';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UnifiedProjectDetailViewProps {
  userRole?: 'TEAM_MEMBER' | 'COMPANY_MANAGER';
}

const roleLabelMap: Record<string, string> = {
  SYSTEM_ADMIN: '시스템 관리자',
  COMPANY_MANAGER: '회사 관리자',
  TEAM_MEMBER: '팀원',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  PENDING: '승인 대기',
};

const derivePriority = (
  task: ProjectTaskSummary,
  statusKey: TaskStatusKey
): '높음' | '중간' | '낮음' => {
  if (statusKey === 'completed') return '낮음';
  if (task.end_date) {
    const daysRemaining = Math.ceil(
      (new Date(task.end_date).getTime() - Date.now()) / (1000 * 3600 * 24)
    );
    if (daysRemaining <= 2) return '높음';
    if (daysRemaining <= 5) return '중간';
  }
  return '중간';
};

export function UnifiedProjectDetailView({
  userRole = 'TEAM_MEMBER',
}: UnifiedProjectDetailViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  // 작업 생성 다이얼로그 상태
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  // 작업 상태 변경 mutation
  const updateTaskStatus = useUpdateTaskStatus();

  // 작업 수정 mutation
  const updateTask = useUpdateTask();

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectDetail(id ?? '');

  const {
    data: projectTasksData,
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useProjectTasks(id ?? '');

  const {
    data: projectMembersData,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useProjectMembers(id ?? '');

  const isLoading = isProjectLoading || isTasksLoading || isMembersLoading;
  const hasError = isProjectError || isTasksError || isMembersError || !project;

  const returnPath =
    userRole === 'COMPANY_MANAGER' ? '/admin/company/projects' : '/dashboard/member/projects';

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">잘못된 접근입니다</h2>
        <p className="text-muted-foreground mb-4">프로젝트 ID가 필요합니다.</p>
        <Button onClick={() => navigate(returnPath)}>프로젝트 목록으로 돌아가기</Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">프로젝트를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          요청하신 프로젝트가 존재하지 않거나 접근 권한이 없습니다.
        </p>
        <Button onClick={() => navigate(returnPath)}>프로젝트 목록으로 돌아가기</Button>
      </div>
    );
  }

  const tasks = projectTasksData?.tasks ?? [];
  const projectMembers = projectMembersData?.members ?? [];

  const manager =
    projectMembers.find((member) => member.role_name?.includes('MANAGER'))?.user_name || '미지정';

  const myTasks = tasks.filter((task) => task.assignee_id === currentUserId);
  const myTaskCounts = myTasks.reduce(
    (acc, task) => {
      const key = toTaskStatusKey(task.status_name);
      if (key === 'completed') acc.completed += 1;
      else if (key === 'inProgress' || key === 'review') acc.inProgress += 1;
      else acc.todo += 1;
      return acc;
    },
    { total: myTasks.length, completed: 0, inProgress: 0, todo: 0 }
  );

  const tabTasks = tasks.map((task) => {
    const statusKey = toTaskStatusKey(task.status_name);
    return {
      id: task.id,
      title: task.task_name,
      statusKey,
      priority: derivePriority(task, statusKey),
      assignee: task.assignee_name || '미배정',
      dueDate: task.end_date || '미정',
      isMyTask: task.assignee_id === currentUserId,
    };
  });

  const kanbanTasks = tabTasks.reduce(
    (acc, task) => {
      const key = task.statusKey;
      const columnKey =
        key === 'inProgress'
          ? 'inProgress'
          : key === 'review'
          ? 'review'
          : key === 'completed'
          ? 'completed'
          : key === 'cancelled'
          ? 'cancelled'
          : 'todo';
      acc[columnKey].push({
        id: task.id,
        title: task.title,
        assignee: task.assignee,
        isMyTask: task.isMyTask,
      });
      return acc;
    },
    {
      todo: [] as { id: string; title: string; assignee: string; isMyTask: boolean }[],
      inProgress: [] as { id: string; title: string; assignee: string; isMyTask: boolean }[],
      review: [] as { id: string; title: string; assignee: string; isMyTask: boolean }[],
      completed: [] as { id: string; title: string; assignee: string; isMyTask: boolean }[],
      cancelled: [] as { id: string; title: string; assignee: string; isMyTask: boolean }[],
    }
  );

  const team = projectMembers
    .filter((member) => !member.role_name?.includes('MANAGER')) // 매니저 제외
    .map((member) => {
      const roleKey = member.role_name ?? '';
      const statusKey = member.status_name ?? '';
      return {
        id: member.id,
        name: member.user_name,
        role: roleLabelMap[roleKey] ?? member.role_name ?? '역할 미지정',
        status: statusLabelMap[statusKey] ?? member.status_name ?? '상태 미지정',
      };
    });

  const activities = tasks
    .slice()
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
    .map((task, index) => {
      const statusKey = toTaskStatusKey(task.status_name);
      return {
        id: index + 1,
        user: task.assignee_name || '시스템',
        action: `${taskStatusLabel(statusKey)} 상태로 업데이트되었습니다`,
        target: task.task_name,
        time: formatDistanceToNowStrict(parseISO(task.updated_at), { addSuffix: true, locale: ko }),
      };
    });

  // 작업 상태 변경 핸들러
  const handleTaskStatusChange = async (taskId: string, newStatusKey: TaskStatusKey) => {
    try {
      const statusId = toTaskStatusId(newStatusKey);
      await updateTaskStatus.mutateAsync({
        taskId,
        statusId,
        comment: '관리자가 검토를 완료했습니다.'
      });
    } catch (error) {
      console.error('작업 상태 변경 실패:', error);
    }
  };

  // 작업 수정 핸들러
  const handleTaskUpdate = async (taskId: string, data: UpdateTaskDto) => {
    try {
      await updateTask.mutateAsync({ taskId, data });
    } catch (error) {
      console.error('작업 수정 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectHeader
        name={project.project_name}
        description={project.project_description || '프로젝트 설명이 없습니다.'}
        status={projectStatusLabel(project.status_name)}
        statusName={project.status_name}
        onCreateTask={() => setIsTaskDialogOpen(true)}
        returnPath={returnPath}
        returnLabel="프로젝트 목록으로 돌아가기"
      />

      <ProjectInfoCards
        progress={Math.round(project.progress_rate ?? 0)}
        myTasks={{
          total: myTaskCounts.total,
          completed: myTaskCounts.completed,
          inProgress: myTaskCounts.inProgress,
          todo: myTaskCounts.todo,
        }}
        startDate={project.start_date}
        endDate={project.end_date}
        teamSize={projectMembers.length}
        manager={manager}
      />

      <ProjectTabs
        tasks={tabTasks}
        team={team}
        activities={activities}
        kanbanTasks={kanbanTasks}
        manager={manager}
        currentUser={user?.user_name || ''}
        userRole={userRole}
        project={project}
        projectMembers={projectMembers}
        onTaskStatusChange={handleTaskStatusChange}
        fullTasks={tasks}
        onTaskUpdate={handleTaskUpdate}
      />

      {/* 작업 생성 다이얼로그 */}
      <TaskCreationDialog 
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        projectId={id}
        teamMembers={projectMembers.map(member => ({
          id: member.id,
          name: member.user_name,
          role: roleLabelMap[member.role_name ?? ''] ?? member.role_name ?? '역할 미지정',
          avatar: ''
        }))}
        currentUser={{
          id: user?.id || '',
          role: userRole
        }}
      />
    </div>
  );
}
