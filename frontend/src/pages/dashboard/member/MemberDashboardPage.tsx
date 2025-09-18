import { TeamMemberSidebar } from "@components/dashboard/team-member-sidebar"
import { TeamMemberDashboard } from "@components/dashboard/team-member-dashboard"

export default function MemberDashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <TeamMemberSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <TeamMemberDashboard />
        </div>
      </main>
    </div>
  )
}