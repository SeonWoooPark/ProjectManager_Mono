import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Separator } from "@components/ui/separator"
import { Badge } from "@components/ui/badge"
import { Save, User, Bell, Shield, Key } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useCompanyMembers } from "@/services/members/membersQueries"
import { useUpdateMemberProfile } from "@/services/members/membersMutations"
import { useChangePassword } from "@/services/auth/authMutations"
import LoadingSpinner from "@components/atoms/LoadingSpinner"

const ROLE_LABELS: Record<number, string> = {
  1: "시스템 관리자",
  2: "회사 관리자",
  3: "팀원",
}

const STATUS_LABELS: Record<number, string> = {
  1: "활성",
  2: "비활성",
  3: "승인 대기",
}

export function UserProfileSettings() {
  const { user: authUser, updateUser } = useAuthStore()
  const { data: membersData, isLoading, isError } = useCompanyMembers()
  const updateProfileMutation = useUpdateMemberProfile()
  const changePasswordMutation = useChangePassword()

  // 회사 멤버 목록에서 현재 로그인한 사용자 찾기
  const currentUser = useMemo(() => {
    if (!authUser?.id || !membersData?.members) return null
    return membersData.members.find((member) => member.id === authUser.id)
  }, [authUser?.id, membersData?.members])

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // currentUser가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.user_name,
        email: currentUser.email,
        phone: currentUser.phone_number || "",
      })
    }
  }, [currentUser])

  const [notifications, setNotifications] = useState({
    taskUpdates: true,
    projectUpdates: true,
    teamUpdates: false,
    emailNotifications: true,
  })

  const handleProfileSave = () => {
    if (!authUser?.id) return

    updateProfileMutation.mutate(
      {
        userId: authUser.id,
        user_name: profileData.name,
        phone_number: profileData.phone,
      },
      {
        onSuccess: (data) => {
          // authStore의 user 정보 업데이트
          updateUser({
            user_name: data.user_name,
            email: data.email,
            phone_number: data.phone_number,
          })
        },
      }
    )
  }

  const handlePasswordChange = () => {
    // 입력값 검증
    if (!passwordData.currentPassword) {
      alert("현재 비밀번호를 입력해주세요.")
      return
    }
    if (!passwordData.newPassword) {
      alert("새 비밀번호를 입력해주세요.")
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert("새 비밀번호는 최소 8자 이상이어야 합니다.")
      return
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      alert("새 비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.")
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }

    // API 호출
    changePasswordMutation.mutate(
      {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      },
      {
        onSuccess: () => {
          // 성공 시 폼 초기화 (실제로는 로그아웃되어 페이지가 이동됨)
          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        },
      }
    )
  }

  const handleNotificationSave = () => {
    console.log("Saving notifications:", notifications)
    // TODO: 알림 설정 API 연동 필요
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError || !currentUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">사용자 정보를 불러올 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">계정 설정</h1>
        <p className="text-muted-foreground">프로필 정보와 계정 설정을 관리하세요</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            프로필 정보
          </CardTitle>
          <CardDescription>기본 프로필 정보를 수정할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl">{currentUser.user_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{currentUser.user_name}</h3>
              <p className="text-muted-foreground">
                {ROLE_LABELS[currentUser.role_id] || "사용자"}
                {authUser?.company?.company_name && ` • ${authUser.company.company_name}`}
              </p>
              <p className="text-sm text-muted-foreground">
                가입일: {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "알 수 없음"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">이메일은 수정할 수 없습니다.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>역할</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{ROLE_LABELS[currentUser.role_id] || "사용자"}</Badge>
                <Badge
                  variant="outline"
                  className={
                    currentUser.status_id === 1
                      ? "bg-green-500/10 text-green-700 border-green-500/20"
                      : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                  }
                >
                  {STATUS_LABELS[currentUser.status_id] || "알 수 없음"}
                </Badge>
              </div>
            </div>
          </div>

          <Button onClick={handleProfileSave} disabled={updateProfileMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateProfileMutation.isPending ? "저장 중..." : "프로필 저장"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2">
            <p className="text-sm text-amber-800">
              ⚠️ 비밀번호 변경 시 모든 기기에서 자동으로 로그아웃됩니다. 새 비밀번호로 다시 로그인해주세요.
            </p>
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={changePasswordMutation.isPending}
            className="gap-2"
          >
            <Key className="h-4 w-4" />
            {changePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            계정 정보
          </CardTitle>
          <CardDescription>현재 계정의 상세 정보를 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">사용자 ID</p>
              <p className="text-base">{currentUser.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">소속 회사</p>
              <p className="text-base">{authUser?.company?.company_name || "없음"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">계정 상태</p>
              <Badge
                variant="outline"
                className={
                  currentUser.status_id === 1
                    ? "bg-green-500/10 text-green-700 border-green-500/20"
                    : "bg-gray-500/10 text-gray-700 border-gray-500/20"
                }
              >
                {STATUS_LABELS[currentUser.status_id] || "알 수 없음"}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">가입일</p>
              <p className="text-base">
                {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "알 수 없음"}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">계정 관련 문의사항은 관리자에게 연락하세요.</p>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            알림 설정
          </CardTitle>
          <CardDescription>받고 싶은 알림을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">작업 업데이트</p>
                <p className="text-sm text-muted-foreground">할당된 작업의 상태 변경 알림</p>
              </div>
              <Button
                variant={notifications.taskUpdates ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications({ ...notifications, taskUpdates: !notifications.taskUpdates })}
              >
                {notifications.taskUpdates ? "켜짐" : "꺼짐"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">프로젝트 업데이트</p>
                <p className="text-sm text-muted-foreground">참여 중인 프로젝트의 중요 업데이트</p>
              </div>
              <Button
                variant={notifications.projectUpdates ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications({ ...notifications, projectUpdates: !notifications.projectUpdates })}
              >
                {notifications.projectUpdates ? "켜짐" : "꺼짐"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">팀 업데이트</p>
                <p className="text-sm text-muted-foreground">팀원 추가/제거 및 역할 변경 알림</p>
              </div>
              <Button
                variant={notifications.teamUpdates ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications({ ...notifications, teamUpdates: !notifications.teamUpdates })}
              >
                {notifications.teamUpdates ? "켜짐" : "꺼짐"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">이메일 알림</p>
                <p className="text-sm text-muted-foreground">중요한 알림을 이메일로 받기</p>
              </div>
              <Button
                variant={notifications.emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })
                }
              >
                {notifications.emailNotifications ? "켜짐" : "꺼짐"}
              </Button>
            </div>
          </div>

          <Button onClick={handleNotificationSave} className="gap-2">
            <Save className="h-4 w-4" />
            알림 설정 저장
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
