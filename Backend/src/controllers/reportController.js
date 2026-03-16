import { StatusCodes } from "http-status-codes";
import { Report } from "../models/Report.js";
import { Product } from "../models/Product.js";

export const createReport = async (req, res) => {
  try {
    const reporterId = req.user?.id;

    const {
      targetType,
      targetId,
      category,
      reason,
      description,
      images = [],
    } = req.body;

    if (!targetType || !targetId || !category || !reason) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }

    let targetSnapshot = null;

    // nếu report product
    if (targetType === "product") {
      const product = await Product.findById(targetId).select(
        "_id name slug shopId"
      );

      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Product not found",
        });
      }

      targetSnapshot = {
        name: product.name,
        slug: product.slug,
        shopId: product.shopId,
      };
    }

    const report = await Report.create({
      reporterId,
      targetType,
      targetId,
      targetSnapshot,
      category,
      reason,
      description,
      images,
      timeline: [
        {
          action: "created",
          actorId: reporterId,
          note: "User tạo report",
        },
      ],
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Report created successfully",
      report,
    });
  } catch (err) {
    console.error("CREATE_REPORT_ERROR:", err);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
    });
  }
};