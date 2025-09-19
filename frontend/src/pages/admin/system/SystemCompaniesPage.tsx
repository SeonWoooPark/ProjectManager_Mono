import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"

export default function SystemCompaniesPage() {
  const companies = [
    {
      id: "1",
      name: "테크스타트업",
      industry: "IT/소프트웨어",
      employeeCount: "1-10명",
      memberCount: 8,
      projectCount: 3,
      adminName: "김철수",
      adminEmail: "kim@techstartup.com",
      registeredDate: "2024-01-10",
      status: "active" as const,
    },
    {
      id: "2",
      name: "마케팅에이전시",
      industry: "서비스업",
      employeeCount: "51-100명",
      memberCount: 25,
      projectCount: 12,
      adminName: "박민수",
      adminEmail: "park@marketing.com",
      registeredDate: "2024-01-08",
      status: "active" as const,
    },
    {
      id: "3",
      name: "디자인스튜디오",
      industry: "서비스업",
      employeeCount: "11-50명",
      memberCount: 15,
      projectCount: 7,
      adminName: "이영희",
      adminEmail: "lee@designstudio.com",
      registeredDate: "2024-01-05",
      status: "inactive" as const,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">회사 관리</h1>
            <p className="text-muted-foreground">등록된 회사들의 정보와 현황을 관리하세요</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">총 회사 수</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/>
                  <path d="M10 10h4"/>
                  <path d="M10 14h4"/>
                  <path d="M10 18h4"/>
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold text-foreground">{companies.length}</div>
                <p className="text-xs text-muted-foreground">
                  활성 회사: {companies.filter((c) => c.status === "active").length}개
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">총 팀원 수</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-2-2"/>
                  <path d="m16 16 2 2"/>
                  <circle cx="20" cy="8" r="6"/>
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {companies.reduce((sum, company) => sum + company.memberCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">모든 회사 합계</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">총 프로젝트 수</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M8 2v4"/>
                  <path d="M16 2v4"/>
                  <rect width="18" height="18" x="3" y="4" rx="2"/>
                  <path d="M3 10h18"/>
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold text-foreground">
                  {companies.reduce((sum, company) => sum + company.projectCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">진행 중인 프로젝트</p>
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold">회사 목록</h3>
              <p className="text-sm text-muted-foreground">등록된 모든 회사의 상세 정보</p>
            </div>
            <div className="p-6 pt-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">회사명</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">업종</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">관리자</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">팀원 수</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">프로젝트 수</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">등록일</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">상태</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">작업</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">{company.name}</td>
                        <td className="p-4 align-middle">{company.industry}</td>
                        <td className="p-4 align-middle">
                          <div>
                            <div className="font-medium">{company.adminName}</div>
                            <div className="text-sm text-muted-foreground">{company.adminEmail}</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{company.memberCount}명</td>
                        <td className="p-4 align-middle">{company.projectCount}개</td>
                        <td className="p-4 align-middle">{company.registeredDate}</td>
                        <td className="p-4 align-middle">
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            company.status === "active" 
                              ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" 
                              : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}>
                            {company.status === "active" ? "활성" : "비활성"}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"/>
                              <circle cx="19" cy="12" r="1"/>
                              <circle cx="5" cy="12" r="1"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}