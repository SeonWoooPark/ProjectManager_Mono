import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  const location = useLocation()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">시스템 관리자</h1>
            <p className="text-sm text-sidebar-foreground/70">관리 콘솔</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name}  to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

      <div className="absolute bottom-0 w-64 p-6">
        <Separator className="mb-4" />
        <Link  to="/auth/login">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </Link>
      </div>
    </div>
  )
}
