import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerOrdersAPI } from "../../../services/sellerOrder.service";

const STATUS_STYLES = {
  created: "bg-blue-50 text-blue-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  shipped: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [status, keyword]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrdersAPI({ status, keyword });
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <h2 className="text-2xl font-extrabold text-slate-900">
        Orders
      </h2>

      {/* FILTER */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by order code..."
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-200"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
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
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 text-slate-500">
          No orders found
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl bg-white border border-slate-100 shadow-sm p-6 flex justify-between items-center hover:shadow-md transition"
            >
              {/* LEFT */}
              <div className="space-y-2">
                <div className="font-bold text-lg text-slate-900">
                  {order.orderCode}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.orderStatus]}`}
                  >
                    {order.orderStatus}
                  </span>
                  <span className="text-slate-500">
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right space-y-2">
                <div className="text-lg font-extrabold text-slate-900">
                  {order.totalAmount.toLocaleString()}đ
                </div>

                <Link
                  to={`/seller/orders/${order._id}`}
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  View detail →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
