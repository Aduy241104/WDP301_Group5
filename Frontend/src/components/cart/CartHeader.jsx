import { ShoppingCart, RefreshCcw } from "lucide-react";

export default function CartHeader({ onRefresh }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* LEFT */ }
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                        Giỏ hàng
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Xem và chỉnh số lượng trước khi thanh toán
                    </p>
                </div>
            </div>

            {/* RIGHT */ }
            <button
                onClick={ onRefresh }
                className={ [
                    "inline-flex items-center gap-2",
                    "self-start sm:self-auto",
                    "rounded-xl border border-slate-200 bg-white",
                    "px-4 py-2 text-sm font-medium text-slate-700",
                    "hover:bg-slate-50",
                ].join(" ") }
            >
                <RefreshCcw className="h-4 w-4" />
                Làm mới
            </button>
        </div>
    );
}
