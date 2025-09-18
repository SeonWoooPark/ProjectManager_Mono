import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Progress } from "@components/ui/progress"
import { ReadOnlyKanbanBoard } from "./read-only-kanban-board"
import { Eye, Calendar, User } from "lucide-react"
import { useState } from "react"

// Mock data for member's assigned projects
const memberProjects = [
  {
    id: "1",
    name: "모바일 앱 개발",
    description: "새로운 모바일 애플리케이션 개발 프로젝트",
    progress: 75,
    status: "진행 중",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    role: "개발자",
    myTasks: {
      total: 8,
      completed: 6,
      inProgress: 2,
      todo: 0,
    },
    allTasks: {
      todo: [
        { id: "1", title: "API 문서 작성", assignee: "김철수", isMyTask: true },
        { id: "2", title: "테스트 케이스 작성", assignee: "박민수", isMyTask: false },
      ],
      inProgress: [
        { id: "3", title: "로그인 기능 구현", assignee: "김철수", isMyTask: true },
        { id: "4", title: "UI 디자인 수정", assignee: "이영희", isMyTask: false },
      ],
      review: [{ id: "5", title: "회원가입 기능", assignee: "김철수", isMyTask: true }],
      completed: [
        { id: "6", title: "프로젝트 초기 설정", assignee: "박민수", isMyTask: false },
        { id: "7", title: "데이터베이스 설계", assignee: "김철수", isMyTask: true },
      ],
      cancelled: [],
    },
  },
  {
    id: "2",
    name: "웹사이트 리뉴얼",
    description: "기존 웹사이트의 UI/UX 개선",
    progress: 45,
    status: "진행 중",
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    role: "개발자",
    myTasks: {
      total: 4,
      completed: 2,
      inProgress: 1,
      todo: 1,
    },
    allTasks: {
      todo: [{ id: "8", title: "반응형 테스트", assignee: "김철수", isMyTask: true }],
      inProgress: [{ id: "9", title: "반응형 레이아웃 구현", assignee: "김철수", isMyTask: true }],
      review: [],
      completed: [
        { id: "10", title: "와이어프레임 검토", assignee: "김철수", isMyTask: true },
        { id: "11", title: "콘텐츠 마이그레이션", assignee: "최영수", isMyTask: false },
      ],
      cancelled: [],
    },
  },
]

export function MemberProjectsView() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const selectedProjectData = memberProjects.find((p) => p.id === selectedProject)

  if (selectedProject && selectedProjectData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedProject(null)} className="mb-2 p-0 h-auto">
              ← 프로젝트 목록으로 돌아가기
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{selectedProjectData.name}</h1>
            <p className="text-muted-foreground">{selectedProjectData.description}</p>
          </div>
          <div className="text-right">
            <Badge variant={selectedProjectData.status === "진행 중" ? "default" : "secondary"}>
              {selectedProjectData.status}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">내 역할: {selectedProjectData.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">전체 진행률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">{selectedProjectData.progress}%</div>
              <Progress value={selectedProjectData.progress} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">내 작업 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {selectedProjectData.myTasks.completed}/{selectedProjectData.myTasks.total}
              </div>
              <p className="text-xs text-muted-foreground">완료된 작업</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">프로젝트 기간</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-foreground">
                {selectedProjectData.startDate} ~ {selectedProjectData.endDate}
              </div>
              <p className="text-xs text-muted-foreground">시작일 ~ 마감일</p>
            </CardContent>
          </Card>
        </div>

        <ReadOnlyKanbanBoard tasks={selectedProjectData.allTasks} currentUser="김철수" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">내 프로젝트</h1>
        <p className="text-muted-foreground">할당된 프로젝트들의 상세 정보와 진행 상황</p>
      </div>

      <div className="grid gap-6">
        {memberProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant={project.status === "진행 중" ? "default" : "secondary"}>{project.status}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">역할: {project.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">전체 진행률</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">내 작업 진행률</span>
                    <span className="font-medium">
                      {Math.round((project.myTasks.completed / project.myTasks.total) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.round((project.myTasks.completed / project.myTasks.total) * 100)}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {project.startDate} ~ {project.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      내 작업: {project.myTasks.completed}/{project.myTasks.total}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProject(project.id)}
                  className="bg-transparent"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  상세보기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
