import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Users, Search, MoreHorizontal, Shield, Building2 } from "lucide-react"
import { useState } from "react"

// Mock data for all users across companies
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

export default function SystemUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">사용자 관리</h1>
        <p className="text-muted-foreground">전체 시스템의 모든 사용자를 관리하세요</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {allUsers.filter((u) => u.status === "활성").length}
            </div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">회사 관리자</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{allUsers.filter((u) => u.isCompanyAdmin).length}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">등록 회사</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{uniqueCompanies.length}</div>
            <p className="text-xs text-muted-foreground">개</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 필터</CardTitle>
          <CardDescription>이름, 회사, 역할, 상태로 사용자를 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일, 회사로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="회사 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 회사</SelectItem>
                {uniqueCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="활성">활성</SelectItem>
                <SelectItem value="비활성">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>전체 시스템 사용자의 상세 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>마지막 활동</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>활동</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.isCompanyAdmin && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              관리자
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "활성" ? "default" : "secondary"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div>프로젝트: {user.projectCount}개</div>
                      <div>작업: {user.taskCount}개</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserAction(user.id, "manage")}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">선택한 조건에 맞는 사용자가 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
