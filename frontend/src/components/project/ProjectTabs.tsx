import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { ReadOnlyKanbanBoard } from "@components/dashboard/read-only-kanban-board"
import {
  CheckSquare, Users, Activity,
  LayoutGrid
} from "lucide-react"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee: string
  dueDate: string
  isMyTask?: boolean
}

interface TeamMember {
  id: number
  name: string
  role: string
  status: string
}

interface Activity {
  id: number
  user: string
  action: string
  target: string
  time: string
}

interface KanbanTasks {
  todo: { id: string; title: string; assignee: string; isMyTask: boolean }[]
  inProgress: { id: string; title: string; assignee: string; isMyTask: boolean }[]
  review: { id: string; title: string; assignee: string; isMyTask: boolean }[]
  completed: { id: string; title: string; assignee: string; isMyTask: boolean }[]
  cancelled: { id: string; title: string; assignee: string; isMyTask: boolean }[]
}

interface ProjectTabsProps {
  tasks: Task[]
  team: TeamMember[]
  activities: Activity[]
  kanbanTasks: KanbanTasks
  manager: string
  currentUser: string
}

export function ProjectTabs({
  tasks,
  team,
  activities,
  kanbanTasks,
  manager,
  currentUser
}: ProjectTabsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800"
      case "진행 중": return "bg-blue-100 text-blue-800"
      case "할 일": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string): "destructive" | "default" | "secondary" => {
    switch (priority) {
      case "높음": return "destructive"
      case "중간": return "default"
      case "낮음": return "secondary"
      default: return "secondary"
    }
  }

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

      </TabsList>

      <TabsContent value="kanban">
        <ReadOnlyKanbanBoard tasks={kanbanTasks} currentUser={currentUser} />
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
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">담당: {task.assignee}</span>
                        <span className="text-xs text-muted-foreground">마감: {task.dueDate}</span>
                      </div>
                    </div>
                    {task.assignee === currentUser && (
                      <Badge variant="outline" className="ml-4">내 작업</Badge>
                    )}
                  </div>
                </div>
              ))}
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
                      <span className="font-medium">{activity.user}</span>님이{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-sm font-medium mt-1">{activity.target}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>


    </Tabs>
  )
}