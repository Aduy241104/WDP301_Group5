export default function CategoryProductsList({
  selectedCategory,
  products,
  loading,
  pagination,
  onOpenAddProducts,
  onPreviousPage,
  onNextPage,
  onDeleteProduct,
  deletingProductId,
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Sản phẩm thuộc category: {selectedCategory.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            ID: {selectedCategory._id}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddProducts}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          + Thêm sản phẩm vào category
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          Đang tải sản phẩm của category...
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          Chưa có sản phẩm nào trong category này.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Ảnh
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Tên
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Brand
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">
                    Giá
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <span
                          className={`text-xs text-gray-500 ${
                            p.images?.[0] ? "hidden" : ""
                          }`}
                        >
                          —
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.brandId?.name || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {typeof p.defaultPrice === "number"
                        ? p.defaultPrice.toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p)}
                        disabled={deletingProductId === p._id}
                        className="px-3 py-1 rounded text-xs border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingProductId === p._id ? "Đang xoá..." : "Xoá"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div>
              Trang {pagination.page} / {pagination.totalPages}{" "}
              {pagination.total ? `(${pagination.total} sản phẩm)` : ""}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPreviousPage}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
