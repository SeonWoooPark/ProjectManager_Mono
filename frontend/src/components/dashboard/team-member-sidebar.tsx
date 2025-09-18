import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { User, Briefcase, CheckSquare, Users, Settings, LogOut, BarChart3 } from "lucide-react"
import { Link, useLocation } from 'react-router-dom'

import { cn } from "@/lib/utils"

const navigation = [
  { name: "대시보드", href: "/dashboard/member", icon: BarChart3 },
  { name: "내 프로젝트", href: "/dashboard/member/projects", icon: Briefcase },
  { name: "내 작업", href: "/dashboard/member/tasks", icon: CheckSquare },
  { name: "팀원 현황", href: "/dashboard/member/team", icon: Users },
  { name: "설정", href: "/dashboard/member/settings", icon: Settings },
]

export function TeamMemberSidebar() {
  const { pathname } = useLocation()

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-9 w-9 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">팀원</h1>
            <p className="text-sm text-gray-500">김철수</p>
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
