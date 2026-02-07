// components/order/OrderItemRow.jsx
import React from "react";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function OrderItemRow({ item }) {
    return (
        <div className="flex gap-4 p-4 border-b last:border-b-0">
            <img
                src={ item.product.images[0] }
                alt={ item.product.name }
                className="w-20 h-20 rounded-lg border object-cover"
            />

            <div className="flex-1">
                <div className="font-semibold">{ item.product.name }</div>
                <div className="text-sm text-slate-500">
                    SKU: { item.variant.sku }
                    { item.variant.size && ` · Size ${item.variant.size}` }
                    { " · " }SL: { item.qty }
                </div>
            </div>

            <div className="font-semibold">
                { formatVND(item.lineTotal) }
            </div>
        </div>
    );
}
