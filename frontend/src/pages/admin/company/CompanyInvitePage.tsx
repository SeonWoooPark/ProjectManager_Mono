import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { TeamInviteInterface } from "@components/admin/team-invite-interface"

export default function CompanyInvitePage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 pl-6 pr-6 max-w-9xl mx-auto">
          <TeamInviteInterface />
        </div>
      </main>
    </div>
  )
}