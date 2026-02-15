import { useMemo } from "react";
import OrderItemRow from "./OrderItemRow";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatVND } from "../../../../utils/money";

export default function OrderCard({
    order,
    onRebuy,
    onReview,
    onReturn,
}) {
    const firstImg = useMemo(() => {
        const first = order?.items?.[0]?.product?.images?.[0];
        return first || "https://via.placeholder.com/80x80?text=No+Image";
    }, [order]);

    return (
        <div className="overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">

            {/* HEADER */ }
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">

                <div className="flex items-center gap-4">
                    <img
                        src={ order?.shop?.avatar || "https://via.placeholder.com/40" }
                        alt={ order?.shop?.name || "Shop" }
                        className="h-10 w-10 rounded-full border border-neutral-300 object-cover"
                    />

                    <div className="text-base font-semibold text-black">
                        { order?.shop?.name || "Shop" }
                    </div>
                </div>

                <OrderStatusBadge orderStatus={ order?.orderStatus } />
            </div>


            {/* ITEMS */ }
            <div className="divide-y divide-neutral-100">
                { (order?.items || []).map((it) => (
                    <OrderItemRow
                        key={ String(it.variantId) }
                        item={ it }
                        fallbackImg={ firstImg }
                    />
                )) }
            </div>

            <div className="px-5 py-4">
                {/* TOTAL */ }
                <div className="flex justify-end">
                    <div className="text-sm text-slate-600">
                        Thành tiền:&nbsp;
                        <span className="text-xl font-semibold text-slate-900">
                            { formatVND(order?.totalAmount || 0) }
                        </span>
                    </div>
                </div>

                {/* ACTION BUTTONS */ }
                <div className="mt-4 flex flex-wrap justify-end gap-3">

                    {/* Mua lại */ }
                    { order?.orderStatus === "delivered" && (
                        <button
                            onClick={ onRebuy }
                            className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                            Mua lại
                        </button>
                    ) }

                    {/* Đánh giá */ }
                    { order?.orderStatus === "delivered" && (
                        <button
                            onClick={ onReview }
                            className="rounded-lg border border-slate-900 px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
                        >
                            Đánh giá
                        </button>
                    ) }

                    {/* Hủy đơn */ }
                    { order?.orderStatus === "created" && (
                        <button
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                        >
                            Hủy đơn
                        </button>
                    ) }

                    {/* Trả hàng */ }
                    { order?.orderStatus === "delivered" && (
                        <button
                            onClick={ onReturn }
                            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                        >
                            Yêu cầu trả hàng
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
}
