import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";

// ============================================
// USER ORDER & CANCELLATION STATISTICS
// ============================================
// View order statistics grouped by user (admin only)
// Supports:
// - Pagination: page, limit
// - Date range: startDate, endDate (based on order createdAt)
// - Keyword search on user: keyword (fullName, email, phone)
export const AdminUserOrderStatisticsController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const { startDate, endDate } = req.query;
        const keyword = String(req.query.keyword ?? "").trim();

        // Build date filter on orders
        const orderMatch = {};
        if (startDate || endDate) {
            orderMatch.createdAt = {};
            if (startDate) {
                orderMatch.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                orderMatch.createdAt.$lte = new Date(endDate);
            }
        }

        // Aggregate statistics from orders grouped by userId
        const pipeline = [
            { $match: orderMatch },
            {
                $group: {
                    _id: "$userId",
                    totalOrders: { $sum: 1 },
                    deliveredOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0],
                        },
                    },
                    cancelledOrders: {
                        $sum: {
                            $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0],
                        },
                    },
                    totalAmount: { $sum: "$totalAmount" },
                    firstOrderAt: { $min: "$createdAt" },
                    lastOrderAt: { $max: "$createdAt" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ];

        // Build user filter after lookup (keyword only)
        const userMatch = {};
        if (keyword) {
            userMatch.$or = [
                { "user.fullName": { $regex: keyword, $options: "i" } },
                { "user.email": { $regex: keyword, $options: "i" } },
                { "user.phone": { $regex: keyword, $options: "i" } },
            ];
        }
        if (Object.keys(userMatch).length > 0) {
            pipeline.push({ $match: userMatch });
        }

        // Compute overall totals (across all matched users)
        pipeline.push(
            {
                $project: {
                    _id: 1,
                    user: {
                        _id: "$user._id",
                        email: "$user.email",
                        fullName: "$user.fullName",
                        phone: "$user.phone",
                        role: "$user.role",
                        status: "$user.status",
                        createdAt: "$user.createdAt",
                    },
                    totalOrders: 1,
                    deliveredOrders: 1,
                    cancelledOrders: 1,
                    totalAmount: 1,
                    firstOrderAt: 1,
                    lastOrderAt: 1,
                },
            },
            {
                $facet: {
                    items: [
                        { $sort: { totalOrders: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    totalCount: [{ $count: "count" }],
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalUsers: { $sum: 1 },
                                totalOrders: { $sum: "$totalOrders" },
                                totalDelivered: { $sum: "$deliveredOrders" },
                                totalCancelled: { $sum: "$cancelledOrders" },
                                totalAmount: { $sum: "$totalAmount" },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                totalUsers: 1,
                                totalOrders: 1,
                                totalDelivered: 1,
                                totalCancelled: 1,
                                totalAmount: { $round: ["$totalAmount", 2] },
                                cancellationRate: {
                                    $cond: [
                                        { $gt: ["$totalOrders", 0] },
                                        {
                                            $round: [
                                                {
                                                    $multiply: [
                                                        {
                                                            $divide: [
                                                                "$totalCancelled",
                                                                "$totalOrders",
                                                            ],
                                                        },
                                                        100,
                                                    ],
                                                },
                                                2,
                                            ],
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    ],
                },
            }
        );

        const result = await Order.aggregate(pipeline);
        const facet = result[0] || {};
        const items = facet.items || [];
        const total = facet.totalCount?.[0]?.count || 0;
        const overall = facet.overall?.[0] || {
            totalUsers: 0,
            totalOrders: 0,
            totalDelivered: 0,
            totalCancelled: 0,
            totalAmount: 0,
            cancellationRate: 0,
        };

        // Enrich with computed per-user cancellation rate
        const enrichedItems = items.map((row) => {
            const { totalOrders: tOrders = 0, cancelledOrders: cOrders = 0 } = row;
            const cancellationRate =
                tOrders > 0 ? Number(((cOrders / tOrders) * 100).toFixed(2)) : 0;

            return {
                ...row,
                cancellationRate,
            };
        });

        return res.status(StatusCodes.OK).json({
            items: enrichedItems,
            paging: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            overall,
        });
    } catch (err) {
        console.error("ADMIN_USER_ORDER_STATS_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

