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

  useEffect(() => {
    if (editingAddress) setForm(editingAddress);
    else setForm(emptyForm);
  }, [editingAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow w-1/3 space-y-4"
    >
      <h2 className="font-semibold text-lg">
        {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
      </h2>

      <input
        className="border w-full p-2 rounded"
        placeholder="Tỉnh / Thành phố"
        value={form.province}
        onChange={(e) =>
          setForm({ ...form, province: e.target.value })
        }
      />

      <input
        className="border w-full p-2 rounded"
        placeholder="Quận / Huyện"
        value={form.district}
        onChange={(e) =>
          setForm({ ...form, district: e.target.value })
        }
      />

      <input
        className="border w-full p-2 rounded"
        placeholder="Phường / Xã"
        value={form.ward}
        onChange={(e) =>
          setForm({ ...form, ward: e.target.value })
        }
      />

      <input
        className="border w-full p-2 rounded"
        placeholder="Địa chỉ cụ thể"
        value={form.streetAddress}
        onChange={(e) =>
          setForm({ ...form, streetAddress: e.target.value })
        }
      />

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
