import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchBannerList,
    createBanner,
    updateBanner,
} from "../services/adminBannerServices";
import axiosInstance from "../axios/axiosConfig";

const POSITION_OPTIONS = [
    { value: "home_top", label: "Trang chủ - Top" },
    // { value: "home_mid", label: "Trang chủ - Giữa" },
    { value: "home_popup", label: "Trang chủ - Popup" },
];

const LINK_TYPE_OPTIONS = [
    { value: "external", label: "Liên kết ngoài" },
    { value: "product", label: "Sản phẩm" },
    { value: "shop", label: "Shop" },
    { value: "category", label: "Danh mục" },
    { value: "search", label: "Tìm kiếm" },
];

export default function AdminBannerForm() {
    const navigate = useNavigate();
    const { bannerId } = useParams();
    const isEdit = !!bannerId;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        linkUrl: "",
        linkType: "external",
        linkTargetId: "",
        position: "home_top",
        priority: 0,
        height: 400,
        startAt: "",
        endAt: "",
    });

    useEffect(() => {
        if (isEdit) {
            loadBanner();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bannerId]);

    const loadBanner = async () => {
        try {
            setLoading(true);
            const res = await fetchBannerList({ limit: 1000 });
            const banner = res?.items?.find((b) => b._id === bannerId);
            if (banner) {
                setFormData({
                    title: banner.title || "",
                    imageUrl: banner.imageUrl || "",
                    linkUrl: banner.linkUrl || "",
                    linkType: banner.linkType || "external",
                    linkTargetId: banner.linkTargetId || "",
                    position: banner.position || "home_top",
                    priority: banner.priority || 0,
                    height: banner.height || 400,
                    startAt: banner.startAt ? new Date(banner.startAt).toISOString().slice(0, 16) : "",
                    endAt: banner.endAt ? new Date(banner.endAt).toISOString().slice(0, 16) : "",
                });
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải thông tin banner.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "banners");

            const res = await axiosInstance.post("/api/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể tải ảnh lên.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            const data = {
                ...formData,
                startAt: new Date(formData.startAt).toISOString(),
                endAt: new Date(formData.endAt).toISOString(),
                linkTargetId: formData.linkTargetId || null,
            };

            if (isEdit) {
                await updateBanner(bannerId, data);
            } else {
                await createBanner(data);
            }

            navigate("/admin/banners");
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Không thể lưu banner.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-slate-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEdit ? "Sửa Banner" : "Thêm Banner"}
                </h1>
                <p className="text-slate-500 mt-1">
                    {isEdit ? "Cập nhật thông tin banner" : "Tạo banner mới cho hệ thống"}
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tiêu đề <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        required
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        placeholder="Nhập tiêu đề banner"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Hình ảnh <span className="text-rose-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {formData.imageUrl && (
                            <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="w-full max-w-md h-48 object-cover rounded-xl border border-slate-200"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && <div className="text-sm text-slate-500">Đang tải ảnh lên...</div>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Vị trí <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={formData.position}
                            onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                            required
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        >
                            {POSITION_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Độ ưu tiên
                        </label>
                        <input
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData((prev) => ({ ...prev, priority: Number(e.target.value) || 0 }))}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                            placeholder="0"
                        />
                    </div> */}
                </div>

                {formData.position === "header_bottom" && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Chiều cao banner (px)
                        </label>
                        <input
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData((prev) => ({ ...prev, height: Number(e.target.value) || 400 }))}
                            min="200"
                            max="800"
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                            placeholder="400"
                        />
                        <p className="text-xs text-slate-500 mt-1">Chiều cao banner carousel (200-800px). Mặc định: 400px</p>
                    </div>
                )}

                {/* <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Loại liên kết <span className="text-rose-500">*</span>
                    </label>
                    <select
                        value={formData.linkType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, linkType: e.target.value }))}
                        required
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                    >
                        {LINK_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div> */}
{/* 
                {formData.linkType === "external" ? (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            URL liên kết
                        </label>
                        <input
                            type="url"
                            value={formData.linkUrl}
                            onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                            placeholder="https://example.com"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            ID đối tượng liên kết
                        </label>
                        <input
                            type="text"
                            value={formData.linkTargetId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, linkTargetId: e.target.value }))}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                            placeholder="Nhập ID sản phẩm/shop/danh mục (ObjectId)..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Để trống nếu không cần. ID phải là ObjectId hợp lệ (24 ký tự hex).
                        </p>
                    </div>
                )} */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ngày bắt đầu <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.startAt}
                            onChange={(e) => setFormData((prev) => ({ ...prev, startAt: e.target.value }))}
                            required
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ngày kết thúc <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.endAt}
                            onChange={(e) => setFormData((prev) => ({ ...prev, endAt: e.target.value }))}
                            required
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/banners")}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold text-sm"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}
