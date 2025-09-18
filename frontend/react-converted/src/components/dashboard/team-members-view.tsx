import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Mail, Calendar, Briefcase } from "lucide-react"

// Mock data for team members
const teamMembers = [
  {
    id: "1",
    name: "김철수",
    email: "kim@company.com",
    role: "개발자",
    department: "개발팀",
    joinDate: "2023-03-15",
    status: "active" as const,
    currentProjects: ["모바일 앱 개발", "웹사이트 리뉴얼"],
    completedTasks: 24,
    isCurrentUser: true,
  },
  {
    id: "2",
    name: "이영희",
    email: "lee@company.com",
    role: "디자이너",
    department: "디자인팀",
    joinDate: "2023-01-20",
    status: "active" as const,
    currentProjects: ["모바일 앱 개발", "마케팅 캠페인"],
    completedTasks: 18,
    isCurrentUser: false,
  },
  {
    id: "3",
    name: "박민수",
    email: "park@company.com",
    role: "기획자",
    department: "기획팀",
    joinDate: "2022-11-10",
    status: "active" as const,
    currentProjects: ["모바일 앱 개발"],
    completedTasks: 32,
    isCurrentUser: false,
  },
  {
    id: "4",
    name: "정수진",
    email: "jung@company.com",
    role: "개발자",
    department: "개발팀",
    joinDate: "2023-06-01",
    status: "active" as const,
    currentProjects: ["웹사이트 리뉴얼"],
    completedTasks: 15,
    isCurrentUser: false,
  },
  {
    id: "5",
    name: "최영수",
    email: "choi@company.com",
    role: "마케터",
    department: "마케팅팀",
    joinDate: "2023-04-12",
    status: "active" as const,
    currentProjects: ["마케팅 캠페인", "웹사이트 리뉴얼"],
    completedTasks: 21,
    isCurrentUser: false,
  },
]

const departmentStats = [
  { name: "개발팀", count: 2, color: "bg-blue-100 text-blue-800" },
  { name: "디자인팀", count: 1, color: "bg-purple-100 text-purple-800" },
  { name: "기획팀", count: 1, color: "bg-green-100 text-green-800" },
  { name: "마케팅팀", count: 1, color: "bg-orange-100 text-orange-800" },
]

export function TeamMembersView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">팀원 현황</h1>
        <p className="text-muted-foreground">우리 팀의 모든 구성원 정보를 확인하세요</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 팀원 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">활성 멤버</p>
          </CardContent>
        </Card>

        {departmentStats.slice(0, 3).map((dept) => (
          <Card key={dept.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{dept.name}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{dept.count}</div>
              <p className="text-xs text-muted-foreground">명</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle>부서별 현황</CardTitle>
          <CardDescription>각 부서의 팀원 분포</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {departmentStats.map((dept) => (
              <Badge key={dept.name} variant="secondary" className={dept.color}>
                {dept.name}: {dept.count}명
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>팀원 목록</CardTitle>
          <CardDescription>모든 팀원의 상세 정보 (읽기 전용)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`border rounded-lg p-4 ${member.isCurrentUser ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-lg font-medium">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{member.name}</h3>
                        {member.isCurrentUser && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            나
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.role} • {member.department}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>입사: {member.joinDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={member.status === "active" ? "default" : "secondary"}>
                      {member.status === "active" ? "활성" : "비활성"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">완료 작업: {member.completedTasks}개</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">참여 중인 프로젝트:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.currentProjects.map((project) => (
                      <Badge key={project} variant="outline" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
