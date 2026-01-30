import React from "react";

export default function CartEmpty() {
    return (
        <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Giỏ hàng trống</div>
            <div className="mt-2 text-sm text-slate-500">
                Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm.
            </div>
            <button
                onClick={ () => (window.location.href = "/") }
                className="mt-5 rounded-2xl bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
                Về trang chủ
            </button>
        </div>
    );
}
