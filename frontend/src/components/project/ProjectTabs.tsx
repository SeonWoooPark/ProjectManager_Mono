import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { ReadOnlyKanbanBoard } from '@components/dashboard/read-only-kanban-board';
import { ProjectSettingsForm } from './ProjectSettingsForm';
import { CheckSquare, Users, Activity, LayoutGrid, Settings } from 'lucide-react';
import { taskStatusBadgeClass, taskStatusLabel, TaskStatusKey } from '@/utils/status';

interface ProjectTabTask {
  id: string;
  title: string;
  statusKey: TaskStatusKey;
  priority: '높음' | '중간' | '낮음';
  assignee: string;
  dueDate: string;
  isMyTask: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface ProjectActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface KanbanTasks {
  todo: { id: string; title: string; assignee: string; isMyTask: boolean }[];
  inProgress: { id: string; title: string; assignee: string; isMyTask: boolean }[];
  review: { id: string; title: string; assignee: string; isMyTask: boolean }[];
  completed: { id: string; title: string; assignee: string; isMyTask: boolean }[];
  cancelled: { id: string; title: string; assignee: string; isMyTask: boolean }[];
}

interface ProjectTabsProps {
  tasks: ProjectTabTask[];
  team: TeamMember[];
  activities: ProjectActivity[];
  kanbanTasks: KanbanTasks;
  manager: string;
  currentUser: string;
  userRole?: 'TEAM_MEMBER' | 'COMPANY_MANAGER';
  project?: any;
  projectMembers?: any[];
}

export function ProjectTabs({
  tasks,
  team,
  activities,
  kanbanTasks,
  manager,
  currentUser,
  userRole = 'TEAM_MEMBER',
  project,
  projectMembers = [],
}: ProjectTabsProps) {
  return (
    <Tabs defaultValue="kanban" className="space-y-4">
      <TabsList className="bg-white text-black">
        <TabsTrigger value="kanban" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <LayoutGrid className="h-4 w-4" />
          칸반 보드
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <CheckSquare className="h-4 w-4" />
          작업 목록
        </TabsTrigger>
        <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <Users className="h-4 w-4" />
          팀 멤버
        </TabsTrigger>
        <TabsTrigger value="activities" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
          <Activity className="h-4 w-4" />
          활동 내역
        </TabsTrigger>
        {userRole === 'COMPANY_MANAGER' && (
          <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
            <Settings className="h-4 w-4" />
            설정
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="kanban">
        <ReadOnlyKanbanBoard tasks={kanbanTasks} />
      </TabsContent>

      <TabsContent value="tasks">
        <Card>
          <CardHeader>
            <CardTitle>작업 목록</CardTitle>
            <CardDescription>프로젝트에 할당된 모든 작업을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${taskStatusBadgeClass(task.statusKey)}`}>
                          {taskStatusLabel(task.statusKey)}
                        </span>
                        <Badge variant={task.priority === '높음' ? 'destructive' : task.priority === '중간' ? 'default' : 'secondary'} className="text-xs">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">담당: {task.assignee}</span>
                        <span className="text-xs text-muted-foreground">마감: {task.dueDate}</span>
                      </div>
                    </div>
                    {task.assignee === currentUser && (
                      <Badge variant="outline" className="ml-4">
                        내 작업
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center text-muted-foreground py-10">등록된 작업이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <Card>
          <CardHeader>
            <CardTitle>팀 멤버</CardTitle>
            <CardDescription>프로젝트에 참여 중인 팀원들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>PM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{manager}</p>
                      <p className="text-sm text-muted-foreground">프로젝트 매니저</p>
                    </div>
                  </div>
                  <Badge>매니저</Badge>
                </div>
              </div>
              {team.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{member.status}</Badge>
                  </div>
                </div>
              ))}
              {team.length === 0 && (
                <div className="text-center text-muted-foreground py-6">등록된 팀원이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activities">
        <Card>
          <CardHeader>
            <CardTitle>활동 내역</CardTitle>
            <CardDescription>프로젝트의 최근 활동들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.user.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>님이{' '}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-sm font-medium mt-1">{activity.target}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center text-muted-foreground py-6">최근 활동이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {userRole === 'COMPANY_MANAGER' && project && (
        <TabsContent value="settings">
          <div className="pb-3">
            <ProjectSettingsForm project={project} currentMembers={projectMembers} />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
