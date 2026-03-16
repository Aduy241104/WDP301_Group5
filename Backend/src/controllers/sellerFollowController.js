import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ShopFollower } from "../models/ShopFollower.js";
import { Shop } from "../models/Shop.js";

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