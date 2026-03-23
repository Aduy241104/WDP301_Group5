import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Banner } from "../models/Banner.js";

const { Types } = mongoose;

function isValidObjectId(id) {
    return Types.ObjectId.isValid(id);
}

/**
 * GET /shops/:shopId/banners
 * home_mid -> slider
 * home_top -> single
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
            position: { $in: ["home_mid", "home_top"] },
            isDeleted: false,
            isActive: true,
            $and: [
                { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
                { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
            ]
        })
            .select("title imageUrl linkUrl linkType linkTargetId position priority")
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        const slider = [];
        const single = [];

        for (const b of banners) {
            if (b.position === "home_mid") {
                slider.push(b);
            } else if (b.position === "home_top") {
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