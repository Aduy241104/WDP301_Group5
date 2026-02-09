import React, { useEffect, useState } from "react";
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

export default function AdminRevenueAnalytics() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [gmvData, setGmvData] = useState(null);
    const [revenueByShop, setRevenueByShop] = useState(null);
    const [period, setPeriod] = useState("month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [shopPage, setShopPage] = useState(1);
    const [shopLimit, setShopLimit] = useState(10);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const params = { period };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const gmvResponse = await fetchGMVStatistics(params);
            setGmvData(gmvResponse);

            const shopParams = { page: shopPage, limit: shopLimit };
            if (startDate) shopParams.startDate = startDate;
            if (endDate) shopParams.endDate = endDate;

            const shopResponse = await fetchRevenueByShop(shopParams);
            setRevenueByShop(shopResponse);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải dữ liệu thống kê.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, shopPage, shopLimit, startDate, endDate]);

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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
                <p className="text-slate-500 mt-1">Xem thống kê doanh thu, GMV và hiệu suất bán hàng theo shop</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h3 className="font-semibold text-slate-900">Bộ lọc</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Khoảng thời gian
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="day">Theo ngày</option>
                            <option value="month">Theo tháng</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setStartDate("");
                                setEndDate("");
                                setPeriod("month");
                            }}
                            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
                        >
                            Đặt lại
                        </button>
                    </div>
                </div>
            </div>

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

            {/* GMV by Period Chart Data */}
            {gmvData?.statistics && gmvData.statistics.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                        Total GMV by {period === "day" ? "Day" : "Month"}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                        Ngày
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                        Total GMV
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
                                {gmvData.statistics.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-900">{item.date}</td>
                                        <td className="px-4 py-3 text-right text-slate-900 font-medium">
                                            {formatCurrency(item.totalGMV || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">
                                            {item.orderCount || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">
                                            {formatCurrency(item.averageOrderValue || 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                        Subtotal
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                        Shipping Fee
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
                                        <td className="px-4 py-3 text-right text-slate-600">
                                            {formatCurrency(shop.subtotal || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">
                                            {formatCurrency(shop.shippingFee || 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {revenueByShop?.paging && revenueByShop.paging.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                                Page {revenueByShop.paging.page} of {revenueByShop.paging.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShopPage(Math.max(1, shopPage - 1))}
                                    disabled={shopPage === 1}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                                >
                                    ← Previous
                                </button>
                                <button
                                    onClick={() => setShopPage(shopPage + 1)}
                                    disabled={shopPage >= revenueByShop.paging.totalPages}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
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
    );
}
