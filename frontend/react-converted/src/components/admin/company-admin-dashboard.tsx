import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderPlus, Users, Briefcase, TrendingUp, Calendar, CheckCircle, UserPlus, Clock } from "lucide-react"
import { Link } from 'react-router-dom'

// Mock data
const stats = [
  {
    title: "진행 중인 프로젝트",
    value: "8",
    change: "+2",
    changeType: "increase" as const,
    icon: Briefcase,
  },
  {
    title: "팀원 수",
    value: "12",
    change: "+1",
    changeType: "increase" as const,
    icon: Users,
  },
  {
    title: "완료된 작업",
    value: "45",
    change: "+8",
    changeType: "increase" as const,
    icon: CheckCircle,
  },
  {
    title: "이번 달 마감",
    value: "3",
    change: "0",
    changeType: "neutral" as const,
    icon: Calendar,
  },
]

const projects = [
  {
    id: "1",
    name: "모바일 앱 개발",
    description: "새로운 모바일 애플리케이션 개발 프로젝트",
    progress: 75,
    status: "진행 중",
    dueDate: "2024-02-15",
    teamMembers: ["김철수", "이영희", "박민수"],
    totalTasks: 24,
    completedTasks: 18,
  },
  {
    id: "2",
    name: "웹사이트 리뉴얼",
    description: "기존 웹사이트의 UI/UX 개선",
    progress: 45,
    status: "진행 중",
    dueDate: "2024-02-28",
    teamMembers: ["정수진", "최영수"],
    totalTasks: 16,
    completedTasks: 7,
  },
  {
    id: "3",
    name: "마케팅 캠페인",
    description: "신제품 출시 마케팅 전략 수립",
    progress: 90,
    status: "검토 중",
    dueDate: "2024-01-30",
    teamMembers: ["한지민", "오성호", "임다은"],
    totalTasks: 12,
    completedTasks: 11,
  },
]

const recentActivities = [
  {
    id: "1",
    message: "김철수가 '로그인 기능 구현' 작업을 완료했습니다",
    time: "30분 전",
    project: "모바일 앱 개발",
  },
  {
    id: "2",
    message: "새로운 팀원 '신입사원'이 팀에 합류했습니다",
    time: "2시간 전",
    project: "전체",
  },
  {
    id: "3",
    message: "이영희가 '디자인 시안' 작업을 시작했습니다",
    time: "4시간 전",
    project: "웹사이트 리뉴얼",
  },
]

const joinRequests = [
  {
    id: "1",
    name: "김민지",
    email: "minji.kim@example.com",
    requestDate: "2024-01-18",
    message: "프론트엔드 개발자로 지원합니다. React와 TypeScript 경험이 있습니다.",
  },
  {
    id: "2",
    name: "박준호",
    email: "junho.park@example.com",
    requestDate: "2024-01-17",
    message: "백엔드 개발 경험을 바탕으로 팀에 기여하고 싶습니다.",
  },
  {
    id: "3",
    name: "이서연",
    email: "seoyeon.lee@example.com",
    requestDate: "2024-01-16",
    message: "UI/UX 디자이너로 참여하여 사용자 경험 개선에 도움이 되고 싶습니다.",
  },
]

export function CompanyAdminDashboard() {
  const handleApproveRequest = (requestId: string) => {
    console.log(`Approving join request: ${requestId}`)
  }

  const handleRejectRequest = (requestId: string) => {
    console.log(`Rejecting join request: ${requestId}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">프로젝트 관리 대시보드</h1>
          <p className="text-muted-foreground">팀의 프로젝트 현황을 확인하고 관리하세요</p>
        </div>
        <Link  to="/admin/company/create-project">
          <Button className="gap-2">
            <FolderPlus className="h-4 w-4" />새 프로젝트
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.changeType === "increase" && (
                  <>
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-primary">{stat.change}</span>
                  </>
                )}
                {stat.changeType === "neutral" && <span className="text-muted-foreground">{stat.change}</span>}
                <span className="text-muted-foreground">지난 주 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>프로젝트 현황</CardTitle>
              <CardDescription>진행 중인 프로젝트들의 진척률과 상태</CardDescription>
            </div>
            <Link  to="/admin/company/projects">
              <Button variant="outline" size="sm" className="bg-transparent">
                모두 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Badge variant={project.status === "진행 중" ? "default" : "secondary"}>{project.status}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      작업: {project.completedTasks}/{project.totalTasks}
                    </span>
                    <span className="text-muted-foreground">마감: {project.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{project.teamMembers.length}명</span>
                    </div>
                    <Link  to={`/admin/company/projects/${project.id}`}>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        상세보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Join Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>팀에서 발생한 최근 활동 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="border-l-2 border-primary pl-4">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.project}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  새로운 팀원 가입 요청
                </CardTitle>
                <CardDescription>승인 대기 중인 가입 요청</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {joinRequests.length}건
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{request.name}</h4>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{request.requestDate}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{request.message}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApproveRequest(request.id)} className="flex-1">
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 bg-transparent"
                    >
                      거절
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Link  to="/admin/company/team">
              <Button className="w-full mt-4 bg-transparent" variant="outline" size="sm">
                모든 가입 요청 보기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
