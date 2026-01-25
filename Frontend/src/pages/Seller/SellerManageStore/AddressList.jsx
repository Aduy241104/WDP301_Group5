import AddressItem from "./AddressItem";

export default function AddressList({
  addresses,
  loading,
  submitting,
  defaultId,
  onViewDetail,
  onEdit,
  onSetDefault,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="font-semibold">Pickup addresses</div>
        {defaultId && (
          <div className="text-xs text-slate-500">
            Default: <span className="font-medium">{defaultId}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-6 text-slate-500">Loading...</div>
      ) : addresses.length === 0 ? (
        <div className="p-6 text-slate-500">Chưa có pickup address nào.</div>
      ) : (
        <div className="divide-y">
          {addresses.map((addr) => (
            <AddressItem
              key={addr._id}
              address={addr}
              submitting={submitting}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onSetDefault={onSetDefault}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

