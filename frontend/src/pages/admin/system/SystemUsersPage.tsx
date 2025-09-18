import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"

export default function SystemUsersPage() {
  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
            <p className="text-muted-foreground">
              시스템의 모든 사용자를 관리합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">등록된 사용자 목록</h2>
            <p className="text-muted-foreground">
              시스템 사용자 목록이 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}