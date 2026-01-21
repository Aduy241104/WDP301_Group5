import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicRoute, PrivateRoute, SellerRoute } from "./guards";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import SellerDashboard from "../pages/Seller/SellerDashboard";
import NotFound from "../pages/NotFound";
import RegisterPage from "../pages/RegisterPage";
import MainLayoutRoute from "./MainLayoutRoute";
import SellerLayout from "../layouts/sellerLayout/SellerLayout";

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
                <Route path="/seller" element={ <SellerDashboard /> } />
            </Route>

            {/* Private routes */ }
            <Route element={ <PrivateRoute /> }>
                <Route path="/profile" element={ <ProfilePage /> } />
            </Route>

            {/* Seller routes */ }
            <Route element={ <SellerRoute /> }>
                <Route path="/seller-center" element={ <SellerLayout><SellerDashboard /></SellerLayout> } />
                
            </Route>

            {/* 404 */ }
            <Route path="*" element={ <NotFound /> } />
        </Routes>
    );
}
