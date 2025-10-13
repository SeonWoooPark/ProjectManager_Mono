import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Eye, Users, Calendar, FolderKanban, CheckCircle, Clock, PauseCircle, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useProjects } from '@/services/projects/projectsQueries';
import { projectStatusBadgeClass, projectStatusLabel } from '@/utils/status';

const projectStatusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  NOT_STARTED: { label: '시작 전', color: 'bg-slate-200 text-slate-800', icon: Clock },
  IN_PROGRESS: { label: '진행 중', color: 'bg-black text-white', icon: FolderKanban },
  COMPLETED: { label: '완료', color: 'bg-sky-200 text-sky-900', icon: CheckCircle },
  ON_HOLD: { label: '보류', color: 'bg-emerald-200 text-emerald-900', icon: PauseCircle },
};

const statusOrder = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

export function ProjectsOverview() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: projectsData,
    isLoading,
    isError,
  } = useProjects();

  const projects = projectsData?.projects ?? [];

  const totalMembersByProject = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach((project) => {
      map.set(project.id, project.allocated_members.length);
    });
    return map;
  }, [projects]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      NOT_STARTED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      ON_HOLD: 0,
    };

    projects.forEach((project) => {
      const normalizedStatus = project.status_name?.trim().toUpperCase();
      if (normalizedStatus && counts[normalizedStatus] !== undefined) {
        counts[normalizedStatus]++;
      }
    });

    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const normalizedStatus = project.status_name?.trim().toUpperCase();
      const statusMatch = statusFilter === 'all' || normalizedStatus === statusFilter;
      const searchMatch =
        searchQuery === '' ||
        project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_description?.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [projects, statusFilter, searchQuery]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">프로젝트 목록을 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">프로젝트 관리</h1>
        <p className="text-muted-foreground">모든 프로젝트의 진행 상황을 확인하고 관리하세요</p>
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
        {projects.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">등록된 프로젝트가 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {projects.length > 0 && filteredProjects.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">선택한 조건에 맞는 프로젝트가 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {filteredProjects.map((project) => {
          const progressRate = Math.round(project.progress_rate ?? 0);
          const statusLabel = projectStatusLabel(project.status_name);
          const badgeClass = projectStatusBadgeClass(project.status_name);
          const teamCount = totalMembersByProject.get(project.id) ?? 0;

          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.project_name}</CardTitle>
                    <CardDescription>{project.project_description || '프로젝트 설명이 없습니다.'}</CardDescription>
                  </div>
                  <Badge className={badgeClass}>{statusLabel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">{progressRate}%</span>
                    </div>
                    <Progress value={progressRate} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {project.start_date} ~ {project.end_date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{teamCount}명</span>
                    </div>
                    <span className="text-muted-foreground">
                      작업: {project.completed_tasks}/{project.total_tasks}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.allocated_members.slice(0, 3).map((member) => (
                      <div
                        key={member.user_id}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                        title={member.user_name}
                      >
                        {member.user_name.charAt(0)}
                      </div>
                    ))}
                    {teamCount > 3 && (
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                        +{teamCount - 3}
                      </div>
                    )}
                  </div>

                  <Link to={`/admin/company/projects/${project.id}`}>
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
