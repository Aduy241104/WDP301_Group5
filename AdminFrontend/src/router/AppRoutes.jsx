import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicRoute, PrivateRoute, SellerRoute } from "./guards";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import SellerDashboard from "../pages/SellerDashboard";
import NotFound from "../pages/NotFound";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public-only: chỉ /login */ }
            <Route element={ <PublicRoute /> }>
                <Route path="/login" element={ <LoginPage /> } />
            </Route>

            {/* ALL PRIVATE: mọi thứ còn lại */ }
            <Route element={ <PrivateRoute /> }>
                <Route path="/" element={ <HomePage /> } />
                <Route path="/profile" element={ <ProfilePage /> } />

                {/* Seller (vẫn nằm trong private) */ }
                <Route element={ <SellerRoute /> }>
                    <Route path="/seller" element={ <SellerDashboard /> } />
                </Route>

                {/* 404 (private luôn) */ }
                <Route path="*" element={ <NotFound /> } />
            </Route>
        </Routes>

    );
}
