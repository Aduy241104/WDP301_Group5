import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    fetchSellerProfile,
    blockSeller,
    unblockSeller,
} from "../services/adminSellerServices";

export default function AdminSellerProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchSellerProfile(userId);
            setData(res);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải thông tin seller.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleBlockToggle = async () => {
        if (!data?.user) return;
        const isBlocked = data.user.status === "blocked";
        const confirmText = isBlocked
            ? "Mở khóa tài khoản seller này?"
            : "Khóa tài khoản seller này? Người dùng sẽ không thể đăng nhập.";
        if (!window.confirm(confirmText)) return;

        try {
            setSubmitting(true);
            if (isBlocked) {
                await unblockSeller(data.user._id ?? userId);
            } else {
                await blockSeller(data.user._id ?? userId);
            }
            await loadProfile();
        } catch (err) {
            alert(
                err?.response?.data?.message || err?.message || "Thao tác thất bại, vui lòng thử lại."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const user = data?.user;
    const shops = data?.shops ?? [];
    const latestRequest = data?.latestSellerRequest;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgb(119,226,242)]/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                        Seller Management
                        <span className="h-1 w-1 rounded-full bg-[rgb(119,226,242)]" />
                        View Seller Profile
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Hồ sơ Seller</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Xem chi tiết thông tin seller, đăng ký gần nhất và danh sách shop. Block / Unblock tài khoản.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <Link
                        to="/admin/shops"
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Danh sách Shop
                    </Link>
                    {user && (
                        <button
                            onClick={handleBlockToggle}
                            disabled={submitting}
                            className={[
                                "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60",
                                user.status === "blocked"
                                    ? "bg-emerald-600 hover:bg-emerald-500"
                                    : "bg-rose-600 hover:bg-rose-500",
                            ].join(" ")}
                        >
                            {user.status === "blocked" ? "Mở khóa" : "Khóa tài khoản"}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-500">
                    <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang tải...
                    </span>
                </div>
            ) : !user ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                    Không tìm thấy thông tin seller.
                </div>
            ) : (
                <>
                    {/* Card: Thông tin tài khoản */}
                    <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="h-1.5 bg-[rgb(119,226,242)]" />
                        <div className="p-5 sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin tài khoản</h2>
                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Họ tên</div>
                                    <div className="font-medium text-slate-900 mt-0.5">{user.fullName}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Email</div>
                                    <div className="text-slate-700 mt-0.5">{user.email}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Số điện thoại</div>
                                    <div className="text-slate-700 mt-0.5">{user.phone || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Vai trò</div>
                                    <div className="capitalize text-slate-700 mt-0.5">{user.role}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Trạng thái</div>
                                    <span
                                        className={[
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-0.5",
                                            user.status === "active" && "bg-emerald-50 text-emerald-700",
                                            user.status === "blocked" && "bg-rose-50 text-rose-700",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {user.status === "active" ? "Hoạt động" : user.status === "blocked" ? "Đã khóa" : user.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card: Đăng ký seller gần nhất */}
                    {latestRequest && (
                        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                            <div className="h-1.5 bg-[rgb(119,226,242)]" />
                            <div className="p-5 sm:p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Đăng ký seller gần nhất</h2>
                                <div className="grid gap-4 text-sm sm:grid-cols-2">
                                    <div>
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Tên shop</div>
                                        <div className="font-medium text-slate-900 mt-0.5">{latestRequest.shopName}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Trạng thái</div>
                                        <span
                                            className={[
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-0.5",
                                                latestRequest.status === "pending" && "bg-amber-50 text-amber-700",
                                                latestRequest.status === "approved" && "bg-emerald-50 text-emerald-700",
                                                latestRequest.status === "rejected" && "bg-rose-50 text-rose-700",
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                        >
                                            {latestRequest.status === "pending" && "Chờ duyệt"}
                                            {latestRequest.status === "approved" && "Đã duyệt"}
                                            {latestRequest.status === "rejected" && "Từ chối"}
                                        </span>
                                    </div>
                                    {latestRequest.rejectReason && (
                                        <div className="sm:col-span-2">
                                            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Lý do từ chối</div>
                                            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mt-0.5">
                                                {latestRequest.rejectReason}
                                            </div>
                                        </div>
                                    )}
                                    <div className="sm:col-span-2">
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Mô tả</div>
                                        <div className="text-slate-700 mt-0.5">{latestRequest.description || "—"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card: Danh sách shop */}
                    <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="h-1.5 bg-[rgb(119,226,242)]" />
                        <div className="p-5 sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Danh sách shop của seller</h2>
                            {shops.length === 0 ? (
                                <div className="text-sm text-slate-500 py-4">Seller này chưa có shop nào.</div>
                            ) : (
                                <div className="space-y-3">
                                    {shops.map((shop) => (
                                        <div
                                            key={shop._id}
                                            className="rounded-xl border border-slate-100 p-4 flex flex-col gap-2 hover:bg-slate-50/50 transition"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-medium text-slate-900">{shop.name}</div>
                                                <span
                                                    className={[
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        shop.status === "pending" && "bg-amber-50 text-amber-700",
                                                        shop.status === "approved" && "bg-emerald-50 text-emerald-700",
                                                        shop.status === "blocked" && "bg-rose-50 text-rose-700",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                >
                                                    {shop.status === "pending" && "Chờ duyệt"}
                                                    {shop.status === "approved" && "Hoạt động"}
                                                    {shop.status === "blocked" && "Đã khóa"}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-600 line-clamp-2">
                                                {shop.description || "Không có mô tả"}
                                            </div>
                                            {shop.shopAddress?.fullAddress && (
                                                <div className="text-xs text-slate-500">
                                                    Địa chỉ: {shop.shopAddress.fullAddress}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
