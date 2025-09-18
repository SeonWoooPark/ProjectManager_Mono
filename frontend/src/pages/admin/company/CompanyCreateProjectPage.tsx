import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"

export default function CompanyCreateProjectPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">프로젝트 생성</h1>
            <p className="text-muted-foreground">
              새로운 프로젝트를 생성합니다.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">프로젝트 정보</h2>
            <p className="text-muted-foreground">
              프로젝트 생성 폼이 여기에 표시됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}