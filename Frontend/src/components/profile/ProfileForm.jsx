import { useState, useRef, useEffect } from "react";
import { updateProfileAPI } from "../../services/profileServices";

const ProfileForm = ({ editData, setEditData, setMessage, reloadProfile }) => {
    const [isEditing, setIsEditing] = useState(false);

    const [errors, setErrors] = useState({
        fullName: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
    });

    const originalDataRef = useRef(null);

    useEffect(() => {
        if (!isEditing && editData) {
            originalDataRef.current = { ...editData };
        }
    }, [editData, isEditing]);
    useEffect(() => {
        if (!editData) return;

        setEditData((prev) => ({
            ...prev,

            // chuẩn hóa gender
            gender: prev.gender ? prev.gender.toLowerCase() : "",

            // chuẩn hóa dateOfBirth cho input type="date"
            dateOfBirth: prev.dateOfBirth
                ? prev.dateOfBirth.slice(0, 10)
                : "",
        }));
    }, []);



    const handlePhoneChange = (e) => {
        const rawValue = e.target.value;

        // Chỉ cho nhập số
        if (!/^\d*$/.test(rawValue)) return;


        // Bắt đầu phải là 0
        if (rawValue.length === 1 && rawValue !== "0") return;

        setEditData((prev) => ({ ...prev, phone: rawValue }));
        setErrors((prev) => ({ ...prev, phone: "" }));
        setIsEditing(true);
    };


    const handleUpdateProfile = async () => {
        let newErrors = {
            fullName: "",
            phone: "",
            gender: "",
            dateOfBirth: "",
        };

        if (!editData.fullName.trim()) {
            newErrors.fullName = "Họ và tên không được để trống";
        }

        if (!/^0\d{9}$/.test(editData.phone)) {
            newErrors.phone = "Số điện thoại phải bắt đầu bằng 0 và gồm đúng 10 chữ số";
        }

        if (!editData.gender) {
            newErrors.gender = "Vui lòng chọn giới tính";
        }

        if (!editData.dateOfBirth) {
            newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
        } else if (new Date(editData.dateOfBirth) > new Date()) {
            newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
        }

        if (
            newErrors.fullName ||
            newErrors.phone ||
            newErrors.gender ||
            newErrors.dateOfBirth
        ) {
            setErrors(newErrors);
            return;
        }

        try {
            await updateProfileAPI({
                fullName: editData.fullName,
                phone: editData.phone,
                gender: editData.gender,
                dateOfBirth: editData.dateOfBirth,
            });

            await reloadProfile?.();

            setIsEditing(false);
            setMessage({ text: "Cập nhật thông tin thành công", type: "success" });

            setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);
        } catch (error) {
            console.error("UPDATE PROFILE ERROR:", error?.response?.data || error);

            setMessage({
                text:
                    error?.response?.data?.message ||
                    "Cập nhật thất bại, vui lòng thử lại",
                type: "error",
            });

            setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);
        }
    }

    const handleCancel = () => {
        setEditData(originalDataRef.current);
        setErrors({ fullName: "", email: "", phone: "" });
        setIsEditing(false);
        setMessage({ text: "", type: "" });
    };

    return (
        <div className="w-full lg:w-2/3 rounded-2xl border border-slate-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            {/* Header */ }
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Cập nhật thông tin để tài khoản chính xác hơn.
                    </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[rgb(119,226,242)] shadow-[0_0_0_6px_rgba(119,226,242,0.18)]" />
                    <span className="text-xs font-medium text-slate-600">Profile</span>
                </div>
            </div>

            {/* Form */ }
            <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* FULL NAME */ }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                        <input
                            className={ [
                                "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                                "outline-none transition",
                                errors.fullName
                                    ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                    : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                            ].join(" ") }
                            value={ editData.fullName }
                            onChange={ (e) => {
                                setEditData({ ...editData, fullName: e.target.value });
                                setErrors((p) => ({ ...p, fullName: "" }));
                                setIsEditing(true);
                            } }
                            placeholder="Nhập họ và tên"
                        />
                        { errors.fullName && <p className="text-sm text-rose-600">{ errors.fullName }</p> }
                    </div>

                    {/* PHONE */ }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                        <input
                            className={ [
                                "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                                "outline-none transition",
                                errors.phone
                                    ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                    : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                            ].join(" ") }
                            value={ editData.phone }
                            onChange={ handlePhoneChange }
                            placeholder="Nhập số điện thoại"
                        />
                        { errors.phone && <p className="text-sm text-rose-600">{ errors.phone }</p> }
                    </div>

                    {/* EMAIL - READ ONLY (span 2 columns) */ }
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <input
                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
                            value={ editData.email }
                            disabled
                        />
                        <p className="text-xs text-slate-500">Email không thể thay đổi.</p>
                    </div>

                    {/* GENDER */ }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Giới tính</label>
                        <select
                            className={ [
                                "w-full rounded-xl border bg-white px-4 py-3 text-slate-900",
                                "outline-none transition",
                                errors.gender
                                    ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                    : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                            ].join(" ") }
                            value={ editData.gender || "" }
                            onChange={ (e) => {
                                setEditData({ ...editData, gender: e.target.value });
                                setErrors((p) => ({ ...p, gender: "" }));
                                setIsEditing(true);
                            } }
                        >
                            <option value="" disabled>
                                Chọn giới tính
                            </option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                        { errors.gender && <p className="text-sm text-rose-600">{ errors.gender }</p> }
                    </div>

                    {/* DATE OF BIRTH */ }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Ngày sinh</label>
                        <input
                            type="date"
                            className={ [
                                "w-full rounded-xl border bg-white px-4 py-3 text-slate-900",
                                "outline-none transition",
                                errors.dateOfBirth
                                    ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                    : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                            ].join(" ") }
                            value={ editData.dateOfBirth || "" }
                            onChange={ (e) => {
                                setEditData({ ...editData, dateOfBirth: e.target.value });
                                setErrors((p) => ({ ...p, dateOfBirth: "" }));
                                setIsEditing(true);
                            } }
                        />
                        { errors.dateOfBirth && (
                            <p className="text-sm text-rose-600">{ errors.dateOfBirth }</p>
                        ) }
                    </div>

                    {/* ACTION BUTTONS (span 2 columns) */ }
                    <div className="lg:col-span-2 pt-1">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={ handleUpdateProfile }
                                className={ [
                                    "flex-1 rounded-xl px-4 py-3 font-semibold text-white",
                                    "bg-[rgb(119,226,242)] shadow-sm",
                                    "hover:brightness-95 active:brightness-90",
                                    "focus:outline-none focus:ring-4 focus:ring-[rgba(119,226,242,0.35)]",
                                    "transition",
                                ].join(" ") }
                            >
                                Cập nhật
                            </button>

                            <button
                                onClick={ handleCancel }
                                className={ [
                                    "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700",
                                    "hover:bg-slate-50 active:bg-slate-100",
                                    "focus:outline-none focus:ring-4 focus:ring-slate-200",
                                    "transition",
                                ].join(" ") }
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;
