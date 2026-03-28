import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSellerVoucherAPI } from "../../../services/sellerVoucher.service";

const initialForm = {
    code: "", // Có thể để trống để BE tự tạo mã random
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    maxDiscountValue: "",
    usageLimitTotal: "",
    usageLimitPerUser: "1",
    expirationDate: "",
};

export default function SellerVoucherAdd() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const validate = () => {
        let newErrors = {};
        const now = new Date();
        const discountVal = Number(form.discountValue || 0);
        const minOrderVal = Number(form.minOrderValue || 0);
        const limitTotal = Number(form.usageLimitTotal || 0);
        const limitPerUser = Number(form.usageLimitPerUser || 0);

        // 1. Validate Code
        if (form.code.trim() && form.code.trim().length < 4) {
            newErrors.code = "Nếu nhập mã, phải có ít nhất 4 ký tự";
        }

        // 2. Validate Giá trị giảm
        if (!form.discountValue || discountVal <= 0) {
            newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
        } else if (form.discountType === "percent" && discountVal > 100) {
            newErrors.discountValue = "Giảm theo % không được quá 100%";
        }

        // 3. Validate Đơn tối thiểu
        if (form.minOrderValue !== "" && minOrderVal < 0) {
            newErrors.minOrderValue = "Giá trị đơn tối thiểu không hợp lệ";
        }

        // --- VALIDATE GIÁ CỐ ĐỊNH VS ĐƠN TỐI THIỂU ---
        if (form.discountType === "fixed" && discountVal > minOrderVal) {
            newErrors.discountValue = "Tiền giảm không được lớn hơn đơn tối thiểu";
            newErrors.minOrderValue = "Đơn tối thiểu phải lớn hơn hoặc bằng tiền giảm";
        }

        // 4. Validate Lượt dùng
        if (limitPerUser <= 0) {
            newErrors.usageLimitPerUser = "Tối thiểu là 1 lượt";
        }

        // Check nếu tổng lượt dùng có giới hạn ( > 0 ) thì mỗi khách không được dùng quá tổng
        if (limitTotal > 0 && limitPerUser > limitTotal) {
            newErrors.usageLimitPerUser = "Lượt dùng mỗi khách không được cao hơn tổng số lượt dùng";
            newErrors.usageLimitTotal = "Tổng lượt dùng phải lớn hơn hoặc bằng lượt dùng mỗi khách";
        }

        // 5. Validate Giảm tối đa (Chỉ cho Percent)
        if (form.discountType === "percent" && form.maxDiscountValue !== "" && Number(form.maxDiscountValue) <= 0) {
            newErrors.maxDiscountValue = "Mức giảm tối đa phải lớn hơn 0";
        }

        // 6. Validate Ngày hết hạn
        if (!form.expirationDate) {
            newErrors.expirationDate = "Vui lòng chọn ngày hết hạn";
        } else if (new Date(form.expirationDate) <= now) {
            newErrors.expirationDate = "Ngày hết hạn phải ở tương lai";
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
                code: form.code.trim() ? form.code.toUpperCase().trim() : undefined,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderValue: Number(form.minOrderValue || 0),
                maxDiscountValue: form.discountType === "fixed"
                    ? Number(form.discountValue)
                    : Number(form.maxDiscountValue || 0),
                usageLimitTotal: Number(form.usageLimitTotal || 0),
                usageLimitPerUser: Number(form.usageLimitPerUser || 1),
                expirationDate: form.expirationDate,
            };

            await createSellerVoucherAPI(payload);
            setModalMessage("Tạo shop voucher thành công!");
            setShowModal(true);
        } catch (err) {
            setModalMessage(err?.response?.data?.message || "Không thể tạo voucher.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));

        // Reset lỗi liên quan khi thay đổi các trường có ràng buộc chéo
        if (name === "discountValue" || name === "minOrderValue") {
            setErrors(p => ({ ...p, discountValue: "", minOrderValue: "" }));
        } else if (name === "usageLimitTotal" || name === "usageLimitPerUser") {
            setErrors(p => ({ ...p, usageLimitTotal: "", usageLimitPerUser: "" }));
        } else if (errors[name]) {
            setErrors(p => ({ ...p, [name]: "" }));
        }
    };

    const renderInput = (name, placeholder, type = "text", label = "", colSpan = "") => (
        <div className={ colSpan }>
            <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-tight">{ label }</label>
            <input
                name={ name }
                type={ type }
                className={ `w-full h-11 px-3 rounded-xl border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50/50` }
                placeholder={ placeholder }
                value={ form[name] }
                onChange={ handleChange }
            />
            { errors[name] && <p className="text-red-500 text-[10px] mt-1 font-bold leading-tight">{ errors[name] }</p> }
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-indigo-600 uppercase leading-none">Shop Voucher Creator</h1>
                    <p className="text-slate-500 mt-2 text-sm italic underline decoration-indigo-200">Thiết lập chương trình khuyến mãi riêng cho cửa hàng</p>
                </div>
            </div>

            <form onSubmit={ onSubmit } className="bg-white border border-slate-200 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl">

                { renderInput("code", "Bỏ trống để tự tạo mã (VD: SHOP-A1B2)", "text", "Mã Voucher") }

                <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-tight">Hình thức giảm</label>
                    <select
                        name="discountType"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 font-medium"
                        value={ form.discountType }
                        onChange={ handleChange }
                    >
                        <option value="percent">Giảm theo phần trăm (%)</option>
                        <option value="fixed">Giảm số tiền cố định (VND)</option>
                    </select>
                </div>

                { renderInput(
                    "discountValue",
                    "Nhập số tiền hoặc %...",
                    "number",
                    `Mức giảm ${form.discountType === "percent" ? "(%)" : "(VND)"}`
                ) }

                <div className={ form.discountType === "fixed" ? "opacity-40 pointer-events-none" : "" }>
                    { renderInput(
                        "maxDiscountValue",
                        form.discountType === "fixed" ? "Không áp dụng" : "Giới hạn tiền giảm",
                        "number",
                        "Số tiền giảm tối đa (VND)"
                    ) }
                </div>

                { renderInput("minOrderValue", "0", "number", "Giá trị đơn tối thiểu (VND)") }
                { renderInput("usageLimitTotal", "0 = Không giới hạn", "number", "Tổng số lượt dùng") }

                { renderInput("usageLimitPerUser", "1", "number", "Lượt dùng tối đa / khách") }
                { renderInput("expirationDate", "", "datetime-local", "Ngày hết hạn chương trình") }

                <div className="md:col-span-2 pt-6 border-t mt-2">
                    <button
                        disabled={ loading }
                        type="submit"
                        className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                    >
                        { loading ? "ĐANG XỬ LÝ..." : "KÍCH HOẠT VOUCHER SHOP" }
                    </button>
                </div>
            </form>

            { showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl border border-white">
                        <div className={ `w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl ${modalMessage.includes("thành công") ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}` }>
                            { modalMessage.includes("thành công") ? "✓" : "!" }
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Kết quả</h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed px-2">{ modalMessage }</p>
                        <div className="flex flex-col gap-3">
                            <button
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg"
                                onClick={ () => navigate("/seller/vouchers") }
                            >
                                QUẢN LÝ DANH SÁCH
                            </button>
                            <button
                                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
                                onClick={ () => { setShowModal(false); if (modalMessage.includes("thành công")) setForm(initialForm); } }
                            >
                                THÊM VOUCHER KHÁC
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}