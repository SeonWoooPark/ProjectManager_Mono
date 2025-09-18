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

// Admin Pages
const SystemDashboardPage = lazy(() => import('@pages/admin/system/SystemDashboardPage'));
const CompanyDashboardPage = lazy(() => import('@pages/admin/company/CompanyDashboardPage'));

// Member Pages
const MemberDashboardPage = lazy(() => import('@pages/dashboard/member/MemberDashboardPage'));

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
          <Route path="login" element={!isAuthenticated ? <Navigate to="/dashboard/member" /> : <LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="company-setup" element={<CompanySetupPage />} />
          <Route path="join-company" element={<JoinCompanyPage />} />
          <Route path="pending-approval" element={<PendingApprovalPage />} />
        </Route>
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* System Admin Routes */}
          <Route path="/admin/system" element={<SystemDashboardPage />} />
          
          {/* Company Admin Routes */}
          <Route path="/admin/company" element={<CompanyDashboardPage />} />
          
          {/* Team Member Routes */}
          <Route path="/dashboard/member" element={<MemberDashboardPage />} />
          
          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;