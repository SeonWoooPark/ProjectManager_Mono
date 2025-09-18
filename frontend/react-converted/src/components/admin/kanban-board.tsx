import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Task {
  id: string
  title: string
  assignee: string
}

interface TaskColumn {
  todo: Task[]
  inProgress: Task[]
  review: Task[]
  completed: Task[]
  cancelled: Task[]
}

interface KanbanBoardProps {
  tasks: TaskColumn
}

const columnConfig = [
  { key: "todo" as keyof TaskColumn, title: "할 일", color: "bg-gray-100 text-gray-800" },
  { key: "inProgress" as keyof TaskColumn, title: "진행 중", color: "bg-blue-100 text-blue-800" },
  { key: "review" as keyof TaskColumn, title: "검토", color: "bg-yellow-100 text-yellow-800" },
  { key: "completed" as keyof TaskColumn, title: "완료", color: "bg-green-100 text-green-800" },
  { key: "cancelled" as keyof TaskColumn, title: "취소", color: "bg-red-100 text-red-800" },
]

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">작업 현황 (칸반 보드)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columnConfig.map((column) => (
          <Card key={column.key} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {column.title}
                <Badge variant="secondary" className={column.color}>
                  {tasks[column.key].length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks[column.key].map((task) => (
                <div key={task.id} className="p-3 bg-muted rounded-lg border">
                  <h4 className="text-sm font-medium text-foreground mb-2">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{task.assignee.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{task.assignee}</span>
                  </div>
                </div>
              ))}
              {tasks[column.key].length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">작업이 없습니다</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
