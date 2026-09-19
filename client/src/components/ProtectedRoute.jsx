import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageLoader } from './ui';

/**
 * Guards a route behind Clerk sign-in and, optionally, an application role.
 * The backend enforces the same rules - this is only for a smooth UI.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isLoaded, isSignedIn, profile, profileLoading } = useApp();
  const location = useLocation();

  if (!isLoaded || profileLoading) return <PageLoader label="Checking your access" />;
  if (!isSignedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
