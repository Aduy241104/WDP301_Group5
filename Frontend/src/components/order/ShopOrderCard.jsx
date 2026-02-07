import React from "react";
import OrderItemRow from "./OrderItemRow";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function ShopOrderCard({
    group,
    voucher,
    onSelectVoucher,
    onRemoveVoucher,
}) {
    return (
        <div className="rounded-xl bg-white border border-slate-200">
            {/* SHOP HEADER */ }
            <div className="flex items-center gap-3 p-4 border-b">
                <img
                    src={ group.shop.avatar }
                    alt={ group.shop.name }
                    className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="font-semibold">{ group.shop.name }</div>
                <div className="ml-auto font-semibold">{ formatVND(group.subTotal) }</div>
            </div>

            {/* ITEMS */ }
            <div>
                { group.validItems.map((item) => (
                    <OrderItemRow key={ item.variantId } item={ item } />
                )) }
            </div>

            {/* VOUCHER */ }
            <div className="flex items-center justify-between p-4 bg-slate-50">
                <div>
                    <div className="text-sm font-medium">Voucher của shop</div>
                    <div className="text-xs text-slate-500">
                        { voucher ? `Đã chọn: ${voucher}` : "Chưa chọn voucher" }
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    { voucher && (
                        <button
                            onClick={ onRemoveVoucher }
                            className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-red-50 text-red-600 border-red-200"
                            type="button"
                        >
                            Gỡ
                        </button>
                    ) }

                    { !voucher && <button
                        onClick={ onSelectVoucher }
                        className="px-3 py-1.5 text-sm border rounded-lg bg-white hover:bg-slate-100"
                        type="button"
                    >
                        Voucher
                    </button> }
                </div>
            </div>
        </div>
    );
}
