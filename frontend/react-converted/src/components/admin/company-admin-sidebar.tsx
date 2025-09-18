import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Building2, Users, FolderPlus, BarChart3, Settings, LogOut, Briefcase, UserPlus } from "lucide-react"
import { Link } from 'react-router-dom'

import { cn } from "@/lib/utils"

const navigation = [
  { name: "대시보드", href: "/admin/company", icon: BarChart3 },
  { name: "프로젝트 생성", href: "/admin/company/create-project", icon: FolderPlus },
  { name: "프로젝트 관리", href: "/admin/company/projects", icon: Briefcase },
  { name: "팀원 관리", href: "/admin/company/team", icon: Users },
  { name: "팀원 초대", href: "/admin/company/invite", icon: UserPlus },
  { name: "설정", href: "/admin/company/settings", icon: Settings },
]

export function CompanyAdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">회사 관리자</h1>
            <p className="text-sm text-sidebar-foreground/70">테크스타트업</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/company/projects" && pathname.startsWith("/admin/company/projects/"))
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
