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

  // 🔥 pagination
  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [status, keyword, page]);

  // reset page khi filter
  useEffect(() => {
    setPage(1);
  }, [status, keyword]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;

      const data = await getSellerOrdersAPI(params);

      const list = data || [];

      // 🔥 pagination local
      const start = (page - 1) * 10;
      const end = page * 10;

      setOrders(list.slice(start, end));

      setPaging({
        page,
        totalPages: Math.ceil(list.length / 10),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Orders</h2>

        <Link
          to="/seller/orders/cancelled"
          className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
        >
          View Cancelled Orders
        </Link>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search order code..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="px-3 py-2 border rounded-lg w-64"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg"
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
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No orders found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold">
                    Order Code
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{order.orderCode}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES[order.orderStatus]
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {order.paymentStatus}
                    </td>

                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                      {order.totalAmount.toLocaleString()}đ
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/seller/orders/${order._id}`}
                        className="px-3 py-1.5 rounded-lg border border-indigo-300 hover:bg-indigo-50 text-sm font-medium hover:text-indigo-700"
                      >
                        View detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔥 PAGINATION */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {paging.page || 1} / {paging.totalPages || 1}
            </span>

            <button
              onClick={() =>
                setPage((p) => (p < (paging.totalPages || 1) ? p + 1 : p))
              }
              disabled={page >= (paging.totalPages || 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
