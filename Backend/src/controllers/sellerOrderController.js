import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Shop } from "../models/Shop.js";
import { OrderAddressSnapshot } from "../models/OrderAddressSnapshot.js";
import { Inventory } from "../models/Inventory.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Ho_Chi_Minh";


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
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res
        .status(400)
        .json({ message: "Cannot cancel shipped or delivered order" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // ✅ hoàn stock
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { variantId: item.variantId },
        {
          $inc: { stock: item.quantity },
          $set: { updatedAt: new Date() },
        }
      );
    }

    // ✅ update order status
    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: "cancelled", createdAt: new Date() });

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("❌ cancelOrder error:", err);
    res.status(500).json({ message: err.message });
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

    // ===== Mốc thời gian theo giờ VN, convert sang UTC để query =====
    const startOfToday = dayjs().tz(TZ).startOf("day").utc().toDate();
    const endOfToday = dayjs().tz(TZ).endOf("day").utc().toDate();

    const startOfYesterday = dayjs().tz(TZ).subtract(1, "day").startOf("day").utc().toDate();
    const endOfYesterday = dayjs().tz(TZ).subtract(1, "day").endOf("day").utc().toDate();

    const startOfThisMonth = dayjs().tz(TZ).startOf("month").utc().toDate();
    const startOfLastMonth = dayjs().tz(TZ).subtract(1, "month").startOf("month").utc().toDate();
    const endOfLastMonth = dayjs().tz(TZ).subtract(1, "month").endOf("month").utc().toDate();

    const revenueMatch = {
      shop: new mongoose.Types.ObjectId(shopId),
      paymentStatus: "paid",
      orderStatus: "delivered",
      cancelledAt: { $exists: false },
    };

    // ===== Revenue today =====
    const todayRevenue = await Order.aggregate([
      { $match: { ...revenueMatch, deliveredAt: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Revenue yesterday =====
    const yesterdayRevenue = await Order.aggregate([
      { $match: { ...revenueMatch, deliveredAt: { $gte: startOfYesterday, $lte: endOfYesterday } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Revenue this month =====
    const monthRevenue = await Order.aggregate([
      { $match: { ...revenueMatch, deliveredAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Revenue last month =====
    const lastMonthRevenue = await Order.aggregate([
      { $match: { ...revenueMatch, deliveredAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // ===== Order stats =====
    const orderStats = await Order.aggregate([
      { $match: { shop: new mongoose.Types.ObjectId(shopId) } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    // ===== New orders today (theo createdAt, giờ VN) =====
    const newOrdersToday = await Order.countDocuments({
      shop: new mongoose.Types.ObjectId(shopId),
      createdAt: { $gte: startOfToday, $lte: endOfToday },
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
      ? Number((((todayRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1))
      : 0;

    const monthChangePercent = lastMonthRev
      ? Number((((monthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1))
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
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const buildRevenueSeries = async (shopId) => {
  const todayVN = dayjs().tz(TZ).startOf("day");

  // ===== Last 7 days =====
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(todayVN.subtract(i, "day"));
  }

  const start = days[0].utc().toDate();
  const end = todayVN.endOf("day").utc().toDate();

  const dailyMatches = await Order.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(shopId),
        paymentStatus: "paid",
        orderStatus: "delivered",
        cancelledAt: { $exists: false },
        deliveredAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$deliveredAt",
            timezone: TZ,
          },
        },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyMap = Object.fromEntries(dailyMatches.map(r => [r._id, r.total]));

  const dailySeries = days.map(d => {
    const key = d.format("YYYY-MM-DD");
    return { date: key, total: dailyMap[key] || 0 };
  });

  // ===== Last 12 months =====
  const months = [];
  for (let i = 11; i >= 0; i--) {
    months.push(dayjs().tz(TZ).subtract(i, "month").startOf("month"));
  }

  const monthStart = months[0].utc().toDate();
  const monthEnd = months[months.length - 1].endOf("month").utc().toDate();

  const monthlyMatches = await Order.aggregate([
    {
      $match: {
        shop: new mongoose.Types.ObjectId(shopId),
        paymentStatus: "paid",
        orderStatus: "delivered",
        cancelledAt: { $exists: false },
        deliveredAt: { $gte: monthStart, $lte: monthEnd },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$deliveredAt",
            timezone: TZ,
          },
        },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthMap = Object.fromEntries(monthlyMatches.map(r => [r._id, r.total]));

  const monthlySeries = months.map(m => {
    const key = m.format("YYYY-MM");
    return { month: key, total: monthMap[key] || 0 };
  });

  return { dailySeries, monthlySeries };
};