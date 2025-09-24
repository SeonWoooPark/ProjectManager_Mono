import { Button } from '@components/ui/button';
import { Separator } from '@components/ui/separator';
import { User, Briefcase, CheckSquare, Users, Settings, LogOut, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { useLogout } from '@/services/auth/authMutations';

const navigation = [
  { name: '대시보드', href: '/dashboard/member', icon: BarChart3 },
  { name: '내 프로젝트', href: '/dashboard/member/projects', icon: Briefcase },
  { name: '내 작업', href: '/dashboard/member/tasks', icon: CheckSquare },
  { name: '팀원 현황', href: '/dashboard/member/team', icon: Users },
  { name: '설정', href: '/dashboard/member/settings', icon: Settings },
];

export function TeamMemberSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const logoutMutation = useLogout();

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">팀원</h1>
            <p className="text-sm text-sidebar-foreground/70">김철수</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              item.href === '/dashboard/member/projects'
                ? pathname.startsWith('/dashboard/member/projects')
                : pathname === item.href;
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-6">
        <Separator className="mb-4" />
        <Link to="/auth/login">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </Link>
      </div>
    </div>
  );
}
