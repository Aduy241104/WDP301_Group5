import { SellerRequest } from "../models/SellerRequest.js";
import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";
import mongoose from "mongoose";


export const createSellerRequest = async (req, res) => {
    try {

        const userId = req.user.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId).select("_id status role").lean();
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "User not found" });
        }
        if (user.status === "blocked") {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Your account is blocked." });
        }
        if (user.role === "admin") {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin cannot submit seller request." });
        }
        if (user.role === "seller") {
            return res.status(StatusCodes.CONFLICT).json({ message: "You are already approved as a seller." });
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
        // Rule: khi user đăng ký làm seller thì phải có 1 shop (pending).
        // Tạo shop trước; nếu tạo request fail thì rollback shop (best-effort).
        const payload = { ...req.body };

        let createdNewShop = false;
        let ensuredShop = await Shop.findOne({ ownerId: userId, isDeleted: false });
        if (!ensuredShop) {
            ensuredShop = await Shop.create({
                ownerId: userId,
                name: payload.shopName,
                description: payload.description ?? "",
                contactPhone: payload.contactPhone ?? "",
                status: "pending",
                isBlockedByAdmin: false,
                shopAddress: payload.shopAddress,
                shopPickupAddresses: [],
            });
            createdNewShop = true;
        } else {
            // Nếu shop đang pending (hoặc chưa approved), cập nhật theo thông tin request mới nhất
            if (ensuredShop.status !== "approved") {
                ensuredShop.name = payload.shopName ?? ensuredShop.name;
                ensuredShop.description = payload.description ?? ensuredShop.description;
                ensuredShop.contactPhone = payload.contactPhone ?? ensuredShop.contactPhone;
                if (payload.shopAddress) ensuredShop.shopAddress = payload.shopAddress;
                ensuredShop.status = "pending";
                ensuredShop.isBlockedByAdmin = false;
                await ensuredShop.save();
            }
        }

        let doc;
        try {
            doc = await SellerRequest.create({
                userId,
                ...payload,
                status: "pending",
            });
        } catch (err) {
            // Nếu vừa tạo shop mới mà tạo request fail => xoá shop để không vi phạm rule "request phải có shop"
            // (best-effort, không dùng transaction để tránh phụ thuộc replica set)
            try {
                if (createdNewShop && ensuredShop?.status === "pending") {
                    await Shop.deleteOne({ _id: ensuredShop._id });
                }
            } catch {
                // ignore
            }
            throw err;
        }

        return res.status(StatusCodes.CREATED).json({
            message: "Seller request submitted successfully.",
            request: {
                id: doc._id,
                status: doc.status,
                createdAt: doc.createdAt,
            },
            shop: {
                id: ensuredShop?._id,
                status: ensuredShop?.status,
            },
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server error",
            error: err?.message,
        });
    }
};
