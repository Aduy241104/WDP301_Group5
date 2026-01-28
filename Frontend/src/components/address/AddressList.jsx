const AddressList = ({ addresses, onEdit }) => {
    console.log("AddressList received:", addresses);
    if (!addresses || addresses.length === 0) {
        return <p>Không có địa chỉ</p>;
    }
    return (
        <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-md min-h-[220px]">
            <div className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Danh sách địa chỉ</h2>

                { addresses.length === 0 ? (
                    <div className="flex items-center justify-center h-[140px] text-sm text-slate-400">
                        Chưa có địa chỉ nào
                    </div>
                ) : (
                    <div className="space-y-3">
                        { addresses.map((addr) => (
                            <div
                                key={ addr._id }
                                className="flex items-start justify-between gap-4 
                                   rounded-xl border border-slate-200 bg-white p-4"
                            >
                                {/* LEFT – address */ }
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-800 break-words">
                                        { addr.fullAddress || "—" }
                                    </p>

                                    { addr.isDefault && (
                                        <span className="mt-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                            Địa chỉ mặc định
                                        </span>
                                    ) }
                                </div>

                                {/* RIGHT – action */ }
                                <button
                                    onClick={ () => onEdit(addr) }
                                    className="shrink-0 text-sm font-medium text-sky-700 hover:underline"
                                >
                                    Chỉnh sửa
                                </button>
                            </div>
                        )) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default AddressList;
