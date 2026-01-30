import React, { useMemo, useState } from "react";
import QuantityControl from "./QuantityControl";
import { Trash2 } from "lucide-react";

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
        <div className="flex gap-4 p-4 sm:p-5 items-start bg-white rounded-lg">
            <div className="pt-1">
                <input
                    type="checkbox"
                    checked={ selected }
                    disabled={ !inStock }
                    onChange={ () => onToggleSelect(item.variantId) }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 disabled:opacity-50"
                />
            </div>

            <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                { img ? (
                    <img src={ img } alt={ name } className="h-full w-full object-cover" />
                ) : null }
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                            { name }
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50">
                                SKU: { item?.variant?.sku }
                            </span>

                            { size ? (
                                <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50">
                                    Size: { size }
                                </span>
                            ) : null }
                        </div>

                        <div className="mt-2 flex items-center gap-3 text-xs">
                            <span
                                className={ [
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
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

                    {/* REMOVE */ }
                    <button
                        onClick={ onRemove }
                        className={ [
                            "shrink-0 inline-flex items-center gap-1.5",
                            "px-3 py-1.5 rounded-lg border",
                            "border-rose-200 bg-white",
                            "text-xs font-medium text-rose-600",
                            "hover:bg-rose-50",
                            "focus:outline-none focus:ring-2 focus:ring-rose-500/20",
                        ].join(" ") }
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                        <div className="text-sm font-semibold text-slate-900">
                            { formatVND(price) }
                        </div>

                        <div className="mt-2">
                            <QuantityControl
                                value={ qty }
                                stock={ stock }
                                disabled={ saving }
                                onChange={ handleChangeQty }
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-0.5">
                            Tạm tính
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                            { formatVND(lineTotal) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
