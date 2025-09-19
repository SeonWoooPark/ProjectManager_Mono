import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"

export default function SystemRequestsPage() {
  return (
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">승인 요청 관리</h1>
            <p className="text-muted-foreground">회사 등록 요청을 검토하고 승인/반려 처리하세요</p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold">모든 승인 요청</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">회사 등록 요청 목록 및 처리 현황</p>
                </div>
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  2개 대기 중
                </div>
              </div>
              
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">회사명</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">요청자</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">업종</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">직원 수</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">요청일</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">상태</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">작업</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">테크스타트업</td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-medium">김철수</div>
                          <div className="text-sm text-muted-foreground">kim@techstartup.com</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">IT/소프트웨어</td>
                      <td className="p-4 align-middle">1-10명</td>
                      <td className="p-4 align-middle">2024-01-15</td>
                      <td className="p-4 align-middle">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          대기 중
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            승인
                          </button>
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M18 6 6 18"/>
                              <path d="m6 6 12 12"/>
                            </svg>
                            반려
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">디자인스튜디오</td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-medium">이영희</div>
                          <div className="text-sm text-muted-foreground">lee@designstudio.com</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">서비스업</td>
                      <td className="p-4 align-middle">11-50명</td>
                      <td className="p-4 align-middle">2024-01-14</td>
                      <td className="p-4 align-middle">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          대기 중
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            승인
                          </button>
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M18 6 6 18"/>
                              <path d="m6 6 12 12"/>
                            </svg>
                            반려
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">마케팅에이전시</td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-medium">박민수</div>
                          <div className="text-sm text-muted-foreground">park@marketing.com</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">서비스업</td>
                      <td className="p-4 align-middle">51-100명</td>
                      <td className="p-4 align-middle">2024-01-13</td>
                      <td className="p-4 align-middle">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          승인됨
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          상세보기
                        </button>
                      </td>
                    </tr>
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