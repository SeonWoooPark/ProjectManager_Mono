import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"
import { SystemAdminDashboard } from "@components/admin/system-admin-dashboard"

export default function SystemDashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-8 max-w-full">
          <SystemAdminDashboard />
        </div>
      </main>
    </div>
  )
}