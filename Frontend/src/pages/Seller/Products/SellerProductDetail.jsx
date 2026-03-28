import { useEffect, useState } from "react";
import { getSellerProductDetailAPI } from "../../../services/sellerManageProduct.service";

export default function SellerProductDetail({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getSellerProductDetailAPI(productId);
        setProduct(res?.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải chi tiết sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="py-12 text-center text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Quay lại
        </button>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          ← Quay lại
        </button>
        <div className="py-12 text-center text-gray-500">Không tìm thấy sản phẩm</div>
      </div>
    );
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActiveBadgeColor = (activeStatus) => {
    return activeStatus === "active"
      ? "bg-blue-100 text-blue-800"
      : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
      >
        ← Quay lại
      </button>

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
            <div className="flex gap-3 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                  product.status
                )}`}
              >
                {product.status === "approved"
                  ? "Đã duyệt"
                  : product.status === "pending"
                  ? "Chờ duyệt"
                  : "Bị từ chối"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getActiveBadgeColor(
                  product.activeStatus
                )}`}
              >
                {product.activeStatus === "active" ? "Đang bán" : "Ngừng bán"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Giá cơ bản</p>
            <p className="text-2xl font-bold text-indigo-600">
              {typeof product.defaultPrice === "number"
                ? product.defaultPrice.toLocaleString()
                : "—"}
              ₫
            </p>
          </div>
        </div>
      </div>

      {/* Reject Reason Alert */}
      {product.status === "rejected" && product.rejectReason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">📋 Lý do từ chối:</h3>
          <p className="text-red-800">{product.rejectReason}</p>
        </div>
      )}

      {/* Images */}
      {product.images && product.images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Hình ảnh</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <img
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-xs">Không tải được</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">Brand</label>
          <p className="text-gray-900">{product.brandId?.name || "—"}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">SKU</label>
          <p className="text-gray-900 text-xs font-mono">
            {product.variants?.[0]?.sku || "—"}
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Xuất xứ</label>
          <p className="text-gray-900">{product.origin || "—"}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700">Đánh giá</label>
          <p className="text-gray-900">
            {product.ratingAvg?.toFixed(1) || 0} ⭐ ({product.totalSale || 0} bán)
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.description || "Không có mô tả"}
          </p>
        </div>
      </div>

      {/* Attributes */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Thuộc tính</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 font-medium uppercase">{key}</p>
                <p className="text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants & Stock */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Phân loại & Tồn kho</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Size</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Giá</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Tồn kho
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((variant) => (
                  <tr key={variant._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {variant.sku}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {variant.size || "Mặc định"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                      {typeof variant.price === "number"
                        ? variant.price.toLocaleString()
                        : "—"}
                      ₫
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          variant.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {variant.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
        <p>Tạo lúc: {new Date(product.createdAt).toLocaleString("vi-VN")}</p>
        {product.updatedAt && (
          <p>Cập nhật lúc: {new Date(product.updatedAt).toLocaleString("vi-VN")}</p>
        )}
      </div>
    </div>
  );
}
