import { useEffect, useState } from "react";
import {
  getProvincesAPI,
  getDistrictsByProvinceAPI,
  getWardsByDistrictAPI,
} from "../../services/vnAddressService";

const emptyForm = {
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  streetAddress: "",
  isDefault: false,
};

const AddressForm = ({ editingAddress, onSubmit }) => {
  const [form, setForm] = useState(emptyForm);

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  // Load provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvince(true);
        const data = await getProvincesAPI();
        setProvinces(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProvince(false);
      }
    };
    fetchProvinces();
  }, []);

  // Edit mode
  useEffect(() => {
    if (editingAddress) setForm(editingAddress);
    else setForm(emptyForm);
  }, [editingAddress]);

  // Province change (LƯU NAME)
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;

    const selectedProvince = provinces.find(
      (p) => p.code.toString() === provinceCode
    );

    setForm((prev) => ({
      ...prev,
      province: selectedProvince ? selectedProvince.name : "",
      district: "",
      ward: "",
    }));

    setDistricts([]);
    setWards([]);

    if (!provinceCode) return;

    try {
      setLoadingDistrict(true);
      const data = await getDistrictsByProvinceAPI(provinceCode);
      setDistricts(data);
    } finally {
      setLoadingDistrict(false);
    }
  };

  // District change (LƯU NAME)
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;

    const selectedDistrict = districts.find(
      (d) => d.code.toString() === districtCode
    );

    setForm((prev) => ({
      ...prev,
      district: selectedDistrict ? selectedDistrict.name : "",
      ward: "",
    }));

    setWards([]);

    if (!districtCode) return;

    try {
      setLoadingWard(true);
      const data = await getWardsByDistrictAPI(districtCode);
      setWards(data);
    } finally {
      setLoadingWard(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!form.phone.trim())
      newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!form.province)
      newErrors.province = "Vui lòng chọn Tỉnh / Thành phố";
    if (!form.district)
      newErrors.district = "Vui lòng chọn Quận / Huyện";
    if (!form.ward)
      newErrors.ward = "Vui lòng chọn Phường / Xã";
    if (!form.streetAddress.trim())
      newErrors.streetAddress = "Vui lòng nhập địa chỉ cụ thể";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg("");
      return;
    }

    try {
      await onSubmit(form);

      setErrors({});
      setSuccessMsg("Lưu địa chỉ thành công");
      setForm(emptyForm);
      setDistricts([]);
      setWards([]);

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-100 bg-white shadow-md"
    >
      <div className="px-7 pt-7">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
        </h2>
      </div>

      <div className="px-7 pb-7 pt-6 space-y-5">

        {/* FULL NAME */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Họ và tên</label>
          <input
            className={`w-full rounded-xl border px-4 py-3 text-sm
            ${errors.fullName ? "border-rose-300" : "border-slate-200"}`}
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />
          {errors.fullName && (
            <p className="text-xs text-rose-600">{errors.fullName}</p>
          )}
        </div>

        {/* PHONE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Số điện thoại
          </label>
          <input
            className={`w-full rounded-xl border px-4 py-3 text-sm
            ${errors.phone ? "border-rose-300" : "border-slate-200"}`}
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />
          {errors.phone && (
            <p className="text-xs text-rose-600">{errors.phone}</p>
          )}
        </div>

        {/* PROVINCE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Tỉnh / Thành phố
          </label>
          <select
            onChange={handleProvinceChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">
              {loadingProvince ? "Đang tải..." : "Chọn Tỉnh / Thành phố"}
            </option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.province && (
            <p className="text-xs text-rose-600">{errors.province}</p>
          )}
        </div>

        {/* DISTRICT */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Quận / Huyện
          </label>
          <select
            onChange={handleDistrictChange}
            disabled={!form.province}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">
              {loadingDistrict ? "Đang tải..." : "Chọn Quận / Huyện"}
            </option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-xs text-rose-600">{errors.district}</p>
          )}
        </div>

        {/* WARD */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Phường / Xã
          </label>
          <select
            disabled={!form.district}
            onChange={(e) => {
              const wardCode = e.target.value;
              const selectedWard = wards.find(
                (w) => w.code.toString() === wardCode
              );

              setForm((prev) => ({
                ...prev,
                ward: selectedWard ? selectedWard.name : "",
              }));
            }}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">
              {loadingWard ? "Đang tải..." : "Chọn Phường / Xã"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
          {errors.ward && (
            <p className="text-xs text-rose-600">{errors.ward}</p>
          )}
        </div>

        {/* STREET */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Địa chỉ cụ thể
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            value={form.streetAddress}
            onChange={(e) =>
              setForm({ ...form, streetAddress: e.target.value })
            }
          />
        </div>

        {/* DEFAULT */}
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
            checked={form.isDefault}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                isDefault: e.target.checked,
              }))
            }
            className="h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
        >
          {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
        </button>

        {successMsg && (
          <p className="text-sm text-green-600 text-center">
            {successMsg}
          </p>
        )}
      </div>
    </form>
  );
};

export default AddressForm;