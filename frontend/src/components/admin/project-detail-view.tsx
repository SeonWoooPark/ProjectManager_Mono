import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Progress } from "@components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { EnhancedKanbanBoard } from "./enhanced-kanban-board"
import { ProjectTimeline } from "./project-timeline"
import { TaskCreationDialog } from "./task-creation-dialog"
import { ProjectSettings } from "./project-settings"
import { Plus, Calendar, Users, BarChart3, Settings, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Mock project data
const projectsData = {
  "1": {
    id: "1",
    name: "모바일 앱 개발",
    description: "새로운 모바일 애플리케이션 개발 프로젝트",
    progress: 75,
    status: "진행 중",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    teamMembers: [
      { id: "1", name: "김철수", role: "개발자", avatar: "김" },
      { id: "2", name: "이영희", role: "디자이너", avatar: "이" },
      { id: "3", name: "박민수", role: "기획자", avatar: "박" },
    ],
    tasks: {
      todo: [
        {
          id: "1",
          title: "API 문서 작성",
          description: "REST API 엔드포인트 문서화",
          assignee: "김철수",
          priority: "중간",
          dueDate: "2024-01-25",
          tags: ["문서", "API"],
          comments: 2,
        },
        {
          id: "2",
          title: "테스트 케이스 작성",
          description: "단위 테스트 및 통합 테스트 케이스 작성",
          assignee: "박민수",
          priority: "높음",
          dueDate: "2024-01-22",
          tags: ["테스트"],
          comments: 0,
        },
      ],
      inProgress: [
        {
          id: "3",
          title: "로그인 기능 구현",
          description: "사용자 인증 및 세션 관리 구현",
          assignee: "김철수",
          priority: "높음",
          dueDate: "2024-01-20",
          tags: ["개발", "인증"],
          comments: 5,
        },
        {
          id: "4",
          title: "UI 디자인 수정",
          description: "사용자 피드백 반영한 UI 개선",
          assignee: "이영희",
          priority: "중간",
          dueDate: "2024-01-24",
          tags: ["디자인", "UI"],
          comments: 3,
        },
      ],
      review: [
        {
          id: "5",
          title: "회원가입 기능",
          description: "신규 사용자 등록 프로세스",
          assignee: "김철수",
          priority: "높음",
          dueDate: "2024-01-18",
          tags: ["개발", "인증"],
          comments: 1,
        },
      ],
      completed: [
        {
          id: "6",
          title: "프로젝트 초기 설정",
          description: "개발 환경 구성 및 기본 구조 설정",
          assignee: "박민수",
          priority: "높음",
          dueDate: "2024-01-12",
          tags: ["설정"],
          comments: 0,
        },
        {
          id: "7",
          title: "데이터베이스 설계",
          description: "ERD 작성 및 테이블 구조 설계",
          assignee: "김철수",
          priority: "높음",
          dueDate: "2024-01-15",
          tags: ["데이터베이스", "설계"],
          comments: 2,
        },
      ],
      cancelled: [],
    },
    milestones: [
      {
        id: "1",
        title: "프로젝트 기획 완료",
        date: "2024-01-10",
        status: "completed" as const,
        description: "요구사항 분석 및 기술 스택 결정",
      },
      {
        id: "2",
        title: "MVP 개발 완료",
        date: "2024-01-30",
        status: "in-progress" as const,
        description: "핵심 기능 구현 완료",
      },
      {
        id: "3",
        title: "베타 테스트",
        date: "2024-02-10",
        status: "upcoming" as const,
        description: "내부 테스트 및 버그 수정",
      },
      {
        id: "4",
        title: "정식 출시",
        date: "2024-02-15",
        status: "upcoming" as const,
        description: "앱스토어 배포 및 마케팅 시작",
      },
    ],
  },
  "2": {
    id: "2",
    name: "웹사이트 리뉴얼",
    description: "기업 홈페이지 전면 개편 및 반응형 웹 구축",
    progress: 45,
    status: "진행 중",
    startDate: "2024-01-15",
    endDate: "2024-03-01",
    teamMembers: [
      { id: "1", name: "정수민", role: "웹 디자이너", avatar: "정" },
      { id: "2", name: "최영호", role: "프론트엔드 개발자", avatar: "최" },
      { id: "3", name: "한지원", role: "백엔드 개발자", avatar: "한" },
      { id: "4", name: "송미래", role: "기획자", avatar: "송" },
    ],
    tasks: {
      todo: [
        {
          id: "8",
          title: "SEO 최적화",
          description: "검색엔진 최적화 및 메타태그 설정",
          assignee: "최영호",
          priority: "중간",
          dueDate: "2024-02-20",
          tags: ["SEO", "최적화"],
          comments: 1,
        },
        {
          id: "9",
          title: "성능 테스트",
          description: "페이지 로딩 속도 및 성능 최적화 테스트",
          assignee: "한지원",
          priority: "높음",
          dueDate: "2024-02-25",
          tags: ["성능", "테스트"],
          comments: 0,
        },
      ],
      inProgress: [
        {
          id: "10",
          title: "메인 페이지 구현",
          description: "새로운 디자인의 메인 페이지 개발",
          assignee: "최영호",
          priority: "높음",
          dueDate: "2024-02-10",
          tags: ["개발", "메인페이지"],
          comments: 8,
        },
        {
          id: "11",
          title: "CMS 연동",
          description: "콘텐츠 관리 시스템 백엔드 연동",
          assignee: "한지원",
          priority: "높음",
          dueDate: "2024-02-15",
          tags: ["백엔드", "CMS"],
          comments: 4,
        },
      ],
      review: [
        {
          id: "12",
          title: "반응형 디자인 적용",
          description: "모바일 및 태블릿 반응형 레이아웃",
          assignee: "정수민",
          priority: "높음",
          dueDate: "2024-02-05",
          tags: ["디자인", "반응형"],
          comments: 3,
        },
      ],
      completed: [
        {
          id: "13",
          title: "와이어프레임 설계",
          description: "전체 페이지 구조 및 사용자 플로우 설계",
          assignee: "송미래",
          priority: "높음",
          dueDate: "2024-01-25",
          tags: ["기획", "와이어프레임"],
          comments: 2,
        },
        {
          id: "14",
          title: "디자인 시스템 구축",
          description: "컬러, 타이포그래피, 컴포넌트 가이드라인",
          assignee: "정수민",
          priority: "높음",
          dueDate: "2024-01-30",
          tags: ["디자인", "시스템"],
          comments: 5,
        },
      ],
      cancelled: [],
    },
    milestones: [
      {
        id: "1",
        title: "디자인 컨셉 확정",
        date: "2024-01-20",
        status: "completed" as const,
        description: "브랜드 아이덴티티 및 디자인 방향성 결정",
      },
      {
        id: "2",
        title: "프론트엔드 개발 완료",
        date: "2024-02-15",
        status: "in-progress" as const,
        description: "모든 페이지 퍼블리싱 완료",
      },
      {
        id: "3",
        title: "백엔드 연동 완료",
        date: "2024-02-20",
        status: "upcoming" as const,
        description: "CMS 및 데이터베이스 연동",
      },
      {
        id: "4",
        title: "사이트 런칭",
        date: "2024-03-01",
        status: "upcoming" as const,
        description: "도메인 연결 및 정식 서비스 시작",
      },
    ],
  },
}

interface ProjectDetailViewProps {
  projectId: string
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  const projectData = projectsData[projectId as keyof typeof projectsData] || projectsData["1"]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link  to="/admin/company/projects">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{projectData.name}</h1>
            <p className="text-muted-foreground">{projectData.description}</p>
            <div className="mt-2">
              <Badge variant={projectData.status === "진행 중" ? "default" : "secondary"}>{projectData.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsTaskDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />새 작업
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">{projectData.progress}%</div>
            <Progress value={projectData.progress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              총 작업
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{Object.values(projectData.tasks).flat().length}</div>
            <p className="text-xs text-muted-foreground">개</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">팀원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{projectData.teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              남은 기간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">25</div>
            <p className="text-xs text-muted-foreground">일</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Tabs */}
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            칸반 보드
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            타임라인
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            팀원
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <EnhancedKanbanBoard tasks={projectData.tasks} teamMembers={projectData.teamMembers} />
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimeline milestones={projectData.milestones} tasks={Object.values(projectData.tasks).flat()} />
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>팀원 관리</CardTitle>
              <CardDescription>프로젝트에 참여하는 팀원들의 정보와 역할</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectData.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {
                          Object.values(projectData.tasks)
                            .flat()
                            .filter((task) => task.assignee === member.name).length
                        }{" "}
                        작업
                      </Badge>
                      <Button variant="ghost" size="sm">
                        관리
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <ProjectSettings project={projectData} />
        </TabsContent>
      </Tabs>

      <TaskCreationDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        teamMembers={projectData.teamMembers}
        currentUser={{
          id: user?.id || '1',
          role: user?.role_name || 'COMPANY_MANAGER'
        }}
      />
    </div>
  )
}
