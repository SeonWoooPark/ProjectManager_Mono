import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"

export default function SystemCompaniesPage() {
  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">회사 관리</h1>
            <p className="text-muted-foreground">
              등록된 회사들을 관리합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">등록된 회사 목록</h2>
            <p className="text-muted-foreground">
              등록된 회사 목록이 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}