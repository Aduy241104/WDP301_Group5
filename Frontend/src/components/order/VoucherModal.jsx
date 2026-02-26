import React, { useEffect, useMemo, useState } from "react";
import { applyShopVoucher } from "../../services/orderCustomerServices";
import { getVoucherByShopAPI } from "../../services/voucherServices";

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

    const [voucherList, setVoucherList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);

    useEffect(() => {
        if (!open) return;
        setCode(defaultCode || "");
        setSelectedVoucherId(null);
        setErr("");
        setLoading(false);
        setResult(null);
    }, [open, defaultCode]);

    const loadVoucherByShop = async (sid) => {
        if (!sid) return;
        try {
            setLoadingList(true);
            const response = await getVoucherByShopAPI(sid);

            // ✅ response.vouchers là array
            const list = Array.isArray(response?.vouchers) ? response.vouchers : [];
            setVoucherList(list);
        } catch (error) {
            console.log(error);
            setVoucherList([]);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        if (!shopId) return;
        loadVoucherByShop(shopId);
    }, [open, shopId]);

    const canSubmit = useMemo(() => {
        return open && !!shopId && code.trim().length > 0 && !loading;
    }, [open, shopId, code, loading]);

    const meetsMin = (v) => subTotal >= Number(v?.minOrderValue || 0);

    const discountLabel = (v) => {
        if (!v) return "";
        if (v.discountType === "fixed") return `Giảm ${formatVND(v.discountValue)}`;
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
        setResult(null);
    };

    const handleApply = async () => {
        const voucherCode = code.trim();
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
                newSubTotal: data.total,
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            {/* overlay */ }
            <div
                className="absolute inset-0 z-0 bg-black/40"
                onClick={ handleClose }
            />

            {/* modal */ }
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* Header */ }
                <div className="flex items-center gap-2 border-b bg-slate-50 p-4">
                    <div className="min-w-0">
                        <div className="truncate font-semibold">Áp voucher cho shop</div>
                        <div className="truncate text-xs text-slate-500">{ shopName || shopId }</div>
                    </div>
                    <button
                        className="ml-auto rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-200/60"
                        onClick={ handleClose }
                        aria-label="close"
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */ }
                <div className="space-y-3 p-4">
                    {/* Voucher list */ }
                    <div className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">Voucher của shop</div>
                            { loadingList && <div className="text-xs text-slate-500">Đang tải...</div> }
                        </div>

                        { !loadingList && voucherList.length === 0 ? (
                            <div className="mt-2 text-sm text-slate-500">Shop chưa có voucher khả dụng.</div>
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
                                                name="shop-voucher"
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

                    {/* Code input */ }
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-slate-600">Mã voucher</div>

                        <div className="flex gap-2">
                            <input
                                value={ code }
                                onChange={ (e) => {
                                    setCode(e.target.value);
                                    setSelectedVoucherId(null);
                                    setResult(null);
                                    setErr("");
                                } }
                                placeholder="VD: UNI20"
                                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                                disabled={ loading || !!selectedVoucherId }
                            />
                            <button
                                className="rounded-xl bg-sky-500 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-60"
                                onClick={ handleApply }
                                disabled={ !canSubmit }
                                type="button"
                            >
                                { loading ? "..." : "Áp" }
                            </button>
                        </div>

                        { err && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                { err }
                            </div>
                        ) }
                    </div>
                </div>

                {/* Footer */ }
                <div className="flex justify-end gap-2 border-t bg-white p-4">
                    <button
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                        onClick={ handleClose }
                        disabled={ loading }
                        type="button"
                    >
                        Đóng
                    </button>
                    <button
                        className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                        onClick={ handleApply }
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