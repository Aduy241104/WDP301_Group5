import React, { useMemo, useState } from "react";
import QuantityControl from "./QuantityControl";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function CartItemRow({
    item,
    selected,
    onToggleSelect,
    onUpdateQty,
    onRemove,
}) {
    const [saving, setSaving] = useState(false);

    const img = item?.product?.images?.[0];
    const name = item?.product?.name;
    const size = item?.variant?.size;
    const price = Number(item?.variant?.price || 0);
    const qty = Number(item?.quantity || 1);
    const stock = Number(item?.stock || 0);
    const inStock = Boolean(item?.inStock);

    const lineTotal = useMemo(() => price * qty, [price, qty]);

    const handleChangeQty = async (nextQty) => {
        if (stock > 0) nextQty = Math.min(nextQty, stock);
        nextQty = Math.max(1, nextQty);

        try {
            setSaving(true);
            await onUpdateQty(item.variantId, nextQty);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-5 flex gap-4 items-start">
            {/* CHECKBOX */ }
            <div className="pt-1">
                <input
                    type="checkbox"
                    checked={ selected }
                    disabled={ !inStock }
                    onChange={ () => onToggleSelect(item.variantId) }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
            </div>

            {/* IMAGE */ }
            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                { img ? (
                    <img
                        src={ img }
                        alt={ name }
                        className="h-full w-full object-cover"
                    />
                ) : null }
            </div>

            {/* CONTENT */ }
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                            { name }
                        </div>

                        <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                            <span className="rounded-full border border-slate-200 px-2 py-0.5 bg-white">
                                SKU: { item?.variant?.sku }
                            </span>
                            { size ? (
                                <span className="rounded-full border border-slate-200 px-2 py-0.5 bg-white">
                                    Size: { size }
                                </span>
                            ) : null }
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs">
                            <span
                                className={ [
                                    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 border",
                                    inStock
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-rose-50 border-rose-200 text-rose-700",
                                ].join(" ") }
                            >
                                <span
                                    className={ [
                                        "h-2 w-2 rounded-full",
                                        inStock ? "bg-emerald-500" : "bg-rose-500",
                                    ].join(" ") }
                                />
                                { inStock ? `Còn hàng (${stock})` : "Hết hàng" }
                            </span>

                            { saving ? (
                                <span className="text-slate-400">Đang lưu...</span>
                            ) : null }
                        </div>
                    </div>

                    <button
                        onClick={ onRemove }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                        Xóa
                    </button>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                        { formatVND(price) }
                    </div>

                    <QuantityControl
                        value={ qty }
                        stock={ stock }
                        disabled={ saving }
                        onChange={ handleChangeQty }
                    />

                    <div className="text-sm font-bold text-slate-900">
                        { formatVND(lineTotal) }
                    </div>
                </div>
            </div>
        </div>
    );
}
