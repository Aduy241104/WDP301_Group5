import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchShopDetail, blockShop, unblockShop } from "../services/adminSellerServices";

export default function AdminShopDetail() {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadDetail = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchShopDetail(shopId);
            setData(res);
        } catch (err) {
            const message =
                err?.response?.data?.message || err?.message || "Không thể tải thông tin shop.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shopId]);

    const handleBlockToggle = async () => {
        if (!data?.shop) return;
        const isBlocked = data.shop.status === "blocked";
        const confirmText = isBlocked ? "Mở khóa shop này?" : "Khóa shop này?";
        if (!window.confirm(confirmText)) return;

        try {
            setSubmitting(true);
            if (isBlocked) {
                await unblockShop(data.shop._id ?? shopId);
            } else {
                await blockShop(data.shop._id ?? shopId);
            }
            await loadDetail();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const shop = data?.shop;
    const owner = shop?.ownerId;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgb(119,226,242)]/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                        Seller Management · View Shop Detail
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Chi tiết Shop</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Xem thông tin chi tiết shop. Block / Unblock shop.
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
                    {owner && (
                        <Link
                            to={`/admin/sellers/${owner._id}`}
                            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
                        >
                            Xem chi tiết Seller
                        </Link>
                    )}
                    {shop && (
                        <button
                            onClick={handleBlockToggle}
                            disabled={submitting}
                            className={[
                                "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60",
                                shop.status === "blocked" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500",
                            ].join(" ")}
                        >
                            {shop.status === "blocked" ? "Mở khóa Shop" : "Khóa Shop"}
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
            ) : !shop ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                    Không tìm thấy thông tin shop.
                </div>
            ) : (
                <>
                    <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="h-1.5 bg-[rgb(119,226,242)]" />
                        <div className="p-5 sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin Shop</h2>
                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Tên shop</div>
                                    <div className="font-medium text-slate-900 mt-0.5">{shop.name}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Trạng thái</div>
                                    <span
                                        className={[
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-0.5",
                                            shop.status === "approved" && "bg-emerald-50 text-emerald-700",
                                            shop.status === "pending" && "bg-amber-50 text-amber-700",
                                            shop.status === "blocked" && "bg-rose-50 text-rose-700",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {shop.status === "approved" && "Hoạt động"}
                                        {shop.status === "pending" && "Chờ duyệt"}
                                        {shop.status === "blocked" && "Bị khóa"}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">SĐT liên hệ</div>
                                    <div className="text-slate-700 mt-0.5">{shop.contactPhone || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Ngày tạo</div>
                                    <div className="text-slate-700 mt-0.5">
                                        {shop.createdAt ? new Date(shop.createdAt).toLocaleString("vi-VN") : "—"}
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Mô tả</div>
                                    <div className="text-slate-700 mt-0.5">{shop.description || "—"}</div>
                                </div>
                                <div className="sm:col-span-2">
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Địa chỉ</div>
                                    <div className="text-slate-700 mt-0.5">{shop.shopAddress?.fullAddress || "—"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {owner && (
                        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                            <div className="h-1.5 bg-[rgb(119,226,242)]" />
                            <div className="p-5 sm:p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Chủ shop</h2>
                                <div className="grid gap-4 text-sm sm:grid-cols-2">
                                    <div>
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Họ tên</div>
                                        <div className="font-medium text-slate-900 mt-0.5">{owner.fullName}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Email</div>
                                        <div className="text-slate-700 mt-0.5">{owner.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Số điện thoại</div>
                                        <div className="text-slate-700 mt-0.5">{owner.phone || "—"}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Vai trò</div>
                                        <div className="capitalize text-slate-700 mt-0.5">{owner.role}</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        to={`/admin/sellers/${owner._id}`}
                                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition"
                                    >
                                        Xem chi tiết Seller
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
