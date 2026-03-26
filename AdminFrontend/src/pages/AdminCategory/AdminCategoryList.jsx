import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminCategoryManageList } from "../../services/adminCategoryManageServices";

export default function AdminCategoryList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchAdminCategoryManageList({ page: 1, limit: 200 });
            setItems(res?.items ?? []);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không tải được danh mục.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Thể Loại</h1>
                    <p className="text-slate-500 text-sm mt-1">Tạo, sửa và xem danh sách danh mục sản phẩm.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/admin/categories/new")}
                    className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition"
                >
                    + Tạo danh mục
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
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Tên</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Hoạt động</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                                        Chưa có danh mục.
                                    </td>
                                </tr>
                            ) : (
                                items.map((c) => (
                                    <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50/60">
                                        <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={
                                                    c.isActive
                                                        ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                                                        : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                                                }
                                            >
                                                {c.isActive ? "Bật" : "Tắt"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/admin/categories/${c._id}/edit`)}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                                            >
                                                Sửa
                                            </button>
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
