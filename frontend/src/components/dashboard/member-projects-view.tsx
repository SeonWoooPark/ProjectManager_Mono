import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Eye, Calendar, User, FolderKanban, CheckCircle, Clock, PauseCircle, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useProjects } from '@/services/projects/projectsQueries';
import { useAssignedTasks } from '@/services/tasks/tasksQueries';
import { useAuthStore } from '@/store/authStore';
import { projectStatusBadgeClass, projectStatusLabel, toTaskStatusKey } from '@/utils/status';
import type { TaskSummary } from '@/types/tasks.types';
import type { TaskStatusKey } from '@/utils/status';

interface MemberProjectCardData {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: string;
  badgeClass: string;
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

const projectStatusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  NOT_STARTED: { label: '시작 전', color: 'bg-slate-200 text-slate-800', icon: Clock },
  IN_PROGRESS: { label: '진행 중', color: 'bg-black text-white', icon: FolderKanban },
  COMPLETED: { label: '완료', color: 'bg-sky-200 text-sky-900', icon: CheckCircle },
  ON_HOLD: { label: '보류', color: 'bg-emerald-200 text-emerald-900', icon: PauseCircle },
};

const statusOrder = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

export function MemberProjectsView() {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
          badgeClass: projectStatusBadgeClass(project.status_name),
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      NOT_STARTED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
    };

    assignedProjects.forEach((project) => {
      const normalizedStatus = projectsData?.projects
        .find((p) => p.id === project.id)
        ?.status_name?.trim().toUpperCase();
      if (normalizedStatus && counts[normalizedStatus] !== undefined) {
        counts[normalizedStatus]++;
      }
    });

    return counts;
  }, [assignedProjects, projectsData?.projects]);

  const filteredProjects = useMemo(() => {
    return assignedProjects.filter((project) => {
      const normalizedStatus = projectsData?.projects
        .find((p) => p.id === project.id)
        ?.status_name?.trim().toUpperCase();
      const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
      const searchMatch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [assignedProjects, statusFilter, searchQuery, projectsData?.projects]);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOrder.map((statusKey) => {
          const config = projectStatusConfig[statusKey];
          if (!config) return null;
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
          <CardTitle>프로젝트 필터</CardTitle>
          <CardDescription>상태와 제목으로 프로젝트를 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="프로젝트 제목 또는 설명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="NOT_STARTED">시작 전</SelectItem>
                <SelectItem value="IN_PROGRESS">진행 중</SelectItem>
                <SelectItem value="COMPLETED">완료</SelectItem>
                <SelectItem value="ON_HOLD">보류</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredProjects.map((project) => {
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
                    <Badge className={project.badgeClass}>{project.status}</Badge>
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

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">선택한 조건에 맞는 프로젝트가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
