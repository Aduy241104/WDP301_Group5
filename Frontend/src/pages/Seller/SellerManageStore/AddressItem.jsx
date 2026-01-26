export default function AddressItem({
  address,
  submitting,
  onViewDetail,
  onEdit,
  onSetDefault,
  onDelete,
}) {
  return (
    <div className="p-5 flex flex-wrap gap-4 items-start justify-between">
      <div className="min-w-[260px]">
        <div className="flex items-center gap-2">
          <div className="font-semibold">
            {address.province} • {address.district} • {address.ward}
          </div>
          {address.isDefault && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              DEFAULT
            </span>
          )}
        </div>
        <div className="text-sm text-slate-600 mt-1">{address.streetAddress}</div>
        <div className="text-sm text-slate-500 mt-1">{address.fullAddress}</div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onViewDetail(address._id)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm"
        >
          View detail
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => onEdit(address)}
          className="px-3 py-2 rounded-lg border hover:bg-slate-50 transition text-sm"
        >
          Edit
        </button>

        <button
          type="button"
          disabled={submitting || address.isDefault}
          onClick={() => onSetDefault(address)}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition text-sm"
        >
          Set default
        </button>

        <button
          type="button"
          disabled={submitting || address.isDefault}
          onClick={() => onDelete(address)}
          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition text-sm"
          title={address.isDefault ? "Cannot delete default pickup address" : "Delete"}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

