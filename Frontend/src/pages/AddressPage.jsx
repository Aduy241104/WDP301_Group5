import { useEffect, useState } from "react";
import {
    getAddressListAPI,
    addAddressAPI,
    updateAddressAPI,
} from "../services/addressServices";

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
        <div className="flex justify-center">
            <div className="relative flex w-full max-w-6xl gap-12 items-start">
                { message && (
                    <div className="absolute top-4 right-4 z-10 rounded-xl bg-green-100 px-4 py-2 text-sm text-green-700 shadow">
                        { message }
                    </div>
                ) }

                {/* LEFT – Address List (LỚN) */ }
                <div className="basis-[68%] grow-0 shrink-0 min-w-[640px]">
                    <AddressList
                        addresses={ addresses }
                        onEdit={ setEditingAddress }
                    />
                </div>

                {/* RIGHT – Address Form (NHỎ) */ }
                <div className="basis-[32%] grow-0 shrink-0 max-w-[420px]">
                    <AddressForm
                        editingAddress={ editingAddress }
                        onSubmit={ handleSubmit }
                    />
                </div>
            </div>
        </div>
    );
};

export default AddressPage;
