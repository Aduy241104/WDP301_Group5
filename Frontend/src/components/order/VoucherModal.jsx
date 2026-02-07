import React, { useEffect, useMemo, useState } from "react";
import { applyShopVoucher } from "../../services/orderCustomerServices";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function VoucherModal({
    open,
    onClose,
    shopId,
    shopName,
    subTotal,
    defaultCode = "",
    onApplied,
}) {
    const [code, setCode] = useState(defaultCode || "");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!open) return;
        setCode(defaultCode || "");
        setErr("");
        setLoading(false);
        setResult(null);
    }, [open, defaultCode]);

    const canSubmit = useMemo(() => {
        return open && !!shopId && code.trim().length > 0 && !loading;
    }, [open, shopId, code, loading]);

    if (!open) return null;

    const handleApply = async () => {
        const voucherCode = code.trim().toUpperCase();
        if (!voucherCode) return;

        try {
            setLoading(true);
            setErr("");
            setResult(null);

            const data = await applyShopVoucher({ shopId, voucherCode, subTotal });

            if (!data?.voucher?.applied) {
                throw new Error(data?.message || "Voucher chưa được áp dụng");
            }

            setResult(data);

            onApplied?.({
                shopId: data.shopId,
                voucherCode: data.voucher.code,
                discount: data.discount,
                newSubTotal: data.total, // total = subTotal sau giảm của shop
                raw: data,
            });

            onClose?.();
        } catch (e) {
            setErr(e?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={ handleClose } />

            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
                    {/* header */ }
                    <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                        <div className="min-w-0">
                            <div className="font-semibold truncate">Áp voucher cho shop</div>
                            <div className="text-xs text-slate-500 truncate">{ shopName || shopId }</div>
                        </div>

                        <button
                            className="ml-auto px-2 py-1 rounded-lg hover:bg-slate-200/60 text-slate-600"
                            onClick={ handleClose }
                            aria-label="close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* body */ }
                    <div className="p-4 space-y-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Tạm tính</span>
                                <span className="font-semibold text-slate-900">{ formatVND(subTotal) }</span>
                            </div>

                            { result && (
                                <>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Giảm</span>
                                        <span className="font-semibold text-emerald-600">
                                            -{ formatVND(result.discount) }
                                        </span>
                                    </div>

                                    <div className="mt-2 pt-2 border-t flex items-center justify-between text-sm">
                                        <span className="text-slate-700 font-medium">Tổng sau giảm</span>
                                        <span className="font-bold text-slate-900">{ formatVND(result.total) }</span>
                                    </div>

                                    <div className="mt-2 text-[11px] text-slate-500">
                                        Đã áp dụng: <span className="font-semibold">{ result.voucher?.code }</span>
                                    </div>
                                </>
                            ) }
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Mã voucher
                            </label>

                            <div className="flex items-center gap-2">
                                <input
                                    value={ code }
                                    onChange={ (e) => setCode(e.target.value) }
                                    placeholder="VD: UNI20"
                                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                                    disabled={ loading }
                                />

                                <button
                                    className="shrink-0 px-3 py-2 rounded-xl bg-sky-500 text-white text-sm hover:bg-sky-600 disabled:opacity-60"
                                    onClick={ handleApply }
                                    disabled={ !canSubmit }
                                    type="button"
                                >
                                    { loading ? "..." : "Áp" }
                                </button>
                            </div>

                            <div className="mt-1 text-[11px] text-slate-500">
                                Nhập mã và bấm “Áp”. Hệ thống sẽ tính giảm theo shop.
                            </div>
                        </div>

                        { err && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                { err }
                            </div>
                        ) }
                    </div>

                    {/* footer */ }
                    <div className="p-4 border-t bg-white flex items-center justify-end gap-2">
                        <button
                            className="px-3 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50 disabled:opacity-60"
                            onClick={ handleClose }
                            disabled={ loading }
                            type="button"
                        >
                            Đóng
                        </button>

                        <button
                            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800 disabled:opacity-60"
                            onClick={ handleApply }
                            disabled={ !canSubmit }
                            type="button"
                        >
                            { loading ? "Đang áp dụng..." : "Áp dụng" }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
