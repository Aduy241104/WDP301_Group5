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
      onSubmit={ handleSubmit }
      className="w-full shrink-0 rounded-2xl border border-slate-100 bg-white shadow-md"
    >
      {/* Header */ }
      <div className="px-7 pt-7">
        <h2 className="text-lg font-semibold text-slate-900">
          { editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ" }
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin địa chỉ dùng cho giao hàng
        </p>
      </div>

      {/* Body */ }
      <div className="px-7 pb-7 pt-6 space-y-5">
        {/* PROVINCE */ }
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Tỉnh / Thành phố
          </label>
          <input
            className={ `w-full rounded-xl border px-4 py-3 text-sm
          bg-white text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300
          ${errors.province ? "border-rose-300 focus:ring-rose-100" : "border-slate-200"}` }
            placeholder="Ví dụ: TP. Hồ Chí Minh"
            value={ form.province }
            onChange={ (e) => {
              setForm({ ...form, province: e.target.value });
              setErrors((p) => ({ ...p, province: "" }));
            } }
          />
          { errors.province && (
            <p className="text-xs text-rose-600">{ errors.province }</p>
          ) }
        </div>

        {/* DISTRICT */ }
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Quận / Huyện
          </label>
          <input
            className={ `w-full rounded-xl border px-4 py-3 text-sm
          bg-white text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300
          ${errors.district ? "border-rose-300 focus:ring-rose-100" : "border-slate-200"}` }
            placeholder="Ví dụ: Quận 1"
            value={ form.district }
            onChange={ (e) => {
              setForm({ ...form, district: e.target.value });
              setErrors((p) => ({ ...p, district: "" }));
            } }
          />
          { errors.district && (
            <p className="text-xs text-rose-600">{ errors.district }</p>
          ) }
        </div>

        {/* WARD */ }
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Phường / Xã
          </label>
          <input
            className={ `w-full rounded-xl border px-4 py-3 text-sm
          bg-white text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300
          ${errors.ward ? "border-rose-300 focus:ring-rose-100" : "border-slate-200"}` }
            placeholder="Ví dụ: Phường Bến Nghé"
            value={ form.ward }
            onChange={ (e) => {
              setForm({ ...form, ward: e.target.value });
              setErrors((p) => ({ ...p, ward: "" }));
            } }
          />
          { errors.ward && (
            <p className="text-xs text-rose-600">{ errors.ward }</p>
          ) }
        </div>

        {/* STREET */ }
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Địa chỉ cụ thể
          </label>
          <input
            className={ `w-full rounded-xl border px-4 py-3 text-sm
          bg-white text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-300
          ${errors.streetAddress ? "border-rose-300 focus:ring-rose-100" : "border-slate-200"}` }
            placeholder="Số nhà, tên đường…"
            value={ form.streetAddress }
            onChange={ (e) => {
              setForm({ ...form, streetAddress: e.target.value });
              setErrors((p) => ({ ...p, streetAddress: "" }));
            } }
          />
          { errors.streetAddress && (
            <p className="text-xs text-rose-600">{ errors.streetAddress }</p>
          ) }
        </div>

        {/* DEFAULT */ }
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Đặt làm mặc định
            </p>
            <p className="text-xs text-slate-500">
              Ưu tiên dùng cho các đơn hàng sau
            </p>
          </div>
          <input
            type="checkbox"
            checked={ form.isDefault }
            onChange={ (e) => setForm({ ...form, isDefault: e.target.checked }) }
            className="h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
          />
        </label>

        {/* ACTION */ }
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white
                 hover:bg-slate-800 transition
                 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          { editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ" }
        </button>
      </div>
    </form>


  );
};

export default AddressForm;
