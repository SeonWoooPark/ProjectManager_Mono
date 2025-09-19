import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"
import { MemberTasksView } from "@components/dashboard/member-tasks-view"

export default function MemberTasksPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <MemberTasksView />
        </div>
      </main>
    </div>
  )
}