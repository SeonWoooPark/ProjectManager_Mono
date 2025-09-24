import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { Button } from "@components/ui/button"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Checkbox } from "@components/ui/checkbox"
import { Separator } from "@components/ui/separator"
import { Label } from "@components/ui/label"
import { AlertTriangle, Save, UserX, Shield, Calendar, Mail } from "lucide-react"
import { useState } from "react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  joinDate: string
  lastActive: string
  status: "active" | "inactive"
  permissions: string[]
  completedTasks: number
  currentProjects: number
  isAdmin: boolean
}

interface UserManagementDialogProps {
  member: TeamMember
  isOpen: boolean
  onClose: () => void
}

const availablePermissions = [
  { id: "project_create", label: "프로젝트 생성", description: "새로운 프로젝트를 생성할 수 있습니다" },
  { id: "project_manage", label: "프로젝트 관리", description: "프로젝트 설정을 변경할 수 있습니다" },
  { id: "task_manage", label: "작업 관리", description: "작업을 생성, 수정, 삭제할 수 있습니다" },
  { id: "team_invite", label: "팀원 초대", description: "새로운 팀원을 초대할 수 있습니다" },
  { id: "team_manage", label: "팀원 관리", description: "팀원의 역할과 권한을 관리할 수 있습니다" },
  { id: "project_view", label: "프로젝트 보기", description: "모든 프로젝트를 조회할 수 있습니다" },
]

const roles = [
  { value: "개발자", label: "개발자" },
  { value: "디자이너", label: "디자이너" },
  { value: "기획자", label: "기획자" },
  { value: "마케터", label: "마케터" },
  { value: "QA", label: "QA" },
]

export function UserManagementDialog({ member, isOpen, onClose }: UserManagementDialogProps) {
  const [selectedRole, setSelectedRole] = useState(member.role)
  const [selectedStatus, setSelectedStatus] = useState(member.status)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    member.permissions.map((p) => availablePermissions.find((ap) => ap.label === p)?.id || ""),
  )
  const [isAdmin, setIsAdmin] = useState(member.isAdmin)

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permissionId))
    }
  }

  const handleSave = () => {
    const updatedMember = {
      ...member,
      role: selectedRole,
      status: selectedStatus,
      permissions: selectedPermissions
        .map((id) => availablePermissions.find((p) => p.id === id)?.label)
        .filter(Boolean) as string[],
      isAdmin,
    }
    console.log("Updating member:", updatedMember)
    onClose()
  }

  const handleDeactivate = () => {
    if (confirm(`${member.name} 님을 비활성화하시겠습니까?`)) {
      console.log("Deactivating member:", member.id)
      onClose()
    }
  }

  const handleRemove = () => {
    if (confirm(`${member.name} 님을 팀에서 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      console.log("Removing member:", member.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {member.name} 관리
          </DialogTitle>
          <DialogDescription>팀원의 역할, 권한, 상태를 관리합니다</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">이메일</span>
              </div>
              <p className="font-medium">{member.email}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">가입일</span>
              </div>
              <p className="font-medium">{member.joinDate}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">완료한 작업</span>
              <p className="font-medium">{member.completedTasks}개</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">참여 중인 프로젝트</span>
              <p className="font-medium">{member.currentProjects}개</p>
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>역할</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
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

            <div className="space-y-2">
              <Label>상태</Label>
              <Select value={selectedStatus} onValueChange={(value: "active" | "inactive") => setSelectedStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Admin Status */}
          <div className="flex items-center space-x-2">
            <Checkbox id="admin" checked={isAdmin} onCheckedChange={(checked) => setIsAdmin(checked === true)} />
            <Label htmlFor="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              관리자 권한 부여
            </Label>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label className="text-base font-medium">권한 설정</Label>
            <div className="space-y-3">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                      {permission.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                변경사항 저장
              </Button>
              <Button variant="outline" onClick={onClose} className="bg-transparent">
                취소
              </Button>
            </div>

            <div className="flex gap-2">
              {member.status === "active" && (
                <Button variant="outline" onClick={handleDeactivate} className="gap-2 bg-transparent">
                  <UserX className="h-4 w-4" />
                  비활성화
                </Button>
              )}
              <Button variant="destructive" onClick={handleRemove} className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                팀에서 제거
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
