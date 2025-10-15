import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"
import { useState } from "react"

export default function SystemUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

  const allUsers = [
    {
      id: "1",
      name: "김철수",
      email: "kim@techstartup.com",
      company: "테크스타트업",
      role: "회사 관리자",
      status: "활성",
      joinDate: "2023-03-15",
      lastActive: "2024-01-18 15:30",
      projectCount: 3,
      taskCount: 24,
      isCompanyAdmin: true,
    },
    {
      id: "2",
      name: "이영희",
      email: "lee@designstudio.com",
      company: "디자인스튜디오",
      role: "회사 관리자",
      status: "활성",
      joinDate: "2023-01-20",
      lastActive: "2024-01-18 14:15",
      projectCount: 2,
      taskCount: 18,
      isCompanyAdmin: true,
    },
    {
      id: "3",
      name: "박민수",
      email: "park@techstartup.com",
      company: "테크스타트업",
      role: "개발자",
      status: "활성",
      joinDate: "2022-11-10",
      lastActive: "2024-01-17 18:45",
      projectCount: 2,
      taskCount: 32,
      isCompanyAdmin: false,
    },
    {
      id: "4",
      name: "정수진",
      email: "jung@creativestudio.com",
      company: "크리에이티브스튜디오",
      role: "디자이너",
      status: "비활성",
      joinDate: "2023-06-01",
      lastActive: "2024-01-15 10:20",
      projectCount: 1,
      taskCount: 15,
      isCompanyAdmin: false,
    },
    {
      id: "5",
      name: "최영수",
      email: "choi@marketingpro.com",
      company: "마케팅프로",
      role: "마케터",
      status: "활성",
      joinDate: "2023-08-12",
      lastActive: "2024-01-18 09:30",
      projectCount: 4,
      taskCount: 28,
      isCompanyAdmin: false,
    },
  ]

  const uniqueCompanies = Array.from(new Set(allUsers.map((user) => user.company)))
  const uniqueRoles = Array.from(new Set(allUsers.map((user) => user.role)))

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = companyFilter === "all" || user.company === companyFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesCompany && matchesStatus && matchesRole
  })

  const handleUserAction = (userId: string, action: string) => {
    console.log(`User ${userId} action: ${action}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6 pb-8 max-w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">사용자 관리</h1>
            <p className="text-muted-foreground">전체 시스템의 모든 사용자를 관리하세요</p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">총 사용자</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-2-2"/>
                  <path d="m16 16 2 2"/>
                  <circle cx="20" cy="8" r="6"/>
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold text-foreground">{allUsers.length}</div>
                <p className="text-xs text-muted-foreground">명</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">활성 사용자</div>
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
                  {allUsers.filter((u) => u.status === "활성").length}
                </div>
                <p className="text-xs text-muted-foreground">명</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">회사 관리자</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <path d="m9 12 2 2 4-4"/>
                  <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/>
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold text-foreground">{allUsers.filter((u) => u.isCompanyAdmin).length}</div>
                <p className="text-xs text-muted-foreground">명</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 p-6">
                <div className="tracking-tight text-sm font-medium text-muted-foreground">등록 회사</div>
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
                <div className="text-2xl font-bold text-foreground">{uniqueCompanies.length}</div>
                <p className="text-xs text-muted-foreground">개</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold">사용자 필터</h3>
              <p className="text-sm text-muted-foreground">이름, 회사, 역할, 상태로 사용자를 필터링하세요</p>
            </div>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="이름, 이메일, 회사로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="all">모든 회사</option>
                  {uniqueCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">모든 역할</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">모든 상태</option>
                  <option value="활성">활성</option>
                  <option value="비활성">비활성</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold">사용자 목록</h3>
              <p className="text-sm text-muted-foreground">전체 시스템 사용자의 상세 정보</p>
            </div>
            <div className="p-6 pt-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">사용자</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">회사</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">역할</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">가입일</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">마지막 활동</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">상태</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">활동</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">관리</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                              <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name}</span>
                                {user.isCompanyAdmin && (
                                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
                                    관리자
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{user.company}</td>
                        <td className="p-4 align-middle">{user.role}</td>
                        <td className="p-4 align-middle">{user.joinDate}</td>
                        <td className="p-4 align-middle text-sm text-muted-foreground">{user.lastActive}</td>
                        <td className="p-4 align-middle">
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            user.status === "활성" 
                              ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" 
                              : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}>
                            {user.status}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-sm text-muted-foreground">
                            <div>프로젝트: {user.projectCount}개</div>
                            <div>작업: {user.taskCount}개</div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <button
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                            onClick={() => handleUserAction(user.id, "manage")}
                          >
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

          {filteredUsers.length === 0 && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-center py-8 p-6">
                <p className="text-muted-foreground">선택한 조건에 맞는 사용자가 없습니다.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}