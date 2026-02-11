const AddressList = ({ addresses, onEdit, onDelete }) => {
    console.log("AddressList received:", addresses);
    if (!addresses || addresses.length === 0) {
        return <p>Không có địa chỉ</p>;
    }
    return (
        <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-md min-h-[220px]">
            <div className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Danh sách địa chỉ</h2>

                {addresses.length === 0 ? (
                    <div className="flex items-center justify-center h-[140px] text-sm text-slate-400">
                        Chưa có địa chỉ nào
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map((addr) => (
                            <div
                                key={addr._id}
                                className="flex items-start justify-between gap-4 
                                   rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <div className="flex-1 min-w-0 space-y-1">
                                    {/* NAME + PHONE */}
                                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
                                        <span>{addr.fullName}</span>
                                        <span className="text-slate-400">|</span>
                                        <span className="text-slate-600">{addr.phone}</span>
                                    </div>

                                    {/* STREET */}
                                    <p className="text-sm text-slate-700">
                                        {addr.streetAddress}
                                    </p>

                                    {/* FULL ADDRESS */}
                                    <p className="text-sm text-slate-500">
                                        {addr.ward}, {addr.district}, {addr.province}
                                    </p>

                                    {/* DEFAULT TAG */}
                                    {addr.isDefault && (
                                        <span className="inline-block rounded border border-red-500 px-2 py-0.5 text-xs text-red-500">
                                            Mặc định
                                        </span>
                                    )}
                                </div>

                                {/* RIGHT – action */}
                                <div className="shrink-0 flex items-center gap-3">
                                    <button
                                        onClick={() => onEdit(addr)}
                                        className="text-sm font-medium text-sky-700 hover:underline"
                                    >
                                        Chỉnh sửa
                                    </button>

                                    {!addr.isDefault && (
                                        <button
                                            onClick={() => onDelete(addr._id)}
                                            className="text-sm font-medium text-red-500 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddressList;
