import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyRequestsTable } from "@/components/admin/company-requests-table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

// Mock data - in real app this would come from API
const allRequests = [
  {
    id: "1",
    companyName: "테크스타트업",
    requesterName: "김철수",
    requesterEmail: "kim@techstartup.com",
    industry: "IT/소프트웨어",
    employeeCount: "1-10명",
    requestDate: "2024-01-15",
    status: "pending" as const,
  },
  {
    id: "2",
    companyName: "디자인스튜디오",
    requesterName: "이영희",
    requesterEmail: "lee@designstudio.com",
    industry: "서비스업",
    employeeCount: "11-50명",
    requestDate: "2024-01-14",
    status: "pending" as const,
  },
  {
    id: "3",
    companyName: "마케팅에이전시",
    requesterName: "박민수",
    requesterEmail: "park@marketing.com",
    industry: "서비스업",
    employeeCount: "51-100명",
    requestDate: "2024-01-13",
    status: "approved" as const,
  },
]

export default function RequestsPage() {
  const pendingCount = allRequests.filter((req) => req.status === "pending").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">승인 요청 관리</h1>
        <p className="text-muted-foreground">회사 등록 요청을 검토하고 승인/반려 처리하세요</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                모든 승인 요청
              </CardTitle>
              <CardDescription>회사 등록 요청 목록 및 처리 현황</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {pendingCount}개 대기 중
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CompanyRequestsTable requests={allRequests} />
        </CardContent>
      </Card>
    </div>
  )
}
