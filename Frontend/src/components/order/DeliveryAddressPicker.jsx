import { useEffect, useMemo, useState } from "react";
import { getAddressListAPI } from "../../services/addressServices";

function mapToDeliveryAddress(a) {
    return {
        contact: { name: a.fullName, phone: a.phone },
        address: {
            province: a.province,
            district: a.district,
            ward: a.ward,
            streetAddress: a.streetAddress,
            fullAddress: a.fullAddress,
        },
    };
}

export default function DeliveryAddressPicker({
    deliveryAddress,    
    setDeliveryAddress,
    onAddAddress,       
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [list, setList] = useState([]);

    const [open, setOpen] = useState(false);          
    const [tempId, setTempId] = useState(null);       

    const defaultItem = useMemo(() => {
        if (!list.length) return null;
        return list.find((x) => x.isDefault) || list[0];
    }, [list]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const res = await getAddressListAPI();
                const data = Array.isArray(res) ? res : res?.data?.data || [];
                if (!mounted) return;

                setList(data);

                if (!deliveryAddress && data.length) {
                    const picked = data.find((x) => x.isDefault) || data[0];
                    setDeliveryAddress(mapToDeliveryAddress(picked));
                }
            } catch (e) {
                if (!mounted) return;
                setError(e?.response?.data?.message || e?.message || "Load địa chỉ thất bại");
                setList([]);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [deliveryAddress, setDeliveryAddress]);

    useEffect(() => {
        if (!open) return;
        const picked = defaultItem;
        if (picked?._id) setTempId(picked._id);
    }, [open, defaultItem]);

    const showing = deliveryAddress || (defaultItem ? mapToDeliveryAddress(defaultItem) : null);

    const handleOpen = () => {
        setOpen(true);
        // set tempId ngay khi mở (nếu có list)
        const picked = defaultItem;
        if (picked?._id) setTempId(picked._id);
    };

    const handleConfirm = () => {
        const picked = list.find((x) => x._id === tempId);
        if (picked) setDeliveryAddress(mapToDeliveryAddress(picked));
        setOpen(false);
    };

    // Loading state
    if (loading) {
        return <div className="p-3 text-sm text-slate-600">Đang tải địa chỉ…</div>;
    }

    // Empty state
    if (!list.length) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold">Chưa có địa chỉ giao hàng</div>
                { error ? <div className="mt-2 text-xs text-red-600">{ error }</div> : null }
                <button
                    type="button"
                    onClick={ onAddAddress }
                    className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                    + Thêm địa chỉ
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">Địa chỉ giao hàng</div>

                    <button
                        type="button"
                        onClick={ handleOpen }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                        Thay đổi
                    </button>
                </div>

                { error ? <div className="mb-2 text-xs text-red-600">{ error }</div> : null }

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="font-medium text-slate-900">
                        { showing?.contact?.name || "—" }{ " " }
                        <span className="text-sm text-slate-500">· { showing?.contact?.phone || "—" }</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                        { showing?.address?.fullAddress || "—" }
                    </div>
                </div>
            </div>

            { open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <div>
                                <div className="text-base font-semibold">Chọn địa chỉ giao hàng</div>
                            </div>
                            <button
                                type="button"
                                onClick={ () => setOpen(false) }
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-auto p-4">
                            <div className="space-y-2">
                                { list.map((a) => {
                                    const checked = tempId === a._id;
                                    return (
                                        <button
                                            key={ a._id }
                                            type="button"
                                            onClick={ () => setTempId(a._id) }
                                            className={ [
                                                "w-full rounded-xl border p-3 text-left",
                                                checked ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:bg-slate-50",
                                            ].join(" ") }
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="font-medium">
                                                    { a.fullName } <span className="text-sm text-slate-500">· { a.phone }</span>
                                                </div>
                                                { a.isDefault ? (
                                                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                                                        Default
                                                    </span>
                                                ) : null }
                                            </div>
                                            <div className="mt-1 text-sm text-slate-700">{ a.fullAddress }</div>
                                        </button>
                                    );
                                }) }
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-200 p-4">
                            <button
                                type="button"
                                onClick={ onAddAddress }
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                            >
                                + Thêm địa chỉ
                            </button>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={ () => setOpen(false) }
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={ handleConfirm }
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) }
        </>
    );
}
