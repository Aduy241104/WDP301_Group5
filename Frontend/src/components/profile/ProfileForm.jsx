import { useState, useRef, useEffect } from "react";
import { updateProfileAPI } from "../../services/profileServices";

const ProfileForm = ({ editData, setEditData, setMessage, reloadProfile }) => {
    const [isEditing, setIsEditing] = useState(false);

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        phone: "",
    });

    const originalDataRef = useRef(null);

    useEffect(() => {
        if (!isEditing && editData) {
            originalDataRef.current = { ...editData };
        }
    }, [editData, isEditing]);

    if (!editData) return null;

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handlePhoneChange = (e) => {
        const rawValue = e.target.value;

        // Chỉ cho nhập số
        if (!/^\d*$/.test(rawValue)) return;


        // Bắt đầu phải là 0
        if (rawValue.length === 1 && rawValue !== "0") return;

        setEditData((prev) => ({ ...prev, phone: rawValue }));
        setErrors((prev) => ({ ...prev, phone: "" }));
    };


    const handleUpdateProfile = async () => {
        let newErrors = { fullName: "", email: "", phone: "" };

        if (!editData.fullName.trim()) {
            newErrors.fullName = "Họ và tên không được để trống";
        }

        if (!isValidEmail(editData.email)) {
            newErrors.email = "Email không đúng định dạng";
        }

        if (!/^0\d{9}$/.test(editData.phone)) {
            newErrors.phone =
                "Số điện thoại phải bắt đầu bằng 0 và gồm đúng 10 chữ số";
        }

        if (newErrors.fullName || newErrors.email || newErrors.phone) {
            setErrors(newErrors);
            return;
        }

        try {
            await updateProfileAPI({
                fullName: editData.fullName,
                email: editData.email,
                phone: editData.phone,
            });

            if (typeof reloadProfile === "function") {
                await reloadProfile();
            }

            setIsEditing(false);

            setMessage({
                text: "Cập nhật thông tin thành công",
                type: "success",
            });

            // Tự tắt sau 3s
            setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);

        } catch (error) {
            setMessage({
                text: "Cập nhật thất bại, vui lòng thử lại",
                type: "error",
            });

            // Tự tắt sau 3s
            setTimeout(() => {
                setMessage({ text: "", type: "" });
            }, 3000);
        }
    };

    const handleCancel = () => {
        setEditData(originalDataRef.current);
        setErrors({ fullName: "", email: "", phone: "" });
        setIsEditing(false);
        setMessage({ text: "", type: "" });
    };

    return (
        <div className="bg-white p-10 rounded-xl shadow w-2/3 space-y-6 min-h-[820px]">

            {/* FULL NAME */}
            <div>
                <label className="font-medium">Họ và tên</label>
                <input
                    className="border w-full p-2 rounded"
                    value={editData.fullName}
                    onChange={(e) => {
                        setEditData({ ...editData, fullName: e.target.value });
                        setErrors((prev) => ({ ...prev, fullName: "" }));
                        setIsEditing(true);
                    }}
                />
                {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
            </div>

            {/* EMAIL */}
            <div>
                <label className="font-medium">Email</label>
                <input
                    className="border w-full p-2 rounded"
                    value={editData.email}
                    onChange={(e) => {
                        setEditData({ ...editData, email: e.target.value });
                        setErrors((prev) => ({ ...prev, email: "" }));
                        setIsEditing(true);
                    }}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
            </div>

            {/* PHONE */}
            <div>
                <label className="font-medium">Số điện thoại</label>
                <input
                    className="border w-full p-2 rounded"
                    value={editData.phone}
                    onChange={handlePhoneChange}
                    placeholder="0xxxxxxxxx"
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded"
                >
                    Cập nhật
                </button>

                <button
                    onClick={handleCancel}
                    className="flex-1 border py-2 rounded"
                >
                    Hủy
                </button>
            </div>
        </div>
    );
};

export default ProfileForm;
