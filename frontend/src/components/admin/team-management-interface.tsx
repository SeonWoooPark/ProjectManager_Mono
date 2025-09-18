import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Badge } from "@components/ui/badge"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Textarea } from "@components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog"
import { UserManagementDialog } from "./user-management-dialog"
import { JoinRequestsCard } from "./join-requests-card"
import { Users, Search, MoreHorizontal, UserPlus, Shield, Settings } from "lucide-react"
import { useState } from "react"

// Mock data for team members
const teamMembers = [
  {
    id: "1",
    name: "김철수",
    email: "kim@company.com",
    role: "개발자",
    department: "개발팀",
    joinDate: "2023-03-15",
    lastActive: "2024-01-18 15:30",
    status: "active" as const,
    permissions: ["프로젝트 생성", "작업 관리", "팀원 초대"],
    completedTasks: 24,
    currentProjects: 3,
    isAdmin: true,
  },
  {
    id: "2",
    name: "이영희",
    email: "lee@company.com",
    role: "디자이너",
    department: "디자인팀",
    joinDate: "2023-01-20",
    lastActive: "2024-01-18 14:15",
    status: "active" as const,
    permissions: ["작업 관리"],
    completedTasks: 18,
    currentProjects: 2,
    isAdmin: false,
  },
  {
    id: "3",
    name: "박민수",
    email: "park@company.com",
    role: "기획자",
    department: "기획팀",
    joinDate: "2022-11-10",
    lastActive: "2024-01-17 18:45",
    status: "active" as const,
    permissions: ["작업 관리", "프로젝트 보기"],
    completedTasks: 32,
    currentProjects: 2,
    isAdmin: false,
  },
  {
    id: "4",
    name: "정수진",
    email: "jung@company.com",
    role: "개발자",
    department: "개발팀",
    joinDate: "2023-06-01",
    lastActive: "2024-01-15 10:20",
    status: "inactive" as const,
    permissions: ["작업 관리"],
    completedTasks: 15,
    currentProjects: 1,
    isAdmin: false,
  },
]

const joinRequests = [
  {
    id: "1",
    name: "최영수",
    email: "choi@example.com",
    requestedRole: "마케터",
    inviteCode: "INV-ABC123",
    requestDate: "2024-01-18",
    invitedBy: "김철수",
  },
  {
    id: "2",
    name: "한지민",
    email: "han@example.com",
    requestedRole: "QA",
    inviteCode: "INV-DEF456",
    requestDate: "2024-01-17",
    invitedBy: "김철수",
  },
]

export function TeamManagementInterface() {
  const [selectedMember, setSelectedMember] = useState<(typeof teamMembers)[0] | null>(null)
  const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const availablePermissions = [
    "프로젝트 생성",
    "프로젝트 수정",
    "프로젝트 삭제",
    "작업 생성",
    "작업 수정",
    "작업 삭제",
    "팀원 초대",
    "팀원 관리",
    "역할 관리",
    "회사 설정",
  ]

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || member.role === roleFilter
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleMemberManagement = (member: (typeof teamMembers)[0]) => {
    setSelectedMember(member)
    setIsManagementDialogOpen(true)
  }

  const handleApproveRequest = (requestId: string) => {
    console.log("Approving join request:", requestId)
  }

  const handleRejectRequest = (requestId: string) => {
    console.log("Rejecting join request:", requestId)
  }

  const handleCreateRole = () => {
    console.log("Creating new role:", newRole)
    setIsRoleDialogOpen(false)
    setNewRole({ name: "", description: "", permissions: [] })
  }

  const togglePermission = (permission: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">팀원 관리</h1>
          <p className="text-muted-foreground">팀원의 역할, 권한, 상태를 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                신규 역할 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>새 역할 생성</DialogTitle>
                <DialogDescription>새로운 팀원 역할을 생성하고 권한을 설정하세요.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="roleName">역할 이름</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="예: 시니어 개발자, 프로젝트 매니저"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="roleDescription">역할 설명</Label>
                  <Textarea
                    id="roleDescription"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="이 역할의 책임과 업무를 설명해주세요"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>권한 설정</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newRole.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={permission} className="text-sm font-normal">
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">선택된 권한: {newRole.permissions.length}개</p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateRole}>
                  역할 생성
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            팀원 초대
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 팀원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">활성 멤버</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {teamMembers.filter((m) => m.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">관리자</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{teamMembers.filter((m) => m.isAdmin).length}</div>
            <p className="text-xs text-muted-foreground">명</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">가입 요청</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{joinRequests.length}</div>
            <p className="text-xs text-muted-foreground">건</p>
          </CardContent>
        </Card>
      </div>

      {/* Join Requests */}
      <JoinRequestsCard requests={joinRequests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>팀원 필터</CardTitle>
          <CardDescription>이름, 역할, 상태로 팀원을 필터링하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value="개발자">개발자</SelectItem>
                <SelectItem value="디자이너">디자이너</SelectItem>
                <SelectItem value="기획자">기획자</SelectItem>
                <SelectItem value="마케터">마케터</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>팀원 목록</CardTitle>
          <CardDescription>모든 팀원의 상세 정보와 관리 옵션</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>팀원</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>마지막 활동</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          {member.isAdmin && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              관리자
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell>{member.joinDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.lastActive}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "active" ? "default" : "secondary"}>
                      {member.status === "active" ? "활성" : "비활성"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{member.permissions.length}개 권한</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMemberManagement(member)}
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

      {selectedMember && (
        <UserManagementDialog
          member={selectedMember}
          isOpen={isManagementDialogOpen}
          onClose={() => {
            setIsManagementDialogOpen(false)
            setSelectedMember(null)
          }}
        />
      )}
    </div>
  )
}
