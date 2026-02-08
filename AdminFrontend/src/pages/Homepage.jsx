import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchGMVStatistics, fetchRevenueByShop } from "../services/adminRevenueServices";

function StatCard({ title, value, subtext, icon }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
                    {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
                </div>
                {icon && <div className="text-3xl text-slate-300">{icon}</div>}
            </div>
        </div>
    );
}

export default function Homepage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const [loading, setLoading] = useState(false);
    const [gmvData, setGmvData] = useState(null);
    const [revenueByShop, setRevenueByShop] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    const loadRevenueData = async () => {
        try {
            setLoading(true);
            const params = { period: "month" };
            const gmvResponse = await fetchGMVStatistics(params);
            setGmvData(gmvResponse);

            const shopResponse = await fetchRevenueByShop({ page: 1, limit: 10 });
            setRevenueByShop(shopResponse);
        } catch (err) {
            console.error("Error loading revenue data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin && activeTab === "analytics") {
            loadRevenueData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, activeTab]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

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
                    {/* Tab Navigation */}
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
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
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

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div className="space-y-6">
                            {/* Total GMV Stats */}
                            {gmvData?.totals && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard
                                        title="Total GMV"
                                        value={formatCurrency(gmvData.totals.totalGMV || 0)}
                                        subtext={`${gmvData.totals.totalOrders || 0} đơn hàng`}
                                        icon="💰"
                                    />
                                    <StatCard
                                        title="Average Order Value"
                                        value={formatCurrency(gmvData.totals.averageOrderValue || 0)}
                                        subtext="Giá trị trung bình"
                                        icon="📊"
                                    />
                                    <StatCard
                                        title="Total Orders"
                                        value={gmvData.totals.totalOrders || 0}
                                        subtext={`GMV: ${formatCurrency(gmvData.totals.totalGMV || 0)}`}
                                        icon="📦"
                                    />
                                </div>
                            )}

                            {/* Revenue by Shop */}
                            {revenueByShop?.items && revenueByShop.items.length > 0 && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-slate-900">
                                            Revenue by Shop
                                        </h3>
                                        {revenueByShop?.totals && (
                                            <div className="text-sm text-slate-600">
                                                Total: <span className="font-semibold text-slate-900">
                                                    {formatCurrency(revenueByShop.totals.totalRevenue || 0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b border-slate-200 bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                                        Shop Name
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Total Revenue
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Orders
                                                    </th>
                                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                                        Avg Order Value
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {revenueByShop.items.map((shop, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-slate-900">
                                                            {shop.shopName || "Unknown"}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-900 font-medium">
                                                            {formatCurrency(shop.totalRevenue || 0)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-600">
                                                            {shop.orderCount || 0}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-slate-600">
                                                            {formatCurrency(shop.averageOrderValue || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-12">
                                    <div className="inline-block">
                                        <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-slate-600 mt-3">Đang tải dữ liệu...</p>
                                </div>
                            )}

                            {/* No Data State */}
                            {!loading && !gmvData?.statistics && (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-slate-600">Không có dữ liệu để hiển thị</p>
                                </div>
                            )}
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
