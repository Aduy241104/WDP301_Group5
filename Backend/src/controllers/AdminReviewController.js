import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";

/**
 * GET /api/admin/reviews
 * Query: productId (optional), page, limit
 */
export const AdminReviewListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const productId = String(req.query.productId ?? "").trim();
        const filter = { isDeleted: false };
        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid productId." });
            }
            filter.productId = new mongoose.Types.ObjectId(productId);
        }

        const [items, total] = await Promise.all([
            Review.find(filter)
                .populate("userId", "email fullName")
                .populate("productId", "name shopId defaultPrice")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments(filter),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        });
    } catch (err) {
        console.error("ADMIN_REVIEW_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

/**
 * GET /api/admin/products/:productId/reviews
 */
export const AdminProductReviewsController = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid productId." });
        }

        const product = await Product.findOne({ _id: productId, isDeleted: false }).select("_id name").lean();
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found." });
        }

        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const filter = { productId, isDeleted: false };

        const [items, total] = await Promise.all([
            Review.find(filter)
                .populate("userId", "email fullName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments(filter),
        ]);

        return res.status(StatusCodes.OK).json({
            product,
            items,
            paging: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        });
    } catch (err) {
        console.error("ADMIN_PRODUCT_REVIEWS_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

/**
 * DELETE /api/admin/reviews/:reviewId
 * Soft delete
 */
export const AdminDeleteReviewController = async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid reviewId." });
        }

        const review = await Review.findOne({ _id: reviewId, isDeleted: false });
        if (!review) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Review not found." });
        }

        review.isDeleted = true;
        review.deletedAt = new Date();
        await review.save();

        return res.status(StatusCodes.OK).json({ message: "Review deleted.", id: review._id });
    } catch (err) {
        console.error("ADMIN_DELETE_REVIEW_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
