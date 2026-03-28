import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSystemVoucher } from "../services/adminVoucherServices";

const initialForm = {
    code: "",
    name: "",
    description: "",
    discountValue: "",
    minOrderValue: "",
    usageLimitTotal: "", // Thêm mới
    usageLimitPerUser: "1", // Mặc định mỗi người dùng 1 lần cho an toàn
    startAt: "",
    endAt: "",
};

export default function AdminVoucherAdd() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const validate = () => {
        let newErrors = {};
        if (!form.name.trim()) newErrors.name = "Tên voucher không được để trống";
        if (!form.discountValue || Number(form.discountValue) <= 0) {
            newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
        }
        // Validate lượt dùng
        if (form.usageLimitTotal !== "" && Number(form.usageLimitTotal) < 0) {
            newErrors.usageLimitTotal = "Số lượng không hợp lệ";
        }
        if (!form.usageLimitPerUser || Number(form.usageLimitPerUser) <= 0) {
            newErrors.usageLimitPerUser = "Tối thiểu là 1 lượt/người";
        }

        if (!form.startAt) newErrors.startAt = "Chọn ngày bắt đầu";
        if (!form.endAt) newErrors.endAt = "Chọn ngày kết thúc";
        else if (new Date(form.endAt) <= new Date(form.startAt)) {
            newErrors.endAt = "Ngày kết thúc phải sau ngày bắt đầu";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            setLoading(true);
            const payload = {
                ...form,
                code: form.code.trim() || undefined,
                discountValue: Number(form.discountValue),
                minOrderValue: Number(form.minOrderValue || 0),
                usageLimitTotal: Number(form.usageLimitTotal || 0), // 0 là không giới hạn
                usageLimitPerUser: Number(form.usageLimitPerUser || 1),
            };
            await createSystemVoucher(payload);
            setModalMessage("Tạo voucher thành công!");
            setShowModal(true);
        } catch (err) {
            setModalMessage(err?.response?.data?.message || "Lỗi khi tạo voucher.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const renderInput = (name, placeholder, type = "text", label = "", note = "") => (
        <div>
            <label className="text-xs font-bold text-slate-600 mb-1 block uppercase tracking-wider">
                { label } { note && <span className="text-slate-400 normal-case font-normal">({ note })</span> }
            </label>
            <input
                name={ name }
                type={ type }
                className={ `w-full h-11 px-3 rounded-xl border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all` }
                placeholder={ placeholder }
                value={ form[name] }
                onChange={ handleChange }
            />
            { errors[name] && <p className="text-red-500 text-[10px] mt-1 font-bold">{ errors[name] }</p> }
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-black text-slate-800">CẤU HÌNH VOUCHER HỆ THỐNG</h1>

            <form onSubmit={ onSubmit } className="bg-white shadow-xl border border-slate-100 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl">
                    { renderInput("code", "SV-XXXXXX", "text", "Mã Voucher", "Để trống để tự tạo") }
                    { renderInput("name", "Tên chương trình...", "text", "Tên hiển thị") }
                </div>

                { renderInput("discountValue", "VND", "number", "Số tiền giảm") }
                { renderInput("minOrderValue", "VND", "number", "Đơn tối thiểu") }

                {/* 2 TRƯỜNG MỚI THÊM */ }
                { renderInput("usageLimitTotal", "VND", "number", "Tổng lượt sử dụng", "0 = Không giới hạn") }
                { renderInput("usageLimitPerUser", "1", "number", "Giới hạn mỗi User") }

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    { renderInput("startAt", "", "datetime-local", "Bắt đầu") }
                    { renderInput("endAt", "", "datetime-local", "Kết thúc") }
                </div>

                <button disabled={ loading } className="md:col-span-2 h-14 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50">
                    { loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN TẠO VOUCHER" }
                </button>
            </form>

            {/* Modal giữ nguyên như cũ */ }
            { showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                        <p className="text-lg font-bold mb-6">{ modalMessage }</p>
                        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold" onClick={ () => navigate("/admin/vouchers") }>QUAY LẠI DANH SÁCH</button>
                    </div>
                </div>
            ) }
        </div>
    );
}