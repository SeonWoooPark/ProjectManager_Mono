import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"

export default function MemberTasksPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">내 작업</h1>
            <p className="text-muted-foreground">
              할당된 작업을 관리합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">할당된 작업</h2>
            <p className="text-muted-foreground">
              할당된 작업 목록이 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}