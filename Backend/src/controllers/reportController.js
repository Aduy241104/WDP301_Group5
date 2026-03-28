import { StatusCodes } from "http-status-codes";
import { Report } from "../models/Report.js";
import { Product } from "../models/Product.js";
import { Shop } from "../models/Shop.js";
import mongoose from "mongoose";

async function ensureCanCreateReport({ reporterId, targetType, targetId }) {
  if (!reporterId) {
    const err = new Error("Unauthorized.");
    err.status = StatusCodes.UNAUTHORIZED;
    throw err;
  }

  if (!targetType || !targetId) {
    const err = new Error("Missing targetType/targetId");
    err.status = StatusCodes.BAD_REQUEST;
    throw err;
  }

  const latest = await Report.findOne({
    reporterId,
    targetType,
    targetId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .select("_id status result createdAt")
    .lean();

  // Rule: mỗi customer chỉ report 1 lần, cho tới khi admin confirmed thì mới được report lại
  if (latest && latest.result !== "confirmed") {
    const err = new Error(
      "Bạn đã report mục này rồi. Vui lòng chờ admin xác nhận trước khi report lại.",
    );
    err.status = StatusCodes.CONFLICT; // 409
    throw err;
  }
}

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

    await ensureCanCreateReport({ reporterId, targetType, targetId });

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

    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
    });
  }
};

// ============================================
// SEND PRODUCT REPORT (customer)
// ============================================
export const sendProductReport = async (req, res) => {
  try {
    const reporterId = req.user?.id;

    const {
      productId,
      category,
      reason,
      description,
      images = [],
    } = req.body;

    if (!productId || !category || !reason) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }

    await ensureCanCreateReport({
      reporterId,
      targetType: "product",
      targetId: productId,
    });

    // Reuse createReport's behavior by calling the same logic inline
    const product = await Product.findById(productId).select(
      "_id name slug shopId",
    );

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Product not found",
      });
    }

    const report = await Report.create({
      reporterId,
      targetType: "product",
      targetId: productId,
      targetSnapshot: {
        name: product.name,
        slug: product.slug,
        shopId: product.shopId,
      },
      category,
      reason,
      description: description ?? "",
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
      message: "Product report created successfully",
      report,
    });
  } catch (err) {
    console.error("SEND_PRODUCT_REPORT_ERROR:", err);

    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
    });
  }
};

// ============================================
// SEND SHOP REPORT (customer)
// ============================================
export const sendShopReport = async (req, res) => {
  try {
    const reporterId = req.user?.id;

    const { shopId, category, reason, description, images = [] } = req.body;

    if (!shopId || !category || !reason) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields",
      });
    }

    await ensureCanCreateReport({
      reporterId,
      targetType: "shop",
      targetId: shopId,
    });

    const shop = await Shop.findById(shopId).select("_id name");

    if (!shop) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Shop not found",
      });
    }

    // Important: targetSnapshot.shopId is required for seller list report query
    const report = await Report.create({
      reporterId,
      targetType: "shop",
      targetId: shop._id,
      targetSnapshot: {
        name: shop.name,
        slug: "",
        shopId: shop._id,
      },
      category,
      reason,
      description: description ?? "",
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
      message: "Shop report created successfully",
      report,
    });
  } catch (err) {
    console.error("SEND_SHOP_REPORT_ERROR:", err);

    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Server error",
    });
  }
};

export const checkReport = async (req, res) => {
  try {
    const reporterId = req.user?.id;
    const { targetType, targetId } = req.query;

    const report = await Report.findOne({
      reporterId,
      targetType,
      targetId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    if (!report) {
      return res.json({ reported: false });
    }

    if (report.result !== "confirmed") {
      return res.json({ reported: true });
    }

    return res.json({ reported: false });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


export const SellerShopReportListController = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // lấy tất cả shop của seller
    const shops = await Shop.find({ ownerId: sellerId }).select("_id name");

    const shopIds = shops.map((s) => s._id);

    // lấy report của shop
    const reports = await Report.find({
      targetType: "shop",
      targetId: { $in: shopIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("category reason status targetSnapshot createdAt targetId");

    return res.status(200).json({
      reports,
    });
  } catch (err) {
    console.error("SELLER_SHOP_REPORT_LIST_ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};