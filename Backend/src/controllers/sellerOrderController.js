import { Order } from "../models/Order.js";
import { OrderAddressSnapshot } from "../models/OrderAddressSnapshot.js";

export const getOrders = async (req, res) => {
  const { status, keyword, shopId } = req.query;

  const filter = {};

  if (status) filter.orderStatus = status;
  if (shopId) filter.shop = shopId;
  if (keyword) filter.orderCode = { $regex: keyword, $options: "i" };

  const orders = await Order.find(filter).sort({ createdAt: -1 });

  res.json(orders);
};

export const getOrderDetail = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("userId", "name email")
    .populate("shop", "name shopPickupAddresses")
    .populate("items.productId", "name");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};


export const confirmOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

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

  if (!order) return res.status(404).json({ message: "Order not found" });

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
  const { status, trackingCode, pickupAddressId } = req.body;

  const validStatus = ["confirmed", "shipped", "delivered"];
  if (!validStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id).populate("shop");
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (status !== "shipped") {
    order.orderStatus = status;
    order.statusHistory.push({ status });

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();
    return res.json(order);
  }

  if (status === "shipped") {
    if (!pickupAddressId) {
      return res.status(400).json({
        message: "Pickup address is required when shipping",
      });
    }

    if (!trackingCode) {
      return res.status(400).json({
        message: "Tracking code is required when shipping",
      });
    }

    if (order.orderStatus !== "confirmed") {
      return res.status(400).json({
        message: "Order must be confirmed before shipping",
      });
    }

    const pickupAddress = order.shop.shopPickupAddresses.find(
      (addr) =>
        addr._id.toString() === pickupAddressId && addr.isDeleted === false,
    );

    if (!pickupAddress) {
      return res.status(400).json({ message: "Invalid pickup address" });
    }

    await OrderAddressSnapshot.create({
      orderId: order._id,
      type: "pickup",
      contact: {
        name: order.shop.name,
        phone: order.shop.phone || "N/A", // nếu có
      },
      address: {
        province: pickupAddress.province,
        district: pickupAddress.district,
        ward: pickupAddress.ward,
        streetAddress: pickupAddress.streetAddress,
        fullAddress: pickupAddress.fullAddress,
      },
    });

    order.trackingCode = trackingCode;
    order.orderStatus = "shipped";
    order.statusHistory.push({ status: "shipped" });

    await order.save();
    return res.json(order);
  }
};


export const getPickupAddresses = async (req, res) => {
  const shop = await Shop.findOne({
    ownerId: req.user.id,
    isDeleted: false,
  });

  if (!shop) {
    return res.status(404).json({ message: "Shop not found" });
  }

  res.json(
    shop.shopPickupAddresses.filter((a) => !a.isDeleted)
  );
};

