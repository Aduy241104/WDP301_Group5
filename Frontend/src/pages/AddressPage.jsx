import { useEffect, useState } from "react";
import {
    getAddressListAPI,
    addAddressAPI,
    updateAddressAPI,
    deleteAddressAPI,
} from "../services/addressServices";

import AddressList from "../components/address/AddressList";
import AddressForm from "../components/address/AddressForm";

const AddressPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [message, setMessage] = useState("");
    const [deleteId, setDeleteId] = useState(null);


    const loadAddresses = async () => {
        try {
            const data = await getAddressListAPI();

            console.log("AddressPage - API result:", data);
            console.log("Is array:", Array.isArray(data));

            setAddresses(data);
        } catch (err) {
            console.error("Load address failed", err);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    const handleSubmit = async (formData) => {
        if (editingAddress) {
            await updateAddressAPI(editingAddress._id, formData);
        } else {
            await addAddressAPI(formData);
        }

        setEditingAddress(null);
        loadAddresses();
        setMessage("Lưu địa chỉ thành công");
        setTimeout(() => setMessage(""), 3000);
    };

    const handleDelete = (id) => {
        setDeleteId(id); // 👈 chỉ mở popup
    };


    const confirmDelete = async () => {
        try {
            await deleteAddressAPI(deleteId);
            await loadAddresses();
            setMessage("Xóa địa chỉ thành công");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error("Delete address failed", err);
        } finally {
            setDeleteId(null); // đóng popup
        }
    };


    return (
        <div className="flex justify-center">
            <div className="relative flex w-full max-w-6xl gap-12 items-start">
                {message && (
                    <div className="absolute top-4 right-4 z-10 rounded-xl bg-green-100 px-4 py-2 text-sm text-green-700 shadow">
                        {message}
                    </div>
                )}

                {/* LEFT – Address List (LỚN) */}
                <div className="basis-[68%] grow-0 shrink-0 min-w-[640px]">
                    <AddressList
                        addresses={addresses}
                        onEdit={setEditingAddress}
                        onDelete={handleDelete}
                    />
                </div>

                {/* RIGHT – Address Form (NHỎ) */}
                <div className="basis-[32%] grow-0 shrink-0 max-w-[420px]">
                    <AddressForm
                        editingAddress={editingAddress}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Xác nhận xóa
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                            Bạn có chắc muốn xóa địa chỉ này không?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressPage;
