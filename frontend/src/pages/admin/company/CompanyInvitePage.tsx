import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"

export default function CompanyInvitePage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">팀원 초대</h1>
            <p className="text-muted-foreground">
              새로운 팀원을 초대합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">초대 링크 생성</h2>
            <p className="text-muted-foreground">
              팀원 초대 기능이 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}