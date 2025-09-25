import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Eye, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useProjects } from '@/services/projects/projectsQueries';
import { useAssignedTasks } from '@/services/tasks/tasksQueries';
import { useAuthStore } from '@/store/authStore';
import { projectStatusBadgeVariant, projectStatusLabel, toTaskStatusKey } from '@/utils/status';
import type { TaskSummary } from '@/types/tasks.types';
import type { TaskStatusKey } from '@/utils/status';

interface MemberProjectCardData {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  startDate: string;
  endDate: string;
  role: string;
  myTasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
}

export function MemberProjectsView() {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useProjects();

  const {
    data: tasksData,
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useAssignedTasks();

  const assignedProjects: MemberProjectCardData[] = useMemo(() => {
    if (!projectsData?.projects || !currentUserId) {
      return [];
    }

    const tasksByProjectId = new Map<string, TaskSummary[]>();
    if (tasksData?.tasks) {
      for (const task of tasksData.tasks) {
        const list = tasksByProjectId.get(task.project_id) ?? [];
        list.push(task);
        tasksByProjectId.set(task.project_id, list);
      }
    }

    return projectsData.projects
      .filter((project) => project.allocated_members.some((member) => member.user_id === currentUserId))
      .map((project) => {
        const projectTasks = tasksByProjectId.get(project.id) ?? [];
        const statusCounts = projectTasks.reduce(
          (acc, task) => {
            const key = toTaskStatusKey(task.status_name);
            acc[key] += 1;
            return acc;
          },
          { todo: 0, inProgress: 0, review: 0, completed: 0, cancelled: 0 } as Record<TaskStatusKey, number>
        );

        return {
          id: project.id,
          name: project.project_name,
          description: project.project_description || '프로젝트 설명이 없습니다.',
          progress: Math.round(project.progress_rate ?? 0),
          status: projectStatusLabel(project.status_name),
          badgeVariant: projectStatusBadgeVariant(project.status_name),
          startDate: project.start_date,
          endDate: project.end_date,
          role: '팀원',
          myTasks: {
            total: projectTasks.length,
            completed: statusCounts.completed,
            inProgress: statusCounts.inProgress,
            todo: statusCounts.todo,
          },
        } satisfies MemberProjectCardData;
      });
  }, [projectsData?.projects, currentUserId, tasksData?.tasks]);

  if (isProjectsLoading || isTasksLoading) {
    return <LoadingSpinner />;
  }

  if (isProjectsError || isTasksError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">프로젝트 정보를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  if (!assignedProjects.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <h2 className="text-xl font-semibold">할당된 프로젝트가 없습니다.</h2>
          <p className="text-muted-foreground">관리자에게 프로젝트 참여를 요청해 보세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">내 프로젝트</h1>
        <p className="text-muted-foreground">할당된 프로젝트들의 상세 정보와 진행 상황</p>
      </div>

      <div className="grid gap-6">
        {assignedProjects.map((project) => {
          const myTaskProgress = project.myTasks.total > 0
            ? Math.round((project.myTasks.completed / project.myTasks.total) * 100)
            : 0;

          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant={project.badgeVariant}>{project.status}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">역할: {project.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">전체 진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">내 작업 진행률</span>
                      <span className="font-medium">{myTaskProgress}%</span>
                    </div>
                    <Progress value={myTaskProgress} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {project.startDate} ~ {project.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        내 작업: {project.myTasks.completed}/{project.myTasks.total}
                      </span>
                    </div>
                  </div>

                  <Link to={`/dashboard/member/projects/${project.id}`}>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Eye className="h-3 w-3 mr-1" />
                      상세보기
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
