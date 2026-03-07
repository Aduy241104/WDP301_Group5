import { useEffect, useState } from "react";
import {
  getSellerProductInventoryAPI,
  updateSellerInventoryStockAPI,
} from "../../../services/sellerInventory.service";

export default function InventoryDetail({ inventoryId, onBack, onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [variants, setVariants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStock, setEditingStock] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await getSellerProductInventoryAPI(inventoryId);
        setData(res?.data || null);
        setVariants(res?.data?.variants || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải chi tiết sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [inventoryId]);

  const handleEditStock = (variant) => {
    setEditingId(variant._id);
    setEditingStock(variant.inventory?.stock || 0);
  };

  const handleSaveStock = async (variantId) => {
    const variant = variants.find((v) => v._id === variantId);
    if (!variant?.inventory) {
      setError("Inventory không tồn tại");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      await updateSellerInventoryStockAPI(variant.inventory._id, { stock: editingStock });
      
      // Update local state
      setVariants((prev) =>
        prev.map((v) =>
          v._id === variantId
            ? { ...v, inventory: { ...v.inventory, stock: editingStock } }
            : v
        )
      );
      setEditingId(null);
      onUpdate?.();
    } catch (e) {
      setError(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingStock(0);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <button onClick={onBack} className="text-indigo-600 hover:underline mb-6">
        &larr; Back
      </button>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      ) : !data ? (
        <div className="py-12 text-center text-gray-500">Không tìm thấy dữ liệu</div>
      ) : (
        <div className="space-y-6">
          {/* Product info */}
          <div className="flex gap-6">
            <div className="w-40 h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
              {data.product?.images?.[0] ? (
                <img
                  src={data.product.images[0]}
                  alt={data.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span className={`text-sm text-gray-500 ${data.product?.images?.[0] ? "hidden" : ""}`}>
                Không có ảnh
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{data.product?.name}</h2>
              <p className="text-gray-600 mb-1">
                <strong>Tổng variant:</strong> {variants.length}
              </p>
              <p className="text-gray-600">
                <strong>Tổng tồn kho:</strong>{" "}
                <span className="text-indigo-600 font-semibold">
                  {variants.reduce((sum, v) => sum + (v.inventory?.stock || 0), 0)}
                </span>
              </p>
            </div>
          </div>

          {/* Variants table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết variant và tồn kho</h3>
            {variants.length === 0 ? (
              <div className="py-8 text-center text-gray-500">Không có variant</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">SKU</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Size</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Giá</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Tồn kho</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-700">{variant.sku}</td>
                        <td className="px-4 py-3">{variant.size || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {variant.price?.toLocaleString() || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingId === variant._id ? (
                            <input
                              type="number"
                              min="0"
                              value={editingStock}
                              onChange={(e) => setEditingStock(Number(e.target.value))}
                              className="border px-2 py-1 rounded w-20 text-right"
                              disabled={submitting}
                            />
                          ) : (
                            <span className="font-medium">{variant.inventory?.stock || 0}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingId === variant._id ? (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleSaveStock(variant._id)}
                                disabled={submitting}
                                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={submitting}
                                className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditStock(variant)}
                              className="px-2 py-1 border rounded text-xs hover:bg-gray-50"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
