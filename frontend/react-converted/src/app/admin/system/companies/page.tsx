import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Calendar, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data
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

export default function CompaniesPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">회사 관리</h1>
        <p className="text-muted-foreground">등록된 회사들의 정보와 현황을 관리하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 회사 수</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              활성 회사: {companies.filter((c) => c.status === "active").length}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 팀원 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {companies.reduce((sum, company) => sum + company.memberCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">모든 회사 합계</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 프로젝트 수</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {companies.reduce((sum, company) => sum + company.projectCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">진행 중인 프로젝트</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>회사 목록</CardTitle>
          <CardDescription>등록된 모든 회사의 상세 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>관리자</TableHead>
                <TableHead>팀원 수</TableHead>
                <TableHead>프로젝트 수</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.adminName}</div>
                      <div className="text-sm text-muted-foreground">{company.adminEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>{company.memberCount}명</TableCell>
                  <TableCell>{company.projectCount}개</TableCell>
                  <TableCell>{company.registeredDate}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === "active" ? "default" : "secondary"}>
                      {company.status === "active" ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
