import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSellerVoucherDetailAPI, updateSellerVoucherAPI } from "../../../services/sellerVoucher.service";

export default function SellerVoucherEdit() {
    const { voucherId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        discountType: "percent",
        discountValue: "",
        minOrderValue: "",
        maxDiscountValue: "",
        usageLimitTotal: "",
        usageLimitPerUser: "1",
        expirationDate: "",
        isActive: true,
    });
    const [errors, setErrors] = useState({});
    const [modalMessage, setModalMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [code, setCode] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await getSellerVoucherDetailAPI(voucherId);
                const v = res?.data;
                setCode(v?.code || "");
                setForm({
                    discountType: v?.discountType || "percent",
                    discountValue: String(v?.discountValue ?? ""),
                    minOrderValue: String(v?.minOrderValue ?? ""),
                    maxDiscountValue: String(v?.maxDiscountValue ?? ""),
                    usageLimitTotal: String(v?.usageLimitTotal ?? ""),
                    usageLimitPerUser: String(v?.usageLimitPerUser ?? "1"),
                    expirationDate: v?.endAt ? new Date(v.endAt).toISOString().slice(0, 16) : "",
                    isActive: Boolean(v?.isActive),
                });
            } catch (e) {
                setModalMessage(e?.response?.data?.message || "Không thể tải chi tiết voucher.");
                setShowModal(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [voucherId]);

    const validate = () => {
        let newErrors = {};
        const now = new Date();
        const discountVal = Number(form.discountValue || 0);
        const minOrderVal = Number(form.minOrderValue || 0);
        const limitTotal = Number(form.usageLimitTotal || 0);
        const limitPerUser = Number(form.usageLimitPerUser || 0);

        // 1. Validate Giá trị giảm
        if (!form.discountValue || discountVal <= 0) {
            newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
        } else if (form.discountType === "percent" && discountVal > 100) {
            newErrors.discountValue = "Giảm theo % không được quá 100%";
        }

        // 2. Validate Đơn tối thiểu & Logic giá cố định
        if (form.minOrderValue !== "" && minOrderVal < 0) {
            newErrors.minOrderValue = "Giá trị đơn tối thiểu không hợp lệ";
        }
        if (form.discountType === "fixed" && discountVal > minOrderVal) {
            newErrors.discountValue = "Số tiền giảm không được lớn hơn đơn tối thiểu";
            newErrors.minOrderValue = "Đơn tối thiểu phải lớn hơn hoặc bằng tiền giảm";
        }

        // 3. Validate Lượt dùng
        if (limitPerUser <= 0) {
            newErrors.usageLimitPerUser = "Tối thiểu là 1 lượt";
        }
        if (limitTotal > 0 && limitPerUser > limitTotal) {
            newErrors.usageLimitPerUser = "Không được cao hơn tổng số lượt dùng";
            newErrors.usageLimitTotal = "Tổng lượt dùng phải >= lượt mỗi khách";
        }

        // 4. Validate Giảm tối đa (Percent)
        if (form.discountType === "percent" && form.maxDiscountValue !== "" && Number(form.maxDiscountValue) <= 0) {
            newErrors.maxDiscountValue = "Mức giảm tối đa phải lớn hơn 0";
        }

        // 5. Validate Ngày hết hạn
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
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderValue: Number(form.minOrderValue || 0),
                maxDiscountValue: form.discountType === "fixed"
                    ? Number(form.discountValue)
                    : Number(form.maxDiscountValue || 0),
                usageLimitTotal: Number(form.usageLimitTotal || 0),
                usageLimitPerUser: Number(form.usageLimitPerUser || 1),
                expirationDate: form.expirationDate,
                isActive: form.isActive,
            };

            await updateSellerVoucherAPI(voucherId, payload);
            setModalMessage("Cập nhật voucher thành công.");
            setShowModal(true);
        } catch (e) {
            setModalMessage(e?.response?.data?.message || "Không thể cập nhật voucher.");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));

        // Reset lỗi các trường liên quan
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
                className={ `w-full h-11 px-3 rounded-xl border ${errors[name] ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white` }
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
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-indigo-600 uppercase">Chỉnh sửa Voucher</h1>
                    <p className="text-slate-500 text-sm italic">Mã voucher đang sửa: <span className="font-bold text-slate-800">{ code }</span></p>
                </div>
                <button type="button" onClick={ () => navigate("/seller/vouchers") } className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-all">
                    QUAY LẠI
                </button>
            </div>

            <form onSubmit={ onSubmit } className="bg-white border border-slate-200 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl relative">
                { loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 rounded-3xl flex items-center justify-center font-bold text-indigo-600">ĐANG TẢI...</div> }

                <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-tight">Hình thức giảm</label>
                    <select
                        name="discountType"
                        className="w-full h-11 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                        value={ form.discountType }
                        onChange={ handleChange }
                    >
                        <option value="percent">Giảm theo %</option>
                        <option value="fixed">Giảm số tiền cố định (VND)</option>
                    </select>
                </div>

                { renderInput("discountValue", "Nhập giá trị...", "number", `Mức giảm ${form.discountType === "percent" ? "(%)" : "(VND)"}`) }

                <div className={ form.discountType === "fixed" ? "opacity-40 pointer-events-none" : "" }>
                    { renderInput("maxDiscountValue", "Giới hạn giảm tối đa", "number", "Giảm tối đa (VND)") }
                </div>

                { renderInput("minOrderValue", "Ví dụ: 100000", "number", "Đơn hàng tối thiểu (VND)") }
                { renderInput("usageLimitTotal", "0 = Không giới hạn", "number", "Tổng số lượt dùng") }
                { renderInput("usageLimitPerUser", "1", "number", "Lượt dùng tối đa / khách") }
                { renderInput("expirationDate", "", "datetime-local", "Ngày hết hạn chương trình") }

                <label className="md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                        name="isActive"
                        type="checkbox"
                        className="w-5 h-5 accent-indigo-600"
                        checked={ form.isActive }
                        onChange={ handleChange }
                    />
                    <span className="font-bold text-slate-700 uppercase text-xs tracking-widest">Kích hoạt voucher (Cho phép khách hàng sử dụng ngay)</span>
                </label>

                <button
                    disabled={ loading }
                    type="submit"
                    className="md:col-span-2 h-14 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 text-lg"
                >
                    { loading ? "ĐANG LƯU..." : "XÁC NHẬN CẬP NHẬT" }
                </button>
            </form>

            { showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-md z-50 p-4">
                    <div className="bg-white rounded-[2rem] p-10 w-full max-w-sm text-center shadow-2xl">
                        <div className={ `w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl ${modalMessage.includes("thành công") ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}` }>
                            { modalMessage.includes("thành công") ? "✓" : "!" }
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Thông báo</h2>
                        <p className="text-slate-500 font-medium mb-10 leading-relaxed px-2">{ modalMessage }</p>
                        <div className="space-y-3">
                            <button
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg transition-all"
                                onClick={ () => navigate("/seller/vouchers") }
                            >
                                VỀ DANH SÁCH
                            </button>
                            <button
                                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
                                onClick={ () => { setShowModal(false); setModalMessage(""); } }
                            >
                                TIẾP TỤC CHỈNH SỬA
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}