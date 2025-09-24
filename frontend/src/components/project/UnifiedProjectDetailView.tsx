import { useParams } from "react-router-dom"
import { ProjectHeader } from "./ProjectHeader"
import { ProjectInfoCards } from "./ProjectInfoCards"
import { ProjectTabs } from "./ProjectTabs"
import { AlertCircle } from "lucide-react"
import { Button } from "@components/ui/button"
import { useNavigate } from "react-router-dom"

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
    kanbanTasks: {
      todo: [
        { id: "t4", title: "API 문서 작성", assignee: "김철수", isMyTask: true },
        { id: "t5", title: "테스트 케이스 작성", assignee: "박민수", isMyTask: false },
      ],
      inProgress: [
        { id: "t1", title: "로그인 API 구현", assignee: "김철수", isMyTask: true },
        { id: "t3", title: "UI 디자인 수정", assignee: "이영희", isMyTask: false },
      ],
      review: [
        { id: "t6", title: "코드 리뷰", assignee: "김철수", isMyTask: true }
      ],
      completed: [
        { id: "t2", title: "회원가입 기능", assignee: "김철수", isMyTask: true },
        { id: "t7", title: "프로젝트 초기 설정", assignee: "박민수", isMyTask: false },
      ],
      cancelled: [],
    },
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
    kanbanTasks: {
      todo: [
        { id: "t7", title: "반응형 테스트", assignee: "김철수", isMyTask: true }
      ],
      inProgress: [
        { id: "t6", title: "반응형 레이아웃 구현", assignee: "김철수", isMyTask: true }
      ],
      review: [],
      completed: [
        { id: "t8", title: "와이어프레임 검토", assignee: "김철수", isMyTask: true },
        { id: "t9", title: "콘텐츠 마이그레이션", assignee: "최영수", isMyTask: false },
      ],
      cancelled: [],
    },
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
    kanbanTasks: {
      todo: [],
      inProgress: [],
      review: [],
      completed: [
        { id: "t10", title: "기술 문서 검토", assignee: "김철수", isMyTask: true },
        { id: "t11", title: "시스템 연동 테스트", assignee: "김철수", isMyTask: true },
      ],
      cancelled: [],
    },
  }
}

interface UnifiedProjectDetailViewProps {
  userRole?: "TEAM_MEMBER" | "COMPANY_MANAGER";
}

export function UnifiedProjectDetailView({ userRole = "TEAM_MEMBER" }: UnifiedProjectDetailViewProps) {
  const { id } = useParams()
  const navigate = useNavigate()

  const project = mockProjects[id || "1"]

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">프로젝트를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">요청하신 프로젝트가 존재하지 않거나 접근 권한이 없습니다.</p>
        <Button onClick={() => navigate(userRole === "COMPANY_MANAGER" ? "/admin/company/projects" : "/dashboard/member/projects")}>
          프로젝트 목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const handleCreateTask = () => {
    // TODO: 새 작업 만들기 모달 또는 페이지로 이동
    console.log("새 작업 만들기 클릭됨")
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        name={project.name}
        description={project.description}
        status={project.status}
        onCreateTask={handleCreateTask}
        returnPath={userRole === "COMPANY_MANAGER" ? "/admin/company/projects" : "/dashboard/member/projects"}
        returnLabel="프로젝트 목록으로 돌아가기"
      />

      <ProjectInfoCards
        progress={project.progress}
        myTasks={project.myTasks}
        startDate={project.startDate}
        endDate={project.endDate}
        teamSize={project.team.length}
        manager={project.manager}
      />

      <ProjectTabs
        tasks={project.tasks}
        team={project.team}
        activities={project.recentActivities}
        kanbanTasks={project.kanbanTasks}
        manager={project.manager}
        currentUser="김철수"
      />
    </div>
  )
}