import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminProductList, approveProduct, rejectProduct, activateProduct, inactivateProduct } from "../services/adminProductServices";
import { fetchShopList } from "../services/adminSellerServices";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái duyệt" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Đã duyệt" },
    { value: "rejected", label: "Từ chối" },
];

const ACTIVE_STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái hiển thị" },
    { value: "active", label: "Đang bán" },
    { value: "inactive", label: "Ẩn" },
];

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

export default function AdminProductList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [items, setItems] = useState([]);
    const [paging, setPaging] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    const [shops, setShops] = useState([]);

    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [activeStatus, setActiveStatus] = useState("");
    const [shopId, setShopId] = useState("");

    const loadShops = async () => {
        try {
            const res = await fetchShopList({ page: 1, limit: 200 });
            setShops(res?.items ?? []);
        } catch {
            // ignore
        }
    };

    const loadData = async (page = 1) => {
        try {
            setLoading(true);
            setError("");
            const params = { page, limit: 20 };
            if (keyword.trim()) params.keyword = keyword.trim();
            if (statusFilter) params.status = statusFilter;
            if (activeStatus) params.activeStatus = activeStatus;
            if (shopId) params.shopId = shopId;
            const res = await fetchAdminProductList(params);
            setItems(res?.items ?? []);
            setPaging(res?.paging ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Không thể tải danh sách sản phẩm."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadShops();
    }, []);

    useEffect(() => {
        loadData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, statusFilter, activeStatus, shopId]);

    const handleSearch = (e) => {
        e?.preventDefault?.();
        setKeyword(searchInput.trim());
    };

    const stats = useMemo(() => {
        const total = items.length;
        const pending = items.filter((p) => p.status === "pending").length;
        const approved = items.filter((p) => p.status === "approved").length;
        const rejected = items.filter((p) => p.status === "rejected").length;
        return { total, pending, approved, rejected };
    }, [items]);

    const handleApprove = async (productId) => {
        if (!window.confirm("Duyệt sản phẩm này?")) return;
        try {
            setSubmitting(true);
            await approveProduct(productId);
            await loadData(paging.page);
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Duyệt thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (productId) => {
        const reason = window.prompt("Nhập lý do từ chối sản phẩm:");
        if (!reason) return;
        try {
            setSubmitting(true);
            await rejectProduct(productId, reason.trim());
            await loadData(paging.page);
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || "Từ chối thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleActiveToggle = async (product, isActive) => {
        const confirmText = isActive
            ? "Ẩn sản phẩm này khỏi người mua?"
            : "Kích hoạt sản phẩm này để hiển thị với người mua?";
        if (!window.confirm(confirmText)) return;
        try {
            setSubmitting(true);
            if (isActive) {
                const reason =
                    window.prompt("Nhập lý do ẩn sản phẩm (không bắt buộc):") || "";
                await inactivateProduct(product._id, reason.trim());
            } else {
                await activateProduct(product._id);
            }
            await loadData(paging.page);
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
            <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-slate-700 mb-2">
                    Product Management · View / Filter · Approve / Reject · Active / Inactive
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Quản lý Sản phẩm</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Xem, lọc và phê duyệt sản phẩm trên toàn hệ thống.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <form onSubmit={handleSearch} className="flex gap-2 lg:col-span-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={activeStatus}
                            onChange={(e) => setActiveStatus(e.target.value)}
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            {ACTIVE_STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <select
                            value={shopId}
                            onChange={(e) => setShopId(e.target.value)}
                            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="">Tất cả shop</option>
                            {shops.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-end gap-2 md:col-span-2">
                        {(keyword || statusFilter || activeStatus || shopId) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchInput("");
                                    setKeyword("");
                                    setStatusFilter("");
                                    setActiveStatus("");
                                    setShopId("");
                                }}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng số" value={stats.total} valueClass="text-slate-900" />
                <StatCard label="Chờ duyệt" value={stats.pending} valueClass="text-amber-600" />
                <StatCard label="Đã duyệt" value={stats.approved} valueClass="text-emerald-600" />
                <StatCard label="Từ chối" value={stats.rejected} valueClass="text-rose-600" />
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr className="border-b border-slate-200">
                                <th className="px-5 py-3 text-left font-semibold">Sản phẩm</th>
                                <th className="px-5 py-3 text-left font-semibold">Shop</th>
                                <th className="px-5 py-3 text-left font-semibold">Trạng thái</th>
                                <th className="px-5 py-3 text-left font-semibold">Hiển thị</th>
                                <th className="px-5 py-3 text-right font-semibold">Giá / Doanh số</th>
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
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                items.map((p) => {
                                    const isActive = p.activeStatus === "active";
                                    const isPending = p.status === "pending";

                                    return (
                                        <tr
                                            key={p._id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {p.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    SKU: {p.skus?.slice(0, 3).join(", ") || "—"}
                                                    {p.skus && p.skus.length > 3
                                                        ? ` (+${p.skus.length - 3})`
                                                        : ""}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-800">
                                                    {p.shop?.name ?? "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusPill status={p.status} />
                                                {p.status === "rejected" && p.rejectReason && (
                                                    <div className="mt-1 text-xs text-rose-500 max-w-xs line-clamp-2">
                                                        Lý do: {p.rejectReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <ActiveStatusPill status={p.activeStatus} />
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="text-slate-900 font-semibold">
                                                    {formatCurrency(p.defaultPrice ?? 0)}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Đã bán: {p.totalSale ?? 0} · Đánh giá:{" "}
                                                    {p.ratingAvg ?? 0}/5
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <IconButton
                                                        title="Xem chi tiết"
                                                        onClick={() =>
                                                            navigate(`/admin/products/${p._id}`)
                                                        }
                                                    >
                                                        <EyeIcon />
                                                    </IconButton>

                                                    {isPending ? (
                                                        <>
                                                            <IconButton
                                                                title="Duyệt"
                                                                tone="success"
                                                                disabled={submitting}
                                                                onClick={() =>
                                                                    handleApprove(p._id)
                                                                }
                                                            >
                                                                <CheckIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                title="Từ chối"
                                                                tone="danger"
                                                                disabled={submitting}
                                                                onClick={() =>
                                                                    handleReject(p._id)
                                                                }
                                                            >
                                                                <XIcon />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        p.status !== "rejected" && (
                                                            <IconButton
                                                                title={isActive ? "Ẩn sản phẩm" : "Kích hoạt"}
                                                                tone={isActive ? "danger" : "success"}
                                                                disabled={submitting}
                                                                onClick={() =>
                                                                    handleActiveToggle(p, isActive)
                                                                }
                                                            >
                                                                {isActive ? <HideIcon /> : <ShowIcon />}
                                                            </IconButton>
                                                        )
                                                    )}
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

            {paging.totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                        Trang {paging.page} / {paging.totalPages} · Tổng {paging.total} sản phẩm
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

function ShowIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            {/* Icon ẩn: vòng tròn với dấu gạch ngang */}
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
            <path
                d="M9.5 12.5 11 14l3.5-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
        </svg>
    );
}

function HideIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            {/* Icon hiện: vòng tròn với dấu tick */}
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
            <path
                d="M9 12h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

