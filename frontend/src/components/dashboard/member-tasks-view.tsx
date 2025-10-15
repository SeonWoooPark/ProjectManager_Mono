import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { CheckSquare, Clock, AlertCircle, Calendar, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useAssignedTasks, tasksQueryKeys } from '@/services/tasks/tasksQueries';
import { useProjects, projectsQueryKeys } from '@/services/projects/projectsQueries';
import { tasksService } from '@/services/tasks/tasksService';
import { DEFAULT_TASK_PRIORITY_LABEL, TaskStatusKey, taskStatusBadgeClass, taskStatusLabel, toTaskStatusKey } from '@/utils/status';
import { useToast } from '@components/ui/use-toast';
import { TaskCreationDialog } from '@components/admin/task-creation-dialog';
import { useAuthStore } from '@/store/authStore';

interface MemberTaskCardData {
  id: string;
  title: string;
  description: string;
  project: string;
  status: TaskStatusKey;
  priority: '높음' | '중간' | '낮음';
  dueDate: string;
}

const statusConfig: Record<TaskStatusKey, { label: string; color: string; icon: LucideIcon }> = {
  todo: { label: '할 일', color: taskStatusBadgeClass('todo'), icon: Clock },
  inProgress: { label: '진행 중', color: taskStatusBadgeClass('inProgress'), icon: AlertCircle },
  review: { label: '검토 중', color: taskStatusBadgeClass('review'), icon: Clock },
  completed: { label: '완료', color: taskStatusBadgeClass('completed'), icon: CheckSquare },
  cancelled: { label: '취소', color: taskStatusBadgeClass('cancelled'), icon: AlertCircle },
};

const priorityConfig = {
  높음: { color: 'destructive' as const },
  중간: { color: 'default' as const },
  낮음: { color: 'secondary' as const },
};

const statusIdByKey: Record<TaskStatusKey, number> = {
  todo: 1,
  inProgress: 2,
  review: 3,
  completed: 4,
  cancelled: 5,
};

const statusOrder: TaskStatusKey[] = ['todo', 'inProgress', 'review', 'completed'];

export function MemberTasksView() {
  const [statusFilter, setStatusFilter] = useState<TaskStatusKey | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError } = useAssignedTasks();
  const { data: projectsData } = useProjects();

  const mutation = useMutation({
    mutationFn: async ({ taskId, statusKey }: { taskId: string; statusKey: TaskStatusKey }) => {
      const statusId = statusIdByKey[statusKey];
      return tasksService.updateStatus(taskId, statusId);
    },
    onSuccess: () => {
      toast({ title: '작업 상태가 업데이트되었습니다.' });
      // 모든 tasks 관련 쿼리 무효화 (할당된 작업 목록 및 통계 업데이트)
      queryClient.invalidateQueries({ queryKey: tasksQueryKeys.all });
      // 모든 projects 관련 쿼리도 무효화 (진행률, 작업 통계 업데이트)
    queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: () => {
      toast({ title: '작업 상태 변경에 실패했습니다.', variant: 'destructive' });
    },
  });

  const tasks: MemberTaskCardData[] = useMemo(() => {
    if (!data?.tasks) return [];

    return data.tasks.map((task) => {
      const statusKey = toTaskStatusKey(task.status_name);

      const priority: '높음' | '중간' | '낮음' = (() => {
        if (statusKey === 'completed') return '낮음';
        if (task.days_remaining !== null) {
          if (task.days_remaining <= 2) return '높음';
          if (task.days_remaining <= 5) return '중간';
        }
        return DEFAULT_TASK_PRIORITY_LABEL as '중간';
      })();

      return {
        id: task.id,
        title: task.task_name,
        description: task.task_description || '작업 설명이 없습니다.',
        project: task.project_name,
        status: statusKey,
        priority,
        dueDate: task.end_date || '미정',
      } satisfies MemberTaskCardData;
    });
  }, [data?.tasks]);

  // const uniqueProjects = useMemo(() => {
  //   return Array.from(new Set(tasks.map((task) => task.project)));
  // }, [tasks]);

  const statusCounts = useMemo(() => {
    return {
      todo: data?.statistics.todo ?? 0,
      inProgress: data?.statistics.in_progress ?? 0,
      review: data?.statistics.review ?? 0,
      completed: data?.statistics.completed ?? 0,
      cancelled: 0,
    } as Record<TaskStatusKey, number>;
  }, [data?.statistics]);

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const projectMatch = projectFilter === 'all' || task.project === projectFilter;
    return statusMatch && projectMatch;
  });

  // 할당된 프로젝트만 필터링 (member-projects-view.tsx와 동일한 방식)
  const assignedProjects = useMemo(() => {
    if (!projectsData?.projects || !user?.id) {
      return [];
    }

    return projectsData.projects
      .filter((project) =>
        project.allocated_members.some((member) => member.user_id === user.id)
      )
      .map((project) => ({
        id: project.id,
        project_name: project.project_name,
      }));
  }, [projectsData?.projects, user?.id]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatusKey) => {
    mutation.mutate({ taskId, statusKey: newStatus });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">작업 정보를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">내 작업</h1>
          <p className="text-muted-foreground">할당된 모든 작업을 확인하고 상태를 업데이트하세요</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />새 작업 만들기
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOrder.map((statusKey) => {
          const config = statusConfig[statusKey];
          const count = statusCounts[statusKey] ?? 0;
          return (
            <Card key={statusKey}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{config.label}</CardTitle>
                <config.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>작업 필터</CardTitle>
          <CardDescription>상태와 프로젝트로 작업을 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={(value: TaskStatusKey | 'all') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="inProgress">진행 중</SelectItem>
                  <SelectItem value="review">검토</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 프로젝트</SelectItem>
                  {assignedProjects.map((project) => (
                    <SelectItem key={project.id} value={project.project_name}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const priorityInfo = priorityConfig[task.priority];
          const statusKey = task.status;

          return (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityInfo.color}>{task.priority}</Badge>
                    <Badge variant="secondary" className={statusConfig[statusKey].color}>
                      {taskStatusLabel(statusKey)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>마감: {task.dueDate}</span>
                    </div>
                    <span>프로젝트: {task.project}</span>
                  </div>

                  {statusKey !== 'completed' && (
                    <div className="flex gap-2">
                      {statusKey === 'todo' && (
                        <Button size="sm" disabled={mutation.isPending} onClick={() => handleStatusChange(task.id, 'inProgress')}>
                          시작하기
                        </Button>
                      )}
                      {statusKey === 'inProgress' && (
                        <Button size="sm" disabled={mutation.isPending} onClick={() => handleStatusChange(task.id, 'review')}>
                          검토 요청
                        </Button>
                      )}
                      {statusKey === 'review' && (
                        <Button size="sm" variant="outline" className="bg-transparent" disabled>
                          검토 대기 중
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">선택한 조건에 맞는 작업이 없습니다.</p>
          </CardContent>
        </Card>
      )}

      {/* 작업 생성 다이얼로그 */}
      <TaskCreationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        projects={assignedProjects}
        teamMembers={[
          {
            id: user?.id || '',
            name: user?.user_name || '',
            role: 'TEAM_MEMBER',
            avatar: '',
          },
        ]}
        currentUser={{
          id: user?.id || '',
          role: 'TEAM_MEMBER',
        }}
      />
    </div>
  );
}
