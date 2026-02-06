import React from "react";
import { Routes, Route } from "react-router-dom";
import { PublicRoute, PrivateRoute, SellerRoute } from "./guards";
import HomePage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import AddressPage from "../pages/AddressPage";
import SellerDashboard from "../pages/Seller/SellerDashboard";
import NotFound from "../pages/NotFound";
import RegisterPage from "../pages/RegisterPage";
import MainLayoutRoute from "./MainLayoutRoute";
import ForgotPasswordPage from "../pages/ResetPassword/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPassword/ResetPasswordPage";
import OrderList from "../pages/Seller/OrderList";
import OrderDetail from "../pages/Seller/OrderDetail";
import SellerCancelledOrders from "../pages/Seller/SellerCancelledOrders";
import SellerLayout from "../layouts/sellerLayout/SellerLayout";
import SellerManageStore from "../pages/Seller/SellerManageStore/SellerManageStore";
import SellerReviews from "../pages/Seller/SellerReviews";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import SellerRegisterPage from "../pages/SellerRequest/SellerRegisterPage";
import SellerStoreInformation from "../pages/Seller/StoreInformation/SellerStoreInformation";
import CartPage from "../pages/CartPage";
import SellerProducts from "../pages/Seller/Products/SellerProducts";
import TopSaleProduct from "../pages/TopSaleProduct";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */ }
      <Route element={ <MainLayoutRoute /> }>
        <Route path="/" element={ <HomePage /> } />
        <Route path="/products-detail/:productId" element={ <ProductDetail /> } />
        <Route path="/top-sale" element={ <TopSaleProduct /> } />
      </Route>

      {/* Public-only (đã login thì không vào /login) */ }
      <Route element={ <PublicRoute /> }>
        <Route path="/login" element={ <LoginPage /> } />
        <Route path="/register" element={ <RegisterPage /> } />
        <Route path="/forgot-password" element={ <ForgotPasswordPage /> } />
        <Route path="/reset-password" element={ <ResetPasswordPage /> } />
      </Route>

      {/* Private routes */ }
      <Route element={ <MainLayoutRoute /> }>
        <Route element={ <PrivateRoute /> }>
          <Route path="/profile" element={ <ProfilePage /> } />
          <Route path="/addresses" element={ <AddressPage /> } />
          <Route path="/my-cart" element={ <CartPage /> } />
        </Route>
      </Route>


      <Route element={ <MainLayoutRoute /> }>
        <Route element={ <PrivateRoute /> }>
          <Route path="/request-seller" element={ <SellerRegisterPage /> } />
        </Route>
      </Route>


      {/* Seller routes */ }
      <Route element={ <SellerRoute /> }>
        <Route path="/seller" element={ <SellerLayout /> }>
          {/* ROUTE MẶC ĐỊNH */ }
          <Route index element={ <SellerDashboard /> } />

          {/* ROUTE RÕ RÀNG */ }
          <Route path="dashboard" element={ <SellerDashboard /> } />
          <Route path="store" element={ <SellerManageStore /> } />
          <Route path="reviews" element={ <SellerReviews /> } />
          <Route path="orders" element={ <OrderList /> } />
          <Route path="orders/cancelled" element={ <SellerCancelledOrders /> } />
          <Route path="orders/:id" element={ <OrderDetail /> } />
          {/* ROUTE RÕ RÀNG */ }
          <Route path="dashboard" element={ <SellerDashboard /> } />
          <Route path="store-information" element={ <SellerStoreInformation /> } />
          <Route path="pickup-addresses" element={ <SellerManageStore /> } />
          <Route path="products" element={ <SellerProducts /> } />
          <Route path="orders" element={ <OrderList /> } />
          <Route path="orders/cancelled" element={ <SellerCancelledOrders /> } />
          <Route path="orders/:id" element={ <OrderDetail /> } />
        </Route>
      </Route>

      {/* 404 */ }
      <Route path="*" element={ <NotFound /> } />
    </Routes>
  );
}
