import { useState } from "react";
import { changePasswordAPI } from "../../services/profileServices";

const ChangePasswordForm = ({ setMessage }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChangePassword = async () => {
        let newErrors = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        };

        if (!passwordData.currentPassword.trim()) {
            newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
        }

        if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (
            newErrors.currentPassword ||
            newErrors.newPassword ||
            newErrors.confirmPassword
        ) {
            setErrors(newErrors);
            return;
        }

        try {
            await changePasswordAPI(passwordData);

            setErrors({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setMessage({
                text: "Đổi mật khẩu thành công",
                type: "success",
            });
        } catch {
            setMessage({
                text: "Mật khẩu hiện tại không đúng",
                type: "error",
            });
        }
    };

    return (
        <div className="w-[420px] rounded-2xl border border-slate-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            {/* Header */ }
            <div className="border-b border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Đổi mật khẩu</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Cập nhật mật khẩu mới để bảo mật tài khoản.
                </p>
            </div>

            {/* Form */ }
            <div className="p-6 space-y-5">
                {/* CURRENT PASSWORD */ }
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Mật khẩu hiện tại
                    </label>
                    <input
                        type="password"
                        className={ [
                            "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                            "outline-none transition",
                            errors.currentPassword
                                ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                        ].join(" ") }
                        placeholder="Nhập mật khẩu hiện tại"
                        value={ passwordData.currentPassword }
                        onChange={ (e) => {
                            setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                            });
                            setErrors((prev) => ({ ...prev, currentPassword: "" }));
                        } }
                    />
                    { errors.currentPassword && (
                        <p className="text-sm text-rose-600">
                            { errors.currentPassword }
                        </p>
                    ) }
                </div>

                {/* NEW PASSWORD */ }
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Mật khẩu mới
                    </label>
                    <input
                        type="password"
                        className={ [
                            "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                            "outline-none transition",
                            errors.newPassword
                                ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                        ].join(" ") }
                        placeholder="Nhập mật khẩu mới"
                        value={ passwordData.newPassword }
                        onChange={ (e) => {
                            setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                            });
                            setErrors((prev) => ({ ...prev, newPassword: "" }));
                        } }
                    />
                    { errors.newPassword && (
                        <p className="text-sm text-rose-600">
                            { errors.newPassword }
                        </p>
                    ) }
                </div>

                {/* CONFIRM PASSWORD */ }
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Xác nhận mật khẩu
                    </label>
                    <input
                        type="password"
                        className={ [
                            "w-full rounded-xl border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400",
                            "outline-none transition",
                            errors.confirmPassword
                                ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                : "border-slate-200 focus:border-[rgb(119,226,242)] focus:ring-4 focus:ring-[rgba(119,226,242,0.25)]",
                        ].join(" ") }
                        placeholder="Nhập lại mật khẩu mới"
                        value={ passwordData.confirmPassword }
                        onChange={ (e) => {
                            setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                            });
                            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        } }
                    />
                    { errors.confirmPassword && (
                        <p className="text-sm text-rose-600">
                            { errors.confirmPassword }
                        </p>
                    ) }
                </div>

                {/* ACTION */ }
                <button
                    onClick={ handleChangePassword }
                    className={ [
                        "w-full rounded-xl px-4 py-3 font-semibold text-white",
                        "bg-[rgb(119,226,242)] shadow-sm",
                        "hover:brightness-95 active:brightness-90",
                        "focus:outline-none focus:ring-4 focus:ring-[rgba(119,226,242,0.35)]",
                        "transition",
                    ].join(" ") }
                >
                    Đổi mật khẩu
                </button>
            </div>
        </div>

    );
};

export default ChangePasswordForm;
