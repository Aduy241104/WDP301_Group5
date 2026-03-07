import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ShopFollower } from "../models/ShopFollower.js";
import { Shop } from "../models/Shop.js"; 

const { Types } = mongoose;

function isValidObjectId(id) {
    return Types.ObjectId.isValid(id);
}

/**
 * POST /shops/:shopId/follow
 * Auth required
 */
export async function followShop(req, res, next) {
    try {
        const userId = req.user?.id;
        const { shopId } = req.params;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
        }
        if (!isValidObjectId(shopId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid shopId." });
        }

        // Optional: check shop exists (khuyến khích)
        const exists = await Shop.exists({ _id: shopId, isDeleted: { $ne: true } });
        if (!exists) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Shop not found." });
        }

        // Idempotent follow (không bị duplicate nhờ unique index)
        // upsert giúp tránh phải findOne trước
        const result = await ShopFollower.updateOne(
            { shopId, userId },
            { $setOnInsert: { shopId, userId } },
            { upsert: true }
        );

        // result.upsertedCount === 1 => vừa follow mới
        const followed = result.upsertedCount === 1;

        return res.status(StatusCodes.OK).json({
            message: followed ? "Followed shop." : "Already followed.",
            data: { shopId, userId, followed },
        });
    } catch (err) {
        // nếu bạn không dùng Shop.exists và chỉ create() thì có thể dính E11000
        // còn updateOne upsert thường ít dính hơn nhưng vẫn để next(err)
        return next(err);
    }
}

/**
 * DELETE /shops/:shopId/follow
 * Auth required
 */
export async function unfollowShop(req, res, next) {
    try {
        const userId = req.user?.id;
        const { shopId } = req.params;

        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
        }
        if (!isValidObjectId(shopId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid shopId." });
        }

        const rs = await ShopFollower.deleteOne({ shopId, userId });

        return res.status(StatusCodes.OK).json({
            message: rs.deletedCount ? "Unfollowed shop." : "Not following.",
            data: { shopId, userId, unfollowed: rs.deletedCount === 1 },
        });
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /me/following/shops?page=1&limit=10
 * Auth required
 * trả về list shop mà user đang follow
 */
export async function getMyFollowingShops(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized." });
        }

        const page = Math.max(1, Number(req.query.page || 1));
        const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
        const skip = (page - 1) * limit;

        const [total, rows] = await Promise.all([
            ShopFollower.countDocuments({ userId }),
            ShopFollower.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "shopId",
                    select: "_id name logo slug rating totalFollowers", // tùy schema Shop
                })
                .lean(),
        ]);

        // format response
        const items = rows.map((r) => ({
            followedAt: r.createdAt,
            shop: r.shopId, // đã populate
        }));

        return res.status(StatusCodes.OK).json({
            message: "OK",
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
        return next(err);
    }
}

/**
 * GET /shops/:shopId/followers?page=1&limit=10
 * Public (hoặc requireAuth nếu bạn muốn)
 * trả về list user follow shop
 */
export async function getShopFollowersCount(req, res, next) {
    try {
        const { shopId } = req.params;

        if (!isValidObjectId(shopId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid shopId.",
            });
        }

        const count = await ShopFollower.countDocuments({ shopId });

        return res.status(StatusCodes.OK).json({
            message: "Get shop followers count success",
            data: {
                shopId,
                followersCount: count,
            },
        });
    } catch (err) {
        return next(err);
    }
}


export const checkFollowShop = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shopId } = req.params;

        // validate shopId
        if (!mongoose.Types.ObjectId.isValid(shopId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid shopId",
            });
        }

        const isFollowed = await ShopFollower.exists({
            shopId,
            userId,
        });

        return res.status(StatusCodes.OK).json({
            message: "Check follow status success",
            isFollowed: !!isFollowed,
        });
    } catch (error) {
        next(error);
    }
};