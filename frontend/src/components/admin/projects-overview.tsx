import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Progress } from "@components/ui/progress"
import { Eye, Users, Calendar } from "lucide-react"
import { Link } from 'react-router-dom'

// Mock projects data
const projects = [
  {
    id: "1",
    name: "모바일 앱 개발",
    description: "새로운 모바일 애플리케이션 개발 프로젝트",
    progress: 75,
    status: "진행 중",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    teamMembers: [
      { id: "1", name: "김철수", role: "개발자" },
      { id: "2", name: "이영희", role: "디자이너" },
      { id: "3", name: "박민수", role: "기획자" },
    ],
    totalTasks: 24,
    completedTasks: 18,
    tasks: {
      todo: [
        { id: "1", title: "API 문서 작성", assignee: "김철수" },
        { id: "2", title: "테스트 케이스 작성", assignee: "박민수" },
      ],
      inProgress: [
        { id: "3", title: "로그인 기능 구현", assignee: "김철수" },
        { id: "4", title: "UI 디자인 수정", assignee: "이영희" },
      ],
      review: [{ id: "5", title: "회원가입 기능", assignee: "김철수" }],
      completed: [
        { id: "6", title: "프로젝트 초기 설정", assignee: "박민수" },
        { id: "7", title: "데이터베이스 설계", assignee: "김철수" },
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
    teamMembers: [
      { id: "4", name: "정수진", role: "개발자" },
      { id: "5", name: "최영수", role: "마케터" },
    ],
    totalTasks: 16,
    completedTasks: 7,
    tasks: {
      todo: [{ id: "8", title: "콘텐츠 마이그레이션", assignee: "최영수" }],
      inProgress: [{ id: "9", title: "반응형 레이아웃 구현", assignee: "정수진" }],
      review: [],
      completed: [{ id: "10", title: "와이어프레임 작성", assignee: "최영수" }],
      cancelled: [],
    },
  },
]

export function ProjectsOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">프로젝트 관리</h1>
        <p className="text-muted-foreground">모든 프로젝트의 진행 상황을 확인하고 관리하세요</p>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <Badge variant={project.status === "진행 중" ? "default" : "secondary"}>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {project.startDate} ~ {project.endDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{project.teamMembers.length}명</span>
                  </div>
                  <span className="text-muted-foreground">
                    작업: {project.completedTasks}/{project.totalTasks}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.teamMembers.slice(0, 3).map((member, index) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                      title={member.name}
                    >
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {project.teamMembers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                </div>

                <Link  to={`/admin/company/projects/${project.id}`}>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Eye className="h-3 w-3 mr-1" />
                    상세보기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
