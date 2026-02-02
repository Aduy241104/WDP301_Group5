import { useEffect, useState } from "react";
import { getSellerProductsAPI } from "../../../services/sellerManageProduct.service";

export default function SellerProductList({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setError("");
        const res = await getSellerProductsAPI({ page: 1, limit: 20 });
        setProducts(res?.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Danh sách sản phẩm</h2>
        <button
          onClick={onAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-gray-500">Chưa có sản phẩm. Bấm "Add Product" để thêm.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ảnh</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tên</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">SKU</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Brand</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Giá</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Active</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling?.classList.remove("hidden"); }}
                        />
                      ) : null}
                      <span className={`text-xs text-gray-500 ${p.images?.[0] ? "hidden" : ""}`}>—</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">
                    {p.skus?.length ? p.skus.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">{p.brandId?.name || "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {typeof p.defaultPrice === "number" ? p.defaultPrice.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "approved" ? "bg-green-100 text-green-800" :
                      p.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {p.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.activeStatus === "active" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {p.activeStatus || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
