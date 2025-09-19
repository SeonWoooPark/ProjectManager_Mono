import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { CompanyAdminDashboard } from "@components/admin/company-admin-dashboard"

export default function CompanyDashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <CompanyAdminDashboard />
        </div>
      </main>
    </div>
  )
}