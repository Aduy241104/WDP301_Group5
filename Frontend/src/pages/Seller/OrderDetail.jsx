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
    const fetchOrder = async () => {
      try {
        const data = await getSellerOrderDetailAPI(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status) => {
  try {
    setUpdating(true);

    await updateSellerOrderStatusAPI({
      id,
      status,
    });

    setOrder((prev) => ({
      ...prev,
      orderStatus: status,
      statusHistory: [
        ...prev.statusHistory,
        {
          status,
          changedAt: new Date().toISOString(),
        },
      ],
    }));
  } catch (err) {
    console.error(err);
  } finally {
    setUpdating(false);
  }
};


  if (loading) return <p className="p-6">Loading order...</p>;
  if (!order) return <p className="p-6">Order not found</p>;

  return (
    <div className="p-6 space-y-6">
      <Link to="/seller/orders" className="text-blue-600 underline">
        ← Back to orders
      </Link>

      {/* ORDER INFO */}
      <div className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-3">
          Order {order.orderCode}
        </h2>

        <div><b>Status:</b> {order.orderStatus}</div>
        <div><b>Payment:</b> {order.paymentStatus}</div>
        <div><b>Total:</b> {order.totalAmount.toLocaleString()}đ</div>
        <div>
          <b>Created:</b>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </div>
      </div>

      {/* ITEMS */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-3">Items</h3>

        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between border-b py-2"
          >
            <div>
              <div>{item.productName}</div>
              <div className="text-sm text-slate-500">
                {item.variantLabel} × {item.quantity}
              </div>
            </div>
            <div>
              {(item.price * item.quantity).toLocaleString()}đ
            </div>
          </div>
        ))}
      </div>

      {/* STATUS ACTION */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-3">Update Status</h3>

        <div className="flex gap-2 items-center">
          {order.orderStatus === "created" && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus("confirmed")}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Confirm
            </button>
          )}

          {order.orderStatus === "confirmed" && (
            <>
              <input
                type="text"
                placeholder="Tracking code"
                className="border px-3 py-2 rounded"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("shipped")}
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                Ship
              </button>
            </>
          )}

          {order.orderStatus === "shipped" && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus("delivered")}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Deliver
            </button>
          )}
        </div>
      </div>

      {/* STATUS HISTORY */}
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-3">Status History</h3>

        <ul className="text-sm space-y-1">
          {order.statusHistory.map((h, idx) => (
            <li key={idx}>
              • {h.status} –{" "}
              {new Date(h.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
