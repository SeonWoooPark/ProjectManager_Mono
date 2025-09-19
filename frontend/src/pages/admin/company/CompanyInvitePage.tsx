import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { TeamInviteInterface } from "@components/admin/team-invite-interface"

export default function CompanyInvitePage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <TeamInviteInterface />
        </div>
      </main>
    </div>
  )
}