import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

export const getProductReviews = async ({
    productId,
    page = 1,
    limit = 5,
    rating
}) => {

    const skip = (page - 1) * limit;
    const product = await Product.findById(productId).select("ratingAvg");
    const matchCondition = {
        productId: new mongoose.Types.ObjectId(productId),
        isDeleted: false
    };

    if (rating) {
        matchCondition.rating = Number(rating);
    }

    const reviews = await Review.find(matchCondition)
        .populate({
            path: "userId",
            select: "fullName avatar"
        })
        .populate({
            path: "sellerReply.shopId",
            select: "shopName"
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Review.countDocuments(matchCondition);

    return {
        reviews,
        avgRating: product?.ratingAvg || 0,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

export const createReview = async ({
    userId,
    productId,
    orderId,
    rating,
    comment,
}) => {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid productId");
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error("Invalid orderId");
    }

    const order = await Order.findOne({
        _id: orderId,
        userId: userId,
        orderStatus: "delivered"
    });

    if (!order) {
        throw new Error("Order not found or not delivered");
    }

    const item = order.items.find(
        item => item.productId.toString() === productId
    );

    if (!item) {
        throw new Error("Product not found in this order");
    }

    const existingReview = await Review.findOne({
        userId,
        productId,
        orderId,
        isDeleted: false
    });

    if (existingReview) {
        throw new Error("You already reviewed this product in this order");
    }

    const review = await Review.create({
        userId,
        productId,
        orderId,
        rating,
        comment
    });

    // 🔥 UPDATE RATING
    await updateProductRating(productId);

    return review;
};

export const updateReviewService = async ({
    reviewId,
    userId,
    rating,
    comment
}) => {

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error("Invalid reviewId");
    }

    const review = await Review.findOne({
        _id: reviewId,
        isDeleted: false
    });

    if (!review) {
        throw new Error("Review not found");
    }

    if (review.userId.toString() !== userId) {
        throw new Error("You can only edit your own review");
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    // 🔥 UPDATE RATING
    await updateProductRating(review.productId);

    return review;
};

export const deleteReviewService = async ({ reviewId, userId }) => {

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error("Invalid reviewId");
    }

    const review = await Review.findOne({
        _id: reviewId,
        userId: userId
    });

    if (!review) {
        throw new Error("Review not found or you are not the owner");
    }

    const productId = review.productId; // 🔥 lưu trước khi xóa

    await Review.findByIdAndDelete(reviewId);

    // 🔥 UPDATE RATING
    await updateProductRating(productId);

    return true;
};

export const updateProductRating = async (productId) => {
    const result = await Review.aggregate([
        {
            $match: {
                productId: new mongoose.Types.ObjectId(productId),
                isDeleted: false
            }
        },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    const avgRating = result.length > 0
        ? Number(result[0].avgRating.toFixed(1))
        : 0;

    await Product.findByIdAndUpdate(productId, {
        ratingAvg: avgRating
    });
};