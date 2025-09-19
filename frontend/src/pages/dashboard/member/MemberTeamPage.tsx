import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"
import { TeamMembersView } from "@components/dashboard/team-members-view"

export default function MemberTeamPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <TeamMembersView />
        </div>
      </main>
    </div>
  )
}