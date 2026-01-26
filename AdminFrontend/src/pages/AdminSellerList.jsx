import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchSellerList,
    fetchShopList,
    blockSeller,
    unblockSeller,
} from "../services/adminSellerServices";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "active", label: "Hoạt động" },
    { value: "blocked", label: "Bị khóa" },
];

function StatusPill({ status }) {
    const map = {
        active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700" },
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

export default function AdminSellerList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [allItems, setAllItems] = useState([]);
    const [shopCounts, setShopCounts] = useState({});

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const refreshData = async () => {
        try {
            setLoading(true);
            setError("");

            const limit = 100;
            const [sellerRes, shopRes] = await Promise.all([
                fetchSellerList({ page: 1, limit }),
                fetchShopList({ page: 1, limit }),
            ]);

            const sellers = sellerRes?.items ?? [];
            setAllItems(sellers);

            const map = {};
            (shopRes?.items ?? []).forEach((s) => {
                const ownerId = s?.ownerId?._id ?? s?.ownerId;
                if (!ownerId) return;
                map[ownerId] = (map[ownerId] ?? 0) + 1;
            });
            setShopCounts(map);
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.message || "Không thể tải dữ liệu người bán."
            );
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
        return allItems.filter((it) => it.status === statusFilter);
    }, [allItems, statusFilter]);

    const visibleItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return baseItems;
        return baseItems.filter((it) => {
            const fullName = String(it?.fullName ?? "").toLowerCase();
            const email = String(it?.email ?? "").toLowerCase();
            const phone = String(it?.phone ?? "").toLowerCase();
            return (
                fullName.includes(q) ||
                email.includes(q) ||
                phone.includes(q)
            );
        });
    }, [baseItems, query]);

    const stats = useMemo(() => {
        const total = allItems.length;
        const active = allItems.filter((it) => it.status === "active").length;
        const blocked = allItems.filter((it) => it.status === "blocked").length;
        return { total, active, blocked };
    }, [allItems]);

    const doBlockToggle = async (userId, isBlocked) => {
        const ok = window.confirm(
            isBlocked ? "Mở khóa người bán này?" : "Khóa người bán này?"
        );
        if (!ok) return;
        try {
            setSubmitting(true);
            if (isBlocked) await unblockSeller(userId);
            else await blockSeller(userId);
            await refreshData();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Danh sách Seller</h1>
                <p className="text-slate-500 mt-1">Quản lý danh sách seller đã được duyệt trên hệ thống</p>
            </div>

            {/* Search + Filter (card) */}
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
                            placeholder="Tìm kiếm theo tên, email..."
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Tổng số" value={stats.total} valueClass="text-slate-900" />
                <StatCard label="Đang hoạt động" value={stats.active} valueClass="text-emerald-600" />
                <StatCard label="Bị khóa" value={stats.blocked} valueClass="text-rose-600" />
            </div>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr className="border-b border-slate-200">
                                <th className="px-5 py-3 text-left font-semibold">Người bán</th>
                                <th className="px-5 py-3 text-left font-semibold">Liên hệ</th>
                                <th className="px-5 py-3 text-left font-semibold">Ngày đăng ký</th>
                                <th className="px-5 py-3 text-left font-semibold">Trạng thái</th>
                                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : visibleItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                visibleItems.map((item) => {
                                    const userId = item._id;
                                    const isBlocked = item.status === "blocked";
                                    const shopCount = userId ? shopCounts[userId] ?? 0 : 0;

                                    return (
                                        <tr
                                            key={item._id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {item.fullName || "—"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ID: {userId ? userId.toString().slice(-6) : "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-800">
                                                    {item.email || "—"}
                                                </div>
                                                <div className="text-slate-500">
                                                    {item.phone || "—"}
                                                </div>
                                            </td>
                                            
                                            <td className="px-5 py-4 text-center">
                                                {shopCount}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusPill status={item.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <IconButton
                                                        title="Xem chi tiết"
                                                        onClick={() => userId && navigate(`/admin/sellers/${userId}`)}
                                                        disabled={!userId}
                                                    >
                                                        <EyeIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        title={isBlocked ? "Mở khóa" : "Khóa"}
                                                        onClick={() => userId && doBlockToggle(userId, isBlocked)}
                                                        disabled={submitting || !userId}
                                                        tone={isBlocked ? "success" : "danger"}
                                                    >
                                                        {isBlocked ? <UnlockIcon /> : <BlockIcon />}
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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

function IconButton({ children, onClick, title, disabled, tone = "neutral" }) {
    const toneCls =
        tone === "success"
            ? "text-emerald-600 hover:bg-emerald-50"
            : tone === "danger"
                ? "text-rose-600 hover:bg-rose-50"
                : "text-slate-700 hover:bg-slate-100";
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={[
                "h-9 w-9 rounded-full grid place-items-center transition",
                toneCls,
                disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent" : "",
            ].join(" ")}
        >
            {children}
        </button>
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
