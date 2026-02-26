import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
                {/* ICON */ }
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>

                {/* TITLE */ }
                <h1 className="mt-4 text-2xl font-bold text-slate-900">
                    Đặt hàng thành công 🎉
                </h1>

                {/* DESCRIPTION */ }
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Đơn hàng của bạn đã được ghi nhận.
                    <br />
                    Shop sẽ sớm xác nhận và tiến hành giao hàng.
                </p>

                {/* ACTIONS */ }
                <div className="mt-8 space-y-3">
                    <button
                        onClick={ () => navigate("/orders", { replace: true }) }
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    >
                        Xem đơn hàng của tôi
                    </button>

                    <Link
                        to="/"
                        className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
}
