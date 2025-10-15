import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Building2, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Settings } from "lucide-react"
import { Link } from 'react-router-dom'

// Mock data
const stats = [
  {
    title: "총 회사 수",
    value: "24",
    change: "+3",
    changeType: "increase" as const,
    icon: Building2,
  },
  {
    title: "총 사용자 수",
    value: "156",
    change: "+12",
    changeType: "increase" as const,
    icon: Users,
  },
  {
    title: "대기 중인 요청",
    value: "5",
    change: "0",
    changeType: "neutral" as const,
    icon: Clock,
  },
  {
    title: "이번 달 승인",
    value: "8",
    change: "+2",
    changeType: "increase" as const,
    icon: CheckCircle,
  },
]

const pendingRequests = [
  {
    id: "1",
    companyName: "테크스타트업",
    requesterName: "김철수",
    requesterEmail: "kim@techstartup.com",
    industry: "IT/소프트웨어",
    employeeCount: "1-10명",
    requestDate: "2024-01-15",
    status: "pending" as const,
  },
  {
    id: "2",
    companyName: "디자인스튜디오",
    requesterName: "이영희",
    requesterEmail: "lee@designstudio.com",
    industry: "서비스업",
    employeeCount: "11-50명",
    requestDate: "2024-01-14",
    status: "pending" as const,
  },
]

const companyManagementData = [
  {
    id: "1",
    name: "테크이노베이션",
    status: "활성",
    userCount: 25,
    projectCount: 8,
    lastActivity: "2024-01-18",
    plan: "프리미엄",
  },
  {
    id: "2",
    name: "크리에이티브랩",
    status: "활성",
    userCount: 12,
    projectCount: 4,
    lastActivity: "2024-01-17",
    plan: "기본",
  },
  {
    id: "3",
    name: "스타트업허브",
    status: "비활성",
    userCount: 8,
    projectCount: 2,
    lastActivity: "2024-01-10",
    plan: "기본",
  },
]

export function SystemAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">시스템 관리 대시보드</h1>
        <p className="text-muted-foreground">전체 시스템 현황을 확인하고 관리하세요</p>
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

      {/* Pending Requests Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                승인 대기 중인 요청
              </CardTitle>
              <CardDescription>새로운 회사 등록 요청을 검토하고 승인하세요</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {pendingRequests.length}개 대기
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>승인 대기 중인 요청을 확인하려면 <Link to="/admin/system/requests" className="text-primary hover:underline">승인 요청 관리</Link> 페이지로 이동하세요.</p>
          </div>
        </CardContent>
      </Card>

      {/* Company Management */}
      <div className="grid grid-cols-1 gap-6">

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  회사 관리 현황
                </CardTitle>
                <CardDescription>등록된 회사들의 현재 상태</CardDescription>
              </div>
              <Link  to="/admin/system/companies">
                <Button variant="outline" size="sm" className="bg-transparent">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyManagementData.map((company) => (
                <div key={company.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">{company.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>사용자: {company.userCount}명</span>
                        <span>•</span>
                        <span>프로젝트: {company.projectCount}개</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={company.status === "활성" ? "default" : "secondary"}>{company.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{company.plan} 플랜</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>마지막 활동: {company.lastActivity}</span>
                    <Link  to={`/admin/system/companies/${company.id}`}>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        관리
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link  to="/admin/system/users">
                <Button className="w-full bg-transparent" variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  사용자 관리
                </Button>
              </Link>
              <Link  to="/admin/system/settings">
                <Button className="w-full bg-transparent" variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  시스템 설정
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
