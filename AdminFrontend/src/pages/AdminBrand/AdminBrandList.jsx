import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBrands, deleteBrand } from "../../services/adminBrandServices";

export default function AdminBrandList() {
const navigate = useNavigate();

const [loading, setLoading] = useState(false);
const [items, setItems] = useState([]);

const [modal, setModal] = useState({
open: false,
type: "",
message: "",
brandId: null
});

const refreshData = async () => {
try {
setLoading(true);

const res = await fetchBrands({ page: 1, limit: 100 });

setItems(res?.data || []);

} catch (err) {

openModal(
"error",
err?.response?.data?.message ||
err?.message ||
"Không thể tải danh sách brand."
);

} finally {
setLoading(false);
}
};

useEffect(() => {
refreshData();
}, []);

const openModal = (type, message, brandId = null) => {
setModal({
open: true,
type,
message,
brandId
});
};

const closeModal = () => {
setModal({
open: false,
type: "",
message: "",
brandId: null
});
};

const handleDelete = async () => {
try {

await deleteBrand(modal.brandId);

closeModal();

openModal("success", "Brand đã được xóa thành công");

await refreshData();

} catch (err) {

openModal(
"error",
err?.response?.data?.message ||
err?.message ||
"Không thể xóa brand."
);

}
};

return (

<div className="space-y-6">

<div className="flex items-center justify-between">
<div>
<h1 className="text-2xl font-bold text-slate-900">Quản lý Brand</h1>
<p className="text-slate-500 mt-1">Thêm, sửa và xóa thương hiệu</p>
</div>

<button
onClick={() => navigate("/admin/brands/new")}
className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold text-sm"

>

* Thêm Brand

  </button>

</div>

<div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">

<table className="min-w-full text-sm">

<thead className="bg-slate-50 text-slate-600">
<tr className="border-b border-slate-200">
<th className="px-5 py-3 text-left font-semibold">Logo</th>
<th className="px-5 py-3 text-left font-semibold">Tên Brand</th>
<th className="px-5 py-3 text-left font-semibold">Mô tả</th>
<th className="px-5 py-3 text-left font-semibold">Trạng thái</th>
<th className="px-5 py-3 text-right font-semibold">Thao tác</th>
</tr>
</thead>

<tbody>

{loading ? (

<tr>
<td colSpan={5} className="px-5 py-10 text-center text-slate-500">
Đang tải dữ liệu...
</td>
</tr>

) : items.length === 0 ? (

<tr>
<td colSpan={5} className="px-5 py-10 text-center text-slate-500">
Không có dữ liệu.
</td>
</tr>

) : (

items.map((brand) => (

<tr
key={brand._id}
className="border-b border-slate-100 hover:bg-slate-50"
>

<td className="px-5 py-4">
{brand.logo ? (
<img
src={brand.logo}
alt={brand.name}
className="w-12 h-12 object-cover rounded-lg"
/>
) : (
<span className="text-slate-400 text-xs">
Không có logo
</span>
)}
</td>

<td className="px-5 py-4 font-semibold text-slate-900">
{brand.name}
</td>

<td className="px-5 py-4 text-slate-600 text-sm">
{brand.description || "—"}
</td>

<td className="px-5 py-4">
{brand.isActive ? (
<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700">
Hoạt động
</span>
) : (
<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
Tắt
</span>
)}
</td>

<td className="px-5 py-4">

<div className="flex items-center justify-end gap-3">

<IconButton
title="Sửa"
onClick={() =>
navigate(`/admin/brands/${brand._id}/edit`)
}

>

<EditIcon />
</IconButton>

<IconButton
title="Xóa"
onClick={() =>
openModal(
"confirm",
"Bạn có chắc chắn muốn xóa brand này?",
brand._id
)
}

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

{/* MODAL */}

{modal.open && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-[360px] space-y-4 shadow-xl">

<h2 className="text-lg font-semibold">

{modal.type === "confirm"
? "Xác nhận"
: modal.type === "error"
? "Lỗi"
: "Thành công"}

</h2>

<p className="text-sm text-slate-600">{modal.message}</p>

<div className="flex justify-end gap-3 pt-2">

{modal.type === "confirm" && (
<>
<button
onClick={closeModal}
className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm"

>

Hủy </button>

<button
onClick={handleDelete}
className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm"

>

Xóa </button>
</>
)}

{modal.type !== "confirm" && (
<button
onClick={closeModal}
className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"

>

OK </button>
)}

</div>

</div>
</div>

)}

</div>
);
}

function IconButton({ children, onClick, title }) {
return (
<button
type="button"
title={title}
onClick={onClick}
className="h-9 w-9 rounded-full grid place-items-center text-slate-700 hover:bg-slate-100 transition"

>

{children} </button>
);
}

function EditIcon() {
return ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none"> <path
d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
stroke="currentColor"
strokeWidth="2"
/> <path
d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
stroke="currentColor"
strokeWidth="2"
/> </svg>
);
}

function DeleteIcon() {
return ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none"> <path
d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
/> </svg>
);
}
