export default function AddressFormModal({
  open,
  editingId,
  form,
  submitting,
  error,
  onClose,
  onSubmit,
  onFormChange,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="font-semibold">
            {editingId ? "Edit pickup address" : "Add pickup address"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Province</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.province}
                onChange={(e) => onFormChange({ province: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">District</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.district}
                onChange={(e) => onFormChange({ district: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Ward</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.ward}
                onChange={(e) => onFormChange({ ward: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Street address</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.streetAddress}
                onChange={(e) => onFormChange({ streetAddress: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Full address</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.fullAddress}
              onChange={(e) => onFormChange({ fullAddress: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => onFormChange({ isDefault: e.target.checked })}
            />
            Set as default
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

