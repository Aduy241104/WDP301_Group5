export default function CategoryForm({
  name,
  onNameChange,
  onSubmit,
  submitting,
  error,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Categories</h2>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 items-stretch md:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category name
          </label>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
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
    </div>
  );
}
