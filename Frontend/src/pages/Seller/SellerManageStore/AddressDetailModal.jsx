export default function AddressDetailModal({ open, loading, error, data, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="font-semibold">Pickup address detail</div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          {loading && (
            <div className="text-slate-500 text-sm">Đang tải chi tiết...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">ID</span>
                <span className="font-mono text-slate-800">{data._id}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Province</span>
                <span className="font-medium">{data.province}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">District</span>
                <span className="font-medium">{data.district}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Ward</span>
                <span className="font-medium">{data.ward}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Street address</span>
                <span className="font-medium break-words">{data.streetAddress}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Full address</span>
                <span className="font-medium break-words">{data.fullAddress}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Default</span>
                <span className="font-medium">{data.isDefault ? "Yes" : "No"}</span>
              </div>
              {data.createdAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Created at</span>
                  <span className="font-medium">
                    {new Date(data.createdAt).toLocaleString()}
                  </span>
                </div>
              )}
              {data.updatedAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Updated at</span>
                  <span className="font-medium">
                    {new Date(data.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

