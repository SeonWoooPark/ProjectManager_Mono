import { SystemAdminSidebar } from "@components/admin/system-admin-sidebar"
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
    <div className="flex h-screen bg-background">
      <SystemAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">시스템 설정</h1>
            <p className="text-muted-foreground">전체 시스템의 설정과 구성을 관리하세요</p>
          </div>

          {/* System Information */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                시스템 정보
              </h3>
              <p className="text-sm text-muted-foreground">기본적인 시스템 정보와 설정</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">시스템 이름</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={systemInfo.systemName}
                    onChange={(e) => setSystemInfo({ ...systemInfo, systemName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">버전</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={systemInfo.version}
                    onChange={(e) => setSystemInfo({ ...systemInfo, version: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">시스템 설명</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={systemInfo.description}
                  onChange={(e) => setSystemInfo({ ...systemInfo, description: e.target.value })}
                  placeholder="시스템에 대한 설명을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">지원 이메일</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="email"
                    value={systemInfo.supportEmail}
                    onChange={(e) => setSystemInfo({ ...systemInfo, supportEmail: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">유지보수 모드</label>
                    <p className="text-sm text-muted-foreground">시스템 점검 시 활성화</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={systemInfo.maintenanceMode}
                    onClick={() => setSystemInfo({ ...systemInfo, maintenanceMode: !systemInfo.maintenanceMode })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      systemInfo.maintenanceMode ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      systemInfo.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveSystemInfo}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                시스템 정보 저장
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="m9 12 2 2 4-4"/>
                  <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/>
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                </svg>
                보안 설정
              </h3>
              <p className="text-sm text-muted-foreground">시스템 전체의 보안 정책을 설정하세요</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">최소 비밀번호 길이</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={security.passwordMinLength}
                    onChange={(e) => setSecurity({ ...security, passwordMinLength: e.target.value })}
                  >
                    <option value="6">6자</option>
                    <option value="8">8자</option>
                    <option value="10">10자</option>
                    <option value="12">12자</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">세션 타임아웃</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  >
                    <option value="1시간">1시간</option>
                    <option value="4시간">4시간</option>
                    <option value="8시간">8시간</option>
                    <option value="24시간">24시간</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">최대 로그인 시도</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity({ ...security, maxLoginAttempts: e.target.value })}
                  >
                    <option value="3">3회</option>
                    <option value="5">5회</option>
                    <option value="10">10회</option>
                  </select>
                </div>
              </div>
              <div className="my-4 border-t" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">2단계 인증 필수</label>
                    <p className="text-sm text-muted-foreground">모든 사용자에게 2단계 인증 강제</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={security.twoFactorRequired}
                    onClick={() => setSecurity({ ...security, twoFactorRequired: !security.twoFactorRequired })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      security.twoFactorRequired ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      security.twoFactorRequired ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">IP 화이트리스트</label>
                    <p className="text-sm text-muted-foreground">허용된 IP에서만 접근 가능</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={security.ipWhitelist}
                    onClick={() => setSecurity({ ...security, ipWhitelist: !security.ipWhitelist })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      security.ipWhitelist ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      security.ipWhitelist ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">감사 로깅</label>
                    <p className="text-sm text-muted-foreground">모든 관리자 활동 기록</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={security.auditLogging}
                    onClick={() => setSecurity({ ...security, auditLogging: !security.auditLogging })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      security.auditLogging ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      security.auditLogging ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveSecurity}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                보안 설정 저장
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                알림 설정
              </h3>
              <p className="text-sm text-muted-foreground">시스템 관리자 알림을 설정하세요</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">시스템 경고</label>
                    <p className="text-sm text-muted-foreground">시스템 오류 및 경고 알림</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.systemAlerts}
                    onClick={() => setNotifications({ ...notifications, systemAlerts: !notifications.systemAlerts })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      notifications.systemAlerts ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      notifications.systemAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">사용자 등록</label>
                    <p className="text-sm text-muted-foreground">새로운 사용자 등록 알림</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.userRegistrations}
                    onClick={() => setNotifications({ ...notifications, userRegistrations: !notifications.userRegistrations })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      notifications.userRegistrations ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      notifications.userRegistrations ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">회사 승인</label>
                    <p className="text-sm text-muted-foreground">회사 등록 승인 요청 알림</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.companyApprovals}
                    onClick={() => setNotifications({ ...notifications, companyApprovals: !notifications.companyApprovals })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      notifications.companyApprovals ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      notifications.companyApprovals ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">보안 이벤트</label>
                    <p className="text-sm text-muted-foreground">보안 관련 이벤트 알림</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.securityEvents}
                    onClick={() => setNotifications({ ...notifications, securityEvents: !notifications.securityEvents })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      notifications.securityEvents ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      notifications.securityEvents ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">성능 경고</label>
                    <p className="text-sm text-muted-foreground">시스템 성능 이슈 알림</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.performanceAlerts}
                    onClick={() => setNotifications({ ...notifications, performanceAlerts: !notifications.performanceAlerts })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      notifications.performanceAlerts ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      notifications.performanceAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">유지보수 공지</label>
                    <p className="text-sm text-muted-foreground">시스템 유지보수 일정 알림</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.maintenanceNotices}
                    onClick={() => setNotifications({ ...notifications, maintenanceNotices: !notifications.maintenanceNotices })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      notifications.maintenanceNotices ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      notifications.maintenanceNotices ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveNotifications}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                알림 설정 저장
              </button>
            </div>
          </div>

          {/* Database Settings */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                  <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
                </svg>
                데이터베이스 설정
              </h3>
              <p className="text-sm text-muted-foreground">데이터베이스 백업 및 유지보수 설정</p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">백업 주기</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={database.backupFrequency}
                    onChange={(e) => setDatabase({ ...database, backupFrequency: e.target.value })}
                  >
                    <option value="매시간">매시간</option>
                    <option value="매일">매일</option>
                    <option value="매주">매주</option>
                    <option value="매월">매월</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">보관 기간</label>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={database.retentionPeriod}
                    onChange={(e) => setDatabase({ ...database, retentionPeriod: e.target.value })}
                  >
                    <option value="7일">7일</option>
                    <option value="30일">30일</option>
                    <option value="90일">90일</option>
                    <option value="1년">1년</option>
                  </select>
                </div>
              </div>
              <div className="my-4 border-t" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">자동 정리</label>
                    <p className="text-sm text-muted-foreground">오래된 데이터 자동 삭제</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={database.autoCleanup}
                    onClick={() => setDatabase({ ...database, autoCleanup: !database.autoCleanup })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      database.autoCleanup ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      database.autoCleanup ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">압축 활성화</label>
                    <p className="text-sm text-muted-foreground">백업 파일 압축</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={database.compressionEnabled}
                    onClick={() => setDatabase({ ...database, compressionEnabled: !database.compressionEnabled })}
                    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                      database.compressionEnabled ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      database.compressionEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveDatabase}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                데이터베이스 설정 저장
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}