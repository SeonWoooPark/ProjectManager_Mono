import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"
import { MemberProjectsView } from "@components/dashboard/member-projects-view"

export default function MemberProjectsPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <MemberProjectsView />
        </div>
      </main>
    </div>
  )
}