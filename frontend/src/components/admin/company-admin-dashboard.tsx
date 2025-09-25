import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { FolderPlus, Users, Briefcase, TrendingUp, Calendar, CheckCircle, UserPlus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useProjects, projectsQueryKeys } from '@/services/projects/projectsQueries';
import { projectsService } from '@/services/projects/projectsService';
import { useCompanyMembers, usePendingMembers } from '@/services/members/membersQueries';
import { projectStatusBadgeVariant, projectStatusLabel, taskStatusLabel, toTaskStatusKey } from '@/utils/status';
import type { TaskStatusKey } from '@/utils/status';
import type { ProjectSummary } from '@/types/projects.types';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

type StatChange = 'increase' | 'decrease' | 'neutral';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: StatChange;
  icon: typeof Briefcase;
}

interface ProjectCardData {
  id: string;
  name: string;
  description: string;
  progress: number;
  statusLabel: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  startDate: string;
  endDate: string;
  teamCount: number;
  completedTasks: number;
  totalTasks: number;
}

interface ActivityCardData {
  id: string;
  message: string;
  time: string;
  project: string;
}

interface JoinRequestCardData {
  id: string;
  name: string;
  email: string;
  requestDate: string;
  requestedRole: string;
  invitedBy: string;
  inviteCode: string;
}

const normalizeStatusKey = (statusName: string | null | undefined) => {
  if (!statusName) return '';
  return statusName.trim().toUpperCase();
};

const isInProgressStatus = (statusName: string | null | undefined) => {
  const key = normalizeStatusKey(statusName);
  return key === 'IN_PROGRESS' || key === 'PLANNING';
};

const isDueInCurrentMonth = (dateStr: string | null | undefined) => {
  if (!dateStr) return false;
  const dueDate = new Date(dateStr);
  if (Number.isNaN(dueDate.getTime())) return false;
  const now = new Date();
  return dueDate.getFullYear() === now.getFullYear() && dueDate.getMonth() === now.getMonth();
};

const formatRelativeTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '날짜 정보 없음';
  try {
    return formatDistanceToNowStrict(parseISO(dateStr), { addSuffix: true, locale: ko });
  } catch (error) {
    return '날짜 정보 없음';
  }
};

const buildProjectStats = (projects: ProjectSummary[], memberCount: number, completedTasksTotal: number, dueThisMonth: number): StatCard[] => {
  return [
    {
      title: '진행 중인 프로젝트',
      value: `${projects.filter((project) => isInProgressStatus(project.status_name)).length}`,
      change: '0',
      changeType: 'neutral',
      icon: Briefcase,
    },
    {
      title: '팀원 수',
      value: `${memberCount}`,
      change: '0',
      changeType: 'neutral',
      icon: Users,
    },
    {
      title: '완료된 작업',
      value: `${completedTasksTotal}`,
      change: '0',
      changeType: 'neutral',
      icon: CheckCircle,
    },
    {
      title: '이번 달 마감',
      value: `${dueThisMonth}`,
      change: '0',
      changeType: 'neutral',
      icon: Calendar,
    },
  ];
};

