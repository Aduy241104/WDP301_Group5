// components/order/OrderTotalBox.jsx
import React from "react";

const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

export default function OrderTotalBox({ total, onSubmit }) {
    return (
        <div className="mt-8 rounded-xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between text-lg font-semibold">
                <span>Tổng thanh toán</span>
                <span className="text-emerald-600">
                    { formatVND(total) }
                </span>
            </div>

            <button
                onClick={ onSubmit }
                className="mt-4 w-full rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold py-3"
            >
                Đặt hàng
            </button>
        </div>
    );
}
