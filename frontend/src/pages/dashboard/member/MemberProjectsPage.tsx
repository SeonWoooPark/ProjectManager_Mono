import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"

export default function MemberProjectsPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">내 프로젝트</h1>
            <p className="text-muted-foreground">
              참여 중인 프로젝트를 확인합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">참여 프로젝트</h2>
            <p className="text-muted-foreground">
              참여 중인 프로젝트 목록이 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}