import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicRoute, PrivateRoute, SellerRoute } from "./guards";

import HomePage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import SellerDashboard from "../pages/SellerDashboard";
import NotFound from "../pages/NotFound";
import RegisterPage from "../pages/RegisterPage";
import MainLayoutRoute from "./MainLayoutRoute";
import ForgotPasswordPage from "../pages/ResetPassword/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPassword/ResetPasswordPage";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public pages */ }
            <Route element={ <MainLayoutRoute /> }>
                <Route path="/" element={ <HomePage /> } />
            </Route>

            {/* Public-only (đã login thì không vào /login) */ }
            <Route element={ <PublicRoute /> }>
                <Route path="/login" element={ <LoginPage /> } />
                <Route path="/register" element={ <RegisterPage /> } />
                <Route path="/forgot-password" element={ <ForgotPasswordPage /> } />
                <Route path="/reset-password" element={ <ResetPasswordPage /> } />
            </Route>

            {/* Private routes */ }
            <Route element={ <PrivateRoute /> }>
                <Route path="/profile" element={ <ProfilePage /> } />
            </Route>

            {/* Seller routes */ }
            <Route element={ <SellerRoute /> }>
                <Route path="/seller" element={ <SellerDashboard /> } />
            </Route>

            {/* 404 */ }
            <Route path="*" element={ <NotFound /> } />
        </Routes>
    );
}
