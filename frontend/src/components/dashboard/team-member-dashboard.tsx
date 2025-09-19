import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Progress } from "@components/ui/progress"
import { Briefcase, CheckSquare, Clock, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { Link } from 'react-router-dom'

// Mock data for assigned projects and tasks
const stats = [
  {
    title: "할당된 프로젝트",
    value: "3",
    change: "+1",
    changeType: "increase" as const,
    icon: Briefcase,
  },
  {
    title: "진행 중인 작업",
    value: "5",
    change: "+2",
    changeType: "increase" as const,
    icon: Clock,
  },
  {
    title: "완료한 작업",
    value: "12",
    change: "+4",
    changeType: "increase" as const,
    icon: CheckSquare,
  },
  {
    title: "이번 주 마감",
    value: "2",
    change: "0",
    changeType: "neutral" as const,
    icon: Calendar,
  },
]

const assignedProjects = [
  {
    id: "1",
    name: "모바일 앱 개발",
    description: "새로운 모바일 애플리케이션 개발 프로젝트",
    progress: 75,
    status: "진행 중",
    dueDate: "2024-02-15",
    myTasks: {
      total: 8,
      completed: 6,
      inProgress: 2,
    },
    role: "개발자",
  },
  {
    id: "2",
    name: "웹사이트 리뉴얼",
    description: "기존 웹사이트의 UI/UX 개선",
    progress: 45,
    status: "진행 중",
    dueDate: "2024-02-28",
    myTasks: {
      total: 4,
      completed: 2,
      inProgress: 1,
    },
    role: "개발자",
  },
  {
    id: "3",
    name: "마케팅 캠페인",
    description: "신제품 출시 마케팅 전략 수립",
    progress: 90,
    status: "검토 중",
    dueDate: "2024-01-30",
    myTasks: {
      total: 2,
      completed: 2,
      inProgress: 0,
    },
    role: "기술 지원",
  },
]

const urgentTasks = [
  {
    id: "1",
    title: "로그인 API 구현",
    project: "모바일 앱 개발",
    dueDate: "2024-01-20",
    priority: "높음",
    status: "진행 중",
  },
  {
    id: "2",
    title: "데이터베이스 최적화",
    project: "웹사이트 리뉴얼",
    dueDate: "2024-01-22",
    priority: "중간",
    status: "할 일",
  },
]

const recentActivities = [
  {
    id: "1",
    message: "'회원가입 기능' 작업을 완료했습니다",
    time: "1시간 전",
    project: "모바일 앱 개발",
  },
  {
    id: "2",
    message: "'UI 디자인 수정' 작업을 시작했습니다",
    time: "3시간 전",
    project: "웹사이트 리뉴얼",
  },
  {
    id: "3",
    message: "'API 문서 검토' 작업에 댓글을 남겼습니다",
    time: "5시간 전",
    project: "모바일 앱 개발",
  },
]

export function TeamMemberDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">내 대시보드</h1>
        <p className="text-muted-foreground">할당된 프로젝트와 작업을 확인하고 관리하세요</p>
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

      {/* Assigned Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>할당된 프로젝트</CardTitle>
              <CardDescription>참여 중인 프로젝트들의 진행 상황</CardDescription>
            </div>
            <Link  to="/dashboard/member/projects">
              <Button variant="outline" size="sm" className="bg-transparent">
                모두 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={project.status === "진행 중" ? "default" : "secondary"}>{project.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">역할: {project.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">전체 진행률</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      내 작업: {project.myTasks.completed}/{project.myTasks.total}
                    </span>
                    <span className="text-muted-foreground">마감: {project.dueDate}</span>
                  </div>
                  <Link  to={`/dashboard/member/projects/${project.id}`}>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      상세보기
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Urgent Tasks and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>내가 수행한 최근 활동 내역</CardDescription>
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
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              긴급 작업
            </CardTitle>
            <CardDescription>마감일이 임박한 작업들</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    <Badge
                      variant={
                        task.priority === "높음" ? "destructive" : task.priority === "중간" ? "default" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{task.project}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">마감: {task.dueDate}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link  to="/dashboard/member/tasks">
                <Button className="w-full bg-transparent" variant="outline" size="sm">
                  모든 작업 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
