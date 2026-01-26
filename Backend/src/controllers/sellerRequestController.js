import { SellerRequest } from "../models/SellerRequest.js";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import mongoose from "mongoose";


export const createSellerRequest = async (req, res) => {
    try {

        const userId = req.user.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId).select("_id status").lean();
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not found" });
        }
        if (user.status === "blocked") {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Your account is blocked." });
        }

        // Không cho gửi trùng
        const existing = await SellerRequest.findOne({
            userId,
            isDeleted: false,
            status: { $in: ["pending", "approved"] },
        })
            .select("_id status createdAt")
            .lean();

        if (existing) {
            return res.status(StatusCodes.CONFLICT).json({
                message:
                    existing.status === "pending"
                        ? "You already have a pending seller request."
                        : "You are already approved as a seller.",
                request: existing,
            });
        }

        // req.body lúc này đã được Joi validate + sanitize
        const doc = await SellerRequest.create({
            userId,
            ...req.body,
            status: "pending",
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Seller request submitted successfully.",
            request: {
                id: doc._id,
                status: doc.status,
                createdAt: doc.createdAt,
            },
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

export const checkSellerRequestExists = async (req, res) => {
    try {
        const userId = req.user.id;


        const latestRequest = await SellerRequest
            .findOne({
                userId,
                isDeleted: false,
            })
            .sort({ createdAt: -1 })
            .lean();

        // Chưa từng gửi request
        if (!latestRequest) {
            return res.status(StatusCodes.OK).json({
                hasRequest: false,
                message: "User has no seller request yet.",
            });
        }

        res.status(StatusCodes.OK).json({
            hasRequest: true,
            requestStatus: latestRequest.status,
            message: "User has seller request",
        })
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server error",
            error: err?.message,
        });
    }
}
