import { useEffect, useState } from "react";
import {
    getAddressListAPI,
    addAddressAPI,
    updateAddressAPI,
} from "../services/addressServices";

import AddressSidebar from "../components/address/AddressSidebar";
import AddressList from "../components/address/AddressList";
import AddressForm from "../components/address/AddressForm";

const AddressPage = () => {
    const [addresses, setAddresses] = useState([]);
    const [editingAddress, setEditingAddress] = useState(null);
    const [message, setMessage] = useState("");


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

    return (
        <div className="flex gap-12">
            <AddressSidebar />

            <div className="flex w-full max-w-6xl gap-12 relative">
                {message && (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-4 py-2 rounded">
                        {message}
                    </div>
                )}

                <AddressList
                    addresses={addresses}
                    onEdit={setEditingAddress}
                />

                <AddressForm
                    editingAddress={editingAddress}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
};

export default AddressPage;
