import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"

export default function SystemRequestsPage() {
  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">승인 요청</h1>
            <p className="text-muted-foreground">
              회사 가입 승인 요청을 관리합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">승인 대기 중인 요청</h2>
            <p className="text-muted-foreground">
              현재 승인 대기 중인 회사 가입 요청이 없습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}