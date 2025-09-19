import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Progress } from "@components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { 
  ArrowLeft, Calendar, Clock, Users, CheckCircle, 
  AlertCircle, FileText, MessageSquare, Activity 
} from "lucide-react"

// Mock data for project details
const mockProjects: { [key: string]: any } = {
  "1": {
    id: "1",
    name: "모바일 앱 개발",
    description: "새로운 모바일 애플리케이션 개발 프로젝트",
    progress: 75,
    status: "진행 중",
    priority: "높음",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    role: "개발자",
    manager: "박지민",
    team: [
      { id: 1, name: "김철수", role: "개발자", status: "활동 중" },
      { id: 2, name: "이영희", role: "디자이너", status: "활동 중" },
      { id: 3, name: "박민수", role: "기획자", status: "활동 중" },
      { id: 4, name: "최영수", role: "개발자", status: "활동 중" },
    ],
    myTasks: {
      total: 8,
      completed: 6,
      inProgress: 2,
      todo: 0,
    },
    tasks: [
      { id: "t1", title: "로그인 API 구현", status: "진행 중", priority: "높음", assignee: "김철수", dueDate: "2024-01-20" },
      { id: "t2", title: "회원가입 기능", status: "완료", priority: "높음", assignee: "김철수", dueDate: "2024-01-15" },
      { id: "t3", title: "UI 디자인 수정", status: "진행 중", priority: "중간", assignee: "이영희", dueDate: "2024-01-22" },
      { id: "t4", title: "API 문서 작성", status: "할 일", priority: "낮음", assignee: "김철수", dueDate: "2024-01-25" },
      { id: "t5", title: "테스트 케이스 작성", status: "할 일", priority: "중간", assignee: "박민수", dueDate: "2024-01-28" },
    ],
    recentActivities: [
      { id: 1, user: "김철수", action: "작업을 완료했습니다", target: "회원가입 기능", time: "1시간 전" },
      { id: 2, user: "이영희", action: "댓글을 남겼습니다", target: "UI 디자인 수정", time: "3시간 전" },
      { id: 3, user: "박민수", action: "작업을 시작했습니다", target: "테스트 케이스 작성", time: "5시간 전" },
    ],
  },
  "2": {
    id: "2",
    name: "웹사이트 리뉴얼",
    description: "기존 웹사이트의 UI/UX 개선",
    progress: 45,
    status: "진행 중",
    priority: "중간",
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    role: "개발자",
    manager: "이상훈",
    team: [
      { id: 1, name: "김철수", role: "개발자", status: "활동 중" },
      { id: 2, name: "정수진", role: "디자이너", status: "활동 중" },
      { id: 3, name: "최영수", role: "개발자", status: "활동 중" },
    ],
    myTasks: {
      total: 4,
      completed: 2,
      inProgress: 1,
      todo: 1,
    },
    tasks: [
      { id: "t6", title: "반응형 레이아웃 구현", status: "진행 중", priority: "높음", assignee: "김철수", dueDate: "2024-01-30" },
      { id: "t7", title: "반응형 테스트", status: "할 일", priority: "중간", assignee: "김철수", dueDate: "2024-02-05" },
      { id: "t8", title: "와이어프레임 검토", status: "완료", priority: "높음", assignee: "김철수", dueDate: "2024-01-20" },
      { id: "t9", title: "콘텐츠 마이그레이션", status: "완료", priority: "중간", assignee: "최영수", dueDate: "2024-01-18" },
    ],
    recentActivities: [
      { id: 1, user: "김철수", action: "작업을 시작했습니다", target: "반응형 레이아웃 구현", time: "2시간 전" },
      { id: 2, user: "정수진", action: "파일을 업로드했습니다", target: "디자인 가이드", time: "4시간 전" },
      { id: 3, user: "최영수", action: "작업을 완료했습니다", target: "콘텐츠 마이그레이션", time: "어제" },
    ],
  },
  "3": {
    id: "3",
    name: "마케팅 캠페인",
    description: "신제품 출시 마케팅 전략 수립",
    progress: 90,
    status: "검토 중",
    priority: "낮음",
    startDate: "2024-01-01",
    endDate: "2024-01-30",
    role: "기술 지원",
    manager: "김민정",
    team: [
      { id: 1, name: "김철수", role: "기술 지원", status: "활동 중" },
      { id: 2, name: "박소영", role: "마케터", status: "활동 중" },
      { id: 3, name: "이준호", role: "기획자", status: "활동 중" },
    ],
    myTasks: {
      total: 2,
      completed: 2,
      inProgress: 0,
      todo: 0,
    },
    tasks: [
      { id: "t10", title: "기술 문서 검토", status: "완료", priority: "중간", assignee: "김철수", dueDate: "2024-01-25" },
      { id: "t11", title: "시스템 연동 테스트", status: "완료", priority: "높음", assignee: "김철수", dueDate: "2024-01-26" },
    ],
    recentActivities: [
      { id: 1, user: "김철수", action: "작업을 완료했습니다", target: "시스템 연동 테스트", time: "오늘" },
      { id: 2, user: "박소영", action: "문서를 공유했습니다", target: "마케팅 전략", time: "어제" },
      { id: 3, user: "이준호", action: "회의를 예약했습니다", target: "최종 검토 회의", time: "2일 전" },
    ],
  }
}

