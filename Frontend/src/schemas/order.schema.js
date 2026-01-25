export const ORDER_STATUS = {
  CREATED: "created",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const OrderItemModel = {
  productId: "",
  productName: "",
  variantId: "",
  variantLabel: "",
  price: 0,
  quantity: 0,
};

export const OrderModel = {
  _id: "",
  orderCode: "",
  userId: {
    _id: "",
    name: "",
    email: "",
  },
  shop: {
    _id: "",
    name: "",
  },
  items: [],
  subtotal: 0,
  shippingFee: 0,
  totalAmount: 0,
  paymentMethod: "",
  paymentStatus: "unpaid",
  orderStatus: ORDER_STATUS.CREATED,
  trackingCode: "",
  createdAt: "",
};
