// components/order/InvalidItemsBox.jsx
import React from "react";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function InvalidItemsBox({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="font-semibold text-amber-800 mb-2">
                Sản phẩm không thể đặt
            </div>

            <div className="space-y-3">
                { items.map((it, idx) => (
                    <div key={ idx } className="flex gap-3 text-sm">
                        <img
                            src={ it.product.images[0] }
                            alt={ it.product.name }
                            className="w-14 h-14 rounded border object-cover"
                        />
                        <div className="flex-1">
                            <div className="font-semibold">{ it.product.name }</div>
                            <div className="text-slate-600">
                                Lý do: { it.reason } · Tồn kho: { it.stock }
                            </div>
                        </div>
                        <div className="font-semibold">
                            { formatVND(it.variantId.price) }
                        </div>
                    </div>
                )) }
            </div>
        </div>
    );
}
