import { useEffect, useState } from "react";
import { getSellerInventoriesAPI, getSellerInventoryStatisticsAPI } from "../../../services/sellerInventory.service";

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
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [sortStock, setSortStock] = useState(""); // "asc" | "desc" or empty
  const [stats, setStats] = useState({
    totalStock: 0,
    productCount: 0,
    variantCount: 0,
    lowStockCount: 0,
    outOfStockVariantCount: 0,
    outOfStockProductCount: 0,
    inventoryValue: 0,
    avgStockPerVariant: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        setError("");
        setLoading(true);
        const params = { page, limit: pagination.limit };
        if (keyword.trim()) params.keyword = keyword.trim();
        if (sortStock) params.sortStock = sortStock;
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
  }, [page, pagination.limit, keyword, sortStock]);

  // statistics fetch (independent of pagination)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getSellerInventoryStatisticsAPI({ lowStockThreshold });
        setStats({
          totalStock: res.totalStock || 0,
          productCount: res.productCount || 0,
          variantCount: res.variantCount || 0,
          lowStockCount: res.lowStockCount || 0,
          outOfStockVariantCount: res.outOfStockVariantCount || 0,
          outOfStockProductCount: res.outOfStockProductCount || 0,
          inventoryValue: res.inventoryValue || 0,
          avgStockPerVariant: res.avgStockPerVariant || 0,
        });
      } catch (e) {
        // ignore errors silently or you could display somewhere
      }
    };
    fetchStats();
  }, [lowStockThreshold]);

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
          <div className="flex items-center">
            <label className="text-sm mr-1">Ngưỡng tồn thấp:</label>
            <input
              type="number"
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              className="w-16 px-2 py-1 border rounded-lg"
            />
          </div>
          <div className="flex items-center ml-4">
            <label className="text-sm mr-1">Sắp xếp:</label>
            <select
              value={sortStock}
              onChange={(e) => setSortStock(e.target.value)}
              className="px-2 py-1 border rounded-lg"
            >
              <option value="">Mặc định</option>
              <option value="asc">Tồn tăng</option>
              <option value="desc">Tồn giảm</option>
            </select>
          </div>
        </div>
      </div>

      {/* statistics badges */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
          Sản phẩm: <strong>{stats.productCount}</strong>
        </div>
        <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg">
          Tổng tồn: <strong>{stats.totalStock}</strong>
        </div>
        <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
          Phân loại: <strong>{stats.variantCount}</strong>
        </div>
        <div className="px-3 py-2 bg-red-50 text-red-700 rounded-lg">
          Tồn thấp (&le;5): <strong>{stats.lowStockCount}</strong>
        </div>
        <div className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
          Hết hàng variant: <strong>{stats.outOfStockVariantCount}</strong>
        </div>
        <div className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
          Hết hàng sản phẩm: <strong>{stats.outOfStockProductCount}</strong>
        </div>
        <div className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg">
          Giá trị tồn kho: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.inventoryValue)}</strong>
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
