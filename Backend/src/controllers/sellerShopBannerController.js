import { StatusCodes } from "http-status-codes";
import { Banner } from "../models/Banner.js";
import mongoose from "mongoose";

// Get shop banners list - only show banners created by this seller
export const getShopBanners = async (req, res) => {
    try {
        const shop = req.shop; // Shop đã được lấy từ middleware checkApprovedShop
        const userId = req.user.id; // User ID from authentication middleware

        // Only show banners created by this seller for this shop
        const banners = await Banner.find({
            shopId: shop._id,
            isDeleted: false,
            createdBy: userId, // Hiển thị theo người tạo
        })
            .populate("createdBy", "email fullName")
            .populate("updatedBy", "email fullName")
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return res.status(StatusCodes.OK).json({
            message: "Get shop banners successfully",
            banners,
        });
    } catch (err) {
        console.error("GET_SHOP_BANNERS_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// Add Banner in shop
export const addShopBanner = async (req, res) => {
    try {
        const shop = req.shop; // Shop đã được lấy từ middleware checkApprovedShop
        const { title, imageUrl, linkUrl, position, order, startAt, endAt, isActive } = req.body;

        // Validation
        if (!imageUrl) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "imageUrl is required",
            });
        }

        const validPositions = ["top", "slider", "popup"];
        if (position && !validPositions.includes(position)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Invalid position. Must be one of: ${validPositions.join(", ")}`,
            });
        }

        // Validate dates if provided
        let startDate = null;
        let endDate = null;
        if (startAt) {
            startDate = new Date(startAt);
            if (isNaN(startDate.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid date format for startAt",
                });
            }
        }
        if (endAt) {
            endDate = new Date(endAt);
            if (isNaN(endDate.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid date format for endAt",
                });
            }
        }

        if (startDate && endDate && endDate <= startDate) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "endAt must be after startAt",
            });
        }

        // Create banner using Banner model
        const banner = new Banner({
            shopId: shop._id,
            title: title || "",
            imageUrl,
            linkUrl: linkUrl || "",
            linkType: "external", // Default for shop banners
            position: position || "top",
            order: order || 0,
            priority: order || 0, // Use order as priority for shop banners
            startAt: startDate || new Date(), // Required field, use current date if not provided
            endAt: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default to 1 year from now
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user.id,
        });

        await banner.save();
        await banner.populate("createdBy", "email fullName");

        return res.status(StatusCodes.CREATED).json({
            message: "Banner added successfully",
            banner,
        });
    } catch (err) {
        console.error("ADD_SHOP_BANNER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// Edit Banner in shop
export const updateShopBanner = async (req, res) => {
    try {
        const shop = req.shop; // Shop đã được lấy từ middleware checkApprovedShop
        const { bannerId } = req.params;
        const { title, imageUrl, linkUrl, position, order, startAt, endAt, isActive } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(bannerId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid banner id",
            });
        }

        // Find banner and check ownership - only banners created by this seller
        const banner = await Banner.findOne({
            _id: bannerId,
            shopId: shop._id,
            createdBy: req.user.id, // Only allow editing banners created by this seller
            isDeleted: false,
        });

        if (!banner) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Banner not found",
            });
        }

        // Update priority when order changes
        if (order !== undefined) {
            banner.priority = order;
        }

        // Validate position if provided
        if (position) {
            const validPositions = ["top", "slider", "popup"];
            if (!validPositions.includes(position)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid position. Must be one of: ${validPositions.join(", ")}`,
                });
            }
            banner.position = position;
        }

        // Validate dates if provided
        if (startAt !== undefined) {
            if (startAt === null) {
                banner.startAt = null;
            } else {
                const startDate = new Date(startAt);
                if (isNaN(startDate.getTime())) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid date format for startAt",
                    });
                }
                banner.startAt = startDate;
            }
        }

        if (endAt !== undefined) {
            if (endAt === null) {
                banner.endAt = null;
            } else {
                const endDate = new Date(endAt);
                if (isNaN(endDate.getTime())) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid date format for endAt",
                    });
                }
                banner.endAt = endDate;
            }
        }

        // Check date validity
        if (banner.startAt && banner.endAt && banner.endAt <= banner.startAt) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "endAt must be after startAt",
            });
        }

        // Update fields
        if (title !== undefined) banner.title = title;
        if (imageUrl !== undefined) banner.imageUrl = imageUrl;
        if (linkUrl !== undefined) banner.linkUrl = linkUrl;
        if (order !== undefined) {
            banner.order = order;
            banner.priority = order; // Sync priority with order
        }
        if (isActive !== undefined) banner.isActive = isActive;

        // Track who updated the banner
        banner.updatedBy = req.user.id;

        await banner.save();
        await banner.populate("createdBy", "email fullName");
        await banner.populate("updatedBy", "email fullName");

        return res.status(StatusCodes.OK).json({
            message: "Banner updated successfully",
            banner,
        });
    } catch (err) {
        console.error("UPDATE_SHOP_BANNER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// Delete Banner in Shop
export const deleteShopBanner = async (req, res) => {
    try {
        const shop = req.shop; // Shop đã được lấy từ middleware checkApprovedShop
        const { bannerId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(bannerId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid banner id",
            });
        }

        // Find banner and check ownership - only banners created by this seller
        const banner = await Banner.findOne({
            _id: bannerId,
            shopId: shop._id,
            createdBy: req.user.id, // Only allow deleting banners created by this seller
            isDeleted: false,
        });

        if (!banner) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Banner not found",
            });
        }

        // Soft delete
        banner.isDeleted = true;
        banner.deletedAt = new Date();
        banner.deletedBy = req.user.id;

        await banner.save();

        return res.status(StatusCodes.OK).json({
            message: "Banner deleted successfully",
        });
    } catch (err) {
        console.error("DELETE_SHOP_BANNER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
