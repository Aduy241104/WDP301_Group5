import { useEffect, useMemo, useState } from "react";
import {
  getBrandsAPI,
  getCategorySchemasAPI,
  getSellerProductDetailAPI,
  updateSellerProductAPI,
} from "../../../services/sellerManageProduct.service";
import { uploadSingleImageAPI } from "../../../services/uploadService";
import ProductForm from "./ProductForm";
import {
  createEmptyProductForm,
  serializeProductPayload,
  toAttrArray,
  validateProductForm,
} from "./productForm.utils";

export default function SellerUpdateProduct({ productId, onBack, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState("");

  const [form, setForm] = useState(() => createEmptyProductForm({ withVariantId: true }));

  const title = useMemo(() => `Cập nhật sản phẩm`, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [brandList, categoryList, detailRes] = await Promise.all([
          getBrandsAPI(),
          getCategorySchemasAPI(),
          getSellerProductDetailAPI(productId),
        ]);

        setBrands(brandList || []);
        setCategories(categoryList || []);

        const data = detailRes?.data;
        const incomingVariants = Array.isArray(data?.variants) ? data.variants : [];

        setForm((prev) => ({
          ...prev,
          name: data?.name || "",
          brandId: data?.brandId?._id || data?.brandId || "",
          categorySchemaId: data?.categorySchemaId || "",
          origin: data?.origin || "",
          description: data?.description || "",
          images:
            Array.isArray(data?.images) && data.images.length ? data.images : [""],
          attributes: toAttrArray(data?.attributes),
          variants:
            incomingVariants.length > 0
              ? incomingVariants.map((v) => ({
                  _id: v?._id,
                  size: v?.size || "",
                  price: v?.price ?? "",
                  stock: v?.stock ?? 0,
                }))
              : prev.variants,
        }));
        // load defaultPrice from response if available or compute from variants
        setDefaultPrice(data?.defaultPrice ?? (
          incomingVariants.length ? Math.min(...incomingVariants.map((v) => v?.price ?? 0)) : ""
        ));
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

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

      // yêu cầu nhập giá mặc định khi cập nhật
      if (!defaultPrice && defaultPrice !== 0) {
        setError("Vui lòng nhập giá mặc định");
        return;
      }

      // yêu cầu mỗi phân loại phải có giá và tồn kho
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

      // 1) Chuẩn bị danh sách ảnh: giữ ảnh cũ (form.images), cộng thêm ảnh mới chọn file
      let currentImages = form.images || [];

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

      // apply defaultPrice to any variant that lacks a price
      const filledVariants = (form.variants || []).map((v) => {
        if (v.price !== "" && v.price != null) return v;
        if (!defaultPrice) return v;
        return { ...v, price: defaultPrice };
      });

      const { payload, variants } = serializeProductPayload(
        { ...form, images: currentImages, variants: filledVariants },
        { includeVariantId: true }
      );
      if (variants.length === 0) {
        setError("Sản phẩm phải có ít nhất 1 phân loại (giá bắt buộc)");
        return;
      }

      await updateSellerProductAPI(productId, payload);

      // Reset file đã chọn sau khi update thành công
      setImageFiles([]);

      onSuccess?.();
      onBack?.();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Cập nhật sản phẩm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="py-12 text-center text-gray-500">Đang tải dữ liệu sản phẩm...</div>
      </div>
    );
  }

  return (
    <ProductForm
      title={title}
      submitLabel="Cập nhật sản phẩm"
      submitting={submitting}
      error={error}
      brands={brands}
      categories={categories}
      form={form}
      setForm={setForm}
      onBack={onBack}
      onSubmit={handleSubmit}
      variantHelpText="Mỗi dòng = 1 biến thể. Variant cũ giữ lại `_id` để update đúng, xoá dòng sẽ soft delete ở backend."
      imageFiles={imageFiles}
      onImageFilesChange={setImageFiles}
      defaultPrice={defaultPrice}
      onDefaultPriceChange={setDefaultPrice}
      enableDefaultPrice
    />
  );
}