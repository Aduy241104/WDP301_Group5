import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute, PrivateRoute, SellerRoute, AdminRoute } from "./guards";
import AdminLayoutRoute from "./AdminLayoutRoute";

import HomePage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import SellerDashboard from "../pages/SellerDashboard";
import NotFound from "../pages/NotFound";
import AdminSellerRequestApproval from "../pages/AdminSellerRequestApproval";
import AdminSellerList from "../pages/AdminSellerList";
import AdminSellerProfile from "../pages/AdminSellerProfile";
import AdminShopList from "../pages/AdminShopList";
import AdminShopDetail from "../pages/AdminShopDetail";
import AdminUserList from "../pages/AdminUserList";
import AdminUserProfile from "../pages/AdminUserProfile";
import AdminBannerList from "../pages/AdminBannerList";
import AdminBannerForm from "../pages/AdminBannerForm";
import AdminReportList from "../pages/AdminReportList";
import AdminReportDetail from "../pages/AdminReportDetail";


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
                        <Route index element={<HomePage />} />
                        <Route path="seller-requests" element={<AdminSellerRequestApproval />} />
                        <Route path="sellers" element={<AdminSellerList />} />
                        <Route path="sellers/:userId" element={<AdminSellerProfile />} />
                        <Route path="shops" element={<AdminShopList />} />
                        <Route path="shops/:shopId" element={<AdminShopDetail />} />
                        <Route path="users" element={<AdminUserList />} />
                        <Route path="users/:userId" element={<AdminUserProfile />} />
                        <Route path="banners" element={<AdminBannerList />} />
                        <Route path="banners/new" element={<AdminBannerForm />} />
                        <Route path="banners/:bannerId/edit" element={<AdminBannerForm />} />
                        <Route path="reports" element={<AdminReportList />} />
                        <Route path="reports/:reportId" element={<AdminReportDetail />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
