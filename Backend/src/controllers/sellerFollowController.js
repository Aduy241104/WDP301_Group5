import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ShopFollower } from "../models/ShopFollower.js";
import { Shop } from "../models/Shop.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

export const getMyShopFollowers = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });

    if (!shop) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Seller does not have a shop",
      });
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Number(req.query.limit || 10));
    const skip = (page - 1) * limit;

    const [total, followers] = await Promise.all([
      ShopFollower.countDocuments({ shopId: shop._id }),
      ShopFollower.find({ shopId: shop._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "userId",
          select: "_id fullname email avatar",
        })
        .lean(),
    ]);

    const items = followers.map((f) => ({
      followedAt: f.createdAt,
      user: f.userId,
    }));

    return res.status(StatusCodes.OK).json({
      message: "Get followers success",
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyShopFollowersCount = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });

    if (!shop) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Seller does not have a shop",
      });
    }

    const count = await ShopFollower.countDocuments({
      shopId: shop._id,
    });

    return res.status(StatusCodes.OK).json({
      message: "Get followers count success",
      data: {
        shopId: shop._id,
        followersCount: count,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ============================================
// TOP FOLLOWERS BY NUMBER OF ORDERS
// ============================================
export const getTopFollowersByNumberOfOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });
    if (!shop) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Seller does not have a shop",
      });
    }

    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

    const followerUserIds = await ShopFollower.distinct("userId", {
      shopId: shop._id,
    });

    if (!followerUserIds.length) {
      return res.status(StatusCodes.OK).json({
        message: "Get top followers success",
        data: {
          shopId: shop._id,
          totalFollowers: 0,
          items: [],
          limit,
        },
      });
    }

    const totalFollowers = followerUserIds.length;

    const orderCounts = await Order.aggregate([
      {
        $match: {
          shop: shop._id,
          userId: { $in: followerUserIds },
          // Delivered orders represent completed purchases
          orderStatus: "delivered",
        },
      },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: limit },
    ]);

    const orderedUserIds = orderCounts.map((r) => r._id);
    const users = await User.find({ _id: { $in: orderedUserIds } })
      .select("_id fullname email avatar")
      .lean();

    const userMap = Object.fromEntries(
      users.map((u) => [String(u._id), u]),
    );

    const items = orderCounts.map((r) => ({
      user: userMap[String(r._id)] || null,
      orderCount: r.orderCount,
    }));

    return res.status(StatusCodes.OK).json({
      message: "Get top followers success",
      data: {
        shopId: shop._id,
        totalFollowers,
        items,
        limit,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// ============================================
// FOLLOWER PURCHASE CONVERSION RATE
// ============================================
export const getFollowerPurchaseConversionRate = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const shop = await Shop.findOne({ ownerId: sellerId });
    if (!shop) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Seller does not have a shop",
      });
    }

    const totalFollowers = await ShopFollower.countDocuments({
      shopId: shop._id,
    });

    if (!totalFollowers) {
      return res.status(StatusCodes.OK).json({
        message: "Get follower conversion rate success",
        data: {
          shopId: shop._id,
          totalFollowers: 0,
          purchasedFollowersCount: 0,
          conversionRate: 0,
        },
      });
    }

    const followerUserIds = await ShopFollower.distinct("userId", {
      shopId: shop._id,
    });

    const purchasedUserIds = await Order.distinct("userId", {
      shop: shop._id,
      orderStatus: "delivered",
      userId: { $in: followerUserIds },
    });

    const purchasedFollowersCount = purchasedUserIds.length;
    const conversionRate = Number(
      ((purchasedFollowersCount / totalFollowers) * 100).toFixed(2),
    );

    return res.status(StatusCodes.OK).json({
      message: "Get follower conversion rate success",
      data: {
        shopId: shop._id,
        totalFollowers,
        purchasedFollowersCount,
        conversionRate,
      },
    });
  } catch (err) {
    return next(err);
  }
};