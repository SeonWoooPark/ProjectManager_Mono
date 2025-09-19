import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import ProtectedRoute from '@components/molecules/ProtectedRoute';
import { useAuthStore } from '@store/authStore';

// Auth Pages
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const SignupPage = lazy(() => import('@pages/auth/SignupPage'));
const CompanySetupPage = lazy(() => import('@pages/auth/CompanySetupPage'));
const JoinCompanyPage = lazy(() => import('@pages/auth/JoinCompanyPage'));
const PendingApprovalPage = lazy(() => import('@pages/auth/PendingApprovalPage'));

// Admin Pages - System
const SystemDashboardPage = lazy(() => import('@pages/admin/system/SystemDashboardPage'));
const SystemRequestsPage = lazy(() => import('@pages/admin/system/SystemRequestsPage'));
const SystemCompaniesPage = lazy(() => import('@pages/admin/system/SystemCompaniesPage'));
const SystemUsersPage = lazy(() => import('@pages/admin/system/SystemUsersPage'));
const SystemSettingsPage = lazy(() => import('@pages/admin/system/SystemSettingsPage'));

// Admin Pages - Company
const CompanyDashboardPage = lazy(() => import('@pages/admin/company/CompanyDashboardPage'));
const CompanyCreateProjectPage = lazy(() => import('@pages/admin/company/CompanyCreateProjectPage'));
const CompanyProjectsPage = lazy(() => import('@pages/admin/company/CompanyProjectsPage'));
const CompanyTeamPage = lazy(() => import('@pages/admin/company/CompanyTeamPage'));
const CompanyInvitePage = lazy(() => import('@pages/admin/company/CompanyInvitePage'));
const CompanySettingsPage = lazy(() => import('@pages/admin/company/CompanySettingsPage'));

// Member Pages
const MemberDashboardPage = lazy(() => import('@pages/dashboard/member/MemberDashboardPage'));
const MemberProjectsPage = lazy(() => import('@pages/dashboard/member/MemberProjectsPage'));
const MemberTasksPage = lazy(() => import('@pages/dashboard/member/MemberTasksPage'));
const MemberTeamPage = lazy(() => import('@pages/dashboard/member/MemberTeamPage'));
const MemberSettingsPage = lazy(() => import('@pages/dashboard/member/MemberSettingsPage'));

// General Pages
const HomePage = lazy(() => import('@pages/HomePage'));
const ProfilePage = lazy(() => import('@pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/auth">
          <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard/member" /> : <LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="company-setup" element={<CompanySetupPage />} />
          <Route path="join-company" element={<JoinCompanyPage />} />
          <Route path="pending-approval" element={<PendingApprovalPage />} />
        </Route>
        
        {/* UI Testing Routes (Authentication Bypassed) */}
        {/* System Admin Routes */}
        <Route path="/admin/system">
          <Route index element={<SystemDashboardPage />} />
          <Route path="requests" element={<SystemRequestsPage />} />
          <Route path="companies" element={<SystemCompaniesPage />} />
          <Route path="users" element={<SystemUsersPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>
        
        {/* Company Admin Routes */}
        <Route path="/admin/company">
          <Route index element={<CompanyDashboardPage />} />
          <Route path="create-project" element={<CompanyCreateProjectPage />} />
          <Route path="projects" element={<CompanyProjectsPage />} />
          <Route path="team" element={<CompanyTeamPage />} />
          <Route path="invite" element={<CompanyInvitePage />} />
          <Route path="settings" element={<CompanySettingsPage />} />
        </Route>
        
        {/* Team Member Routes */}
        <Route path="/dashboard/member">
          <Route index element={<MemberDashboardPage />} />
          <Route path="projects" element={<MemberProjectsPage />} />
          <Route path="tasks" element={<MemberTasksPage />} />
          <Route path="team" element={<MemberTeamPage />} />
          <Route path="settings" element={<MemberSettingsPage />} />
        </Route>
        
        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;