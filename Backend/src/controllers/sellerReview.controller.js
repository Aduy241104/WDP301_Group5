import mongoose from "mongoose";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";

// Get reviews for a product or grouped by product for seller's products
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.query;

    if (productId) {
      const reviews = await Review.find({ productId, isDeleted: false })
        .populate("userId", "name email")
        .sort({ createdAt: -1 });
      return res.json(reviews);
    }

    // grouped by product: return avg rating and count for products
    const grouped = await Review.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          avgRating: 1,
          count: 1,
          productName: "$product.name",
        },
      },
    ]);

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reply to a review (seller)
export const replyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, shopId } = req.body;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.sellerReply = {
      shopId: shopId ? mongoose.Types.ObjectId(shopId) : undefined,
      message,
      createdAt: new Date(),
    };

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Review statistics: weekly or monthly
export const getReviewStats = async (req, res) => {
  try {
    const { period = "month" } = req.query; // 'week' or 'month'

    if (period === "week") {
      // last 7 days: group by day
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 6);
      from.setHours(0,0,0,0);

      const stats = await Review.aggregate([
        { $match: { createdAt: { $gte: from }, isDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.json(stats);
    }

    // monthly - last 12 months
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const stats = await Review.aggregate([
      { $match: { createdAt: { $gte: start }, isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
