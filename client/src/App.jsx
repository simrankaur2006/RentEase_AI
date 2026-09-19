import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Favourites from './pages/Favourites';
import Compare from './pages/Compare';
import Recommendations from './pages/Recommendations';
import TenantDashboard from './pages/TenantDashboard';
import MyInquiries from './pages/MyInquiries';
import Profile from './pages/Profile';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProperties from './pages/owner/OwnerProperties';
import PropertyForm from './pages/owner/PropertyForm';
import OwnerInquiries from './pages/owner/OwnerInquiries';
import OwnerReviews from './pages/owner/OwnerReviews';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminUsers from './pages/admin/AdminUsers';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

/** Sends first time users to the preference onboarding form. */
function OnboardingGate() {
  const { isSignedIn, profile, needsOnboarding } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const skipOn = ['/onboarding', '/login', '/register'];
    const shouldSkip = skipOn.some((path) => location.pathname.startsWith(path));
    if (isSignedIn && profile && needsOnboarding && profile.role !== 'admin' && !shouldSkip) {
      navigate('/onboarding', { replace: true });
    }
  }, [isSignedIn, profile, needsOnboarding, location.pathname, navigate]);

  return null;
}

/** Uses the dashboard shell that matches the signed-in user's role. */
function RoleDashboardLayout() {
  const { role } = useApp();
  return <DashboardLayout variant={role === 'admin' ? 'admin' : role === 'owner' ? 'owner' : 'tenant'} />;
}

export default function App() {
  return (
    <>
      <OnboardingGate />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Landing />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/login/*" element={<Login />} />
          <Route path="/register/*" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><Compare /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />

          {/* Tenant dashboard */}
          <Route
            element={
              <ProtectedRoute roles={['tenant', 'admin']}>
                <DashboardLayout variant="tenant" />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<TenantDashboard />} />
            <Route path="/inquiries" element={<MyInquiries />} />
          </Route>

          {/* Profile is shared by every role */}
          <Route element={<ProtectedRoute><RoleDashboardLayout /></ProtectedRoute>}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Owner workspace */}
          <Route
            element={
              <ProtectedRoute roles={['owner', 'admin']}>
                <DashboardLayout variant="owner" />
              </ProtectedRoute>
            }
          >
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/properties" element={<OwnerProperties />} />
            <Route path="/owner/properties/new" element={<PropertyForm />} />
            <Route path="/owner/properties/:id/edit" element={<PropertyForm editing />} />
            <Route path="/owner/inquiries" element={<OwnerInquiries />} />
            <Route path="/owner/reviews" element={<OwnerReviews />} />
          </Route>

          {/* Admin console */}
          <Route
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout variant="admin" />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
