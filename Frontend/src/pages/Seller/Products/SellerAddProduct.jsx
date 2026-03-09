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
        const categoryList = await getCategorySchemasAPI();
        setCategories(categoryList || []);

        // ban đầu không tải brands, chờ người dùng chọn category
      } catch (e) {
        console.error("Load categories:", e);
      }
    };
    load();
  }, []);

  // khi seller chọn 1 danh mục mới, cập nhật brands tương ứng và reset brandId trong form
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const list = await getBrandsAPI(form.categorySchemaId);
        setBrands(list || []);
        // nếu brand hiện tại không thuộc danh sách mới thì xóa đi
        if (form.brandId && !list.find((b) => b._id === form.brandId)) {
          setForm((p) => ({ ...p, brandId: "" }));
        }
      } catch (e) {
        console.error("Failed to load brands for category", e);
      }
    };
    if (form.categorySchemaId) {
      fetchBrands();
    } else {
      // nếu không chọn category thì cũng reset brands
      setBrands([]);
      setForm((p) => ({ ...p, brandId: "" }));
    }
  }, [form.categorySchemaId]);

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

      // chỉ yêu cầu tồn kho cho mỗi phân loại, giá có thể để trống
      for (const v of form.variants || []) {
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
        // nếu defaultPrice thiếu (vì validation cũ), trả về as-is
        if (defaultPrice === "" || defaultPrice == null) return v;
        return { ...v, price: defaultPrice };
      });

      const { payload, variants } = serializeProductPayload({
        ...form,
        images: currentImages,
        variants: filledVariants,
      });
      if (variants.length === 0) {
        setError("Sản phẩm phải có ít nhất 1 phân loại");
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
      variantHelpText="Mỗi dòng = 1 biến thể. SKU tự động tạo, không trùng. Giá để trống sẽ dùng giá mặc định."
      imageFiles={imageFiles}
      onImageFilesChange={setImageFiles}
      defaultPrice={defaultPrice}
      onDefaultPriceChange={setDefaultPrice}
      enableDefaultPrice
    />
  );
}