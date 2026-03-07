import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createBrand,
    updateBrand,
    fetchBrands,
    fetchCategories
} from "../../services/adminBrandServices";
import axiosInstance from "../../axios/axiosConfig";

export default function AdminBrandForm() {

const navigate = useNavigate();
const { brandId } = useParams();
const isEdit = !!brandId;

const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);
const [error, setError] = useState("");

const [categories, setCategories] = useState([]);

const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    categoryId: ""
});

useEffect(() => {
    loadCategories();

    if (isEdit) {
        loadBrand();
    }
}, [brandId]);

const loadCategories = async () => {
    try {
        const res = await fetchCategories();
        setCategories(res?.data || res);
    } catch (err) {
        console.error("Load category error:", err);
    }
};

const loadBrand = async () => {
    try {

        setLoading(true);

        const res = await fetchBrands();

        const brand = res?.data?.find((b) => b._id === brandId);

        if (brand) {
            setFormData({
                name: brand.name || "",
                logo: brand.logo || "",
                description: brand.description || "",
                categoryId: brand.categoryId?._id || ""
            });
        }

    } catch (err) {
        setError(err?.response?.data?.message || err.message);
    } finally {
        setLoading(false);
    }
};

const handleLogoUpload = async (e) => {

    const file = e.target.files?.[0];
    if (!file) return;

    try {

        setUploading(true);

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("folder", "brands");

        const res = await axiosInstance.post(
            "/api/upload/image",
            formDataUpload,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        setFormData((prev) => ({
            ...prev,
            logo: res.data.url
        }));

    } catch (err) {

        setError(err?.response?.data?.message || err.message);

    } finally {

        setUploading(false);

    }
};

const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        setLoading(true);
        setError("");

        if (isEdit) {
            await updateBrand(brandId, formData);
        } else {
            await createBrand(formData);
        }

        navigate("/admin/brands");

    } catch (err) {

        setError(err?.response?.data?.message || err.message);

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
            {isEdit ? "Sửa Brand" : "Thêm Brand"}
        </h1>
        <p className="text-slate-500 mt-1">
            {isEdit ? "Cập nhật thông tin brand" : "Tạo brand mới cho hệ thống"}
        </p>
    </div>

    {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
            {error}
        </div>
    )}

<form
onSubmit={handleSubmit}
className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
>

{/* NAME */}
<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Tên Brand <span className="text-rose-500">*</span>
</label>

<input
type="text"
value={formData.name}
required
onChange={(e) =>
setFormData((prev) => ({
...prev,
name: e.target.value
}))
}
className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
placeholder="Nhập tên brand"
/>

</div>

{/* LOGO */}
<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Logo Brand
</label>

<div className="space-y-3">

{formData.logo && (
<img
src={formData.logo}
alt="logo"
className="w-full max-w-xs h-40 object-cover rounded-xl border border-slate-200"
/>
)}

<input
type="file"
accept="image/*"
onChange={handleLogoUpload}
disabled={uploading}
className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
/>

{uploading && (
<div className="text-sm text-slate-500">
Đang tải logo lên...
</div>
)}

</div>

</div>

{/* DESCRIPTION */}
<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Mô tả Brand
</label>

<textarea
value={formData.description}
onChange={(e) =>
setFormData((prev) => ({
...prev,
description: e.target.value
}))
}
rows={4}
className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
placeholder="Mô tả brand..."
/>

</div>

{/* CATEGORY */}
<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Category
</label>

<select
value={formData.categoryId}
onChange={(e) =>
setFormData((prev) => ({
...prev,
categoryId: e.target.value
}))
}
className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
>

<option value="">Chọn Category</option>

{categories?.map((cat) => (
<option key={cat._id} value={cat._id}>
{cat.name}
</option>
))}

</select>

</div>

{/* BUTTON */}
<div className="flex items-center gap-4 pt-4">

<button
type="submit"
disabled={loading || uploading}
className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
>
{loading
? "Đang lưu..."
: isEdit
? "Cập nhật"
: "Tạo mới"}
</button>

<button
type="button"
onClick={() => navigate("/admin/brands")}
className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold text-sm"
>
Hủy
</button>

</div>

</form>

</div>
);
}

