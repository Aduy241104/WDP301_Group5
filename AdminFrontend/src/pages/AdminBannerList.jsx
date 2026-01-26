import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchBannerList,
    deleteBanner,
} from "../services/adminBannerServices";

const POSITION_OPTIONS = [
    { value: "", label: "Tất cả vị trí" },

    { value: "home_top", label: "Trang chủ - Top" },
    // { value: "home_mid", label: "Trang chủ - Giữa" },
    // { value: "home_popup", label: "Trang chủ - Popup" },
];

function PositionPill({ position }) {
    const map = {
        home_top: { label: "Top", cls: "bg-blue-50 text-blue-700" },
        home_mid: { label: "Giữa", cls: "bg-purple-50 text-purple-700" },
        home_popup: { label: "Popup", cls: "bg-orange-50 text-orange-700" },
        unknown: { label: "—", cls: "bg-slate-100 text-slate-700" },
    };
    const it = map[position] ?? map.unknown;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${it.cls}`}>
            {it.label}
        </span>
    );
}

function StatusBadge({ startAt, endAt }) {
    const now = new Date();
    const start = new Date(startAt);
    const end = new Date(endAt);

    if (now < start) {
        return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700">Sắp diễn ra</span>;
    }
    if (now >= start && now <= end) {
        return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700">Đang hoạt động</span>;
    }
    return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700">Đã kết thúc</span>;
}

export default function AdminBannerList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [positionFilter, setPositionFilter] = useState("");

    const refreshData = async () => {
        try {
            setLoading(true);
            setError("");
            const params = { page: 1, limit: 100 };
            if (positionFilter) params.position = positionFilter;
            const res = await fetchBannerList(params);
            setItems(res?.items ?? []);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách banner.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [positionFilter]);

    const handleDelete = async (bannerId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
            return;
        }

        try {
            setError("");
            await deleteBanner(bannerId);
            await refreshData();
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể xóa banner.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Banner</h1>
                    <p className="text-slate-500 mt-1">Thêm, sửa và xóa banner hệ thống</p>
                </div>
                <button
                    onClick={() => navigate("/admin/banners/new")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
                >
                    + Thêm Banner
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="max-w-xs">
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-4 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    >
                        {POSITION_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
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
                                <th className="px-5 py-3 text-left font-semibold">Hình ảnh</th>
                                <th className="px-5 py-3 text-left font-semibold">Tiêu đề</th>
                                <th className="px-5 py-3 text-left font-semibold">Vị trí</th>
                                <th className="px-5 py-3 text-left font-semibold">Thời gian</th>
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
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                                        Không có dữ liệu.
                                    </td>
                                </tr>
                            ) : (
                                items.map((banner) => (
                                    <tr key={banner._id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-5 py-4">
                                            <img
                                                src={banner.imageUrl}
                                                alt={banner.title}
                                                className="w-20 h-12 object-cover rounded-lg"
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">{banner.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {banner.linkType === "external" ? "Liên kết ngoài" : `Liên kết ${banner.linkType}`}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <PositionPill position={banner.position} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-xs text-slate-600">
                                                <div>Từ: {new Date(banner.startAt).toLocaleDateString("vi-VN")}</div>
                                                <div>Đến: {new Date(banner.endAt).toLocaleDateString("vi-VN")}</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge startAt={banner.startAt} endAt={banner.endAt} />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <IconButton
                                                    title="Sửa"
                                                    onClick={() => navigate(`/admin/banners/${banner._id}/edit`)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    title="Xóa"
                                                    onClick={() => handleDelete(banner._id)}
                                                >
                                                    <DeleteIcon />
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

function EditIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DeleteIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}
