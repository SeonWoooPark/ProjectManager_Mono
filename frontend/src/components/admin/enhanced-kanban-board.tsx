import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { TaskDetailDialog } from "./task-detail-dialog"
import { MessageCircle, Calendar, Flag, Plus } from "lucide-react"
import { useState } from "react"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  priority: string
  dueDate: string
  tags: string[]
  comments: number
}

interface TaskColumn {
  todo: Task[]
  inProgress: Task[]
  review: Task[]
  completed: Task[]
  cancelled: Task[]
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
}

interface EnhancedKanbanBoardProps {
  tasks: TaskColumn
  teamMembers: TeamMember[]
}

const columnConfig = [
  { key: "todo" as keyof TaskColumn, title: "할 일", color: "bg-gray-100 text-gray-800" },
  { key: "inProgress" as keyof TaskColumn, title: "진행 중", color: "bg-blue-100 text-blue-800" },
  { key: "review" as keyof TaskColumn, title: "검토", color: "bg-yellow-100 text-yellow-800" },
  { key: "completed" as keyof TaskColumn, title: "완료", color: "bg-green-100 text-green-800" },
  { key: "cancelled" as keyof TaskColumn, title: "취소", color: "bg-red-100 text-red-800" },
]

const priorityColors = {
  높음: "text-red-600",
  중간: "text-yellow-600",
  낮음: "text-green-600",
}

export function EnhancedKanbanBoard({ tasks, teamMembers }: EnhancedKanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleTaskMove = (taskId: string, fromColumn: string, toColumn: string) => {
    // In a real app, this would update the task status via API
    console.log(`Moving task ${taskId} from ${fromColumn} to ${toColumn}`)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columnConfig.map((column) => (
          <Card key={column.key} className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {column.title}
                  <Badge variant="secondary" className={column.color}>
                    {tasks[column.key].length}
                  </Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks[column.key].map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-background rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{task.dueDate.slice(5)}</span>
                        </div>
                      </div>
                      <Flag className={`h-3 w-3 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {task.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{task.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {teamMembers.find((m) => m.name === task.assignee)?.avatar || task.assignee.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {teamMembers.find((m) => m.name === task.assignee)?.role || "팀원"}
                          </span>
                          <span className="text-xs font-medium">{task.assignee}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{task.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {tasks[column.key].length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">작업이 없습니다</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          isOpen={isTaskDialogOpen}
          onClose={() => {
            setIsTaskDialogOpen(false)
            setSelectedTask(null)
          }}
          teamMembers={teamMembers}
          onTaskMove={handleTaskMove}
        />
      )}
    </div>
  )
}
