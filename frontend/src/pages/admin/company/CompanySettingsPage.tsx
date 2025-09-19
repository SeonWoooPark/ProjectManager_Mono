import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { CompanySettings } from "@components/admin/company-settings"

export default function CompanySettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-4xl">
          <CompanySettings />
        </div>
      </main>
    </div>
  )
}