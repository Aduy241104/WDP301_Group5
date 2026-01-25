const AddressList = ({ addresses, onEdit }) => {
    console.log("AddressList received:", addresses);
    if (!addresses || addresses.length === 0) {
        return <p>Không có địa chỉ</p>;
    }
    return (
        <div className="bg-white p-6 rounded-xl shadow w-2/3 space-y-4">
            <h2 className="text-lg font-semibold">Danh sách địa chỉ</h2>

            {addresses.map((addr) => (
                <div
                    key={addr._id}
                    className="border p-4 rounded space-y-1"
                >
                    <p>{addr.fullAddress}</p>

                    {addr.isDefault && (
                        <span className="text-sm text-green-600">
                            Địa chỉ mặc định
                        </span>
                    )}

                    <button
                        onClick={() => onEdit(addr)}
                        className="block text-sm text-indigo-600 mt-2"
                    >
                        Chỉnh sửa
                    </button>
                </div>
            ))}
        </div>
    );
};

export default AddressList;
