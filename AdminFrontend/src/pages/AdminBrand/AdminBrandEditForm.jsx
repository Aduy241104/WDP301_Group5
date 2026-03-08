import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
updateBrand,
fetchCategories
} from "../../services/adminBrandServices";
import axiosInstance from "../../axios/axiosConfig";

export default function AdminBrandEditForm() {

const navigate = useNavigate();
const { brandId } = useParams();

const [loading, setLoading] = useState(false);
const [uploading, setUploading] = useState(false);

const [categories, setCategories] = useState([]);

const [formData, setFormData] = useState({
name: "",
logo: "",
description: "",
categoryId: ""
});

/* MODAL STATE */

const [modal, setModal] = useState({
open:false,
type:"",
message:""
});

const [confirmModal,setConfirmModal]=useState(false);

/* SHOW MODAL */

const showModal=(type,message)=>{
setModal({
open:true,
type,
message
});
};

const closeModal=()=>{
setModal({
open:false,
type:"",
message:""
});
};

useEffect(()=>{
loadCategories();
loadBrand();
},[brandId]);

/* LOAD CATEGORY */

const loadCategories=async()=>{
try{

const res=await fetchCategories();
setCategories(res?.data||res);

}catch(err){

showModal(
"error",
"Không thể tải danh sách category"
);

}
};

/* LOAD BRAND */

const loadBrand=async()=>{
try{

setLoading(true);

const res=await axiosInstance.get(`/api/admin/brands/${brandId}`);

const brand=res.data;

setFormData({
name:brand.name||"",
logo:brand.logo||"",
description:brand.description||"",
categoryId:brand.categoryId?._id||""
});

}catch(err){

showModal(
"error",
err?.response?.data?.message||
"Không thể tải thông tin brand"
);

}finally{

setLoading(false);

}
};

/* UPLOAD LOGO */

const handleLogoUpload=async(e)=>{

const file=e.target.files?.[0];
if(!file) return;

try{

setUploading(true);

const formDataUpload=new FormData();
formDataUpload.append("file",file);
formDataUpload.append("folder","brands");

const res=await axiosInstance.post(
"/api/upload/image",
formDataUpload,
{headers:{"Content-Type":"multipart/form-data"}}
);

setFormData(prev=>({
...prev,
logo:res.data.url
}));

showModal("success","Upload logo thành công");

}catch(err){

showModal(
"error",
err?.response?.data?.message||
"Upload logo thất bại"
);

}finally{

setUploading(false);

}
};

/* CONFIRM SUBMIT */

const handleSubmit=(e)=>{
e.preventDefault();
setConfirmModal(true);
};

/* UPDATE BRAND */

const confirmUpdate=async()=>{

try{

setLoading(true);

await updateBrand(brandId,formData);

setConfirmModal(false);

showModal("success","Cập nhật brand thành công");

setTimeout(()=>{
navigate("/admin/brands");
},1500);

}catch(err){

showModal(
"error",
err?.response?.data?.message||
"Không thể cập nhật brand"
);

}finally{

setLoading(false);

}
};

if(loading){
return(
<div className="flex items-center justify-center py-20">
<div className="text-slate-500">Đang tải...</div>
</div>
);
}

return(

<div className="space-y-6">

<div>
<h1 className="text-2xl font-bold text-slate-900">
Sửa Brand
</h1>

<p className="text-slate-500 mt-1">
Cập nhật thông tin brand
</p>
</div>

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
onChange={(e)=>setFormData(prev=>({...prev,name:e.target.value}))}
className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm"
/>

</div>

{/* LOGO */}

<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Logo Brand
</label>

<div className="space-y-3">

{formData.logo &&(
<img
src={formData.logo}
alt="logo"
className="w-full max-w-xs h-40 object-cover rounded-xl border"
/>
)}

<input
type="file"
accept="image/*"
onChange={handleLogoUpload}
disabled={uploading}
/>

</div>

</div>

{/* DESCRIPTION */}

<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Mô tả Brand
</label>

<textarea
value={formData.description}
onChange={(e)=>setFormData(prev=>({...prev,description:e.target.value}))}
rows={4}
className="w-full rounded-xl border p-3 text-sm"
/>

</div>

{/* CATEGORY */}

<div>

<label className="block text-sm font-semibold text-slate-700 mb-2">
Category
</label>

<select
value={formData.categoryId}
onChange={(e)=>setFormData(prev=>({...prev,categoryId:e.target.value}))}
className="w-full h-12 rounded-xl border px-4 text-sm"
>

<option value="">Chọn Category</option>

{categories?.map(cat=>(
<option key={cat._id} value={cat._id}>
{cat.name}
</option>
))}

</select>

</div>

{/* BUTTON */}

<div className="flex gap-4 pt-4">

<button
type="submit"
disabled={loading||uploading}
className="px-6 py-3 bg-blue-600 text-white rounded-xl"
>
Cập nhật
</button>

<button
type="button"
onClick={()=>navigate("/admin/brands")}
className="px-6 py-3 bg-slate-100 rounded-xl"
>
Hủy
</button>

</div>

</form>

{/* CONFIRM MODAL */}

{confirmModal &&(
<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white rounded-xl p-6 w-[400px] space-y-4">

<h2 className="text-lg font-bold">
Xác nhận cập nhật
</h2>

<p className="text-slate-600">
Bạn có chắc muốn cập nhật brand này không?
</p>

<div className="flex justify-end gap-3">

<button
onClick={()=>setConfirmModal(false)}
className="px-4 py-2 bg-slate-200 rounded-lg"
>
Hủy
</button>

<button
onClick={confirmUpdate}
className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
Xác nhận
</button>

</div>

</div>

</div>
)}

{/* MESSAGE MODAL */}

{modal.open &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white rounded-xl p-6 w-[400px] space-y-4 text-center">

<h2 className={`text-lg font-bold ${
modal.type==="error"?"text-red-600":"text-green-600"
}`}>
{modal.type==="error"?"Lỗi":"Thành công"}
</h2>

<p className="text-slate-600">
{modal.message}
</p>

<button
onClick={closeModal}
className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
Đóng
</button>

</div>

</div>

)}

</div>
);
}