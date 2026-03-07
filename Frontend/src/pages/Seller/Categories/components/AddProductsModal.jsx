export default function AddProductsModal({
  selectedCategory,
  products,
  loading,
  pagination,
  keyword,
  selectedProductIds,
  submitting,
  onKeywordChange,
  onSearch,
  onToggleSelectProduct,
  onSelectAll,
  onPreviousPage,
  onNextPage,
  onAddProducts,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Thêm sản phẩm vào category
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Category: {selectedCategory.name} (ID: {selectedCategory._id})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Đóng
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-3">
          <input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            type="button"
            onClick={onSearch}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
          >
            Tìm
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Đang tải danh sách sản phẩm...
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Không còn sản phẩm nào để thêm vào category này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          products.length > 0 &&
                          products.every((p) => selectedProductIds.includes(p._id))
                        }
                        onChange={(e) => onSelectAll(e.target.checked)}
                      />
                    </th>
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
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const checked = selectedProductIds.includes(p._id);
                    return (
                      <tr
                        key={p._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleSelectProduct(p._id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div>
            Đã chọn {selectedProductIds.length} sản phẩm
            {pagination.total ? ` / ${pagination.total} sản phẩm khả dụng` : ""}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
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
            <button
              type="button"
              disabled={submitting || selectedProductIds.length === 0}
              onClick={onAddProducts}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? "Đang thêm..." : "Thêm vào category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
