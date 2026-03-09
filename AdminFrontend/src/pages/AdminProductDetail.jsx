import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    fetchAdminProductDetail,
    approveProduct,
    rejectProduct,
    activateProduct,
    inactivateProduct,
} from "../services/adminProductServices";

function StatusPill({ status }) {
    const map = {
        pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700" },
        approved: { label: "Đã duyệt", cls: "bg-emerald-50 text-emerald-700" },
        rejected: { label: "Từ chối", cls: "bg-rose-50 text-rose-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function ActiveStatusPill({ status }) {
    const map = {
        active: { label: "Đang bán", cls: "bg-emerald-50 text-emerald-700" },
        inactive: { label: "Ẩn", cls: "bg-slate-100 text-slate-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

export default function AdminProductDetail() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const loadDetail = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchAdminProductDetail(productId);
            setData(res);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải thông tin sản phẩm.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const product = data?.product;

    const handleApprove = async () => {
        if (!product) return;
        if (!window.confirm("Duyệt sản phẩm này?")) return;
        try {
            setSubmitting(true);
            await approveProduct(product._id ?? productId);
            await loadDetail();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Duyệt thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!product) return;
        const reason =
            window.prompt("Nhập lý do từ chối sản phẩm (bắt buộc):")?.trim() ?? "";
        if (!reason) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }
        try {
            setSubmitting(true);
            await rejectProduct(product._id ?? productId, reason);
            await loadDetail();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Từ chối thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleActiveToggle = async () => {
        if (!product) return;
        const isActive = product.activeStatus === "active";
        const confirmText = isActive
            ? "Ẩn sản phẩm này khỏi người mua?"
            : "Kích hoạt sản phẩm này để hiển thị với người mua?";
        if (!window.confirm(confirmText)) return;
        try {
            setSubmitting(true);
            if (isActive) {
                const reason =
                    window.prompt("Nhập lý do ẩn sản phẩm (không bắt buộc):") || "";
                await inactivateProduct(product._id ?? productId, reason.trim());
            } else {
                await activateProduct(product._id ?? productId);
            }
            await loadDetail();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Thao tác thất bại.");
        } finally {
            setSubmitting(false);
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                        Product Management · View Product Detail · Approve / Reject · Active / Inactive
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Chi tiết Sản phẩm</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Xem thông tin chi tiết sản phẩm và quản lý trạng thái hiển thị.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <Link
                        to="/admin/products"
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Danh sách sản phẩm
                    </Link>
                    {product && (
                        <>
                            {product.status === "pending" && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition disabled:opacity-60"
                                    >
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition disabled:opacity-60"
                                    >
                                        Từ chối
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleActiveToggle}
                                disabled={submitting}
                                className={[
                                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-60",
                                    product.activeStatus === "active"
                                        ? "bg-rose-600 hover:bg-rose-500"
                                        : "bg-emerald-600 hover:bg-emerald-500",
                                ].join(" ")}
                            >
                                {product.activeStatus === "active"
                                    ? "Ẩn sản phẩm"
                                    : "Kích hoạt sản phẩm"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            {loading && !product && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                    Đang tải...
                </div>
            )}

            {!loading && !product && !error && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                    Không tìm thấy thông tin sản phẩm.
                </div>
            )}

            {product && (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div className="h-1.5 bg-emerald-400" />
                        <div className="p-5 sm:p-6 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                {/* Left: Thumbnail / Images */}
                                <div className="w-full max-w-xs">
                                    <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                                        {Array.isArray(product.images) && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-xs text-slate-400 text-center px-4">
                                                Chưa có hình ảnh cho sản phẩm này
                                            </div>
                                        )}
                                    </div>
                                    {Array.isArray(product.images) && product.images.length > 1 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {product.images.slice(1, 5).map((img, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
                                                >
                                                    <img
                                                        src={img}
                                                        alt={`${product.name} - ${idx + 2}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Basic info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 mb-1">
                                                {product.name}
                                            </h2>
                                            <div className="text-sm text-slate-600">
                                                Brand: {product.brandId?.name ?? "—"}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                Shop: {product.shopId?.name ?? "—"}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <StatusPill status={product.status} />
                                            <ActiveStatusPill status={product.activeStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                        Giá mặc định
                                    </div>
                                    <div className="font-semibold text-slate-900 mt-0.5">
                                        {formatCurrency(product.defaultPrice ?? 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                        Doanh số / Đánh giá
                                    </div>
                                    <div className="text-slate-700 mt-0.5">
                                        {product.totalSale ?? 0} đơn · {product.ratingAvg ?? 0}/5
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                        Ngày tạo
                                    </div>
                                    <div className="text-slate-700 mt-0.5">
                                        {product.createdAt
                                            ? new Date(product.createdAt).toLocaleString("vi-VN")
                                            : "—"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                        Ngày xuất bản
                                    </div>
                                    <div className="text-slate-700 mt-0.5">
                                        {product.publishedAt
                                            ? new Date(product.publishedAt).toLocaleString("vi-VN")
                                            : "—"}
                                    </div>
                                </div>
                                {product.rejectReason && (
                                    <div className="sm:col-span-2">
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                            Lý do từ chối
                                        </div>
                                        <div className="text-rose-600 mt-0.5">
                                            {product.rejectReason}
                                        </div>
                                    </div>
                                )}
                                {product.inactiveReason && (
                                    <div className="sm:col-span-2">
                                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                                            Lý do ẩn
                                        </div>
                                        <div className="text-slate-700 mt-0.5">
                                            {product.inactiveReason}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">
                                    Mô tả
                                </div>
                                <div className="text-sm text-slate-700 whitespace-pre-line">
                                    {product.description || "—"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                        <div className="p-5 sm:p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">
                                Phân loại / SKU
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase">
                                                SKU
                                            </th>
                                            <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 uppercase">
                                                Kích thước
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                                Giá
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                                Tồn kho
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 uppercase">
                                                Ngưỡng cảnh báo
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(product.variants ?? []).length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-6 text-center text-slate-500"
                                                >
                                                    Chưa có phân loại cho sản phẩm này.
                                                </td>
                                            </tr>
                                        ) : (
                                            product.variants.map((v) => (
                                                <tr
                                                    key={v._id}
                                                    className="border-b border-slate-100 hover:bg-slate-50/60"
                                                >
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-800">
                                                        {v.sku}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {v.size || "—"}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-900 font-medium">
                                                        {formatCurrency(v.price ?? 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-700">
                                                        {v.stock ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-700">
                                                        {v.threshold ?? 0}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

