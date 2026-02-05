export const emptyAttr = { key: "", value: "" };
export const emptyVariant = { size: "", price: "", stock: "" };
export const emptyVariantWithId = { _id: undefined, size: "", price: "", stock: "" };

export function createEmptyProductForm({ withVariantId = false } = {}) {
  return {
    name: "",
    brandId: "",
    categorySchemaId: "",
    origin: "",
    description: "",
    images: [""],
    attributes: [emptyAttr],
    variants: [withVariantId ? emptyVariantWithId : emptyVariant],
  };
}

export function toAttrArray(attributes) {
  if (!attributes) return [emptyAttr];
  if (Array.isArray(attributes)) {
    const arr = attributes
      .map((a) => ({ key: a?.key ?? "", value: a?.value ?? "" }))
      .filter((a) => a.key);
    return arr.length ? arr : [emptyAttr];
  }
  if (typeof attributes === "object") {
    const entries = Object.entries(attributes)
      .map(([key, value]) => ({ key, value }))
      .filter((a) => a.key);
    return entries.length ? entries : [emptyAttr];
  }
  return [emptyAttr];
}

export function validateProductForm(form) {
  if (!form?.name?.trim()) return "Vui lòng nhập tên sản phẩm";
  if (!form?.brandId) return "Vui lòng chọn Brand";
  if (!form?.categorySchemaId) return "Vui lòng chọn Danh mục";
  return "";
}

export function serializeProductPayload(form, { includeVariantId = false } = {}) {
  const images = (form.images || []).map((x) => x.trim()).filter(Boolean);
  const attributes = (form.attributes || [])
    .map((a) => ({ key: a.key?.trim(), value: a.value }))
    .filter((a) => a.key);

  const variants = (form.variants || [])
    .map((v) => ({
      ...(includeVariantId && v._id ? { _id: v._id } : {}),
      size: v.size?.trim() || "",
      price: Number(v.price),
      stock: Number(v.stock || 0),
    }))
    .filter((v) => Number.isFinite(v.price));

  return {
    payload: {
      brandId: form.brandId,
      categorySchemaId: form.categorySchemaId,
      name: form.name.trim(),
      description: form.description || "",
      origin: form.origin || "",
      images,
      attributes,
      variants,
    },
    variants,
  };
}

