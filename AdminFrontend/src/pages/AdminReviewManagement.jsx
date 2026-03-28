import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchAdminReviews, deleteAdminReview } from "../services/adminReviewServices";

export default function AdminReviewManagement() {
    const [searchParams, setSearchParams] = useSearchParams();
    const productIdFromUrl = searchParams.get("productId") || "";

    const [productId, setProductId] = useState(productIdFromUrl);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const load = async (p = 1) => {
        try {
            setLoading(true);
            setError("");
            const pid = (searchParams.get("productId") || "").trim();
            const params = { page: p, limit: 20 };
            if (pid) params.productId = pid;
            const res = await fetchAdminReviews(params);
            setItems(res?.items ?? []);
            setTotalPages(res?.paging?.totalPages ?? 0);
            setPage(res?.paging?.page ?? p);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không tải được đánh giá.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setProductId(productIdFromUrl);
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productIdFromUrl]);

    const applyFilter = () => {
        const next = new URLSearchParams();
        if (productId.trim()) next.set("productId", productId.trim());
        setSearchParams(next);
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Xóa đánh giá này? (soft delete)")) return;
        try {
            await deleteAdminReview(reviewId);
            await load(page);
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Xóa thất bại.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Quản lý đánh giá sản phẩm</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Xem đánh giá theo sản phẩm hoặc toàn hệ thống; xóa nội dung vi phạm.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Lọc theo Product ID</label>
                    <input
                        type="text"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        placeholder="Mongo ObjectId (để trống = tất cả)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-mono"
                    />
                </div>
                <button
                    type="button"
                    onClick={applyFilter}
                    className="rounded-xl px-4 py-2 bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                >
                    Áp dụng
                </button>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">{error}</div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3 text-left font-semibold text-slate-600">Sản phẩm</th>
                                <th className="px-3 py-3 text-left font-semibold text-slate-600">Khách</th>
                                <th className="px-3 py-3 text-center font-semibold text-slate-600">Sao</th>
                                <th className="px-3 py-3 text-left font-semibold text-slate-600">Bình luận</th>
                                <th className="px-3 py-3 text-left font-semibold text-slate-600">Ngày</th>
                                <th className="px-3 py-3 text-right font-semibold text-slate-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                        Không có đánh giá.
                                    </td>
                                </tr>
                            ) : (
                                items.map((r) => (
                                    <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50/60 align-top">
                                        <td className="px-3 py-3">
                                            <div className="font-medium text-slate-900 max-w-[180px] truncate">
                                                {r.productId?.name ?? "—"}
                                            </div>
                                            <Link
                                                to={`/admin/products/${r.productId?._id}`}
                                                className="text-xs text-blue-600 hover:underline font-mono"
                                            >
                                                {r.productId?._id ? String(r.productId._id).slice(-8) : "—"}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div>{r.userId?.fullName ?? "—"}</div>
                                            <div className="text-xs text-slate-500">{r.userId?.email ?? ""}</div>
                                        </td>
                                        <td className="px-3 py-3 text-center font-semibold">{r.rating}</td>
                                        <td className="px-3 py-3 text-slate-700 max-w-xs whitespace-pre-wrap">
                                            {r.comment || "—"}
                                        </td>
                                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap text-xs">
                                            {r.createdAt
                                                ? new Date(r.createdAt).toLocaleString("vi-VN")
                                                : "—"}
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(r._id)}
                                                className="text-sm font-semibold text-rose-600 hover:text-rose-500"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex gap-2 justify-center">
                    <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() => load(page - 1)}
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <span className="text-sm text-slate-600 py-1">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={page >= totalPages || loading}
                        onClick={() => load(page + 1)}
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}
