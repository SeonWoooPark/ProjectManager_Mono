import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { ReadOnlyKanbanBoard } from '@components/dashboard/read-only-kanban-board';
import { DraggableKanbanBoard } from '@components/dashboard/draggable-kanban-board';
import { ProjectSettingsForm } from './ProjectSettingsForm';
import { CheckSquare, Users, Activity, LayoutGrid, Settings, Search } from 'lucide-react';
import { taskStatusBadgeClass, taskStatusLabel, TaskStatusKey } from '@/utils/status';
import { useState } from 'react';
import { TaskEditDialog } from '@components/dashboard/task-edit-dialog';
import type { UpdateTaskDto } from '@/types/tasks.types';

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
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatusKey) => Promise<void>;
  fullTasks?: {
    id: string;
    task_name: string;
    task_description: string | null;
    start_date: string | null;
    end_date: string | null;
    progress_rate: number;
  }[];
  onTaskUpdate?: (taskId: string, data: UpdateTaskDto) => Promise<void>;
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
  onTaskStatusChange,
  fullTasks = [],
  onTaskUpdate,
}: ProjectTabsProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusKey | 'all'>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // 담당자 목록 생성 (관리자 + 팀원)
  const assignees = [manager, ...team.map(member => member.name)];

  // 필터링된 작업 목록
  const filteredTasks = tasks.filter(task => {
    const statusMatch = selectedStatus === 'all' || task.statusKey === selectedStatus;
    const assigneeMatch = selectedAssignee === 'all' || task.assignee === selectedAssignee;
    const searchMatch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && assigneeMatch && searchMatch;
  });

  // 각 상태별 작업 개수
  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.statusKey === 'todo').length,
    inProgress: tasks.filter(t => t.statusKey === 'inProgress').length,
    review: tasks.filter(t => t.statusKey === 'review').length,
    completed: tasks.filter(t => t.statusKey === 'completed').length,
    cancelled: tasks.filter(t => t.statusKey === 'cancelled').length,
  };

  // 작업 클릭 핸들러
  const handleTaskClick = (taskId: string, isMyTask?: boolean) => {
    setSelectedTaskId(taskId);
    // 관리자는 모든 작업 수정 가능, 팀원은 본인 작업만 수정 가능
    if (userRole === 'COMPANY_MANAGER') {
      setIsReadOnly(false);
    } else {
      setIsReadOnly(!isMyTask);
    }
    setIsTaskDialogOpen(true);
  };

  // 선택된 작업 찾기
  const selectedTask = selectedTaskId
    ? fullTasks.find(t => t.id === selectedTaskId)
    : null;

  // 작업 수정 핸들러
  const handleTaskUpdate = async (taskId: string, data: UpdateTaskDto) => {
    if (onTaskUpdate) {
      await onTaskUpdate(taskId, data);
    }
    setIsTaskDialogOpen(false);
  };

  return (
    <Tabs defaultValue="kanban" className="space-y-4">
      <TabsList className="bg-white text-black">
        <TabsTrigger
          value="kanban"
          className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
        >
          <LayoutGrid className="h-4 w-4" />
          칸반 보드
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
        >
          <CheckSquare className="h-4 w-4" />
          작업 목록
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
        >
          <Users className="h-4 w-4" />팀 멤버
        </TabsTrigger>
        <TabsTrigger
          value="activities"
          className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
        >
          <Activity className="h-4 w-4" />
          활동 내역
        </TabsTrigger>
        {userRole === 'COMPANY_MANAGER' && (
          <TabsTrigger
            value="settings"
            className="gap-2 data-[state=active]:bg-black data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            설정
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="kanban">
        {userRole === 'COMPANY_MANAGER' ? (
          <DraggableKanbanBoard
            tasks={kanbanTasks}
            onTaskStatusChange={onTaskStatusChange}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <ReadOnlyKanbanBoard
            tasks={kanbanTasks}
            onTaskClick={handleTaskClick}
          />
        )}
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>작업 필터</CardTitle>
            <CardDescription>검색어, 상태, 담당자로 작업을 필터링하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="작업 제목 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TaskStatusKey | 'all')}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태 ({statusCounts.all})</SelectItem>
                  <SelectItem value="todo">할 일 ({statusCounts.todo})</SelectItem>
                  <SelectItem value="inProgress">진행 중 ({statusCounts.inProgress})</SelectItem>
                  <SelectItem value="review">검토 중 ({statusCounts.review})</SelectItem>
                  <SelectItem value="completed">완료 ({statusCounts.completed})</SelectItem>
                  <SelectItem value="cancelled">취소 ({statusCounts.cancelled})</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="담당자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 담당자</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>작업 목록</CardTitle>
            <CardDescription>프로젝트에 할당된 작업을 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${taskStatusBadgeClass(
                            task.statusKey
                          )}`}
                        >
                          {taskStatusLabel(task.statusKey)}
                        </span>
                        <Badge
                          variant={
                            task.priority === '높음'
                              ? 'destructive'
                              : task.priority === '중간'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">담당: {task.assignee}</span>
                        <span className="text-xs text-muted-foreground">마감: {task.dueDate}</span>
                      </div>
                    </div>

                    {/* 오른쪽 버튼 영역 */}
                    <div className="flex items-center gap-2 ml-4">
                      {task.assignee === currentUser && (
                        <Badge variant="outline">내 작업</Badge>
                      )}

                      {/* 회사 관리자: 검토 중인 작업 검토 완료 */}
                      {userRole === 'COMPANY_MANAGER' && task.statusKey === 'review' && (
                        <Button
                          size="sm"
                          onClick={() => onTaskStatusChange?.(task.id, 'completed')}
                          className="h-8"
                        >
                          검토 완료
                        </Button>
                      )}

                      {/* 팀원: 내 작업의 상태 변경 */}
                      {userRole === 'TEAM_MEMBER' && task.isMyTask && task.statusKey !== 'completed' && task.statusKey !== 'cancelled' && (
                        <>
                          {task.statusKey === 'todo' && (
                            <Button
                              size="sm"
                              onClick={() => onTaskStatusChange?.(task.id, 'inProgress')}
                              className="h-8"
                            >
                              시작하기
                            </Button>
                          )}
                          {task.statusKey === 'inProgress' && (
                            <Button
                              size="sm"
                              onClick={() => onTaskStatusChange?.(task.id, 'review')}
                              className="h-8"
                            >
                              검토 요청
                            </Button>
                          )}
                          {task.statusKey === 'review' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent h-8"
                              disabled
                            >
                              검토 대기 중
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  {selectedStatus === 'all' && selectedAssignee === 'all'
                    ? '등록된 작업이 없습니다.'
                    : '선택한 조건에 맞는 작업이 없습니다.'}
                </div>
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
                <div className="text-center text-muted-foreground py-6">
                  등록된 팀원이 없습니다.
                </div>
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
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
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
        <TabsContent value="settings" className="flex-none">
          <ProjectSettingsForm project={project} currentMembers={projectMembers} />
        </TabsContent>
      )}

      {/* 작업 수정/상세 다이얼로그 */}
      {selectedTask && (
        <TaskEditDialog
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          task={selectedTask}
          onSubmit={handleTaskUpdate}
          readOnly={isReadOnly}
        />
      )}
    </Tabs>
  );
}
