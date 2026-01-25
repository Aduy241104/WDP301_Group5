import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSellerOrderDetailAPI,
  updateSellerOrderStatusAPI,
} from "../../services/sellerOrder.service";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

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
    setUpdating(true);
    await updateSellerOrderStatusAPI({
      id,
      status,
      trackingCode: status === "shipped" ? trackingCode : undefined,
    });

    setOrder((prev) => ({
      ...prev,
      orderStatus: status,
      statusHistory: [
        ...prev.statusHistory,
        { status, changedAt: new Date().toISOString() },
      ],
    }));
    setUpdating(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="space-y-6">
      <Link to="/seller/orders" className="text-blue-600 underline">
        ← Back to orders
      </Link>

      {/* INFO */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">
          Order {order.orderCode}
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><b>Status:</b> {order.orderStatus}</div>
          <div><b>Payment:</b> {order.paymentStatus}</div>
          <div><b>Total:</b> {order.totalAmount.toLocaleString()}đ</div>
          <div>
            <b>Created:</b>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold mb-3">Items</h3>

        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-2 border-b">
            <div>
              <div>{item.productName}</div>
              <div className="text-xs text-slate-500">
                {item.variantLabel} × {item.quantity}
              </div>
            </div>
            <div className="font-medium">
              {(item.price * item.quantity).toLocaleString()}đ
            </div>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="bg-white rounded-xl p-6 shadow space-y-3">
        <h3 className="font-semibold">Update Status</h3>

        {order.orderStatus === "created" && (
          <button
            onClick={() => updateStatus("confirmed")}
            disabled={updating}
            className="btn-primary"
          >
            Confirm Order
          </button>
        )}

        {order.orderStatus === "confirmed" && (
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Tracking code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
            <button
              onClick={() => updateStatus("shipped")}
              disabled={!trackingCode || updating}
              className="btn-warning"
            >
              Ship
            </button>
          </div>
        )}

        {order.orderStatus === "shipped" && (
          <button
            onClick={() => updateStatus("delivered")}
            disabled={updating}
            className="btn-success"
          >
            Mark as Delivered
          </button>
        )}
      </div>

      {/* HISTORY */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="font-semibold mb-3">Status History</h3>
        <ul className="text-sm space-y-1">
          {order.statusHistory.map((h, i) => (
            <li key={i}>
              • {h.status} – {new Date(h.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