export function ProjectDetailView() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const project = mockProjects[id || "1"]

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">프로젝트를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">요청하신 프로젝트가 존재하지 않거나 접근 권한이 없습니다.</p>
        <Button onClick={() => navigate("/dashboard/member/projects")}>
          프로젝트 목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료": return "bg-green-100 text-green-800"
      case "진행 중": return "bg-blue-100 text-blue-800"
      case "할 일": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "높음": return "destructive"
      case "중간": return "default"
      case "낮음": return "secondary"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard/member/projects")} 
          className="mb-4 p-0 h-auto hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          프로젝트 목록으로 돌아가기
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <Badge variant={project.status === "진행 중" ? "default" : "secondary"}>
                {project.status}
              </Badge>
              <Badge variant={getPriorityColor(project.priority)}>
                우선순위: {project.priority}
              </Badge>
              <span className="text-sm text-muted-foreground">내 역할: {project.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">전체 진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">{project.progress}%</div>
            <Progress value={project.progress} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">내 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {project.myTasks.completed}/{project.myTasks.total}
            </div>
            <p className="text-xs text-muted-foreground">
              진행 중: {project.myTasks.inProgress}, 할 일: {project.myTasks.todo}
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
              <span>{project.startDate}</span>
            </div>
            <div className="flex items-center text-sm mt-1">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{project.endDate}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">팀 구성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{project.team.length}명</div>
            <p className="text-xs text-muted-foreground">프로젝트 매니저: {project.manager}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            작업 목록
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            팀 멤버
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-2">
            <Activity className="h-4 w-4" />
            활동 내역
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FileText className="h-4 w-4" />
            파일
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            토론
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>작업 목록</CardTitle>
              <CardDescription>프로젝트에 할당된 모든 작업을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.tasks.map((task: any) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">담당: {task.assignee}</span>
                          <span className="text-xs text-muted-foreground">마감: {task.dueDate}</span>
                        </div>
                      </div>
                      {task.assignee === "김철수" && (
                        <Badge variant="outline" className="ml-4">내 작업</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>팀 멤버</CardTitle>
              <CardDescription>프로젝트에 참여 중인 팀원들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>PM</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{project.manager}</p>
                        <p className="text-sm text-muted-foreground">프로젝트 매니저</p>
                      </div>
                    </div>
                    <Badge>매니저</Badge>
                  </div>
                </div>
                {project.team.map((member: any) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{member.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>활동 내역</CardTitle>
              <CardDescription>프로젝트의 최근 활동들</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {activity.user.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>님이{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <p className="text-sm font-medium mt-1">{activity.target}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>파일</CardTitle>
              <CardDescription>프로젝트 관련 문서 및 파일</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">아직 업로드된 파일이 없습니다</p>
                <Button variant="outline" className="mt-4">파일 업로드</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions">
          <Card>
            <CardHeader>
              <CardTitle>토론</CardTitle>
              <CardDescription>프로젝트 관련 토론 및 의견 교환</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">아직 토론이 없습니다</p>
                <Button variant="outline" className="mt-4">새 토론 시작</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}