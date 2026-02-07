import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchShopList, blockShop, unblockShop } from "../services/adminSellerServices";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "approved", label: "Hoạt động" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "blocked", label: "Bị khóa" },
];

function StatusPill({ status }) {
    const map = {
        approved: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
        pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700" },
        blocked: { label: "Bị khóa", cls: "bg-rose-50 text-rose-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

export default function AdminShopList() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [allItems, setAllItems] = useState([]);
    const [actionShopId, setActionShopId] = useState(null); // shop đang khóa/mở khóa

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const refreshData = async () => {
        try {
            setLoading(true);
            setError("");
            const limit = 100;
            const res = await fetchShopList({ page: 1, limit });
            setAllItems(res?.items ?? []);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách shop.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const baseItems = useMemo(() => {
        if (!statusFilter) return allItems;
        return allItems.filter((s) => s?.status === statusFilter);
    }, [allItems, statusFilter]);

    const visibleItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return baseItems;
        return baseItems.filter((s) => {
            const name = String(s?.name ?? "").toLowerCase();
            const ownerEmail = String(s?.ownerId?.email ?? "").toLowerCase();
            const ownerName = String(s?.ownerId?.fullName ?? "").toLowerCase();
            return name.includes(q) || ownerEmail.includes(q) || ownerName.includes(q);
        });
    }, [baseItems, query]);

    const stats = useMemo(() => {
        const total = allItems.length;
        const active = allItems.filter((s) => s?.status === "approved").length;
        const pending = allItems.filter((s) => s?.status === "pending").length;
        const blocked = allItems.filter((s) => s?.status === "blocked").length;
        return { total, active, pending, blocked };
    }, [allItems]);

    const handleBlockToggle = async (shop) => {
        const isBlocked = shop.status === "blocked";
        const confirmText = isBlocked ? "Mở khóa shop này?" : "Khóa shop này?";
        if (!window.confirm(confirmText)) return;
        try {
            setActionShopId(shop._id);
            if (isBlocked) {
                await unblockShop(shop._id);
            } else {
                await blockShop(shop._id);
            }
            await refreshData();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
        } finally {
            setActionShopId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Danh sách Shop</h1>
                <p className="text-slate-500 mt-1">Xem và lọc shop theo trạng thái</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M16.5 16.5 21 21"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm theo tên shop, email chủ shop..."
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        />
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M3 4h18l-7 8v6l-4 2v-8L3 4Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng số" value={stats.total} valueClass="text-slate-900" />
                <StatCard label="Hoạt động" value={stats.active} valueClass="text-emerald-600" />
                <StatCard label="Chờ duyệt" value={stats.pending} valueClass="text-amber-600" />
                <StatCard label="Bị khóa" value={stats.blocked} valueClass="text-rose-600" />
            </div>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr className="border-b border-slate-200">
                                <th className="px-5 py-3 text-left font-semibold">Shop</th>
                                <th className="px-5 py-3 text-left font-semibold">Chủ shop</th>
                                <th className="px-5 py-3 text-left font-semibold">Ngày tạo</th>
                                <th className="px-5 py-3 text-left font-semibold">Trạng thái</th>
                                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : visibleItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                visibleItems.map((shop) => (
                                    <tr key={shop._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">{shop.name}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">
                                                {shop.description || "—"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-slate-800">
                                                {shop.ownerId?.email || "—"}
                                            </div>
                                            <div className="text-slate-500">
                                                {shop.ownerId?.fullName || "—"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {shop.createdAt
                                                ? new Date(shop.createdAt).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill status={shop.status} />
                                        </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        to={`/admin/shops/${shop._id}`}
                                                        title="Xem chi tiết"
                                                        className="h-9 w-9 rounded-full grid place-items-center transition text-slate-700 hover:bg-slate-100"
                                                    >
                                                        <EyeIcon />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        title={shop.status === "blocked" ? "Mở khóa" : "Khóa"}
                                                        onClick={() => handleBlockToggle(shop)}
                                                        disabled={actionShopId === shop._id}
                                                        className={[
                                                            "h-9 w-9 rounded-full grid place-items-center transition disabled:opacity-40 disabled:cursor-not-allowed",
                                                            shop.status === "blocked"
                                                                ? "text-emerald-600 hover:bg-emerald-50"
                                                                : "text-rose-600 hover:bg-rose-50",
                                                        ].join(" ")}
                                                    >
                                                        {actionShopId === shop._id ? (
                                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                        ) : shop.status === "blocked" ? (
                                                            <UnlockIcon />
                                                        ) : (
                                                            <BlockIcon />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, valueClass }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className={`mt-1 text-3xl font-extrabold ${valueClass}`}>{value}</div>
        </div>
    );
}

function EyeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function BlockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path
                d="M7.5 7.5 16.5 16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function UnlockIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M7 11V8a5 5 0 0 1 10 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );
}
