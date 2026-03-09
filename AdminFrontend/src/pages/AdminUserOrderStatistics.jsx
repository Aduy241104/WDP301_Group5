import React, { useEffect, useState } from "react";
import { fetchUserOrderStatistics } from "../services/adminUserServices";

const ROLE_LABELS = {
    user: "Người dùng",
    seller: "Seller",
    admin: "Admin",
};

function StatusPill({ status }) {
    const map = {
        active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
        blocked: { label: "Bị khóa", cls: "bg-rose-50 text-rose-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status ?? ""] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

export default function AdminUserOrderStatistics() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [paging, setPaging] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [overall, setOverall] = useState(null);

    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const loadData = async (page = 1) => {
        try {
            setLoading(true);
            setError("");
            const params = { page, limit: 20 };
            if (keyword.trim()) params.keyword = keyword.trim();
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await fetchUserOrderStatistics(params);
            setItems(res?.items ?? []);
            setPaging(res?.paging ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
            setOverall(res?.overall ?? null);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Không thể tải thống kê đơn hàng người dùng."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, startDate, endDate]);

    const handleSearch = (e) => {
        e?.preventDefault?.();
        setKeyword(searchInput.trim());
    };

    const formatDateTime = (value) => {
        if (!value) return "—";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleString("vi-VN");
    };

    const formatCurrency = (value) => {
        if (!value) return "0 ₫";
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
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                    User Management · User Order Statistics
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Thống kê đơn hàng theo người dùng</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Xem số đơn đã đặt, đã giao, đã hủy và tổng chi tiêu của từng người dùng.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <form onSubmit={handleSearch} className="flex gap-2 md:col-span-3">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên, email, số điện thoại..."
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                    <div className="flex items-center justify-end gap-2">
                        {(keyword || startDate || endDate) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setKeyword("");
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {overall && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Tổng người dùng"
                        value={overall.totalUsers ?? 0}
                        valueClass="text-slate-900"
                    />
                    <StatCard
                        label="Tổng đơn"
                        value={overall.totalOrders ?? 0}
                        valueClass="text-blue-600"
                    />
                    <StatCard
                        label="Tổng đơn hủy"
                        value={overall.totalCancelled ?? 0}
                        valueClass="text-rose-600"
                    />
                    <StatCard
                        label="Tổng chi tiêu"
                        value={formatCurrency(overall.totalAmount ?? 0)}
                        valueClass="text-emerald-600"
                        subtext={`Tỷ lệ hủy: ${overall.cancellationRate ?? 0}%`}
                    />
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Đang tải...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase">
                                        Người dùng
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase">
                                        Vai trò
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                        Đơn đã đặt
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                        Đã giao
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                        Đã hủy
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                        Tỷ lệ hủy
                                    </th>
                                    <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                        Tổng chi tiêu
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase">
                                        Đơn đầu / cuối
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-slate-500"
                                        >
                                            Chưa có dữ liệu thống kê.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((row) => {
                                        const user = row.user;
                                        return (
                                            <tr
                                                key={row._id}
                                                className="border-b border-slate-100 hover:bg-slate-50/60"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-slate-900">
                                                        {user?.fullName || "—"}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {user?.email || "—"}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {user?.phone || "—"}
                                                    </div>
                                                    <div className="mt-1">
                                                        <StatusPill status={user?.status} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-700">
                                                    {ROLE_LABELS[user?.role] ?? user?.role ?? "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-900 font-medium">
                                                    {row.totalOrders ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {row.deliveredOrders ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-right text-rose-600">
                                                    {row.cancelledOrders ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {(row.cancellationRate ?? 0).toFixed(2)}%
                                                </td>
                                                <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                                                    {formatCurrency(row.totalAmount ?? 0)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    <div>Đầu: {formatDateTime(row.firstOrderAt)}</div>
                                                    <div>Cuối: {formatDateTime(row.lastOrderAt)}</div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {paging.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                        Trang {paging.page} / {paging.totalPages} · Tổng {paging.total} người dùng
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={paging.page <= 1}
                            onClick={() => loadData(paging.page - 1)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-50 hover:bg-slate-50"
                        >
                            Trước
                        </button>
                        <button
                            disabled={paging.page >= paging.totalPages}
                            onClick={() => loadData(paging.page + 1)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-50 hover:bg-slate-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, valueClass, subtext }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className={`mt-1 text-2xl font-extrabold ${valueClass}`}>{value}</div>
            {subtext && <div className="mt-1 text-xs text-slate-500">{subtext}</div>}
        </div>
    );
}

