import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    approveSellerRequest,
    fetchSellerRegistrationsByStatus,
    rejectSellerRequest,
} from "../services/adminSellerServices";

function StatusPill({ status }) {
    const map = {
        pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700" },
    };
    const it = map[status] ?? map.pending;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

export default function AdminSellerRequestApproval() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [allItems, setAllItems] = useState([]);
    const [query, setQuery] = useState("");

    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    const refreshData = async () => {
        try {
            setLoading(true);
            setError("");

            const limit = 100;
            const res = await fetchSellerRegistrationsByStatus({ status: "pending", page: 1, limit });
            const requests = res?.items ?? [];
            setAllItems(requests);
        } catch (err) {
            setError(
                err?.response?.data?.message || err?.message || "Không thể tải dữ liệu yêu cầu đăng ký."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const visibleItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allItems;
        return allItems.filter((it) => {
            const shopName = String(it?.shopName ?? "").toLowerCase();
            const fullName = String(it?.userId?.fullName ?? "").toLowerCase();
            const email = String(it?.userId?.email ?? "").toLowerCase();
            const phone = String(it?.userId?.phone ?? "").toLowerCase();
            return (
                shopName.includes(q) ||
                fullName.includes(q) ||
                email.includes(q) ||
                phone.includes(q)
            );
        });
    }, [allItems, query]);

    const stats = useMemo(() => {
        const total = allItems.length;
        return { total };
    }, [allItems]);

    const openReject = (requestId) => {
        setRejectingId(requestId);
        setRejectReason("");
    };

    const doApprove = async (requestId) => {
        if (!window.confirm("Duyệt đăng ký seller này?")) return;
        try {
            setSubmitting(true);
            await approveSellerRequest(requestId);
            await refreshData();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Duyệt thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const doReject = async () => {
        if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }
        try {
            setSubmitting(true);
            await rejectSellerRequest(rejectingId, rejectReason.trim());
            setRejectingId(null);
            setRejectReason("");
            await refreshData();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Từ chối thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const getUserIdFromRequest = (item) => {
        return item?.userId?._id ?? item?.userId ?? null;
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Duyệt yêu cầu đăng ký Seller</h1>
                <p className="text-slate-500 mt-1">Xem và duyệt các yêu cầu đăng ký seller đang chờ xử lý</p>
            </div>

            {/* Search (card) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng yêu cầu chờ duyệt" value={stats.total} valueClass="text-amber-600" />
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
                                <th className="px-5 py-3 text-left font-semibold">Tên shop</th>
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
                                        Không có yêu cầu nào chờ duyệt.
                                    </td>
                                </tr>
                            ) : (
                                visibleItems.map((item) => {
                                    const userId = getUserIdFromRequest(item);

                                    return (
                                        <tr
                                            key={item._id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {item.userId?.fullName || "—"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ID: {userId ? userId.toString().slice(-6) : "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-800">
                                                    {item.userId?.email || "—"}
                                                </div>
                                                <div className="text-slate-500">
                                                    {item.userId?.phone || "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {item.shopName || "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {item.createdAt
                                                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusPill status="pending" />
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
                                                        title="Duyệt"
                                                        onClick={() => doApprove(item._id)}
                                                        disabled={submitting}
                                                        tone="success"
                                                    >
                                                        <CheckIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        title="Từ chối"
                                                        onClick={() => openReject(item._id)}
                                                        disabled={submitting}
                                                        tone="danger"
                                                    >
                                                        <XIcon />
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

            {/* Reject modal */}
            {rejectingId && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <div className="text-lg font-bold text-slate-900">
                                Từ chối đăng ký người bán
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                Nhập lý do để gửi tới người dùng.
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            <textarea
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Ví dụ: Thông tin cửa hàng chưa đầy đủ..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRejectingId(null);
                                        setRejectReason("");
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={doReject}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 disabled:opacity-60"
                                    disabled={submitting || !rejectReason.trim()}
                                >
                                    {submitting ? "Đang xử lý..." : "Xác nhận"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M20 6 9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}
