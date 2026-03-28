import { useMemo } from "react";
import OrderItemRow from "./OrderItemRow";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatVND } from "../../../../utils/money";
import { useNavigate } from "react-router-dom";
import CancelOrderButton from "./CancelOrderButton";

export default function OrderCard({
  order,
  isReviewed, // 🔥 thêm
  onRebuy,
  onReview,
  onReturn,
  onReload,
}) {
  const firstImg = useMemo(() => {
    const first = order?.items?.[0]?.product?.images?.[0];
    return first || "https://via.placeholder.com/80x80?text=No+Image";
  }, [order]);

  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
        <div className="flex items-center gap-4">
          <img
            src={order?.shop?.avatar || "https://via.placeholder.com/40"}
            alt={order?.shop?.name || "Shop"}
            className="h-10 w-10 rounded-full border border-neutral-300 object-cover"
          />

          <div className="text-base font-semibold text-black">
            {order?.shop?.name || "Shop"}
          </div>
        </div>

        <OrderStatusBadge orderStatus={order?.orderStatus} />
      </div>

      {/* ITEMS */}
      <div className="divide-y divide-neutral-100">
        {(order?.items || []).map((it) => (
          <OrderItemRow
            key={String(it.variantId)}
            item={it}
            fallbackImg={firstImg}
          />
        ))}
      </div>

      <div className="px-5 py-4">
        {/* TOTAL */}
        <div className="flex justify-end">
          <div className="text-sm text-slate-600">
            Thành tiền:&nbsp;
            <span className="text-xl font-semibold text-slate-900">
              {formatVND(order?.totalAmount || 0)}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => navigate(`/order-detail/${order._id}`)}
            className="rounded-lg 
                                    bg-[rgb(119,226,242)] 
                                    px-5 py-2 
                                    text-sm font-medium 
                                    text-white
                                    shadow-sm
                                    transition 
                                    hover:brightness-95 
                                    active:scale-95"
          >
            Chi tiết đơn hàng
          </button>

          {/* Mua lại */}
          {order?.orderStatus === "delivered" && (
            <button
              onClick={onRebuy}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Mua lại
            </button>
          )}

          {/* Đánh giá */}
          {order?.orderStatus === "delivered" && (
            <button
              onClick={onReview}
              disabled={isReviewed}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition
      ${
        isReviewed
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
      }
    `}
            >
              {isReviewed ? "Đã đánh giá" : "Đánh giá"}
            </button>
          )}
          {/* Hủy đơn */}
          {order?.orderStatus === "created" && (
            <CancelOrderButton orderId={order._id} onSuccess={onReload} />
          )}

          {/* Trả hàng */}
          {order?.orderStatus === "delivered" && (
            <button
              onClick={() => navigate(`/report/${order._id}`)}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
            >
              Khiếu nại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
