import { useEffect, useState } from "react";
import {
  createSellerCategoryAPI,
  getSellerCategoriesAPI,
  updateSellerCategoryAPI,
  deleteSellerCategoryAPI,
  getSellerCategoryProductsAPI,
  getSellerCategoryAvailableProductsAPI,
  addProductsToSellerCategoryAPI,
  deleteProductFromSellerCategoryAPI,
} from "../../../services/sellerManageCategory.service";
import CategoryForm from "./components/CategoryForm";
import CategoryList from "./components/CategoryList";
import CategoryProductsList from "./components/CategoryProductsList";
import AddProductsModal from "./components/AddProductsModal";

export default function SellerCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [categoryProductsPagination, setCategoryProductsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [categoryProductsLoading, setCategoryProductsLoading] = useState(false);

  const [showAddProductsModal, setShowAddProductsModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [availablePagination, setAvailablePagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableKeyword, setAvailableKeyword] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [addProductsSubmitting, setAddProductsSubmitting] = useState(false);

  const [deletingProductId, setDeletingProductId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSellerCategoriesAPI();
      setCategories(data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải danh sách category");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryProducts = async (category, page = 1) => {
    if (!category) return;
    try {
      setCategoryProductsLoading(true);
      setError("");
      const res = await getSellerCategoryProductsAPI(category._id, {
        page,
        limit: categoryProductsPagination.limit,
      });
      setCategoryProducts(res?.data || []);
      if (res?.pagination) {
        setCategoryProductsPagination(res.pagination);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải sản phẩm của category");
    } finally {
      setCategoryProductsLoading(false);
    }
  };

  const loadAvailableProducts = async (category, page = 1, keyword = "") => {
    if (!category) return;
    try {
      setAvailableLoading(true);
      setError("");
      const res = await getSellerCategoryAvailableProductsAPI(category._id, {
        page,
        limit: availablePagination.limit,
        keyword: keyword || undefined,
      });
      setAvailableProducts(res?.data || []);
      if (res?.pagination) {
        setAvailablePagination(res.pagination);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải danh sách sản phẩm để thêm");
    } finally {
      setAvailableLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await createSellerCategoryAPI({ name: name.trim() });
      setName("");
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Tạo category thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setEditingName(cat.name || "");
  };

  const handleSaveEdit = async (cat) => {
    if (!editingName.trim()) return;
    try {
      setError("");
      await updateSellerCategoryAPI(cat._id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Cập nhật category thất bại");
    }
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xoá category "${cat.name}"? Sản phẩm sẽ không còn gắn với category này.`
      )
    ) {
      return;
    }
    try {
      setError("");
      await deleteSellerCategoryAPI(cat._id);
      if (selectedCategory && selectedCategory._id === cat._id) {
        setSelectedCategory(null);
        setCategoryProducts([]);
      }
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Xoá category thất bại");
    }
  };

  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    setCategoryProductsPagination((prev) => ({ ...prev, page: 1 }));
    await loadCategoryProducts(cat, 1);
  };

  const handleOpenAddProducts = async () => {
    if (!selectedCategory) return;
    setSelectedProductIds([]);
    setAvailableKeyword("");
    setAvailablePagination((prev) => ({ ...prev, page: 1 }));
    setShowAddProductsModal(true);
    await loadAvailableProducts(selectedCategory, 1, "");
  };

  const handleToggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddProductsToCategory = async () => {
    if (!selectedCategory || selectedProductIds.length === 0) return;
    try {
      setAddProductsSubmitting(true);
      setError("");
      await addProductsToSellerCategoryAPI(selectedCategory._id, selectedProductIds);
      setShowAddProductsModal(false);
      await loadCategoryProducts(selectedCategory, categoryProductsPagination.page);
    } catch (e) {
      setError(e?.response?.data?.message || "Thêm sản phẩm vào category thất bại");
    } finally {
      setAddProductsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!selectedCategory) return;
    if (
      !window.confirm(
        `Bạn có chắc muốn xoá sản phẩm "${product.name}" khỏi category này?`
      )
    ) {
      return;
    }
    try {
      setDeletingProductId(product._id);
      setError("");
      await deleteProductFromSellerCategoryAPI(selectedCategory._id, product._id);
      await loadCategoryProducts(selectedCategory, categoryProductsPagination.page);
    } catch (e) {
      setError(e?.response?.data?.message || "Xoá sản phẩm khỏi category thất bại");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6">
      <CategoryForm
        name={name}
        onNameChange={setName}
        onSubmit={handleAdd}
        submitting={submitting}
        error={error}
      />

      <CategoryList
        categories={categories}
        loading={loading}
        selectedCategoryId={selectedCategory?._id}
        editingId={editingId}
        editingName={editingName}
        onSelectCategory={handleSelectCategory}
        onStartEdit={handleStartEdit}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        onEditingNameChange={setEditingName}
        onCancelEdit={() => {
          setEditingId(null);
          setEditingName("");
        }}
      />

      {selectedCategory && (
        <CategoryProductsList
          selectedCategory={selectedCategory}
          products={categoryProducts}
          loading={categoryProductsLoading}
          pagination={categoryProductsPagination}
          onOpenAddProducts={handleOpenAddProducts}
          onPreviousPage={() => {
            const nextPage = Math.max(1, categoryProductsPagination.page - 1);
            setCategoryProductsPagination((p) => ({ ...p, page: nextPage }));
            loadCategoryProducts(selectedCategory, nextPage);
          }}
          onNextPage={() => {
            const nextPage = categoryProductsPagination.totalPages
              ? Math.min(
                  categoryProductsPagination.totalPages,
                  categoryProductsPagination.page + 1
                )
              : categoryProductsPagination.page + 1;
            setCategoryProductsPagination((p) => ({ ...p, page: nextPage }));
            loadCategoryProducts(selectedCategory, nextPage);
          }}
          onDeleteProduct={handleDeleteProduct}
          deletingProductId={deletingProductId}
        />
      )}

      {showAddProductsModal && selectedCategory && (
        <AddProductsModal
          selectedCategory={selectedCategory}
          products={availableProducts}
          loading={availableLoading}
          pagination={availablePagination}
          keyword={availableKeyword}
          selectedProductIds={selectedProductIds}
          submitting={addProductsSubmitting}
          onKeywordChange={setAvailableKeyword}
          onSearch={() => {
            setAvailablePagination((p) => ({ ...p, page: 1 }));
            loadAvailableProducts(selectedCategory, 1, availableKeyword);
          }}
          onToggleSelectProduct={handleToggleSelectProduct}
          onSelectAll={(checked) => {
            if (checked) {
              setSelectedProductIds((prev) => [
                ...new Set([
                  ...prev,
                  ...availableProducts.map((p) => p._id),
                ]),
              ]);
            } else {
              setSelectedProductIds((prev) =>
                prev.filter(
                  (id) => !availableProducts.some((p) => p._id === id)
                )
              );
            }
          }}
          onPreviousPage={() => {
            const nextPage = Math.max(1, availablePagination.page - 1);
            setAvailablePagination((p) => ({ ...p, page: nextPage }));
            loadAvailableProducts(selectedCategory, nextPage, availableKeyword);
          }}
          onNextPage={() => {
            const nextPage = availablePagination.totalPages
              ? Math.min(
                  availablePagination.totalPages,
                  availablePagination.page + 1
                )
              : availablePagination.page + 1;
            setAvailablePagination((p) => ({ ...p, page: nextPage }));
            loadAvailableProducts(selectedCategory, nextPage, availableKeyword);
          }}
          onAddProducts={handleAddProductsToCategory}
          onClose={() => setShowAddProductsModal(false)}
        />
      )}
    </div>
  );
}