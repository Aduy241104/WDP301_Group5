import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    fetchAdminCategoryById,
    createAdminCategory,
    updateAdminCategory,
} from "../../services/adminCategoryManageServices";

export default function AdminCategoryForm() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(categoryId);

    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                setLoading(true);
                setError("");
                const c = await fetchAdminCategoryById(categoryId);
                setName(c.name ?? "");
                setIsActive(c.isActive !== false);
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || "Không tải được danh mục.");
            } finally {
                setLoading(false);
            }
        })();
    }, [categoryId, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            alert("Vui lòng nhập tên danh mục.");
            return;
        }
        try {
            setSaving(true);
            setError("");
            if (isEdit) {
                await updateAdminCategory(categoryId, { name: trimmed, isActive });
            } else {
                await createAdminCategory({ name: trimmed, isActive });
            }
            navigate("/admin/categories");
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Lưu thất bại.";
            setError(msg);
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                Đang tải...
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEdit ? "Sửa danh mục" : "Tạo danh mục mới"}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Category schema dùng khi gán loại sản phẩm.</p>
                </div>
                <Link
                    to="/admin/categories"
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                    ← Danh sách
                </Link>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">{error}</div>
            )}

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
            >
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên danh mục</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                        placeholder="Ví dụ: Thời trang nam"
                    />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
                </label>
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-2xl px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-60"
                    >
                        {saving ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/categories")}
                        className="rounded-2xl px-5 py-2.5 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