export function CompanyAdminDashboard() {
  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
  } = useCompanyMembers();

  const {
    data: pendingMembersData,
    isLoading: pendingLoading,
    isError: pendingError,
  } = usePendingMembers();

  const projects = projectsData?.projects ?? [];
  const projectCards: ProjectCardData[] = useMemo(() => (
    projects.map((project) => ({
      id: project.id,
      name: project.project_name,
      description: project.project_description || '프로젝트 설명이 없습니다.',
      progress: Math.round(project.progress_rate ?? 0),
      statusLabel: projectStatusLabel(project.status_name),
      badgeVariant: projectStatusBadgeVariant(project.status_name),
      startDate: project.start_date,
      endDate: project.end_date,
      teamCount: project.allocated_members.length,
      completedTasks: project.completed_tasks,
      totalTasks: project.total_tasks,
    }))
  ), [projects]);

  const completedTasksTotal = useMemo(
    () => projects.reduce((sum, project) => sum + (project.completed_tasks ?? 0), 0),
    [projects]
  );

  const dueThisMonth = useMemo(
    () => projects.reduce((count, project) => count + (isDueInCurrentMonth(project.end_date) ? 1 : 0), 0),
    [projects]
  );

  const memberCount = membersData?.statistics.total_members ?? 0;

  const stats = useMemo(
    () => buildProjectStats(projects, memberCount, completedTasksTotal, dueThisMonth),
    [projects, memberCount, completedTasksTotal, dueThisMonth]
  );

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    projectCards.forEach((project) => {
      map.set(project.id, project.name);
    });
    return map;
  }, [projectCards]);

  const projectIdsForActivities = useMemo(() => projectCards.slice(0, 5).map((project) => project.id), [projectCards]);

  const activityQueries = useQueries({
    queries: projectIdsForActivities.map((projectId) => ({
      queryKey: projectsQueryKeys.tasks(projectId, undefined),
      queryFn: () => projectsService.getProjectTasks(projectId),
      enabled: projectIdsForActivities.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const activitiesLoading = activityQueries.some((query) => query.isLoading);

  const recentActivities = useMemo((): ActivityCardData[] => {
    const allTasks = activityQueries
      .map((query) => query.data?.tasks ?? [])
      .flat();

    const activityItems = allTasks.map((task) => {
      const statusKey: TaskStatusKey = toTaskStatusKey(task.status_name);
      const projectName = projectNameById.get(task.project_id) ?? '알 수 없는 프로젝트';
      const updatedAt = task.updated_at;
      const message = `${task.assignee_name ?? '담당자 미지정'}님이 '${task.task_name}' 작업을 ${taskStatusLabel(statusKey)} 상태로 변경했습니다`;
      return {
        id: task.id,
        message,
        project: projectName,
        time: formatRelativeTime(updatedAt),
        updatedAt,
      };
    });

    return activityItems
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5)
      .map(({ updatedAt, ...rest }) => rest);
  }, [activityQueries, projectNameById]);

  const joinRequests: JoinRequestCardData[] = useMemo(() => {
    const pendingMembers = pendingMembersData?.pending_members ?? [];
    return pendingMembers.map((member) => ({
      id: member.id,
      name: member.user_name,
      email: member.email,
      requestDate: member.created_at ? member.created_at.slice(0, 10) : '알 수 없음',
      requestedRole: member.role_name,
      invitedBy: '관리자 승인 대기',
      inviteCode: '-',
    }));
  }, [pendingMembersData?.pending_members]);

  const handleApproveRequest = (requestId: string) => {
    console.log(`Approving join request: ${requestId}`);
  };

  const handleRejectRequest = (requestId: string) => {
    console.log(`Rejecting join request: ${requestId}`);
  };

  if (projectsLoading || membersLoading || pendingLoading || activitiesLoading) {
    return <LoadingSpinner />;
  }

  if (projectsError || membersError || pendingError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">회사 데이터를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">프로젝트 관리 대시보드</h1>
          <p className="text-muted-foreground">팀의 프로젝트 현황을 확인하고 관리하세요</p>
        </div>
        <Link to="/admin/company/create-project">
          <Button className="gap-2">
            <FolderPlus className="h-4 w-4" />새 프로젝트
          </Button>
        </Link>
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
                {stat.changeType === 'increase' ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary">{stat.change}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{stat.change}</span>
                )}
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
              <CardTitle>프로젝트 현황</CardTitle>
              <CardDescription>진행 중인 프로젝트들의 진척률과 상태</CardDescription>
            </div>
            <Link to="/admin/company/projects">
              <Button variant="outline" size="sm" className="bg-transparent">
                모두 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {projectCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">등록된 프로젝트가 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {projectCards.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge variant={project.badgeVariant}>{project.statusLabel}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        작업: {project.completedTasks}/{project.totalTasks}
                      </span>
                      <span className="text-muted-foreground">
                        기간: {project.startDate} ~ {project.endDate}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{project.teamCount}명</span>
                      </div>
                    </div>
                    <Link to={`/admin/company/projects/${project.id}`}>
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
            <CardDescription>팀에서 발생한 최근 활동 내역</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">최근 활동이 없습니다.</div>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  새로운 팀원 가입 요청
                </CardTitle>
                <CardDescription>승인 대기 중인 가입 요청</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {joinRequests.length}건
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {joinRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">대기 중인 가입 요청이 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{request.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{request.requestDate}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">요청 역할: {request.requestedRole}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApproveRequest(request.id)} className="flex-1">
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 bg-transparent"
                      >
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/company/team">
              <Button className="w-full mt-4 bg-transparent" variant="outline" size="sm">
                모든 가입 요청 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
