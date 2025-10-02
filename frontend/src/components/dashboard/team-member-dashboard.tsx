import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Briefcase, CheckSquare, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useProjects } from '@/services/projects/projectsQueries';
import { useAssignedTasks } from '@/services/tasks/tasksQueries';
import { useAuthStore } from '@/store/authStore';
import { projectStatusBadgeClass, projectStatusLabel, taskStatusLabel, toTaskStatusKey } from '@/utils/status';
import type { TaskStatusKey } from '@/utils/status';
import type { TaskSummary } from '@/types/tasks.types';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface StatCardData {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
}

interface AssignedProjectCardData {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: string;
  badgeClass: string;
  dueDate: string;
  myTasks: {
    total: number;
    completed: number;
    inProgress: number;
  };
  role: string;
}

interface UrgentTaskData {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  priority: '높음' | '중간' | '낮음';
  status: TaskStatusKey;
}

interface RecentActivityData {
  id: string;
  message: string;
  time: string;
  project: string;
}

const derivePriority = (task: TaskSummary, statusKey: TaskStatusKey): '높음' | '중간' | '낮음' => {
  if (statusKey === 'completed') return '낮음';
  if (task.days_remaining !== null) {
    if (task.days_remaining <= 2) return '높음';
    if (task.days_remaining <= 5) return '중간';
  }
  return '중간';
};

export function TeamMemberDashboard() {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const { data: projectData, isLoading: isProjectsLoading, isError: isProjectsError } = useProjects();
  const { data: taskData, isLoading: isTasksLoading, isError: isTasksError } = useAssignedTasks();

  const assignedProjects = useMemo<AssignedProjectCardData[]>(() => {
    if (!projectData?.projects || !currentUserId) return [];

    const tasksByProject = new Map<string, TaskSummary[]>();
    if (taskData?.tasks) {
      for (const task of taskData.tasks) {
        const list = tasksByProject.get(task.project_id) ?? [];
        list.push(task);
        tasksByProject.set(task.project_id, list);
      }
    }

    return projectData.projects
      .filter((project) => project.allocated_members.some((member) => member.user_id === currentUserId))
      .map((project) => {
        const tasksForProject = tasksByProject.get(project.id) ?? [];
        const statusCounts = tasksForProject.reduce(
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
          badgeClass: projectStatusBadgeClass(project.status_name),
          dueDate: project.end_date,
          role: '팀원',
          myTasks: {
            total: tasksForProject.length,
            completed: statusCounts.completed,
            inProgress: statusCounts.inProgress,
          },
        } satisfies AssignedProjectCardData;
      })
      .slice(0, 3);
  }, [projectData?.projects, currentUserId, taskData?.tasks]);

  const stats = useMemo<StatCardData[]>(() => {
    const totalProjects = assignedProjects.length;
    const inProgressTasks = taskData?.tasks?.filter((task) => {
      const statusKey = toTaskStatusKey(task.status_name);
      return statusKey === 'todo' || statusKey === 'inProgress' || statusKey === 'review';
    }).length ?? 0;
    const completedTasks = taskData?.statistics.completed ?? 0;
    const dueThisWeek = taskData?.tasks?.filter((task) => {
      if (task.days_remaining === null) return false;
      return task.days_remaining >= 0 && task.days_remaining <= 7 && toTaskStatusKey(task.status_name) !== 'completed';
    }).length ?? 0;

    return [
      {
        title: '할당된 프로젝트',
        value: `${totalProjects}`,
        change: '0',
        changeType: 'neutral',
        icon: Briefcase,
      },
      {
        title: '진행 중인 작업',
        value: `${inProgressTasks}`,
        change: '0',
        changeType: 'neutral',
        icon: Clock,
      },
      {
        title: '완료한 작업',
        value: `${completedTasks}`,
        change: '0',
        changeType: 'neutral',
        icon: CheckSquare,
      },
      {
        title: '이번 주 마감',
        value: `${dueThisWeek}`,
        change: '0',
        changeType: 'neutral',
        icon: Calendar,
      },
    ];
  }, [assignedProjects.length, taskData?.statistics.completed, taskData?.tasks]);

  const urgentTasks = useMemo<UrgentTaskData[]>(() => {
    if (!taskData?.tasks) return [];
    return taskData.tasks
      .filter((task) => task.days_remaining !== null && task.days_remaining >= 0 && task.days_remaining <= 3 && toTaskStatusKey(task.status_name) !== 'completed')
      .sort((a, b) => (a.days_remaining ?? 0) - (b.days_remaining ?? 0))
      .slice(0, 3)
      .map((task) => {
        const statusKey = toTaskStatusKey(task.status_name);
        return {
          id: task.id,
          title: task.task_name,
          project: task.project_name,
          dueDate: task.end_date || '미정',
          priority: derivePriority(task, statusKey),
          status: statusKey,
        } satisfies UrgentTaskData;
      });
  }, [taskData?.tasks]);

  const recentActivities = useMemo<RecentActivityData[]>(() => {
    if (!taskData?.tasks) return [];
    return taskData.tasks
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((task) => {
        const statusKey = toTaskStatusKey(task.status_name);
        const message = `'${task.task_name}' 작업 상태가 ${taskStatusLabel(statusKey)}으로 업데이트되었습니다`;
        const time = formatDistanceToNowStrict(parseISO(task.updated_at), { addSuffix: true, locale: ko });
        return {
          id: task.id,
          message,
          time,
          project: task.project_name,
        } satisfies RecentActivityData;
      });
  }, [taskData?.tasks]);

  if (isProjectsLoading || isTasksLoading) {
    return <LoadingSpinner />;
  }

  if (isProjectsError || isTasksError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">대시보드 정보를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">내 대시보드</h1>
        <p className="text-muted-foreground">할당된 프로젝트와 작업을 확인하고 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.changeType === 'increase' && (
                  <>
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary">{stat.change}</span>
                  </>
                )}
                {stat.changeType !== 'increase' && <span className="text-muted-foreground">{stat.change}</span>}
                <span className="text-muted-foreground">지난 주 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>할당된 프로젝트</CardTitle>
              <CardDescription>참여 중인 프로젝트들의 진행 상황</CardDescription>
            </div>
            <Link to="/dashboard/member/projects">
              <Button variant="outline" size="sm" className="bg-transparent">
                모두 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {assignedProjects.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">할당된 프로젝트가 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {assignedProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={project.badgeClass}>{project.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">역할: {project.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">전체 진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        내 작업: {project.myTasks.completed}/{project.myTasks.total}
                      </span>
                      <span className="text-muted-foreground">마감: {project.dueDate}</span>
                    </div>
                    <Link to={`/dashboard/member/projects/${project.id}`}>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        상세보기
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>내가 수행한 최근 활동 내역</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">최근 활동이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>{activity.project}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              긴급 작업
            </CardTitle>
            <CardDescription>마감일이 임박한 작업들</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentTasks.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">임박한 작업이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <Badge
                        variant={
                          task.priority === '높음' ? 'destructive' : task.priority === '중간' ? 'default' : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{task.project}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">마감: {task.dueDate}</span>
                      <Badge variant="outline" className="text-xs">
                        {taskStatusLabel(task.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Link to="/dashboard/member/tasks">
                <Button className="w-full bg-transparent" variant="outline" size="sm">
                  모든 작업 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
