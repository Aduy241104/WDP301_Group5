import { StatusCodes } from "http-status-codes";
import { SellerRequest } from "../models/SellerRequest.js";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";

// ============================================
// SELLER REGISTRATION LIST
// ============================================
// View the list of seller registrations (no filter)
export const AdminSellerRegistrationListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };

        const [items, total] = await Promise.all([
            SellerRequest.find(query)
                .populate("userId", "email fullName phone role status")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SellerRequest.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_SELLER_REG_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// FILTER SELLER BY STATUS
// ============================================
// Filter sellers by status (pending, approved, rejected)
export const AdminFilterSellerByStatusController = async (req, res) => {
    try {
        const status = String(req.query.status ?? "").trim();
        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid status. Must be one of: pending, approved, rejected.",
            });
        }

        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false, status };

        const [items, total] = await Promise.all([
            SellerRequest.find(query)
                .populate("userId", "email fullName phone role status")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SellerRequest.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_SELLER_FILTER_STATUS_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// SELLER LIST
// ============================================
// View the list of sellers (User with role=seller)
export const AdminSellerListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { role: "seller" };
        const status = String(req.query.status ?? "").trim();
        if (status) query.status = status;

        const [items, total] = await Promise.all([
            User.find(query)
                .select("email fullName phone role status createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_SELLER_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// VIEW SELLER PROFILE
// ============================================
// View detailed seller profile information.
export const AdminViewSellerProfileController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean();
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        const [shops, latestRequest] = await Promise.all([
            Shop.find({ ownerId: userId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
            SellerRequest.findOne({ userId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
        ]);

        return res.status(StatusCodes.OK).json({
            user,
            shops,
            latestSellerRequest: latestRequest,
            cccdImages: latestRequest?.cccdImages ?? [],
        });
    } catch (err) {
        console.error("ADMIN_VIEW_SELLER_PROFILE_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// APPROVE SELLER
// ============================================
// Approve seller registration
export const AdminApproveSellerController = async (req, res) => {
    try {
        const { requestId } = req.params;

        const sellerRequest = await SellerRequest.findById(requestId);
        if (!sellerRequest || sellerRequest.isDeleted) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Seller request not found." });
        }

        if (sellerRequest.status === "approved") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Seller request already approved." });
        }
        if (sellerRequest.status === "rejected") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Seller request already rejected." });
        }

        const user = await User.findById(sellerRequest.userId);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        // Update request
        sellerRequest.status = "approved";
        sellerRequest.rejectReason = "";
        await sellerRequest.save();

        // Promote user -> seller (keep blocked/active status as-is)
        if (user.role !== "seller") {
            user.role = "seller";
            await user.save();
        }

        // Ensure a shop exists (create from request if not exists)
        const existingShop = await Shop.findOne({ ownerId: user._id, isDeleted: false });
        let shop = existingShop;
        if (!existingShop) {
            shop = await Shop.create({
                ownerId: user._id,
                name: sellerRequest.shopName,
                description: sellerRequest.description ?? "",
                contactPhone: sellerRequest.contactPhone ?? "",
                status: "approved",
                isBlockedByAdmin: false,
                shopAddress: sellerRequest.shopAddress,
                shopPickupAddresses: [],
            });
        } else if (existingShop.status === "pending") {
            existingShop.status = "approved";
            existingShop.isBlockedByAdmin = false;
            existingShop.name = sellerRequest.shopName ?? existingShop.name;
            existingShop.description = sellerRequest.description ?? existingShop.description;
            existingShop.contactPhone = sellerRequest.contactPhone ?? existingShop.contactPhone;
            if (sellerRequest.shopAddress) existingShop.shopAddress = sellerRequest.shopAddress;
            await existingShop.save();
        }

        return res.status(StatusCodes.OK).json({
            message: "Seller request approved.",
            sellerRequest,
            user: { id: user._id, role: user.role, status: user.status },
            shop,
        });
    } catch (err) {
        console.error("ADMIN_APPROVE_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// REJECT SELLER
// ============================================
// Reject seller registration with reason
export const AdminRejectSellerController = async (req, res) => {
    try {
        const { requestId } = req.params;
        const rejectReason = String(req.body.rejectReason ?? "").trim();
        if (!rejectReason) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "rejectReason is required." });
        }

        const sellerRequest = await SellerRequest.findById(requestId);
        if (!sellerRequest || sellerRequest.isDeleted) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Seller request not found." });
        }

        if (sellerRequest.status === "approved") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Seller request already approved." });
        }
        if (sellerRequest.status === "rejected") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Seller request already rejected." });
        }

        sellerRequest.status = "rejected";
        sellerRequest.rejectReason = rejectReason;
        await sellerRequest.save();

        return res.status(StatusCodes.OK).json({
            message: "Seller request rejected.",
            sellerRequest,
        });
    } catch (err) {
        console.error("ADMIN_REJECT_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// BLOCK SELLER
// ============================================
// Block a seller account
export const AdminBlockSellerController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        user.status = "blocked";
        await user.save();

        // Also block shops owned by this user
        await Shop.updateMany(
            { ownerId: userId, isDeleted: false },
            { $set: { status: "blocked", isBlockedByAdmin: true } }
        );

        return res.status(StatusCodes.OK).json({
            message: "Seller blocked.",
            user: { id: user._id, role: user.role, status: user.status },
        });
    } catch (err) {
        console.error("ADMIN_BLOCK_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// UNBLOCK SELLER
// ============================================
// Unblock a seller account
export const AdminUnblockSellerController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        user.status = "active";
        await user.save();

        // Unblock shops (set back to approved if they were blocked by admin)
        await Shop.updateMany(
            { ownerId: userId, isDeleted: false },
            { $set: { status: "approved", isBlockedByAdmin: false } }
        );

        return res.status(StatusCodes.OK).json({
            message: "Seller unblocked.",
            user: { id: user._id, role: user.role, status: user.status },
        });
    } catch (err) {
        console.error("ADMIN_UNBLOCK_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// ============================================
// SHOP LIST
// ============================================
// View the list of shops
export const AdminShopListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };
        const status = String(req.query.status ?? "").trim();
        if (status) query.status = status;

        const [items, total] = await Promise.all([
            Shop.find(query)
                .populate("ownerId", "email fullName phone role status")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Shop.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_SHOP_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
