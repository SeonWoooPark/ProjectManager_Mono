import { CompanyAdminSidebar } from "@components/admin/company-admin-sidebar"
import { CreateProjectForm } from "@components/admin/create-project-form"

export default function CompanyCreateProjectPage() {
  return (
    <div className="flex h-screen bg-background">
      <CompanyAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 pl-6 pr-6 max-w-9xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">새 프로젝트 생성</h1>
            <p className="text-muted-foreground">
              새로운 프로젝트를 생성하고 팀원을 배정하세요
            </p>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">프로젝트 정보</h2>
                <p className="text-muted-foreground mt-1">프로젝트의 기본 정보와 설정을 입력해주세요</p>
              </div>
              <CreateProjectForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}