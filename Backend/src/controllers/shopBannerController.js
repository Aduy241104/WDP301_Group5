import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Banner } from "../models/Banner.js";

const { Types } = mongoose;

function isValidObjectId(id) {
    return Types.ObjectId.isValid(id);
}

/**
 * GET /shops/:shopId/banners
 * slider -> carousel
 * single -> banner đơn (top) hiển thị từ trên xuống
 */
export async function getShopBanners(req, res) {
    try {
        const { shopId } = req.params;

        if (!isValidObjectId(shopId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid shopId." });
        }

        const now = new Date();

        const banners = await Banner.find({
            shopId,
            position: { $in: ["slider", "top"] },
            isDeleted: false,
            isActive: true,
            $and: [
                { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
                { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
            ]
        })
            .select("title imageUrl linkUrl linkType linkTargetId position order priority")
            .sort({ order: 1, priority: -1 })
            .lean();

        const slider = [];
        const single = [];

        for (const b of banners) {
            if (b.position === "slider") {
                slider.push(b);
            } else if (b.position === "top") {
                single.push(b);
            }
        }

        return res.status(StatusCodes.OK).json({
            message: "OK.",
            data: {
                slider,
                single
            }
        });

    } catch (error) {
        console.error("getShopBanners error:", error);

        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
}