import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSellerOrderDetailAPI,
  updateSellerOrderStatusAPI,
  cancelSellerOrderAPI,
  getOrderPickupAddressesAPI,
} from "../../services/sellerOrder.service";

/* ================= UI HELPERS ================= */

const StatusBadge = ({ status }) => {
  const map = {
    created: "bg-gray-100 text-gray-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const Section = ({ title, desc, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
    <div>
      <h3 className="font-semibold text-lg">{title}</h3>
      {desc && <p className="text-sm text-slate-500 mt-1">{desc}</p>}
    </div>
    {children}
  </div>
);

/* ================= COMPONENT ================= */

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([]);
  const [selectedPickupId, setSelectedPickupId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [orderData, addressesData] = await Promise.all([
        getSellerOrderDetailAPI(id),
        getOrderPickupAddressesAPI(id),
      ]);
      
      setOrder(orderData);
      
      const addresses = addressesData.pickupAddresses || [];
      setPickupAddresses(addresses);
      
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) setSelectedPickupId(defaultAddr._id);
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      if (status === "cancelled") {
        await cancelSellerOrderAPI(id);
      } else {
        await updateSellerOrderStatusAPI({
          id,
          status,
          trackingCode: status === "shipped" ? trackingCode : undefined,
          pickupAddressId: status === "shipped" ? selectedPickupId : undefined,
        });
      }

      setOrder((prev) => ({
        ...prev,
        orderStatus: status,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/seller/orders" className="text-blue-600 underline">
        ← Back to orders
      </Link>

      {/* ORDER INFO */}
      <Section title={`Order ${order.orderCode}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Status</div>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div>
            <div className="text-slate-500">Payment</div>
            <div className="font-medium">{order.paymentStatus}</div>
          </div>
          <div>
            <div className="text-slate-500">Total</div>
            <div className="font-semibold text-lg">
              {order.totalAmount.toLocaleString()}đ
            </div>
          </div>
          <div>
            <div className="text-slate-500">Created</div>
            <div>{new Date(order.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </Section>

      {/* ITEMS */}
      <Section title="Items">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-3 border-b last:border-b-0"
          >
            <div>
              <div className="font-medium">{item.productName}</div>
              <div className="text-xs text-slate-500">
                {item.variantLabel} × {item.quantity}
              </div>
            </div>
            <div className="font-semibold">
              {(item.price * item.quantity).toLocaleString()}đ
            </div>
          </div>
        ))}
      </Section>

      {/* CONFIRM / CANCEL */}
      {order.orderStatus === "created" && (
        <Section
          title="Order Actions"
          desc="Select pickup address, then confirm the order to proceed with shipping."
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Address</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedPickupId}
                onChange={(e) => setSelectedPickupId(e.target.value)}
              >
                <option value="">-- Select pickup address --</option>
                {pickupAddresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.fullAddress} {addr.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => updateStatus("confirmed")}
                disabled={!selectedPickupId || updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 transition"
              >
                ✅ Confirm Order
              </button>

              <button
                onClick={() => updateStatus("cancelled")}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50 transition"
              >
                ❌ Cancel Order
              </button>
            </div>
          </div>
        </Section>
      )}

      {/* SHIPPING */}
      {order.orderStatus === "confirmed" && (
        <Section
          title="Shipping Information"
          desc="Select pickup address and enter the tracking code provided by the shipping carrier."
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pickup Address</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedPickupId}
                onChange={(e) => setSelectedPickupId(e.target.value)}
              >
                <option value="">-- Select pickup address --</option>
                {pickupAddresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.fullAddress} {addr.isDefault ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tracking Code</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Tracking code (e.g. GHN123456)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
            </div>

            <button
              onClick={() => updateStatus("shipped")}
              disabled={!trackingCode || !selectedPickupId || updating}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 disabled:opacity-50 transition"
            >
              🚚 Mark as Shipped
            </button>
          </div>
        </Section>
      )}

      {/* DELIVERY */}
      {order.orderStatus === "shipped" && (
        <Section
          title="Delivery Confirmation"
          desc="Confirm that the order has been successfully delivered to the customer."
        >
          <button
            onClick={() => updateStatus("delivered")}
            disabled={updating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50 transition"
          >
            📦 Mark as Delivered
          </button>
        </Section>
      )}

      {/* STATUS HISTORY */}
      <Section title="Status History">
        <ul className="space-y-2 text-sm">
          {order.statusHistory.map((h, i) => (
            <li key={i} className="flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-3">
                <StatusBadge status={h.status} />
                <span className="text-sm text-slate-500">
                  {new Date(h.changedAt).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
