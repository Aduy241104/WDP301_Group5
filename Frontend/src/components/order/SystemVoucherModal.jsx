// components/order/SystemVoucherModal.jsx
import React, { useEffect, useState } from "react";
import { applySystemVoucher } from "../../services/orderCustomerServices";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function SystemVoucherModal({
    open,
    onClose,
    defaultCode = "",
    grandSubTotal = 0,
    shippingFeeTotal = 0,
    onApplied,
}) {
    const [code, setCode] = useState(defaultCode);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!open) return;
        setCode(defaultCode || "");
        setErr("");
        setLoading(false);
    }, [open, defaultCode]);

    if (!open) return null;

    const beforeTotal = grandSubTotal + shippingFeeTotal;
    const canSubmit = !loading && code.trim();

    const close = () => !loading && onClose?.();

    const apply = async () => {
        const voucherCode = code.trim().toUpperCase();
        if (!voucherCode) return;

        try {
            setLoading(true);
            setErr("");

            const data = await applySystemVoucher({
                voucherCode,
                grandSubTotal,
                shippingFeeTotal,
            });

            if (!data?.voucher?.applied) throw new Error(data?.message || "Voucher chưa được áp dụng");

            onApplied?.({
                voucherCode: data.voucher.code,
                shipDiscount: data.shipDiscount || 0,
                grandTotal: data.grandTotal,
                raw: data,
            });

            close();
        } catch (e) {
            setErr(e?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={ close } />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header */ }
                    <div className="p-4 border-b bg-slate-50 flex items-center">
                        <div className="min-w-0">
                            <div className="font-semibold truncate">Áp voucher toàn đơn</div>
                            <div className="text-xs text-slate-500 truncate">Giảm trên tổng đơn (system)</div>
                        </div>
                        <button
                            className="ml-auto px-2 py-1 rounded-lg hover:bg-slate-200/60 text-slate-600"
                            onClick={ close }
                            aria-label="close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */ }
                    <div className="p-4 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-sm">
                            <Row label="Tiền hàng" value={ formatVND(grandSubTotal) } />
                            <Row label="Phí vận chuyển" value={ formatVND(shippingFeeTotal) } />
                            <div className="pt-2 border-t flex items-center justify-between">
                                <span className="text-slate-700 font-medium">Tổng trước giảm</span>
                                <span className="font-bold text-slate-900">{ formatVND(beforeTotal) }</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Mã voucher</label>
                            <input
                                value={ code }
                                onChange={ (e) => setCode(e.target.value) }
                                placeholder="VD: FREESHIP30K"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                                disabled={ loading }
                            />
                            <div className="mt-1 text-[11px] text-slate-500">
                                Voucher system thường giảm phí vận chuyển / giảm toàn đơn.
                            </div>
                        </div>

                        { err && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                { err }
                            </div>
                        ) }
                    </div>

                    {/* Footer */ }
                    <div className="p-4 border-t bg-white flex items-center justify-end gap-2">
                        <button
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-60"
                            onClick={ close }
                            disabled={ loading }
                        >
                            Đóng
                        </button>
                        <button
                            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-60"
                            onClick={ apply }
                            disabled={ !canSubmit }
                        >
                            { loading ? "Đang áp dụng..." : "Áp dụng" }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-600">{ label }</span>
            <span className="font-semibold text-slate-900">{ value }</span>
        </div>
    );
}
