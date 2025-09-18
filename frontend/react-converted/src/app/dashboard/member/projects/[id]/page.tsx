import { TeamMemberSidebar } from "@/components/dashboard/team-member-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar } from "lucide-react"
import { Link } from 'react-router-dom'

// Mock project detail data
const projectDetail = {
  id: "1",
  name: "모바일 앱 개발",
  description:
    "새로운 모바일 애플리케이션 개발 프로젝트입니다. React Native를 사용하여 iOS와 Android 플랫폼을 모두 지원하는 크로스 플랫폼 앱을 개발합니다.",
  progress: 75,
  status: "진행 중",
  dueDate: "2024-02-15",
  startDate: "2024-01-01",
  teamMembers: [
    { name: "김철수", role: "개발자", avatar: "KCS" },
    { name: "이영희", role: "디자이너", avatar: "LYH" },
    { name: "박민수", role: "개발자", avatar: "PMS" },
  ],
  myTasks: [
    {
      id: "1",
      title: "로그인 API 구현",
      status: "완료",
      priority: "높음",
      dueDate: "2024-01-20",
    },
    {
      id: "2",
      title: "회원가입 기능 개발",
      status: "진행 중",
      priority: "높음",
      dueDate: "2024-01-25",
    },
    {
      id: "3",
      title: "프로필 페이지 UI",
      status: "할 일",
      priority: "중간",
      dueDate: "2024-01-30",
    },
  ],
  totalTasks: 24,
  completedTasks: 18,
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link  to="/dashboard/member/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                프로젝트 목록
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{projectDetail.name}</h1>
              <p className="text-muted-foreground">{projectDetail.description}</p>
            </div>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">전체 진행률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">{projectDetail.progress}%</div>
                <Progress value={projectDetail.progress} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">작업 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {projectDetail.completedTasks}/{projectDetail.totalTasks}
                </div>
                <p className="text-sm text-muted-foreground">완료된 작업</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">팀원 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{projectDetail.teamMembers.length}</div>
                <p className="text-sm text-muted-foreground">참여 중인 팀원</p>
              </CardContent>
            </Card>
          </div>

          {/* My Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>내 할당 작업</CardTitle>
              <CardDescription>이 프로젝트에서 나에게 할당된 작업들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectDetail.myTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === "높음"
                              ? "destructive"
                              : task.priority === "중간"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === "완료" ? "default" : "outline"}>{task.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>마감: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
