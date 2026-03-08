import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminUserAnalytics from "./AdminUserAnalytics";
import AdminRevenueAnalytics from "./AdminRevenueAnalytics";

export default function Homepage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">
                    Xin chào, {user?.fullName || user?.email || "bạn"}.
                </p>
            </div>

            {!isAdmin ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-700">
                    Tài khoản này không có quyền Admin.
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-200 bg-white rounded-t-xl px-6 pt-4">

                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`pb-3 px-4 font-medium text-sm transition ${
                                activeTab === "overview"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Tổng quan
                        </button>

                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`pb-3 px-4 font-medium text-sm transition ${
                                activeTab === "analytics"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Revenue Analytics
                        </button>

                        <button
                            onClick={() => setActiveTab("useranalytics")}
                            className={`pb-3 px-4 font-medium text-sm transition ${
                                activeTab === "useranalytics"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            User Analytics
                        </button>

                    </div>

                    {/* OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="grid gap-4 sm:grid-cols-2">

                            <QuickCard
                                to="/admin/seller-requests"
                                title="Duyệt yêu cầu Seller"
                                desc="Xem và duyệt các yêu cầu đăng ký seller đang chờ xử lý."
                                icon="📩"
                            />

                            <QuickCard
                                to="/admin/sellers"
                                title="Danh sách Seller"
                                desc="Quản lý danh sách seller đã được duyệt."
                                icon="👤"
                            />

                            <QuickCard
                                to="/admin/shops"
                                title="Danh sách Shop"
                                desc="Xem và lọc shop theo trạng thái."
                                icon="🏪"
                            />

                        </div>
                    )}

                    {/* REVENUE ANALYTICS */}
                    {activeTab === "analytics" && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <AdminRevenueAnalytics />
                        </div>
                    )}

                    {/* USER ANALYTICS */}
                    {activeTab === "useranalytics" && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <AdminUserAnalytics />
                        </div>
                    )}

                </>
            )}

        </div>
    );
}

function QuickCard({ to, title, desc, icon }) {
    return (
        <Link
            to={to}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow hover:border-blue-200 transition group"
        >
            <div className="flex items-center gap-3 mb-3">

                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    {icon}
                </div>

                <div>
                    <h2 className="font-bold text-slate-900">{title}</h2>
                    <p className="text-xs text-slate-500">Admin</p>
                </div>

            </div>

            <p className="text-sm text-slate-600">{desc}</p>
        </Link>
    );
}