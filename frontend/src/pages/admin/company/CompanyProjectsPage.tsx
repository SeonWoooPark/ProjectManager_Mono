import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { ProjectsOverview } from "@components/admin/projects-overview"

export default function CompanyProjectsPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl">
          <ProjectsOverview />
        </div>
      </main>
    </div>
  )
}