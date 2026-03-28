// components/order/SystemVoucherModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { applySystemVoucher } from "../../services/orderCustomerServices";
import { getSystemVouchersAPI } from "../../services/voucherServices";

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
    const [code, setCode] = useState(defaultCode || "");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const [voucherList, setVoucherList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);

    useEffect(() => {
        if (!open) return;
        setCode(defaultCode || "");
        setSelectedVoucherId(null);
        setErr("");
        setLoading(false);
    }, [open, defaultCode]);

    const loadSystemVouchers = async () => {
        try {
            setLoadingList(true);
            const response = await getSystemVouchersAPI();
            const list = Array.isArray(response?.vouchers) ? response.vouchers : [];
            setVoucherList(list);

            // Tự động tick chọn nếu mã defaultCode đã được áp từ trước
            if (defaultCode) {
                const found = list.find(v => v.code === defaultCode);
                if (found) setSelectedVoucherId(found._id);
            }
        } catch (error) {
            console.log(error);
            setVoucherList([]);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        loadSystemVouchers();
    }, [open]);

    const beforeTotal = grandSubTotal + shippingFeeTotal;

    // Nút "Áp dụng" chỉ sáng khi đang mở, đã chọn 1 code và không loading
    const canSubmit = useMemo(() => {
        return open && code.trim().length > 0 && !loading;
    }, [open, code, loading]);

    const meetsMin = (v) => grandSubTotal >= Number(v?.minOrderValue || 0);

    const discountLabel = (v) => {
        if (!v) return "";
        if (v.discountType === "fixed" || v.discountType === "ship") return `Giảm ${formatVND(v.discountValue)}`;
        if (v.discountType === "percent") return `Giảm ${v.discountValue}%`;
        return "Giảm giá";
    };

    const formatDate = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("vi-VN");
    };

    const handlePickVoucher = (v) => {
        setSelectedVoucherId(v._id);
        setCode(v.code || "");
        setErr("");
    };

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

            if (!data?.voucher?.applied) {
                throw new Error(data?.message || "Voucher chưa được áp dụng");
            }

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

    const close = () => {
        if (loading) return;
        onClose?.();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            {/* overlay */ }
            <div className="absolute inset-0 z-0 bg-black/40" onClick={ close } />

            {/* modal */ }
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* Header */ }
                <div className="flex items-center gap-2 border-b bg-slate-50 p-4">
                    <div className="min-w-0">
                        <div className="truncate font-semibold">Áp voucher toàn đơn</div>
                        <div className="truncate text-xs text-slate-500">Giảm trên tổng đơn (system)</div>
                    </div>
                    <button
                        className="ml-auto rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-200/60"
                        onClick={ close }
                        aria-label="close"
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */ }
                <div className="space-y-3 p-4">
                    {/* Summary Box */ }
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
                        <Row label="Tiền hàng" value={ formatVND(grandSubTotal) } />
                        <Row label="Phí vận chuyển" value={ formatVND(shippingFeeTotal) } />
                        <div className="flex items-center justify-between border-t pt-2">
                            <span className="font-medium text-slate-700">Tổng trước giảm</span>
                            <span className="font-bold text-slate-900">{ formatVND(beforeTotal) }</span>
                        </div>
                    </div>

                    {/* Voucher list */ }
                    <div className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Voucher của sàn</div>
                            { loadingList && <div className="text-xs text-slate-500">Đang tải...</div> }
                        </div>

                        { !loadingList && voucherList.length === 0 ? (
                            <div className="mt-2 text-sm text-slate-500">Hệ thống chưa có voucher khả dụng.</div>
                        ) : (
                            <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                                { voucherList.map((v) => {
                                    const ok = meetsMin(v);
                                    const checked = selectedVoucherId === v._id;

                                    return (
                                        <label
                                            key={ v._id }
                                            className={ [
                                                "flex cursor-pointer gap-3 rounded-xl border p-3 transition",
                                                checked ? "border-sky-300 bg-sky-50" : "border-slate-200 hover:bg-slate-50",
                                                !ok ? "opacity-60" : "",
                                            ].join(" ") }
                                        >
                                            <input
                                                type="radio"
                                                name="system-voucher"
                                                className="mt-1"
                                                checked={ checked }
                                                onChange={ () => handlePickVoucher(v) }
                                                disabled={ !ok || loading }
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="truncate font-semibold">
                                                            { v.code } • { discountLabel(v) }
                                                        </div>
                                                        <div className="line-clamp-2 text-xs text-slate-600">
                                                            { v.description || v.name }
                                                        </div>
                                                    </div>

                                                    <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                                                        HSD { formatDate(v.endAt) }
                                                    </span>
                                                </div>

                                                { !!v.minOrderValue && (
                                                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                                                        <span className="rounded-lg bg-slate-100 px-2 py-1">
                                                            Đơn tối thiểu: { formatVND(v.minOrderValue) }
                                                        </span>
                                                        { !ok && (
                                                            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
                                                                Chưa đủ điều kiện
                                                            </span>
                                                        ) }
                                                    </div>
                                                ) }
                                            </div>
                                        </label>
                                    );
                                }) }
                            </div>
                        ) }
                    </div>

                    {/* Hiển thị lỗi nếu có */ }
                    { err && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            { err }
                        </div>
                    ) }
                </div>

                {/* Footer */ }
                <div className="flex justify-end gap-2 border-t bg-white p-4">
                    <button
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                        onClick={ close }
                        disabled={ loading }
                        type="button"
                    >
                        Đóng
                    </button>
                    <button
                        className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                        onClick={ apply }
                        disabled={ !canSubmit }
                        type="button"
                    >
                        { loading ? "Đang áp dụng..." : "Áp dụng" }
                    </button>
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