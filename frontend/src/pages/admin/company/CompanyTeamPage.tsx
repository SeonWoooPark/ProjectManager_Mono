import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { TeamManagementInterface } from "@components/admin/team-management-interface"

export default function CompanyTeamPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <TeamManagementInterface />
        </div>
      </main>
    </div>
  )
}