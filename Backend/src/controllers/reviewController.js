import { getProductReviews, createReview, updateReviewService, deleteReviewService } from "../services/reviewService.js";

export const viewProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 5, rating } = req.query;

        const data = await getProductReviews({
            productId,
            page: Number(page),
            limit: Number(limit),
            rating
        });

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("View reviews error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
export const addReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, orderId, rating, comment } = req.body;

        if (!productId || !orderId || !rating) {
            return res.status(400).json({
                success: false,
                message: "productId, orderId and rating are required",
            });
        }

        const review = await createReview({
            userId,
            productId,
            orderId,
            rating,
            comment,
        });

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: review,
        });

    } catch (error) {
        console.error("Add review error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await updateReviewService({
            reviewId,
            userId,
            rating,
            comment
        });

        return res.json({
            success: true,
            message: "Review updated successfully",
            data: review
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const deleteReview = async (req, res) => {
    try {

        const userId = req.user.id;
        const { reviewId } = req.params;

        await deleteReviewService({
            reviewId,
            userId
        });

        return res.json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};
