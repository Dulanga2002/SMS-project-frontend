import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function ProtectedRoute({ allowedRoles }) {
  const { isLoaded, isSignedIn, user } = useUser();

  // Wait until Clerk loads
  if (!isLoaded) return null;

  // Not logged in → Home page
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  const role = user?.publicMetadata?.role;

  // Role not allowed
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Allowed → render nested routes
  return <Outlet />;
}
