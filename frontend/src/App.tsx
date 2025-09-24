import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { useAuthStore } from '@store/authStore';
import { Toaster } from '@components/ui/toaster';

// Auth Pages
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@pages/auth/SignupPage'));
const CompanySetupPage = lazy(() => import('@pages/auth/CompanySetupPage'));
const JoinCompanyPage = lazy(() => import('@pages/auth/JoinCompanyPage'));
const PendingApprovalPage = lazy(() => import('@pages/auth/PendingApprovalPage'));
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@pages/auth/ResetPasswordPage'));

// Admin Pages - System
const SystemDashboardPage = lazy(() => import('@pages/admin/system/SystemDashboardPage'));
const SystemRequestsPage = lazy(() => import('@pages/admin/system/SystemRequestsPage'));
const SystemCompaniesPage = lazy(() => import('@pages/admin/system/SystemCompaniesPage'));
const SystemUsersPage = lazy(() => import('@pages/admin/system/SystemUsersPage'));
const SystemSettingsPage = lazy(() => import('@pages/admin/system/SystemSettingsPage'));

// Admin Pages - Company
const CompanyDashboardPage = lazy(() => import('@pages/admin/company/CompanyDashboardPage'));
const CompanyCreateProjectPage = lazy(
  () => import('@pages/admin/company/CompanyCreateProjectPage')
);
const CompanyProjectsPage = lazy(() => import('@pages/admin/company/CompanyProjectsPage'));
const CompanyTeamPage = lazy(() => import('@pages/admin/company/CompanyTeamPage'));
const CompanyInvitePage = lazy(() => import('@pages/admin/company/CompanyInvitePage'));
const CompanySettingsPage = lazy(() => import('@pages/admin/company/CompanySettingsPage'));
const CompanyProjectDetailPage = lazy(
  () => import('@pages/admin/company/CompanyProjectDetailPage')
);

// Member Pages
const MemberDashboardPage = lazy(() => import('@pages/dashboard/member/MemberDashboardPage'));
const MemberProjectsPage = lazy(() => import('@pages/dashboard/member/MemberProjectsPage'));
const MemberProjectDetailPage = lazy(
  () => import('@pages/dashboard/member/MemberProjectDetailPage')
);
const MemberTasksPage = lazy(() => import('@pages/dashboard/member/MemberTasksPage'));
const MemberTeamPage = lazy(() => import('@pages/dashboard/member/MemberTeamPage'));
const MemberSettingsPage = lazy(() => import('@pages/dashboard/member/MemberSettingsPage'));

// General Pages
const ProfilePage = lazy(() => import('@pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

function App() {
  const user = useAuthStore((state) => state.user);

  const getDefaultRoute = () => {
    console.log('user', user);
    if (!user) return '/auth/login';

    switch (user.role_id) {
      case 1:
        return '/admin/system';
      case 2:
        return user.status_id === 1 ? '/admin/company' : '/auth/pending-approval';
      case 3:
        return user.status_id === 1 ? '/dashboard/member' : '/auth/pending-approval';
      default:
        return '/auth/login';
    }
  };

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to={getDefaultRoute()} /> : <LoginPage />} />

          {/* Auth Routes */}
          <Route path="/auth">
            <Route
              path="login"
              element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />}
            />
            <Route path="signup" element={<SignupPage />} />
            <Route path="company-setup" element={<CompanySetupPage />} />
            <Route path="join-company" element={<JoinCompanyPage />} />
            <Route path="pending-approval" element={<PendingApprovalPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* UI Testing Routes (Authentication Bypassed) */}
          {/* System Admin Routes - SYSTEM_ADMIN(1)만 접근 가능 */}
          <Route path="/admin/system" element={<ProtectedRoute allowedRoles={[1]} />}>
            <Route index element={<SystemDashboardPage />} />
            <Route path="requests" element={<SystemRequestsPage />} />
            <Route path="companies" element={<SystemCompaniesPage />} />
            <Route path="users" element={<SystemUsersPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

          {/* Company Admin Routes - COMPANY_MANAGER(2)만 접근 가능 */}
          <Route path="/admin/company" element={<ProtectedRoute allowedRoles={[2]} />}>
            <Route index element={<CompanyDashboardPage />} />
            <Route path="create-project" element={<CompanyCreateProjectPage />} />
            <Route path="projects" element={<CompanyProjectsPage />} />
            <Route path="projects/:id" element={<CompanyProjectDetailPage />} />
            <Route path="team" element={<CompanyTeamPage />} />
            <Route path="invite" element={<CompanyInvitePage />} />
            <Route path="settings" element={<CompanySettingsPage />} />
          </Route>

          {/* Team Member Routes - TEAM_MEMBER(3)만 접근 가능 */}
          <Route path="/dashboard/member" element={<ProtectedRoute allowedRoles={[3]} />}>
            <Route index element={<MemberDashboardPage />} />
            <Route path="projects" element={<MemberProjectsPage />} />
            <Route path="projects/:id" element={<MemberProjectDetailPage />} />
            <Route path="tasks" element={<MemberTasksPage />} />
            <Route path="team" element={<MemberTeamPage />} />
            <Route path="settings" element={<MemberSettingsPage />} />
          </Route>

          {/* Profile - 모든 로그인 사용자 접근 가능 */}
          <Route path="/profile" element={<ProtectedRoute />}>
            <Route index element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
