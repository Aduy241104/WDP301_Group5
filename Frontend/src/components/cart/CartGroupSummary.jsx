import React, { useMemo } from "react";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function CartGroupSummary({ summary, items = [], selectedIds }) {
    if (!summary) return null;

    // ✅ tính tổng tiền các item được chọn trong shop này
    const totalPrice = useMemo(() => {
        return items.reduce((sum, it) => {
            if (!selectedIds?.has(it.variantId)) return sum;
            return sum + Number(it.quantity || 0) * Number(it.variant?.price || 0);
        }, 0);
    }, [items, selectedIds]);

    return (
        <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1">
                    { summary.totalLines } dòng
                </span>
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1">
                    Tổng SL: { summary.totalQty }
                </span>
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1">
                    Còn hàng: { summary.inStockLines }
                </span>
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1">
                    Hết hàng: { summary.outOfStockLines }
                </span>

                {/* ✅ Tổng tiền theo item đã chọn */ }
                <span className="rounded-full bg-slate-900 text-white px-3 py-1 font-semibold">
                    Tạm tính: { formatVND(totalPrice) }
                </span>
            </div>
        </div>
    );
}
