import { useEffect, useState } from "react";
import {
  createSellerCategoryAPI,
  getSellerCategoriesAPI,
} from "../../../services/sellerManageCategory.service";

export default function SellerCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-col md:flex-row gap-3 items-stretch md:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên category mới..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Đang thêm..." : "Thêm category"}
        </button>
      </form>

      <div className="border-t border-gray-200 pt-4">
        {loading ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Đang tải danh sách category...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            Chưa có category nào. Hãy thêm category mới.
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-800">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    ID: {c._id}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

