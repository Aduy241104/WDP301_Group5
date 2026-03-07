import { useState } from "react";
import { cancelOrderAPI } from "../../../../services/orderCustomerServices";

export default function CancelOrderButton({ orderId, onSuccess }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCancel = async () => {
        try {
            setLoading(true);
            setError("");

            await cancelOrderAPI(orderId);

            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(
                err?.response?.data?.message || "Hủy đơn thất bại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Cancel Button */ }
            <button
                onClick={ () => setOpen(true) }
                className="rounded-lg border border-red-500 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
                Hủy đơn
            </button>

            {/* Dialog */ }
            { open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-800">
                            Xác nhận hủy đơn
                        </h3>

                        <p className="mt-2 text-sm text-slate-600">
                            Bạn có chắc chắn muốn hủy đơn này không?
                            Hành động này không thể hoàn tác.
                        </p>

                        { error && (
                            <p className="mt-3 text-sm text-red-600">
                                { error }
                            </p>
                        ) }

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={ () => setOpen(false) }
                                disabled={ loading }
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                            >
                                Đóng
                            </button>

                            <button
                                onClick={ handleCancel }
                                disabled={ loading }
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                                { loading ? "Đang hủy..." : "Xác nhận hủy" }
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </>
    );
}