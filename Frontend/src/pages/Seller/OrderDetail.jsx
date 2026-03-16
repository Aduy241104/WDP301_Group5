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
      {status?.toUpperCase()}
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
    <div className="max-w-5xl mx-auto space-y-6">

      {/* BACK */}
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
            <div className="font-semibold text-lg text-indigo-600">
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
      <Section title="Order Items">

        <div className="space-y-4">

          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50"
            >

              <div className="flex items-center gap-4">

                {/* IMAGE */}
                <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
                  {item.productId?.images?.[0] ? (
                    <img
                      src={item.productId.images[0]}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* PRODUCT INFO */}
                <div>
                  <div className="font-semibold text-gray-800">
                    {item.productName}
                  </div>

                  {item.variantLabel && (
                    <div className="text-sm text-gray-500">
                      Variant: {item.variantLabel}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </div>
                </div>

              </div>

              {/* PRICE */}
              <div className="text-right">

                <div className="text-sm text-gray-500">
                  {item.price.toLocaleString()}đ
                </div>

                <div className="font-semibold text-lg text-indigo-600">
                  {(item.price * item.quantity).toLocaleString()}đ
                </div>

              </div>

            </div>
          ))}

        </div>

      </Section>

      {/* ORDER SUMMARY */}
      <Section title="Order Summary">

        <div className="space-y-2 text-sm">

          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{order.subtotal.toLocaleString()}đ</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Shipping Fee</span>
            <span>{order.shippingFee.toLocaleString()}đ</span>
          </div>

          {order.voucher && (
            <div className="flex justify-between text-green-600">
              <span>Voucher ({order.voucher.code})</span>
              <span>-{order.voucher.appliedDiscountAmount.toLocaleString()}đ</span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-indigo-600">
              {order.totalAmount.toLocaleString()}đ
            </span>
          </div>

        </div>

      </Section>

      {/* SHIPPING INFO */}
      <Section title="Shipping Information">

        <div className="grid grid-cols-2 gap-4 text-sm">

          <div>
            <div className="text-gray-500">Tracking Code</div>
            <div className="font-medium">
              {order.trackingCode || "Not shipped yet"}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Payment Method</div>
            <div className="font-medium">
              {order.paymentMethod || "N/A"}
            </div>
          </div>

        </div>

      </Section>

      {/* CONFIRM / CANCEL */}
      {order.orderStatus === "created" && (
        <Section title="Order Actions">

          <div className="space-y-3">

            <select
              className="w-full px-3 py-2 border rounded-lg"
              value={selectedPickupId}
              onChange={(e) => setSelectedPickupId(e.target.value)}
            >
              <option value="">Select pickup address</option>

              {pickupAddresses.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  {addr.fullAddress}
                </option>
              ))}
            </select>

            <div className="flex gap-3">

              <button
                onClick={() => updateStatus("confirmed")}
                disabled={!selectedPickupId || updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Confirm Order
              </button>

              <button
                onClick={() => updateStatus("cancelled")}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Order
              </button>

            </div>

          </div>

        </Section>
      )}

      {/* SHIPPING */}
      {order.orderStatus === "confirmed" && (
        <Section title="Shipping">

          <div className="space-y-3">

            <input
              placeholder="Tracking code"
              className="w-full px-3 py-2 border rounded-lg"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />

            <button
              onClick={() => updateStatus("shipped")}
              disabled={!trackingCode || updating}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Mark as Shipped
            </button>

          </div>

        </Section>
      )}

      {/* DELIVERY */}
      {order.orderStatus === "shipped" && (
        <Section title="Delivery Confirmation">

          <button
            onClick={() => updateStatus("delivered")}
            disabled={updating}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Mark as Delivered
          </button>

        </Section>
      )}

      {/* STATUS HISTORY */}
      <Section title="Status History">

        <ul className="space-y-2 text-sm">

          {order.statusHistory.map((h, i) => (
            <li key={i} className="flex justify-between">

              <StatusBadge status={h.status} />

              <span className="text-gray-500">
                {new Date(h.changedAt).toLocaleString()}
              </span>

            </li>
          ))}

        </ul>

      </Section>

    </div>
  );
}
