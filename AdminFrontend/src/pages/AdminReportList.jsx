import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchReportList } from "../services/adminReportServices";

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "open", label: "Đang mở" },
    { value: "closed", label: "Đã đóng" },
    { value: "reopened", label: "Đã mở lại" },
];

const TARGET_TYPE_OPTIONS = [
    { value: "", label: "Tất cả loại" },
    { value: "shop", label: "Shop" },
    { value: "product", label: "Sản phẩm" },
    { value: "user", label: "Người dùng" },
];

const CATEGORY_OPTIONS = [
    { value: "", label: "Tất cả danh mục" },
    { value: "spam", label: "Spam" },
    { value: "fake", label: "Giả mạo" },
    { value: "copyright", label: "Bản quyền" },
    { value: "scam", label: "Lừa đảo" },
    { value: "abuse", label: "Lạm dụng" },
    { value: "other", label: "Khác" },
];

function StatusPill({ status }) {
    const map = {
        open: { label: "Đang mở", cls: "bg-blue-50 text-blue-700" },
        closed: { label: "Đã đóng", cls: "bg-slate-100 text-slate-700" },
        reopened: { label: "Đã mở lại", cls: "bg-amber-50 text-amber-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[status] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function CategoryPill({ category }) {
    const map = {
        spam: { label: "Spam", cls: "bg-red-50 text-red-700" },
        fake: { label: "Giả mạo", cls: "bg-orange-50 text-orange-700" },
        copyright: { label: "Bản quyền", cls: "bg-purple-50 text-purple-700" },
        scam: { label: "Lừa đảo", cls: "bg-rose-50 text-rose-700" },
        abuse: { label: "Lạm dụng", cls: "bg-pink-50 text-pink-700" },
        other: { label: "Khác", cls: "bg-slate-100 text-slate-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[category] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function TargetTypePill({ targetType }) {
    const map = {
        shop: { label: "Shop", cls: "bg-blue-50 text-blue-700" },
        product: { label: "Sản phẩm", cls: "bg-green-50 text-green-700" },
        user: { label: "Người dùng", cls: "bg-purple-50 text-purple-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[targetType] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

export default function AdminReportList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [targetTypeFilter, setTargetTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const refreshData = async () => {
        try {
            setLoading(true);
            setError("");
            const params = { page: 1, limit: 100 };
            if (statusFilter) params.status = statusFilter;
            if (targetTypeFilter) params.targetType = targetTypeFilter;
            if (categoryFilter) params.category = categoryFilter;
            const res = await fetchReportList(params);
            setItems(res?.items ?? []);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách khiếu nại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, targetTypeFilter, categoryFilter]);

    const stats = {
        total: items.length,
        open: items.filter((r) => r.status === "open").length,
        closed: items.filter((r) => r.status === "closed").length,
        reopened: items.filter((r) => r.status === "reopened").length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Quản lý Khiếu nại</h1>
                <p className="text-slate-500 mt-1">Xem và quản lý các khiếu nại từ người dùng</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng số" value={stats.total} valueClass="text-slate-900" />
                <StatCard label="Đang mở" value={stats.open} valueClass="text-blue-600" />
                <StatCard label="Đã đóng" value={stats.closed} valueClass="text-slate-600" />
                <StatCard label="Đã mở lại" value={stats.reopened} valueClass="text-amber-600" />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
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
                            value={targetTypeFilter}
                            onChange={(e) => setTargetTypeFilter(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        >
                            {TARGET_TYPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        >
                            {CATEGORY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
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
                                <th className="px-5 py-3 text-left font-semibold">Người báo cáo</th>
                                <th className="px-5 py-3 text-left font-semibold">Loại</th>
                                <th className="px-5 py-3 text-left font-semibold">Danh mục</th>
                                <th className="px-5 py-3 text-left font-semibold">Lý do</th>
                                <th className="px-5 py-3 text-left font-semibold">Trạng thái</th>
                                <th className="px-5 py-3 text-left font-semibold">Ngày tạo</th>
                                <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                items.map((report) => (
                                    <tr key={report._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            <div className="text-slate-800">
                                                {report.reporterId?.email || "—"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {report.reporterId?.fullName || "—"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <TargetTypePill targetType={report.targetType} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <CategoryPill category={report.category} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="max-w-xs truncate text-slate-700">
                                                {report.reason || "—"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusPill status={report.status} />
                                        </td>
                                        <td className="px-5 py-4">
                                            {report.createdAt
                                                ? new Date(report.createdAt).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <IconButton
                                                    title="Xem chi tiết"
                                                    onClick={() => navigate(`/admin/reports/${report._id}`)}
                                                >
                                                    <EyeIcon />
                                                </IconButton>
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

function IconButton({ children, onClick, title, disabled }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={[
                "h-9 w-9 rounded-full grid place-items-center transition",
                "text-slate-700 hover:bg-slate-100",
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
