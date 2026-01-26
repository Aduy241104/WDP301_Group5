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
        <div className="bg-white p-10 rounded-xl shadow w-2/3 space-y-6 min-h-[820px]">

            {/* FULL NAME */}
            <div>
                <label className="font-medium">Họ và tên</label>
                <input
                    className="border w-full p-2 rounded"
                    value={editData.fullName}
                    onChange={(e) => {
                        setEditData({ ...editData, fullName: e.target.value });
                        setErrors((p) => ({ ...p, fullName: "" }));
                        setIsEditing(true);
                    }}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            {/* EMAIL - READ ONLY */}
            <div>
                <label className="font-medium">Email</label>
                <input
                    className="border w-full p-2 rounded bg-gray-100 cursor-not-allowed"
                    value={editData.email}
                    disabled
                />
            </div>

            {/* PHONE */}
            <div>
                <label className="font-medium">Số điện thoại</label>
                <input
                    className="border w-full p-2 rounded"
                    value={editData.phone}
                    onChange={handlePhoneChange}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* GENDER */}
            <div>
                <label className="font-medium">Giới tính</label>
                <select
                    className="border w-full p-2 rounded"
                    value={editData.gender || ""}
                    onChange={(e) => {
                        setEditData({ ...editData, gender: e.target.value });
                        setErrors((p) => ({ ...p, gender: "" }));
                        setIsEditing(true);
                    }}
                >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                </select>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
            </div>

            {/* DATE OF BIRTH */}
            <div>
                <label className="font-medium">Ngày sinh</label>
                <input
                    type="date"
                    className="border w-full p-2 rounded"
                    value={editData.dateOfBirth || ""}
                    onChange={(e) => {
                        setEditData({ ...editData, dateOfBirth: e.target.value });
                        setErrors((p) => ({ ...p, dateOfBirth: "" }));
                        setIsEditing(true);
                    }}
                />
                {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
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
