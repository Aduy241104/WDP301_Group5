import { useEffect, useState } from "react";
import {
  createSellerProductAPI,
  getBrandsAPI,
  getCategorySchemasAPI,
} from "../../../services/sellerManageProduct.service";

const emptyVariant = { size: "", price: "", stock: "" };
const emptyAttr = { key: "", value: "" };

export default function SellerAddProduct({ onBack, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    brandId: "",
    categorySchemaId: "",
    origin: "",
    description: "",
    images: [""],
    attributes: [emptyAttr],
    variants: [emptyVariant],
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [brandList, categoryList] = await Promise.all([
          getBrandsAPI(),
          getCategorySchemasAPI(),
        ]);
        setBrands(brandList || []);
        setCategories(categoryList || []);
      } catch (e) {
        console.error("Load brands/categories:", e);
      }
    };
    load();
  }, []);

  const setFormField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addRow = (key, empty) =>
    setForm((p) => ({ ...p, [key]: [...p[key], empty] }));
  const removeRow = (key, idx) =>
    setForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  const updateRow = (key, idx, patch) =>
    setForm((p) => ({
      ...p,
      [key]: p[key].map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const images = (form.images || []).map((x) => x.trim()).filter(Boolean);
      const attributes = (form.attributes || [])
        .map((a) => ({ key: a.key?.trim(), value: a.value }))
        .filter((a) => a.key);
      const variants = (form.variants || [])
        .map((v) => ({
          size: v.size?.trim() || "",
          price: Number(v.price),
          stock: Number(v.stock || 0),
        }))
        .filter((v) => Number.isFinite(v.price));

      if (!form.name.trim()) {
        setError("Vui lòng nhập tên sản phẩm");
        return;
      }
      if (!form.brandId) {
        setError("Vui lòng chọn Brand");
        return;
      }
      if (!form.categorySchemaId) {
        setError("Vui lòng chọn Danh mục");
        return;
      }
      if (variants.length === 0) {
        setError("Sản phẩm phải có ít nhất 1 phân loại (giá bắt buộc)");
        return;
      }

      await createSellerProductAPI({
        brandId: form.brandId,
        categorySchemaId: form.categorySchemaId,
        name: form.name.trim(),
        description: form.description || "",
        origin: form.origin || "",
        images,
        attributes,
        variants,
      });

      onSuccess?.();
      onBack?.();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Tạo sản phẩm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
      >
        ← Quay lại danh sách
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-6">Thêm sản phẩm mới</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
            <input
              value={form.name}
              onChange={(e) => setFormField("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Ví dụ: Áo thun..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xuất xứ</label>
            <input
              value={form.origin}
              onChange={(e) => setFormField("origin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Việt Nam..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
            <select
              value={form.brandId}
              onChange={(e) => setFormField("brandId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Chọn thương hiệu --</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
            <select
              value={form.categorySchemaId}
              onChange={(e) => setFormField("categorySchemaId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <textarea
            value={form.description}
            onChange={(e) => setFormField("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Mô tả sản phẩm..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Ảnh (URL)</label>
            <button
              type="button"
              onClick={() => addRow("images", "")}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
            >
              + Thêm ảnh
            </button>
          </div>
          {form.images.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={url}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    images: p.images.map((x, i) => (i === idx ? e.target.value : x)),
                  }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
              <button
                type="button"
                disabled={form.images.length === 1}
                onClick={() => removeRow("images", idx)}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">Thuộc tính</label>
              <p className="text-xs text-gray-500 mt-0.5">Tự nhập theo loại sản phẩm (vd: màu, RAM, chất liệu, dung lượng...)</p>
            </div>
            <button
              type="button"
              onClick={() => addRow("attributes", emptyAttr)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
            >
              + Thêm thuộc tính
            </button>
          </div>
          {form.attributes.map((a, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={a.key}
                onChange={(e) => updateRow("attributes", idx, { key: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tên thuộc tính (vd: màu, RAM, chất liệu)"
              />
              <input
                value={a.value}
                onChange={(e) => updateRow("attributes", idx, { value: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                placeholder="Giá trị (vd: đỏ, 8GB, cotton)"
              />
              <div className="md:col-span-3">
                <button
                  type="button"
                  disabled={form.attributes.length === 1}
                  onClick={() => removeRow("attributes", idx)}
                  className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 text-sm"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phân loại *</label>
              <p className="text-xs text-gray-500 mt-0.5">Mỗi dòng = 1 biến thể. SKU tự động tạo, không trùng.</p>
            </div>
            <button
              type="button"
              onClick={() => addRow("variants", emptyVariant)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
            >
              + Thêm phân loại
            </button>
          </div>
          {form.variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3"
            >
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Phân loại</label>
                <input
                  value={v.size}
                  onChange={(e) => updateRow("variants", idx, { size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  placeholder="vd: S/M/L, Đỏ, 8GB/128GB"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Giá *</label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateRow("variants", idx, { price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tồn kho</label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => updateRow("variants", idx, { stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  min={0}
                />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button
                  type="button"
                  disabled={form.variants.length === 1}
                  onClick={() => removeRow("variants", idx)}
                  className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 text-sm"
                >
                  Xóa phân loại
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Đang lưu..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
}
