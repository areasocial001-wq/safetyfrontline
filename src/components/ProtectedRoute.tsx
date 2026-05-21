import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || (user && roleLoading)) return <Spinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && roles.length > 0 && (!role || !roles.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
