import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card"
import { Label } from "@components/ui/label"
import { Input } from "@components/ui/input"
import { Button } from "@components/ui/button"
import { Textarea } from "@components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { Switch } from "@components/ui/switch"
import { Building2, Bell, Shield } from "lucide-react"
import { Separator } from "@components/ui/separator"

export function CompanySettings() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "테크스타트업",
    description: "혁신적인 기술 솔루션을 제공하는 스타트업",
    website: "https://techstartup.com",
    industry: "기술",
    size: "10-50명",
    timezone: "Asia/Seoul",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    teamInvitations: true,
    weeklyReports: false,
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "8시간",
    passwordPolicy: "강함",
    ipRestriction: false,
  })

  const handleSaveCompanyInfo = () => {
    console.log("Saving company info:", companyInfo)
  }

  const handleSaveNotifications = () => {
    console.log("Saving notifications:", notifications)
  }

  const handleSaveSecurity = () => {
    console.log("Saving security settings:", security)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">회사 설정</h1>
        <p className="text-muted-foreground">회사 정보, 보안, 알림 설정을 관리하세요</p>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>회사 정보</CardTitle>
          </div>
          <CardDescription>기본적인 회사 정보를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">회사명</Label>
              <Input
                id="companyName"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">웹사이트</Label>
              <Input
                id="website"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">회사 설명</Label>
            <Textarea
              id="description"
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
              placeholder="회사에 대한 간단한 설명을 입력하세요"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">업종</Label>
              <Select value={companyInfo.industry} onValueChange={(value) => setCompanyInfo({ ...companyInfo, industry: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="기술">기술</SelectItem>
                  <SelectItem value="금융">금융</SelectItem>
                  <SelectItem value="제조">제조</SelectItem>
                  <SelectItem value="서비스">서비스</SelectItem>
                  <SelectItem value="교육">교육</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">회사 규모</Label>
              <Select value={companyInfo.size} onValueChange={(value) => setCompanyInfo({ ...companyInfo, size: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10명">1-10명</SelectItem>
                  <SelectItem value="10-50명">10-50명</SelectItem>
                  <SelectItem value="50-200명">50-200명</SelectItem>
                  <SelectItem value="200명 이상">200명 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">시간대</Label>
              <Select value={companyInfo.timezone} onValueChange={(value) => setCompanyInfo({ ...companyInfo, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSaveCompanyInfo}>회사 정보 저장</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>알림 설정</CardTitle>
          </div>
          <CardDescription>이메일 및 시스템 알림을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>이메일 알림</Label>
                <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>프로젝트 업데이트</Label>
                <p className="text-sm text-muted-foreground">프로젝트 진행 상황 알림</p>
              </div>
              <Switch
                checked={notifications.projectUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, projectUpdates: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>작업 배정</Label>
                <p className="text-sm text-muted-foreground">새로운 작업 배정 알림</p>
              </div>
              <Switch
                checked={notifications.taskAssignments}
                onCheckedChange={(checked) => setNotifications({ ...notifications, taskAssignments: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>팀 초대</Label>
                <p className="text-sm text-muted-foreground">새로운 팀원 초대 알림</p>
              </div>
              <Switch
                checked={notifications.teamInvitations}
                onCheckedChange={(checked) => setNotifications({ ...notifications, teamInvitations: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>주간 리포트</Label>
                <p className="text-sm text-muted-foreground">주간 프로젝트 진행 리포트</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveNotifications}>알림 설정 저장</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>보안 설정</CardTitle>
          </div>
          <CardDescription>계정 보안 및 접근 제어를 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>2단계 인증</Label>
                <p className="text-sm text-muted-foreground">추가 보안을 위한 2단계 인증 활성화</p>
              </div>
              <Switch
                checked={security.twoFactorAuth}
                onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>세션 타임아웃</Label>
                <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1시간">1시간</SelectItem>
                    <SelectItem value="4시간">4시간</SelectItem>
                    <SelectItem value="8시간">8시간</SelectItem>
                    <SelectItem value="24시간">24시간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>비밀번호 정책</Label>
                <Select value={security.passwordPolicy} onValueChange={(value) => setSecurity({ ...security, passwordPolicy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="기본">기본</SelectItem>
                    <SelectItem value="강함">강함</SelectItem>
                    <SelectItem value="매우 강함">매우 강함</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP 제한</Label>
                <p className="text-sm text-muted-foreground">특정 IP 주소에서만 접근 허용</p>
              </div>
              <Switch
                checked={security.ipRestriction}
                onCheckedChange={(checked) => setSecurity({ ...security, ipRestriction: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveSecurity}>보안 설정 저장</Button>
        </CardContent>
      </Card>
    </div>
  )
}