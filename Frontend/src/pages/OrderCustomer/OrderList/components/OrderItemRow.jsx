import React from "react";
import { formatVND } from "../../../../utils/money";

export default function OrderItemRow({ item, fallbackImg }) {
    const img = item?.product?.images?.[0] || fallbackImg;

    const variantText = [
        item?.variant?.sku ? `SKU: ${item.variant.sku}` : null,
        item?.variant?.size ? `Size ${item.variant.size}` : null,
        item?.variantLabel ? item.variantLabel : null,
        `SL: ${item?.quantity || 0}`,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="flex gap-4 p-4">
            <img
                src={ img }
                alt={ item?.productName || item?.product?.name || "Product" }
                className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
            />

            <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-slate-900">
                    { item?.productName || item?.product?.name }
                </div>
                <div className="mt-1 text-sm text-slate-500">{ variantText }</div>
                <div className="mt-2 text-sm text-slate-600">
                    Đơn giá: <span className="font-medium">{ formatVND(item?.price || 0) }</span>
                </div>
            </div>

            <div className="flex flex-col items-end justify-between">
                <div className="text-right text-sm text-slate-500">x{ item?.quantity || 0 }</div>
                <div className="text-right font-semibold text-slate-900">
                    { formatVND((item?.price || 0) * (item?.quantity || 0)) }
                </div>
            </div>
        </div>
    );
}
