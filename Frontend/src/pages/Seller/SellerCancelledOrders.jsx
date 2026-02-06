import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerOrdersAPI } from "../../services/sellerOrder.service";

const STATUS_STYLES = {
  created: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SellerCancelledOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
     
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrdersAPI({ status: "cancelled" });
      // support different response shapes
      const list = data?.data || data?.orders || data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Cancelled Orders</h2>
        <Link to="/seller/orders" className="text-sm text-indigo-600 hover:underline">
          Back to Orders
        </Link>
      </div>

      {loading && <div className="text-slate-500">Loading orders...</div>}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-slate-500">No cancelled orders found</div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const id = order._id || order.id;
            const code = order.orderCode || order.trackingCode || id;
            const status = order.orderStatus || order.status || "unknown";
            const payment = order.paymentStatus || "";
            const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "-";
            const amount = order.totalAmount || order.amount || 0;

            return (
              <div
                key={id}
                className="bg-white rounded-xl shadow p-5 flex justify-between items-center hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="font-semibold text-lg">{code}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700"}`}>
                      {status}
                    </span>
                    <span className="text-slate-500">{payment}</span>
                  </div>
                  <div className="text-sm text-slate-500">Created: {created}</div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-lg font-bold">{Number(amount).toLocaleString()}đ</div>
                  <Link to={`/seller/orders/${id}`} className="inline-block text-sm text-indigo-600 hover:underline">
                    View detail →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
