import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PublicRoute() {
    const { isAuthenticated } = useAuth();

    // Nếu đã login rồi mà vào /login thì đá về /
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <Outlet />;
}

export function PrivateRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={ { from: location } } />;
    }
    return <Outlet />;
}

export function SellerRoute() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const role = user?.role ?? user?.data?.role ?? null;

    if (role !== "seller") {
        // không đủ quyền -> đá về / (hoặc /403)
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export function AdminRoute() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const role = user?.role ?? user?.data?.role ?? null;

    if (role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
