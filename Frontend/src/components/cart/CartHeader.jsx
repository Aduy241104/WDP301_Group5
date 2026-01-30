import React from "react";

export default function CartHeader({ onRefresh }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>
                <p className="text-slate-500 text-sm mt-1">Xem và chỉnh số lượng trước khi thanh toán.</p>
            </div>

            <button
                onClick={ onRefresh }
                className="self-start sm:self-auto rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                Làm mới
            </button>
        </div>
    );
}
