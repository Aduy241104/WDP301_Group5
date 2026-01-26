import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Banner } from "../models/Banner.js";

// View Banner List
export const AdminBannerListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };
        const position = String(req.query.position ?? "").trim();
        if (position) query.position = position;

        const [items, total] = await Promise.all([
            Banner.find(query)
                .populate("createdBy", "email fullName")
                .populate("updatedBy", "email fullName")
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Banner.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_BANNER_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// Add Banner
export const AdminAddBannerController = async (req, res) => {
    try {
        const {
            title,
            imageUrl,
            linkUrl = "",
            linkType,
            linkTargetId = null,
            position,
            priority = 0,
            height = 400,
            startAt,
            endAt,
        } = req.body;

        // Validation
        if (!title || !imageUrl || !linkType || !position || !startAt || !endAt) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Missing required fields: title, imageUrl, linkType, position, startAt, endAt",
            });
        }

        const validLinkTypes = ["external", "product", "shop", "category", "search"];
        if (!validLinkTypes.includes(linkType)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Invalid linkType. Must be one of: ${validLinkTypes.join(", ")}`,
            });
        }

        const validPositions = ["header_bottom", "home_top", "home_mid", "home_popup"];
        if (!validPositions.includes(position)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Invalid position. Must be one of: ${validPositions.join(", ")}`,
            });
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid date format for startAt or endAt",
            });
        }

        if (endDate <= startDate) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "endAt must be after startAt",
            });
        }

        // Validate linkTargetId if provided
        let validatedLinkTargetId = null;
        if (linkTargetId) {
            const linkTargetIdStr = String(linkTargetId).trim();
            if (linkTargetIdStr && mongoose.Types.ObjectId.isValid(linkTargetIdStr)) {
                validatedLinkTargetId = new mongoose.Types.ObjectId(linkTargetIdStr);
            } else if (linkTargetIdStr) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid linkTargetId format. Must be a valid ObjectId.",
                });
            }
        }

        const banner = new Banner({
            title,
            imageUrl,
            linkUrl,
            linkType,
            linkTargetId: validatedLinkTargetId,
            position,
            priority: Number(priority) || 0,
            height: Number(height) || 400,
            startAt: startDate,
            endAt: endDate,
            createdBy: req.user.id,
        });

        await banner.save();
        await banner.populate("createdBy", "email fullName");

        return res.status(StatusCodes.CREATED).json({
            message: "Banner created successfully",
            banner,
        });
    } catch (err) {
        console.error("ADMIN_ADD_BANNER_ERROR:", err);
        if (err.name === "ValidationError") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: err.message,
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// Update Banner
export const AdminUpdateBannerController = async (req, res) => {
    try {
        const { bannerId } = req.params;
        const {
            title,
            imageUrl,
            linkUrl,
            linkType,
            linkTargetId,
            position,
            priority,
            height,
            startAt,
            endAt,
        } = req.body;

        const banner = await Banner.findOne({ _id: bannerId, isDeleted: false });
        if (!banner) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Banner not found" });
        }

        // Update fields if provided
        if (title !== undefined) banner.title = title;
        if (imageUrl !== undefined) banner.imageUrl = imageUrl;
        if (linkUrl !== undefined) banner.linkUrl = linkUrl;
        if (linkType !== undefined) {
            const validLinkTypes = ["external", "product", "shop", "category", "search"];
            if (!validLinkTypes.includes(linkType)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid linkType. Must be one of: ${validLinkTypes.join(", ")}`,
                });
            }
            banner.linkType = linkType;
        }
        if (linkTargetId !== undefined) {
            if (linkTargetId) {
                const linkTargetIdStr = String(linkTargetId).trim();
                if (linkTargetIdStr && mongoose.Types.ObjectId.isValid(linkTargetIdStr)) {
                    banner.linkTargetId = new mongoose.Types.ObjectId(linkTargetIdStr);
                } else if (linkTargetIdStr) {
                    return res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid linkTargetId format. Must be a valid ObjectId.",
                    });
                } else {
                    banner.linkTargetId = null;
                }
            } else {
                banner.linkTargetId = null;
            }
        }
        if (position !== undefined) {
            const validPositions = ["header_bottom", "home_top", "home_mid", "home_popup"];
            if (!validPositions.includes(position)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Invalid position. Must be one of: ${validPositions.join(", ")}`,
                });
            }
            banner.position = position;
        }
        if (priority !== undefined) banner.priority = Number(priority) || 0;
        if (height !== undefined) banner.height = Number(height) || 400;
        if (startAt !== undefined) {
            const startDate = new Date(startAt);
            if (isNaN(startDate.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid date format for startAt" });
            }
            banner.startAt = startDate;
        }
        if (endAt !== undefined) {
            const endDate = new Date(endAt);
            if (isNaN(endDate.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid date format for endAt" });
            }
            banner.endAt = endDate;
        }

        // Validate dates
        if (banner.endAt <= banner.startAt) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "endAt must be after startAt",
            });
        }

        banner.updatedBy = req.user.id;
        await banner.save();
        await banner.populate("createdBy", "email fullName");
        await banner.populate("updatedBy", "email fullName");

        return res.status(StatusCodes.OK).json({
            message: "Banner updated successfully",
            banner,
        });
    } catch (err) {
        console.error("ADMIN_UPDATE_BANNER_ERROR:", err);
        if (err.name === "ValidationError") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: err.message,
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// Delete Banner
export const AdminDeleteBannerController = async (req, res) => {
    try {
        const { bannerId } = req.params;

        const banner = await Banner.findOne({ _id: bannerId, isDeleted: false });
        if (!banner) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Banner not found" });
        }

        banner.isDeleted = true;
        banner.deletedAt = new Date();
        banner.deletedBy = req.user.id;

        await banner.save();

        return res.status(StatusCodes.OK).json({
            message: "Banner deleted successfully",
        });
    } catch (err) {
        console.error("ADMIN_DELETE_BANNER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

