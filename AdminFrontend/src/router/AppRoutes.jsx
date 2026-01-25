import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute, PrivateRoute, SellerRoute, AdminRoute } from "./guards";
import AdminLayoutRoute from "./AdminLayoutRoute";

import HomePage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import SellerDashboard from "../pages/SellerDashboard";
import NotFound from "../pages/NotFound";
import AdminSellerRegistrationList from "../pages/AdminSellerRegistrationList";
import AdminSellerProfile from "../pages/AdminSellerProfile";
import AdminShopList from "../pages/AdminShopList";

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<PrivateRoute />}>
                <Route element={<AdminLayoutRoute />}>
                    <Route path="/" element={<HomePage />} />
                </Route>

                <Route element={<SellerRoute />}>
                    <Route path="/seller" element={<SellerDashboard />} />
                </Route>

                {/* Admin: layout + trang Seller Management */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayoutRoute />}>
                        <Route index element={<Navigate to="/admin/seller-registrations" replace />} />
                        <Route path="seller-registrations" element={<AdminSellerRegistrationList />} />
                        <Route path="sellers/:userId" element={<AdminSellerProfile />} />
                        <Route path="shops" element={<AdminShopList />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
