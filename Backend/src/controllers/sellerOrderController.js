import {Order} from "../models/Order.js";
import {} from "../models/Shop.js";


export const getOrders = async (req, res) => {
  const { status, keyword, shopId } = req.query;

  const filter = {};

  if (status) filter.orderStatus = status;
  if (shopId) filter.shop = shopId;
  if (keyword)
    filter.orderCode = { $regex: keyword, $options: "i" };

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 });

  res.json(orders);
};

export const getOrderDetail = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("userId", "name email")
    .populate("shop", "name")
    .populate("items.productId", "name");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};


export const confirmOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return res.status(404).json({ message: "Order not found" });

  if (order.orderStatus !== "created") {
    return res.status(400).json({ message: "Order cannot be confirmed" });
  }

  order.orderStatus = "confirmed";
  order.statusHistory.push({ status: "confirmed" });

  await order.save();

  res.json(order);
};

export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return res.status(404).json({ message: "Order not found" });

  if (["shipped", "delivered"].includes(order.orderStatus)) {
    return res
      .status(400)
      .json({ message: "Cannot cancel shipped/delivered order" });
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: "cancelled" });

  await order.save();

  res.json(order);
};


export const updateOrderStatus = async (req, res) => {
  const { status, trackingCode } = req.body;

  const validStatus = ["confirmed", "shipped", "delivered"];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).json({ message: "Order not found" });

  order.orderStatus = status;
  order.statusHistory.push({ status });

  if (status === "shipped" && trackingCode) {
    order.trackingCode = trackingCode;
  }

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();

  res.json(order);
};
