import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Shop } from "../models/Shop.js";
import { OrderAddressSnapshot } from "../models/OrderAddressSnapshot.js";
import { Inventory } from "../models/Inventory.js";

export const getOrders = async (req, res) => {
  const { status, keyword, trackingCode } = req.query;

  const filter = {};

  if (status) filter.orderStatus = status;
  if (keyword) filter.orderCode = { $regex: keyword, $options: "i" };
  if (trackingCode)
    filter.trackingCode = { $regex: trackingCode, $options: "i" };

  const orders = await Order.find(filter).sort({ createdAt: -1 });

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Cannot cancel shipped or delivered order" });
    }

    if (order.orderStatus === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Order already cancelled" });
    }

    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { variantId: item.variantId },
        {
          $inc: { stock: item.quantity },
          $set: { updatedAt: new Date() },
        },
        { session },
      );
    }

    // ✅ update order status
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: "cancelled", createdAt: new Date() });

    await order.save({ session });

    await session.commitTransaction();
    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ cancelOrder error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingCode, pickupAddressId } = req.body;

    // 1️⃣ validate status
    const validStatus = ["confirmed", "shipped", "delivered"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 2️⃣ find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3️⃣ ensure statusHistory exists
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }

    order.orderStatus = status;
    order.statusHistory.push({ status, createdAt: new Date() });

    // 4️⃣ shipped logic
    if (status === "shipped") {
      if (trackingCode) {
        order.trackingCode = trackingCode;
      }

      // validate pickupAddressId and create snapshot
      if (pickupAddressId && mongoose.Types.ObjectId.isValid(pickupAddressId)) {
        const shop = await Shop.findById(order.shop);
        if (!shop) {
          return res.status(404).json({ message: "Shop not found" });
        }

        const shopAddr = shop.shopPickupAddresses.find(
          (addr) => addr._id.toString() === pickupAddressId && !addr.isDeleted,
        );

        if (!shopAddr) {
          return res.status(400).json({ message: "Pickup address not found" });
        }

        const snap = new OrderAddressSnapshot({
          orderId: order._id,
          type: "pickup",
          contact: {
            name: shop.name,
            phone: "",
          },
          address: {
            province: shopAddr.province,
            district: shopAddr.district,
            ward: shopAddr.ward,
            streetAddress: shopAddr.streetAddress,
            fullAddress: shopAddr.fullAddress,
          },
        });

        await snap.save({ validateBeforeSave: false });

        order.pickupAddressSnapshotId = snap._id;
      }
    }

    // 5️⃣ delivered logic
    if (status === "delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod" && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.paidAt = new Date();
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getOrderPickupAddresses = async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate("shop");
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const shop = await Shop.findById(order.shop);
  if (!shop) {
    return res.status(404).json({ message: "Shop not found" });
  }

  const pickupAddresses = shop.shopPickupAddresses || [];
  res.json({ pickupAddresses });
};

export const getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });
    if (!shop) {
      return res.status(404).json({ message: "Seller does not have a shop" });
    }

    const shopId = shop._id;

    // ===== Time ranges =====
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastMonthEnd = monthStart;

    // ===== Revenue today =====
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "paid",
          deliveredAt: { $gte: today, $lt: tomorrow },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Revenue yesterday =====
    const yesterdayRevenue = await Order.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "paid",
          deliveredAt: { $gte: yesterday, $lt: today },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Revenue this month =====
    const monthRevenue = await Order.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "paid",
          deliveredAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Revenue last month =====
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          shop: new mongoose.Types.ObjectId(shopId),
          paymentStatus: "paid",
          deliveredAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Order stats =====
    const orderStats = await Order.aggregate([
      { $match: { shop: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // ===== New orders today (theo createdAt là ĐÚNG) =====
    const newOrdersToday = await Order.countDocuments({
      shop: new mongoose.Types.ObjectId(shopId),
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // ===== Pending orders =====
    const pendingOrders = await Order.countDocuments({
      shop: new mongoose.Types.ObjectId(shopId),
      orderStatus: "created",
    });

    const todayRev = todayRevenue[0]?.total || 0;
    const yesterdayRev = yesterdayRevenue[0]?.total || 0;
    const monthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;

    const dayChangePercent = yesterdayRev
      ? (((todayRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1)
      : 0;

    const monthChangePercent = lastMonthRev
      ? (((monthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
      : 0;

    const { dailySeries, monthlySeries } = await buildRevenueSeries(shopId);

    res.json({
      todayRevenue: todayRev,
      monthRevenue: monthRev,
      newOrdersToday,
      pendingOrders,
      dayChangePercent,
      monthChangePercent,
      orderStats,
      dailyRevenueLast7Days: dailySeries,
      monthlyRevenueLast12Months: monthlySeries,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const buildRevenueSeries = async (shopId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ===== Last 7 days =====
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const dailyMatches = await Order.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(shopId),
        paymentStatus: "paid",
        deliveredAt: {
          $gte: days[0],
          $lt: new Date(days[6].getTime() + 24 * 60 * 60 * 1000),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$deliveredAt",
          },
        },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyMap = {};
  dailyMatches.forEach((r) => {
    dailyMap[r._id] = r.total;
  });

  const dailySeries = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    return { date: key, total: dailyMap[key] || 0 };
  });

  // ===== Last 12 months =====
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }

  const monthStart = months[0];
  const monthEnd = new Date(
    months[months.length - 1].getFullYear(),
    months[months.length - 1].getMonth() + 1,
    1,
  );

  const monthlyMatches = await Order.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(shopId),
        paymentStatus: "paid",
        deliveredAt: { $gte: monthStart, $lt: monthEnd },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$deliveredAt",
          },
        },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthMap = {};
  monthlyMatches.forEach((r) => {
    monthMap[r._id] = r.total;
  });

  const monthlySeries = months.map((m) => {
    const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    return { month: key, total: monthMap[key] || 0 };
  });

  return { dailySeries, monthlySeries };
};
