import { Order } from "../models/Order.js";
import { StatusCodes } from "http-status-codes";

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

      // JOIN PRODUCT
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },

      { $unwind: "$productInfo" },

      // JOIN CATEGORY SCHEMA
      {
        $lookup: {
          from: "categoryschemas",
          localField: "productInfo.categorySchemaId",
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
              $multiply: ["$items.price", "$items.quantity"]
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
          totalRevenue: 1,
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