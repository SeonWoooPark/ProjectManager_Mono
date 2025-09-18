import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shield, Bell, Database, Globe } from "lucide-react"
import { useState } from "react"

export default function SystemSettingsPage() {
  const [systemInfo, setSystemInfo] = useState({
    systemName: "프로젝트 관리 SaaS",
    version: "1.0.0",
    description: "중소기업과 스타트업을 위한 프로젝트 관리 솔루션",
    supportEmail: "support@projectsaas.com",
    maintenanceMode: false,
  })

  const [security, setSecurity] = useState({
    passwordMinLength: "8",
    sessionTimeout: "24시간",
    maxLoginAttempts: "5",
    twoFactorRequired: false,
    ipWhitelist: false,
    auditLogging: true,
  })

  const [notifications, setNotifications] = useState({
    systemAlerts: true,
    userRegistrations: true,
    companyApprovals: true,
    securityEvents: true,
    performanceAlerts: false,
    maintenanceNotices: true,
  })

  const [database, setDatabase] = useState({
    backupFrequency: "매일",
    retentionPeriod: "30일",
    autoCleanup: true,
    compressionEnabled: true,
  })

  const handleSaveSystemInfo = () => {
    console.log("Saving system info:", systemInfo)
  }

  const handleSaveSecurity = () => {
    console.log("Saving security settings:", security)
  }

  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", notifications)
  }

  const handleSaveDatabase = () => {
    console.log("Saving database settings:", database)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">시스템 설정</h1>
        <p className="text-muted-foreground">전체 시스템의 설정과 구성을 관리하세요</p>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            시스템 정보
          </CardTitle>
          <CardDescription>기본적인 시스템 정보와 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">시스템 이름</Label>
              <Input
                id="systemName"
                value={systemInfo.systemName}
                onChange={(e) => setSystemInfo({ ...systemInfo, systemName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">버전</Label>
              <Input
                id="version"
                value={systemInfo.version}
                onChange={(e) => setSystemInfo({ ...systemInfo, version: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">시스템 설명</Label>
            <Textarea
              id="description"
              value={systemInfo.description}
              onChange={(e) => setSystemInfo({ ...systemInfo, description: e.target.value })}
              placeholder="시스템에 대한 설명을 입력하세요"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">지원 이메일</Label>
              <Input
                id="supportEmail"
                type="email"
                value={systemInfo.supportEmail}
                onChange={(e) => setSystemInfo({ ...systemInfo, supportEmail: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>유지보수 모드</Label>
                <p className="text-sm text-muted-foreground">시스템 점검 시 활성화</p>
              </div>
              <Switch
                checked={systemInfo.maintenanceMode}
                onCheckedChange={(checked) => setSystemInfo({ ...systemInfo, maintenanceMode: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveSystemInfo}>시스템 정보 저장</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            보안 설정
          </CardTitle>
          <CardDescription>시스템 전체의 보안 정책을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>최소 비밀번호 길이</Label>
              <Select
                value={security.passwordMinLength}
                onValueChange={(value) => setSecurity({ ...security, passwordMinLength: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6자</SelectItem>
                  <SelectItem value="8">8자</SelectItem>
                  <SelectItem value="10">10자</SelectItem>
                  <SelectItem value="12">12자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>세션 타임아웃</Label>
              <Select
                value={security.sessionTimeout}
                onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}
              >
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
              <Label>최대 로그인 시도</Label>
              <Select
                value={security.maxLoginAttempts}
                onValueChange={(value) => setSecurity({ ...security, maxLoginAttempts: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3회</SelectItem>
                  <SelectItem value="5">5회</SelectItem>
                  <SelectItem value="10">10회</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>2단계 인증 필수</Label>
                <p className="text-sm text-muted-foreground">모든 사용자에게 2단계 인증 강제</p>
              </div>
              <Switch
                checked={security.twoFactorRequired}
                onCheckedChange={(checked) => setSecurity({ ...security, twoFactorRequired: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP 화이트리스트</Label>
                <p className="text-sm text-muted-foreground">허용된 IP에서만 접근 가능</p>
              </div>
              <Switch
                checked={security.ipWhitelist}
                onCheckedChange={(checked) => setSecurity({ ...security, ipWhitelist: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>감사 로깅</Label>
                <p className="text-sm text-muted-foreground">모든 관리자 활동 기록</p>
              </div>
              <Switch
                checked={security.auditLogging}
                onCheckedChange={(checked) => setSecurity({ ...security, auditLogging: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveSecurity}>보안 설정 저장</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            알림 설정
          </CardTitle>
          <CardDescription>시스템 관리자 알림을 설정하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>시스템 경고</Label>
                <p className="text-sm text-muted-foreground">시스템 오류 및 경고 알림</p>
              </div>
              <Switch
                checked={notifications.systemAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>사용자 등록</Label>
                <p className="text-sm text-muted-foreground">새로운 사용자 등록 알림</p>
              </div>
              <Switch
                checked={notifications.userRegistrations}
                onCheckedChange={(checked) => setNotifications({ ...notifications, userRegistrations: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>회사 승인</Label>
                <p className="text-sm text-muted-foreground">회사 등록 승인 요청 알림</p>
              </div>
              <Switch
                checked={notifications.companyApprovals}
                onCheckedChange={(checked) => setNotifications({ ...notifications, companyApprovals: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>보안 이벤트</Label>
                <p className="text-sm text-muted-foreground">보안 관련 이벤트 알림</p>
              </div>
              <Switch
                checked={notifications.securityEvents}
                onCheckedChange={(checked) => setNotifications({ ...notifications, securityEvents: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>성능 경고</Label>
                <p className="text-sm text-muted-foreground">시스템 성능 이슈 알림</p>
              </div>
              <Switch
                checked={notifications.performanceAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, performanceAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>유지보수 공지</Label>
                <p className="text-sm text-muted-foreground">시스템 유지보수 일정 알림</p>
              </div>
              <Switch
                checked={notifications.maintenanceNotices}
                onCheckedChange={(checked) => setNotifications({ ...notifications, maintenanceNotices: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveNotifications}>알림 설정 저장</Button>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            데이터베이스 설정
          </CardTitle>
          <CardDescription>데이터베이스 백업 및 유지보수 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>백업 주기</Label>
              <Select
                value={database.backupFrequency}
                onValueChange={(value) => setDatabase({ ...database, backupFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="매시간">매시간</SelectItem>
                  <SelectItem value="매일">매일</SelectItem>
                  <SelectItem value="매주">매주</SelectItem>
                  <SelectItem value="매월">매월</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>보관 기간</Label>
              <Select
                value={database.retentionPeriod}
                onValueChange={(value) => setDatabase({ ...database, retentionPeriod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7일">7일</SelectItem>
                  <SelectItem value="30일">30일</SelectItem>
                  <SelectItem value="90일">90일</SelectItem>
                  <SelectItem value="1년">1년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>자동 정리</Label>
                <p className="text-sm text-muted-foreground">오래된 데이터 자동 삭제</p>
              </div>
              <Switch
                checked={database.autoCleanup}
                onCheckedChange={(checked) => setDatabase({ ...database, autoCleanup: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>압축 활성화</Label>
                <p className="text-sm text-muted-foreground">백업 파일 압축</p>
              </div>
              <Switch
                checked={database.compressionEnabled}
                onCheckedChange={(checked) => setDatabase({ ...database, compressionEnabled: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveDatabase}>데이터베이스 설정 저장</Button>
        </CardContent>
      </Card>
    </div>
  )
}
