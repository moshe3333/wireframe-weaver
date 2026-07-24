import { Navigate } from "react-router-dom";
import { getAuthData, isAuthenticated } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  const { role } = getAuthData();
  const roleLower = (role || 'student').trim().toLowerCase();

  if (allowedRoles && !allowedRoles.map(r => r.trim().toLowerCase()).includes(roleLower)) {
    // If user's role is not allowed for this route, redirect to their specific dashboard
    if (roleLower === 'admin') return <Navigate to="/dashboard" replace />;
    if (roleLower === 'instructor') return <Navigate to="/instructor-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
