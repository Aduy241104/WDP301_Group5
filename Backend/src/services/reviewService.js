import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

export const getProductReviews = async ({
    productId,
    page = 1,
    limit = 5,
    rating
}) => {

    const skip = (page - 1) * limit;

    const matchCondition = {
        productId: new mongoose.Types.ObjectId(productId),
        isDeleted: false
    };

    // 🔥 filter rating
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

    // 🔥 tìm order đúng của user
    const order = await Order.findOne({
        _id: orderId,
        userId: userId,
        orderStatus: "delivered"
    });

    if (!order) {
        throw new Error("Order not found or not delivered");
    }

    // 🔥 kiểm tra product có trong order không
    const item = order.items.find(
        item => item.productId.toString() === productId
    );

    if (!item) {
        throw new Error("Product not found in this order");
    }

    // 🔥 check đã review chưa
    const existingReview = await Review.findOne({
        userId,
        productId,
        orderId,
        isDeleted: false
    });

    if (existingReview) {
        throw new Error("You already reviewed this product in this order");
    }

    // 🔥 tạo review
    const review = await Review.create({
        userId,
        productId,
        orderId,
        rating,
        comment
    });

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

    // 🔥 chỉ chủ review mới sửa được
    if (review.userId.toString() !== userId) {
        throw new Error("You can only edit your own review");
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

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

    // 🔥 Hard delete (xóa khỏi DB)
    await Review.findByIdAndDelete(reviewId);

    return true;
};