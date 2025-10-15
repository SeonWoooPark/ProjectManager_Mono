import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { CompanySettings } from "@components/admin/company-settings"

export default function CompanySettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 pl-6 pr-6 max-w-9xl mx-auto">
          <CompanySettings />
        </div>
      </main>
    </div>
  )
}