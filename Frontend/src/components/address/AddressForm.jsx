import { useEffect, useState } from "react";

const emptyForm = {
  province: "",
  district: "",
  ward: "",
  streetAddress: "",
  isDefault: false,
};

const AddressForm = ({ editingAddress, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);

  // ✅ THÊM
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (editingAddress) setForm(editingAddress);
    else setForm(emptyForm);
  }, [editingAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ THÊM VALIDATE
    const newErrors = {};

    if (!form.province.trim())
      newErrors.province = "Vui lòng nhập Tỉnh / Thành phố";
    if (!form.district.trim())
      newErrors.district = "Vui lòng nhập Quận / Huyện";
    if (!form.ward.trim())
      newErrors.ward = "Vui lòng nhập Phường / Xã";
    if (!form.streetAddress.trim())
      newErrors.streetAddress = "Vui lòng nhập địa chỉ cụ thể";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg("");
      return;
    }

    try {
      await onSubmit(form); // giữ nguyên
      setErrors({});
      setSuccessMsg("Lưu địa chỉ thành công");
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch {
      setSuccessMsg("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow w-1/3 space-y-4"
    >
      <h2 className="font-semibold text-lg">
        {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
      </h2>

      

      {/* PROVINCE */}
      <input
        className="border w-full p-2 rounded"
        placeholder="Tỉnh / Thành phố"
        value={form.province}
        onChange={(e) => {
          setForm({ ...form, province: e.target.value });
          setErrors((p) => ({ ...p, province: "" }));
        }}
      />
      {errors.province && (
        <p className="text-sm text-red-500">{errors.province}</p>
      )}

      {/* DISTRICT */}
      <input
        className="border w-full p-2 rounded"
        placeholder="Quận / Huyện"
        value={form.district}
        onChange={(e) => {
          setForm({ ...form, district: e.target.value });
          setErrors((p) => ({ ...p, district: "" }));
        }}
      />
      {errors.district && (
        <p className="text-sm text-red-500">{errors.district}</p>
      )}

      {/* WARD */}
      <input
        className="border w-full p-2 rounded"
        placeholder="Phường / Xã"
        value={form.ward}
        onChange={(e) => {
          setForm({ ...form, ward: e.target.value });
          setErrors((p) => ({ ...p, ward: "" }));
        }}
      />
      {errors.ward && (
        <p className="text-sm text-red-500">{errors.ward}</p>
      )}

      {/* STREET ADDRESS */}
      <input
        className="border w-full p-2 rounded"
        placeholder="Địa chỉ cụ thể"
        value={form.streetAddress}
        onChange={(e) => {
          setForm({ ...form, streetAddress: e.target.value });
          setErrors((p) => ({ ...p, streetAddress: "" }));
        }}
      />
      {errors.streetAddress && (
        <p className="text-sm text-red-500">
          {errors.streetAddress}
        </p>
      )}

      {/* DEFAULT */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) =>
            setForm({ ...form, isDefault: e.target.checked })
          }
        />
        Đặt làm mặc định
      </label>

      <button className="w-full bg-indigo-600 text-white py-2 rounded">
        {editingAddress ? "Cập nhật" : "Thêm mới"}
      </button>
    </form>
  );
};

export default AddressForm;
