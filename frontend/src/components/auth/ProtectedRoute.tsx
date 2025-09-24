import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: number[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  // 로그인하지 않은 경우
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 역할 체크 (allowedRoles가 지정된 경우)
  if (allowedRoles && !allowedRoles.includes(user.role_id)) {
    // 권한이 없는 경우 자신의 기본 페이지로 리다이렉트
    const getDefaultRoute = () => {
      switch (user.role_id) {
        case 1: return '/admin/system';
        case 2: return user.status_id === 1 ? '/admin/company' : '/auth/pending-approval';
        case 3: return user.status_id === 1 ? '/dashboard/member' : '/auth/pending-approval';
        default: return '/';
      }
    };
    return <Navigate to={getDefaultRoute()} replace />;
  }

  // children이 있으면 children을, 없으면 Outlet을 렌더링
  return children ? <>{children}</> : <Outlet />;
}