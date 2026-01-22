import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerOrdersAPI } from "../../services/sellerOrder.service";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getSellerOrdersAPI({
          status,
          keyword,
        });
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, keyword]);

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Order List</h2>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search order code..."
          className="border px-3 py-1 rounded w-64"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="border px-3 py-1 rounded"
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
      {orders.length === 0 && <p className="text-slate-500">No orders found</p>}

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded p-4 flex justify-between items-center"
          >
            {/* LEFT */}
            <div className="space-y-1">
              <div>
                <b>Order:</b> {order.orderCode}
              </div>

              <div>
                <b>Status:</b>{" "}
                <span
                  className={`font-medium ${
                    order.orderStatus === "created"
                      ? "text-blue-600"
                      : order.orderStatus === "confirmed"
                        ? "text-indigo-600"
                        : order.orderStatus === "shipped"
                          ? "text-orange-600"
                          : order.orderStatus === "delivered"
                            ? "text-green-600"
                            : "text-red-600"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div>
                <b>Payment:</b> {order.paymentStatus}
              </div>

              <div>
                <b>Created:</b> {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            {/* RIGHT */}
            <div className="text-right space-y-2">
              <div className="font-semibold">
                {order.totalAmount.toLocaleString()}đ
              </div>

              <Link
                to={`/seller/orders/${order._id}`}
                className="inline-block text-sm text-blue-600 underline"
              >
                View detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
