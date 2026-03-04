import { useEffect, useState } from "react";
import { getSellerInventoriesAPI } from "../../../services/sellerInventory.service";

export default function SellerInventoryList({ onView }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setError("");
        setLoading(true);
        const params = { page, limit: pagination.limit };
        if (keyword.trim()) params.keyword = keyword.trim();
        const res = await getSellerInventoriesAPI(params);

        setItems(res?.data || []);
        if (res?.pagination) {
          setPagination(res.pagination);
        }
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải inventory");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, pagination.limit, keyword]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Tồn kho sản phẩm</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm SKU hoặc tên sản phẩm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-gray-500">Không có bản ghi tồn kho</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ảnh</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên sản phẩm</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Số lượng variant</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Tổng tồn kho</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <span
                        className={`text-xs text-gray-400 ${product.images?.[0] ? "hidden" : ""}`}
                      >
                        —
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 text-center">{product.variantCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-600">{product.totalStock}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onView(product._id)}
                      className="px-3 py-1.5 rounded-lg border border-indigo-300 hover:bg-indigo-50 text-sm font-medium hover:text-indigo-700"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            {page} / {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
