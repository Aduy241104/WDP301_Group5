import { useEffect, useState } from "react";
import {
  createSellerProductAPI,
  getBrandsAPI,
  getCategorySchemasAPI,
} from "../../../services/sellerManageProduct.service";
import ProductForm from "./ProductForm";
import {
  createEmptyProductForm,
  serializeProductPayload,
  validateProductForm,
} from "./productForm.utils";

export default function SellerAddProduct({ onBack, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(() => createEmptyProductForm());

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const msg = validateProductForm(form);
      if (msg) {
        setError(msg);
        return;
      }

      const { payload, variants } = serializeProductPayload(form);
      if (variants.length === 0) {
        setError("Sản phẩm phải có ít nhất 1 phân loại (giá bắt buộc)");
        return;
      }

      await createSellerProductAPI(payload);

      onSuccess?.();
      onBack?.();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Tạo sản phẩm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductForm
      title="Thêm sản phẩm mới"
      submitLabel="Tạo sản phẩm"
      submitting={submitting}
      error={error}
      brands={brands}
      categories={categories}
      form={form}
      setForm={setForm}
      onBack={onBack}
      onSubmit={handleSubmit}
      variantHelpText="Mỗi dòng = 1 biến thể. SKU tự động tạo, không trùng."
    />
  );
}
