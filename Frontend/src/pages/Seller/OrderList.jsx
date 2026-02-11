import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerOrdersAPI } from "../../services/sellerOrder.service";

const STATUS_STYLES = {
  created: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [status, keyword, trackingCode]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrdersAPI({ status, keyword, trackingCode });
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <div className="flex items-center gap-3">
          <Link
            to="/seller/orders/cancelled"
            className="text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100"
          >
            View Cancelled Orders
          </Link>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by order code..."
          className="border px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search by tracking code..."
          className="border px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
        />

        <select
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="created">Created</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading && (
        <div className="text-slate-500">Loading orders...</div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-slate-500">
          No orders found
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow p-5 flex justify-between items-center hover:shadow-md transition"
            >
              {/* LEFT */}
              <div className="space-y-2">
                <div className="font-semibold text-lg">
                  {order.orderCode}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full font-medium ${
                      STATUS_STYLES[order.orderStatus]
                    }`}
                  >
                    {order.orderStatus}
                  </span>

                  <span className="text-slate-500">
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="text-sm text-slate-500">
                  Created:{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right space-y-2">
                <div className="text-lg font-bold">
                  {order.totalAmount.toLocaleString()}đ
                </div>

                <Link
                  to={`/seller/orders/${order._id}`}
                  className="inline-block text-sm text-indigo-600 hover:underline"
                >
                  View detail →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
