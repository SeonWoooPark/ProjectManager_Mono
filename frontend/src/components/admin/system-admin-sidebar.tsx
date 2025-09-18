import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { Building2, Users, FileCheck, BarChart3, Settings, LogOut, Shield } from "lucide-react"
import { Link, useLocation } from 'react-router-dom'

import { cn } from "@/lib/utils"

const navigation = [
  { name: "대시보드", href: "/admin/system", icon: BarChart3 },
  { name: "승인 요청", href: "/admin/system/requests", icon: FileCheck },
  { name: "회사 관리", href: "/admin/system/companies", icon: Building2 },
  { name: "사용자 관리", href: "/admin/system/users", icon: Users },
  { name: "설정", href: "/admin/system/settings", icon: Settings },
]

export function SystemAdminSidebar() {
  const { pathname } = useLocation()

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-9 w-9 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">시스템 관리자</h1>
            <p className="text-sm text-gray-500">관리 콘솔</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-200">
        <Link to="/auth/login">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </Link>
      </div>
    </div>
  )
}
