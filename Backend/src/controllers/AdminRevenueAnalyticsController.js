import { StatusCodes } from "http-status-codes";
import { Order } from "../models/Order.js";
import { Shop } from "../models/Shop.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";


// GMV Statistics - View total GMV by day and month
export const AdminGMVStatisticsController = async (req, res) => {
    try {

        const { period = "month" } = req.query;
        const { startDate, endDate } = req.query;

        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const matchStage = {
            ...dateFilter,
            orderStatus: "delivered",
            paymentStatus: "paid",
        };

        let groupBy;
        let dateFormat;

        if (period === "day") {

            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
            };

            dateFormat = {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                },
            };

        } else {

            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
            };

            dateFormat = {
                $dateToString: {
                    format: "%Y-%m",
                    date: "$createdAt",
                },
            };
        }

        const pipeline = [

            { $match: matchStage },

            {
                $group: {
                    _id: groupBy,
                    date: { $first: dateFormat },
                    totalGMV: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" },
                },
            },

            {
                $project: {
                    _id: 0,
                    date: 1,
                    totalGMV: { $round: ["$totalGMV", 2] },
                    orderCount: 1,
                    averageOrderValue: { $round: ["$averageOrderValue", 2] },
                },
            },

            { $sort: { date: 1 } },

        ];

        const statistics = await Order.aggregate(pipeline);

        const totals = await Order.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalGMV: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalGMV: { $round: ["$totalGMV", 2] },
                    totalOrders: 1,
                    averageOrderValue: { $round: ["$averageOrderValue", 2] },
                },
            },
        ]);

        return res.status(StatusCodes.OK).json({
            message: "GMV statistics retrieved successfully",
            period,
            statistics,
            totals: totals[0] || {
                totalGMV: 0,
                totalOrders: 0,
                averageOrderValue: 0,
            },
        });

    } catch (err) {

        console.error("ADMIN_GMV_STATISTICS_ERROR:", err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error."
        });
    }
};



// Revenue by Shop
export const AdminRevenueByShopController = async (req, res) => {

    try {

        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const { startDate, endDate, shopId } = req.query;

        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const shopFilter = {};

        if (shopId) {

            if (!mongoose.Types.ObjectId.isValid(shopId)) {

                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Invalid shopId",
                });

            }

            shopFilter.shop = new mongoose.Types.ObjectId(shopId);
        }

        const matchStage = {
            ...dateFilter,
            ...shopFilter,
            orderStatus: "delivered",
            paymentStatus: "paid",
        };

        const pipeline = [

            { $match: matchStage },

            {
                $group: {
                    _id: "$shop",
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" },
                    subtotal: { $sum: "$subtotal" },
                    shippingFee: { $sum: "$shippingFee" },
                },
            },

            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "_id",
                    as: "shopInfo",
                },
            },

            { $unwind: { path: "$shopInfo", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    _id: 0,
                    shopId: "$_id",
                    shopName: "$shopInfo.name",
                    shopOwnerId: "$shopInfo.ownerId",
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    orderCount: 1,
                    averageOrderValue: { $round: ["$averageOrderValue", 2] },
                    subtotal: { $round: ["$subtotal", 2] },
                    shippingFee: { $round: ["$shippingFee", 2] },
                },
            },

            { $sort: { totalRevenue: -1 } },

            {
                $facet: {
                    items: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{ $count: "count" }],
                },
            },
        ];

        const result = await Order.aggregate(pipeline);

        const items = result[0]?.items || [];
        const total = result[0]?.totalCount[0]?.count || 0;

        return res.status(StatusCodes.OK).json({
            message: "Revenue by shop retrieved successfully",
            items,
            paging: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (err) {

        console.error("ADMIN_REVENUE_BY_SHOP_ERROR:", err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error."
        });
    }
};



// Revenue by Category
export const AdminRevenueByCategoryController = async (req, res) => {

    try {

        const { startDate, endDate } = req.query;

        const dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        const matchStage = {
            ...dateFilter,
            orderStatus: "delivered",
            paymentStatus: "paid",
        };

        const pipeline = [

            { $match: matchStage },

            { $unwind: "$items" },

            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productInfo",
                },
            },

            { $unwind: "$productInfo" },

            {
                $lookup: {
                    from: "shopcategories",
                    localField: "productInfo.shopCategoryId",
                    foreignField: "_id",
                    as: "categoryInfo",
                },
            },

            { $unwind: "$categoryInfo" },

            {
                $group: {

                    _id: "$categoryInfo._id",

                    categoryName: { $first: "$categoryInfo.name" },

                    totalRevenue: {
                        $sum: {
                            $multiply: [
                                "$items.price",
                                "$items.quantity"
                            ]
                        }
                    },

                    totalOrders: { $sum: 1 },

                    totalQuantity: { $sum: "$items.quantity" }

                }
            },

            {
                $project: {
                    _id: 0,
                    categoryId: "$_id",
                    categoryName: 1,
                    totalRevenue: { $round: ["$totalRevenue", 2] },
                    totalOrders: 1,
                    totalQuantity: 1
                }
            },

            { $sort: { totalRevenue: -1 } }

        ];

        const statistics = await Order.aggregate(pipeline);

        return res.status(StatusCodes.OK).json({
            message: "Revenue by category retrieved successfully",
            statistics
        });

    } catch (err) {

        console.error("ADMIN_REVENUE_BY_CATEGORY_ERROR:", err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error."
        });
    }
};