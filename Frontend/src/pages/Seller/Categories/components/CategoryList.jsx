export default function CategoryList({
  categories,
  loading,
  selectedCategoryId,
  editingId,
  editingName,
  onSelectCategory,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onEditingNameChange,
  onCancelEdit,
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
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
            {categories.map((c) => {
              const isEditing = editingId === c._id;
              const isSelected = selectedCategoryId === c._id;
              return (
                <div
                  key={c._id}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg border ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div>
                    {isEditing ? (
                      <input
                        value={editingName}
                        onChange={(e) => onEditingNameChange(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      />
                    ) : (
                      <div className="font-medium text-gray-800">{c.name}</div>
                    )}
                    <div className="text-xs text-gray-500">ID: {c._id}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {c.createdAt && (
                      <span className="text-gray-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectCategory(c)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-white"
                    >
                      Xem sản phẩm
                    </button>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSaveEdit(c)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEdit}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-white"
                        >
                          Huỷ
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartEdit(c)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-white"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(c)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Xoá
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
