import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '@components/templates/Layout';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import ProtectedRoute from '@components/molecules/ProtectedRoute';
import { useAuthStore } from '@store/authStore';

const HomePage = lazy(() => import('@pages/HomePage'));
const LoginPage = lazy(() => import('@pages/LoginPage'));
const DashboardPage = lazy(() => import('@pages/DashboardPage'));
const ProfilePage = lazy(() => import('@pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@pages/NotFoundPage'));

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;