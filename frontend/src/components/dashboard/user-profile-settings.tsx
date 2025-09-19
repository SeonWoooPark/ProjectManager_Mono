import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import { Textarea } from "@components/ui/textarea"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import { Separator } from "@components/ui/separator"
import { Badge } from "@components/ui/badge"
import { Save, User, Bell, Shield, Key } from "lucide-react"
import { useState } from "react"

// Mock user data
const userData = {
  id: "1",
  name: "김철수",
  email: "kim@company.com",
  role: "개발자",
  department: "개발팀",
  joinDate: "2023-03-15",
  bio: "풀스택 개발자로 웹 애플리케이션 개발에 관심이 많습니다.",
  phone: "010-1234-5678",
  permissions: ["프로젝트 생성", "작업 관리", "팀원 초대"],
  isAdmin: true,
}

export function UserProfileSettings() {
  const [profileData, setProfileData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    bio: userData.bio,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    taskUpdates: true,
    projectUpdates: true,
    teamUpdates: false,
    emailNotifications: true,
  })

  const handleProfileSave = () => {
    console.log("Saving profile:", profileData)
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }
    console.log("Changing password")
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleNotificationSave = () => {
    console.log("Saving notifications:", notifications)
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
              <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{userData.name}</h3>
              <p className="text-muted-foreground">
                {userData.role} • {userData.department}
              </p>
              <p className="text-sm text-muted-foreground">가입일: {userData.joinDate}</p>
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
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
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
                <Badge variant="outline">{userData.role}</Badge>
                {userData.isAdmin && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    관리자
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">자기소개</Label>
            <Textarea
              id="bio"
              placeholder="자신에 대해 간단히 소개해주세요"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows={3}
            />
          </div>

          <Button onClick={handleProfileSave} className="gap-2">
            <Save className="h-4 w-4" />
            프로필 저장
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

          <Button onClick={handlePasswordChange} className="gap-2">
            <Key className="h-4 w-4" />
            비밀번호 변경
          </Button>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />내 권한
          </CardTitle>
          <CardDescription>현재 계정에 부여된 권한을 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userData.permissions.map((permission) => (
              <Badge key={permission} variant="outline">
                {permission}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">권한 변경이 필요한 경우 관리자에게 문의하세요.</p>
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
