import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicRoute() {
  const { isAuthenticated } = useAuth();

  // Đã login mà cố vào /login, /register... thì đá về /
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function SellerRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = user?.role?.toLowerCase() ?? null;
  if (role !== "seller") return <Navigate to="/" replace />;

  return <Outlet />;
}
