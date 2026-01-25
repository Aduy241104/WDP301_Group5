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
        <div className="bg-white p-6 rounded shadow w-[420px] space-y-4">
            <h3 className="font-semibold">Đổi mật khẩu</h3>

            {/* CURRENT PASSWORD */}
            <div>
                <input
                    type="password"
                    className="border w-full p-2 rounded"
                    placeholder="Mật khẩu hiện tại"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                        setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                        });
                        setErrors((prev) => ({ ...prev, currentPassword: "" }));
                    }}
                />
                {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.currentPassword}
                    </p>
                )}
            </div>

            {/* NEW PASSWORD */}
            <div>
                <input
                    type="password"
                    className="border w-full p-2 rounded"
                    placeholder="Mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                        setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                        });
                        setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                />
                {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.newPassword}
                    </p>
                )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
                <input
                    type="password"
                    className="border w-full p-2 rounded"
                    placeholder="Xác nhận mật khẩu"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                        setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                        });
                        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.confirmPassword}
                    </p>
                )}
            </div>

            <button
                onClick={handleChangePassword}
                className="w-full bg-indigo-600 text-white py-2 rounded"
            >
                Đổi mật khẩu
            </button>
        </div>
    );
};

export default ChangePasswordForm;
