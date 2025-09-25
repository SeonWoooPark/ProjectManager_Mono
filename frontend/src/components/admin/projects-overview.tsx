import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { Eye, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useProjects } from '@/services/projects/projectsQueries';
import { projectStatusBadgeVariant, projectStatusLabel } from '@/utils/status';

export function ProjectsOverview() {
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

      <div className="grid gap-6">
        {projects.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">등록된 프로젝트가 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {projects.map((project) => {
          const progressRate = Math.round(project.progress_rate ?? 0);
          const statusLabel = projectStatusLabel(project.status_name);
          const badgeVariant = projectStatusBadgeVariant(project.status_name);
          const teamCount = totalMembersByProject.get(project.id) ?? 0;

          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.project_name}</CardTitle>
                    <CardDescription>{project.project_description || '프로젝트 설명이 없습니다.'}</CardDescription>
                  </div>
                  <Badge variant={badgeVariant}>{statusLabel}</Badge>
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
