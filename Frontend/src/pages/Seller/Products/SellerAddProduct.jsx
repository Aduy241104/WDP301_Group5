import { useEffect, useState } from "react";
import {
  createSellerProductAPI,
  getBrandsAPI,
  getCategorySchemasAPI,
} from "../../../services/sellerManageProduct.service";
import { uploadSingleImageAPI } from "../../../services/uploadService";
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
  const [imageFiles, setImageFiles] = useState([]);
   const [defaultPrice, setDefaultPrice] = useState("");

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

      // Yêu cầu nhập giá mặc định khi tạo sản phẩm mới
      if (!defaultPrice && defaultPrice !== 0) {
        setError("Vui lòng nhập giá mặc định");
        return;
      }

      // Yêu cầu mỗi phân loại phải có giá và tồn kho
      for (const v of form.variants || []) {
        if (v.price === "" || v.price == null) {
          setError("Vui lòng nhập giá cho tất cả phân loại");
          return;
        }
        if (v.stock === "" || v.stock == null) {
          setError("Vui lòng nhập tồn kho cho tất cả phân loại");
          return;
        }
      }

      // 1) Chuẩn bị danh sách ảnh: ảnh URL user nhập + ảnh mới chọn file
      let currentImages = form.images || [];

      // Chỉ upload ảnh khi user thực sự bấm submit
      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(
          imageFiles.map((file) =>
            uploadSingleImageAPI({ file, folder: "products" })
          )
        );

        const uploadedUrls = uploadResults
          .map((r) => r?.url)
          .filter(Boolean);

        currentImages = [...currentImages, ...uploadedUrls];
      }

      // Áp dụng giá mặc định cho những variant không nhập giá
      const filledVariants = (form.variants || []).map((v) => {
        if (v.price !== "" && v.price != null) return v;
        if (!defaultPrice) return v;
        return { ...v, price: defaultPrice };
      });

      const { payload, variants } = serializeProductPayload({
        ...form,
        images: currentImages,
        variants: filledVariants,
      });
      if (variants.length === 0) {
        setError("Sản phẩm phải có ít nhất 1 phân loại (giá bắt buộc)");
        return;
      }

      await createSellerProductAPI(payload);

      // Reset file đã chọn sau khi tạo thành công
      setImageFiles([]);
      setDefaultPrice("");

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
      imageFiles={imageFiles}
      onImageFilesChange={setImageFiles}
      defaultPrice={defaultPrice}
      onDefaultPriceChange={setDefaultPrice}
      enableDefaultPrice
    />
  );
}
