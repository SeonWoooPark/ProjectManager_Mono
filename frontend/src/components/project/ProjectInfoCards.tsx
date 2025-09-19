import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Progress } from "@components/ui/progress"
import { Calendar, Clock } from "lucide-react"

interface ProjectInfoCardsProps {
  progress: number
  myTasks: {
    total: number
    completed: number
    inProgress: number
    todo: number
  }
  startDate: string
  endDate: string
  teamSize: number
  manager: string
}

export function ProjectInfoCards({
  progress,
  myTasks,
  startDate,
  endDate,
  teamSize,
  manager
}: ProjectInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">전체 진행률</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">{progress}%</div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">내 작업</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {myTasks.completed}/{myTasks.total}
          </div>
          <p className="text-xs text-muted-foreground">
            진행 중: {myTasks.inProgress}, 할 일: {myTasks.todo}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">프로젝트 기간</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{startDate}</span>
          </div>
          <div className="flex items-center text-sm mt-1">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{endDate}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">팀 구성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{teamSize}명</div>
          <p className="text-xs text-muted-foreground">프로젝트 매니저: {manager}</p>
        </CardContent>
      </Card>
    </div>
  )
}