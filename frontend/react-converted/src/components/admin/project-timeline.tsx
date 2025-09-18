import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Calendar, Flag } from "lucide-react"

interface Milestone {
  id: string
  title: string
  date: string
  status: "completed" | "in-progress" | "upcoming"
  description: string
}

interface Task {
  id: string
  title: string
  assignee: string
  priority: string
  dueDate: string
}

interface ProjectTimelineProps {
  milestones: Milestone[]
  tasks: Task[]
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  "in-progress": { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" },
  upcoming: { icon: Calendar, color: "text-gray-600", bgColor: "bg-gray-100" },
}

export function ProjectTimeline({ milestones, tasks }: ProjectTimelineProps) {
  const upcomingTasks = tasks
    .filter((task) => new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>프로젝트 마일스톤</CardTitle>
          <CardDescription>주요 단계별 진행 상황</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const config = statusConfig[milestone.status]
              return (
                <div key={milestone.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{milestone.title}</h4>
                      <span className="text-sm text-muted-foreground">{milestone.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    <Badge variant={milestone.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {milestone.status === "completed" && "완료"}
                      {milestone.status === "in-progress" && "진행 중"}
                      {milestone.status === "upcoming" && "예정"}
                    </Badge>
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 mt-12 w-px h-8 bg-border" style={{ marginLeft: "1.5rem" }} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>다가오는 마감일</CardTitle>
          <CardDescription>마감일이 임박한 작업들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">{task.title}</h4>
                  <p className="text-xs text-muted-foreground">담당자: {task.assignee}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Flag
                    className={`h-3 w-3 ${
                      task.priority === "높음"
                        ? "text-red-600"
                        : task.priority === "중간"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">마감일이 임박한 작업이 없습니다</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
