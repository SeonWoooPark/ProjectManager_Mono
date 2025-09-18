import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Mail, UserPlus, CheckCircle, Clock, XCircle } from "lucide-react"
import { useState } from "react"

// Mock data for pending invitations
const pendingInvitations = [
  {
    id: "1",
    email: "newuser@example.com",
    role: "개발자",
    invitedBy: "김철수",
    invitedDate: "2024-01-18",
    status: "pending" as const,
    inviteCode: "INV-ABC123",
  },
  {
    id: "2",
    email: "designer@example.com",
    role: "디자이너",
    invitedBy: "김철수",
    invitedDate: "2024-01-17",
    status: "accepted" as const,
    inviteCode: "INV-DEF456",
  },
  {
    id: "3",
    email: "expired@example.com",
    role: "기획자",
    invitedBy: "김철수",
    invitedDate: "2024-01-10",
    status: "expired" as const,
    inviteCode: "INV-GHI789",
  },
]

const roles = [
  { value: "개발자", label: "개발자" },
  { value: "디자이너", label: "디자이너" },
  { value: "기획자", label: "기획자" },
  { value: "마케터", label: "마케터" },
  { value: "QA", label: "QA" },
]

export function TeamInviteInterface() {
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Sending invitation:", inviteForm)
      setInviteForm({ email: "", role: "" })
      setIsLoading(false)
    }, 1000)
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // In a real app, show a toast notification
    console.log("Copied invite code:", code)
  }

  const resendInvitation = (id: string) => {
    console.log("Resending invitation:", id)
  }

  const cancelInvitation = (id: string) => {
    console.log("Canceling invitation:", id)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">팀원 초대</h1>
        <p className="text-muted-foreground">새로운 팀원을 초대하고 초대 현황을 관리하세요</p>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />새 팀원 초대
          </CardTitle>
          <CardDescription>이메일 주소와 역할을 입력하여 팀원을 초대하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="초대할 사용자의 이메일을 입력하세요"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>역할</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="역할을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !inviteForm.email || !inviteForm.role} className="gap-2">
              <Mail className="h-4 w-4" />
              {isLoading ? "초대 중..." : "초대 보내기"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>초대 현황</CardTitle>
          <CardDescription>보낸 초대의 상태를 확인하고 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>초대자</TableHead>
                <TableHead>초대일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>초대 코드</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>{invitation.role}</TableCell>
                  <TableCell>{invitation.invitedBy}</TableCell>
                  <TableCell>{invitation.invitedDate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invitation.status === "accepted"
                          ? "default"
                          : invitation.status === "expired"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {invitation.status === "pending" && (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          대기 중
                        </>
                      )}
                      {invitation.status === "accepted" && (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          수락됨
                        </>
                      )}
                      {invitation.status === "expired" && (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          만료됨
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{invitation.inviteCode}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyInviteCode(invitation.inviteCode)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {invitation.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendInvitation(invitation.id)}
                            className="bg-transparent"
                          >
                            재전송
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelInvitation(invitation.id)}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                          >
                            취소
                          </Button>
                        </>
                      )}
                      {invitation.status === "expired" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitation(invitation.id)}
                          className="bg-transparent"
                        >
                          재초대
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>초대 방법 안내</CardTitle>
          <CardDescription>팀원 초대 프로세스에 대한 설명</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">이메일 초대 발송</h4>
                <p className="text-muted-foreground">
                  입력한 이메일 주소로 초대 링크와 초대 코드가 포함된 이메일이 발송됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">회원가입 및 코드 입력</h4>
                <p className="text-muted-foreground">
                  초대받은 사용자가 회원가입 후 초대 코드를 입력하여 팀 참여를 요청합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">승인 및 팀 합류</h4>
                <p className="text-muted-foreground">
                  회사 관리자가 요청을 승인하면 새 팀원이 팀에 정식으로 합류하게 됩니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
