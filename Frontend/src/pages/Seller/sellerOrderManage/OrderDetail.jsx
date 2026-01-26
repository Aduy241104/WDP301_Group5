import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSellerOrderDetailAPI,
  updateSellerOrderStatusAPI,
} from "../../../services/sellerOrder.service";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [pickupAddressId, setPickupAddressId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await getSellerOrderDetailAPI(id);
      setOrder(data);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setError("");

    if (status === "shipped") {
      if (!pickupAddressId)
        return setError("Vui lòng chọn địa chỉ lấy hàng");
      if (!trackingCode)
        return setError("Vui lòng nhập tracking code");
    }

    try {
      setUpdating(true);
      await updateSellerOrderStatusAPI({
        id,
        status,
        trackingCode: status === "shipped" ? trackingCode : undefined,
        pickupAddressId: status === "shipped" ? pickupAddressId : undefined,
      });

      setOrder((prev) => ({
        ...prev,
        orderStatus: status,
        trackingCode:
          status === "shipped" ? trackingCode : prev.trackingCode,
        statusHistory: [
          ...prev.statusHistory,
          { status, changedAt: new Date().toISOString() },
        ],
      }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <section className="space-y-6">
      <Link
        to="/seller/orders"
        className="text-sm font-semibold text-indigo-600 hover:underline"
      >
        ← Back to orders
      </Link>

      {/* INFO */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          Order {order.orderCode}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
          <div><b>Status:</b> {order.orderStatus}</div>
          <div><b>Payment:</b> {order.paymentStatus}</div>
          <div><b>Total:</b> {order.totalAmount.toLocaleString()}đ</div>
          <div><b>Created:</b> {new Date(order.createdAt).toLocaleString()}</div>

          {order.trackingCode && (
            <div className="sm:col-span-2">
              <b>Tracking:</b> {order.trackingCode}
            </div>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
        <h3 className="font-extrabold text-slate-900 mb-3">Items</h3>

        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between py-3 border-b border-slate-100 last:border-0"
          >
            <div>
              <div className="font-semibold text-slate-900">
                {item.productName}
              </div>
              <div className="text-xs text-slate-500">
                {item.variantLabel} × {item.quantity}
              </div>
            </div>

            <div className="font-bold text-slate-900">
              {(item.price * item.quantity).toLocaleString()}đ
            </div>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900">Update Status</h3>

        {error && <div className="text-sm text-red-600">{error}</div>}

        {order.orderStatus === "created" && (
          <button
            onClick={() => updateStatus("confirmed")}
            disabled={updating}
            className="w-full px-5 py-3 rounded-2xl bg-[rgb(119,226,242)] font-bold hover:opacity-90"
          >
            Confirm Order
          </button>
        )}

        {order.orderStatus === "confirmed" && (
          <>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              value={pickupAddressId}
              onChange={(e) => setPickupAddressId(e.target.value)}
            >
              <option value="">-- Chọn địa chỉ lấy hàng --</option>
              {order.shop?.shopPickupAddresses
                ?.filter((a) => !a.isDeleted)
                .map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.fullAddress}
                  </option>
                ))}
            </select>

            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Tracking code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />

            <button
              onClick={() => updateStatus("shipped")}
              disabled={updating}
              className="w-full px-5 py-3 rounded-2xl bg-orange-50 text-orange-700 font-bold hover:opacity-90"
            >
              Ship Order
            </button>
          </>
        )}

        {order.orderStatus === "shipped" && (
          <button
            onClick={() => updateStatus("delivered")}
            disabled={updating}
            className="w-full px-5 py-3 rounded-2xl bg-green-50 text-green-700 font-bold hover:opacity-90"
          >
            Mark as Delivered
          </button>
        )}
      </div>

      {/* HISTORY */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6">
        <h3 className="font-extrabold text-slate-900 mb-3">
          Status History
        </h3>
        <ul className="text-sm space-y-1 text-slate-600">
          {order.statusHistory.map((h, i) => (
            <li key={i}>
              • {h.status} – {new Date(h.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
