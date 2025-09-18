import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Textarea } from "@components/ui/textarea"
import { CheckSquare, Clock, AlertCircle, Calendar, Plus } from "lucide-react"
import { useState } from "react"

// Mock data for member's tasks
const memberTasks = [
  {
    id: "1",
    title: "로그인 API 구현",
    description: "사용자 인증을 위한 로그인 API 엔드포인트 개발",
    project: "모바일 앱 개발",
    status: "inProgress" as const,
    priority: "높음" as const,
    dueDate: "2024-01-20",
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    title: "데이터베이스 최적화",
    description: "쿼리 성능 개선 및 인덱스 최적화",
    project: "웹사이트 리뉴얼",
    status: "todo" as const,
    priority: "중간" as const,
    dueDate: "2024-01-22",
    createdDate: "2024-01-16",
  },
  {
    id: "3",
    title: "회원가입 기능 테스트",
    description: "회원가입 프로세스의 단위 테스트 및 통합 테스트",
    project: "모바일 앱 개발",
    status: "review" as const,
    priority: "중간" as const,
    dueDate: "2024-01-18",
    createdDate: "2024-01-10",
  },
  {
    id: "4",
    title: "프로젝트 초기 설정",
    description: "개발 환경 구성 및 기본 프로젝트 구조 설정",
    project: "모바일 앱 개발",
    status: "completed" as const,
    priority: "높음" as const,
    dueDate: "2024-01-12",
    createdDate: "2024-01-08",
  },
  {
    id: "5",
    title: "반응형 레이아웃 구현",
    description: "모바일 및 태블릿 화면에 대응하는 반응형 CSS 작성",
    project: "웹사이트 리뉴얼",
    status: "inProgress" as const,
    priority: "낮음" as const,
    dueDate: "2024-01-25",
    createdDate: "2024-01-17",
  },
]

const statusConfig = {
  todo: { label: "할 일", color: "bg-gray-100 text-gray-800", icon: Clock },
  inProgress: { label: "진행 중", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  review: { label: "검토", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  completed: { label: "완료", color: "bg-green-100 text-green-800", icon: CheckSquare },
}

const priorityConfig = {
  높음: { color: "destructive" as const },
  중간: { color: "default" as const },
  낮음: { color: "secondary" as const },
}

export function MemberTasksView() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    dueDate: "",
  })

  // Get unique projects for filter
  const uniqueProjects = Array.from(new Set(memberTasks.map((task) => task.project)))

  const filteredTasks = memberTasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter
    const projectMatch = projectFilter === "all" || task.project === projectFilter
    return statusMatch && projectMatch
  })

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // In a real app, this would update the task status via API
    console.log(`Task ${taskId} status changed to ${newStatus}`)
  }

  const handleCreateTask = () => {
    // In a real app, this would create a new task via API
    console.log("Creating new task:", newTask)
    setIsCreateDialogOpen(false)
    setNewTask({ title: "", description: "", project: "", dueDate: "" })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">내 작업</h1>
          <p className="text-muted-foreground">할당된 모든 작업을 확인하고 상태를 업데이트하세요</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />새 작업 만들기
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 작업 만들기</DialogTitle>
              <DialogDescription>새로운 작업을 생성하여 프로젝트에 추가하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">작업 제목</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="작업 제목을 입력하세요"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">작업 설명</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="작업에 대한 상세 설명을 입력하세요"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">프로젝트</Label>
                <Select value={newTask.project} onValueChange={(value) => setNewTask({ ...newTask, project: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="프로젝트 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">마감일</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateTask}>
                작업 생성
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = memberTasks.filter((task) => task.status === status).length
          return (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{config.label}</CardTitle>
                <config.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{count}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>작업 필터</CardTitle>
          <CardDescription>상태와 프로젝트로 작업을 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="inProgress">진행 중</SelectItem>
                  <SelectItem value="review">검토</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="프로젝트 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 프로젝트</SelectItem>
                  {uniqueProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const statusInfo = statusConfig[task.status]
          const priorityInfo = priorityConfig[task.priority]

          return (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityInfo.color}>{task.priority}</Badge>
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>마감: {task.dueDate}</span>
                    </div>
                    <span>프로젝트: {task.project}</span>
                  </div>

                  {task.status !== "completed" && (
                    <div className="flex gap-2">
                      {task.status === "todo" && (
                        <Button size="sm" onClick={() => handleStatusChange(task.id, "inProgress")}>
                          시작하기
                        </Button>
                      )}
                      {task.status === "inProgress" && (
                        <Button size="sm" onClick={() => handleStatusChange(task.id, "review")}>
                          검토 요청
                        </Button>
                      )}
                      {task.status === "review" && (
                        <Button size="sm" variant="outline" className="bg-transparent">
                          검토 대기 중
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">선택한 조건에 맞는 작업이 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
