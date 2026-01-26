import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Homepage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

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
                <div className="grid gap-4 sm:grid-cols-2">
                    <QuickCard
                        to="/admin/seller-requests"
                        title="Duyệt yêu cầu Seller"
                        desc="Xem và duyệt các yêu cầu đăng ký seller đang chờ xử lý."
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M9 12l2 2 4-4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                            </svg>
                        }
                    />

                    <QuickCard
                        to="/admin/sellers"
                        title="Danh sách Seller"
                        desc="Quản lý danh sách seller đã được duyệt, khóa/mở khóa tài khoản."
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M20 8v6M23 11h-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        }
                    />

                    <QuickCard
                        to="/admin/shops"
                        title="Danh sách Shop"
                        desc="Xem và lọc shop theo trạng thái, mở hồ sơ seller."
                        icon={
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        }
                    />
                </div>
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
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition">
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
