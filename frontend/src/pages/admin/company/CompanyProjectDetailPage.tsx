import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { UnifiedProjectDetailView } from "@components/project/UnifiedProjectDetailView"

export default function CompanyProjectDetailPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 pl-6 pr-6 max-w-9xl mx-auto">
          <UnifiedProjectDetailView userRole="COMPANY_MANAGER" />
        </div>
      </main>
    </div>
  )
}