import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Users, Mail, Calendar, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import { useCompanyMembers } from '@/services/members/membersQueries';
import { useAuthStore } from '@/store/authStore';

interface StatCardData {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
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

const statusBadgeVariant = (statusName: string) => {
  switch (statusName) {
    case 'ACTIVE':
      return 'default' as const;
    case 'PENDING':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

export function TeamMembersView() {
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;

  const { data, isLoading, isError } = useCompanyMembers();

  const stats = useMemo<StatCardData[]>(() => {
    if (!data?.statistics) {
      return [
        { title: '총 팀원 수', value: 0, description: '등록된 팀원', icon: Users },
        { title: '활성 멤버', value: 0, description: '활성 상태 사용자', icon: Briefcase },
        { title: '승인 대기', value: 0, description: '승인 필요 사용자', icon: Briefcase },
        { title: '팀 멤버', value: 0, description: '팀원 역할', icon: Briefcase },
      ];
    }

    const { total_members, active_members, pending_members, managers } = data.statistics;

    return [
      {
        title: '총 팀원 수',
        value: total_members,
        description: '등록된 전체 멤버',
        icon: Users,
      },
      {
        title: '활성 멤버',
        value: active_members,
        description: '활성 상태 사용자',
        icon: Briefcase,
      },
      {
        title: '승인 대기',
        value: pending_members,
        description: '승인 대기 중인 팀원',
        icon: Briefcase,
      },
      {
        title: '관리자',
        value: managers,
        description: '회사 관리자 역할',
        icon: Briefcase,
      },
    ];
  }, [data?.statistics]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">팀원 정보를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const roleBadges = [
    { label: '관리자', count: data.statistics.managers },
    { label: '팀원', count: data.statistics.team_members },
    { label: '승인 대기', count: data.statistics.pending_members },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">팀원 현황</h1>
        <p className="text-muted-foreground">우리 팀의 모든 구성원 정보를 확인하세요</p>
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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>역할별 현황</CardTitle>
          <CardDescription>역할 및 상태별 팀원 수</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roleBadges.map((badge) => (
              <Badge key={badge.label} variant="secondary" className="text-sm">
                {badge.label}: {badge.count}명
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>팀원 목록</CardTitle>
          <CardDescription>모든 팀원의 상세 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.members.map((member) => {
              const roleLabel = roleLabelMap[member.role_name] ?? member.role_name;
              const statusLabel = statusLabelMap[member.status_name] ?? member.status_name;
              const joinDate = member.created_at ? member.created_at.slice(0, 10) : '';
              const isCurrentUser = member.id === currentUserId;

              return (
                <div
                  key={member.id}
                  className={`border rounded-lg p-4 ${isCurrentUser ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-lg font-medium">{member.user_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{member.user_name}</h3>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              나
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {roleLabel}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone_number && (
                            <div className="flex items-center gap-1">
                              <span>{member.phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>가입: {joinDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant={statusBadgeVariant(member.status_name)}>
                        {statusLabel}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        완료 작업: {member.tasks_completed}개 / 총 {member.tasks_assigned}개
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">참여 프로젝트 수: {member.projects_assigned}개</p>
                    <Badge variant="outline" className="text-xs">
                      프로젝트 {member.projects_assigned}개 참여 중
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
