import { StatusCodes } from "http-status-codes";
import { Report } from "../models/Report.js";
import {
  createProductReportNotification,
  createShopReportNotification,
} from "../services/notificationService.js";
import { Shop } from "../models/Shop.js";
import { Product } from "../models/Product.js";

// ================= LIST =================
export const AdminReportListController = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };

    if (req.query.status) query.status = String(req.query.status).trim();
    if (req.query.targetType)
      query.targetType = String(req.query.targetType).trim();
    if (req.query.category) query.category = String(req.query.category).trim();

    const [items, total] = await Promise.all([
      Report.find(query)
        .populate("reporterId", "email fullName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    return res.status(StatusCodes.OK).json({
      items,
      paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("ADMIN_REPORT_LIST_ERROR:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ================= DETAIL =================
export const AdminReportDetailController = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findOne({ _id: reportId, isDeleted: false })
      .populate("reporterId", "email fullName avatar")
      .populate("timeline.actorId", "email fullName")
      .lean();

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({ report });
  } catch (err) {
    console.error("ADMIN_REPORT_DETAIL_ERROR:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ================= CLASSIFY =================
export const AdminClassifyReportController = async (req, res) => {
  try {
    const { targetType } = req.query;

    const validTargetTypes = ["shop", "product", "user"];
    if (targetType && !validTargetTypes.includes(targetType)) {
      return res.status(400).json({
        message: `Invalid targetType. Must be one of: ${validTargetTypes.join(", ")}`,
      });
    }

    const query = { isDeleted: false };
    if (targetType) query.targetType = targetType;

    const classification = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$targetType",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({ classification });
  } catch (err) {
    console.error("ADMIN_CLASSIFY_REPORT_ERROR:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ================= RESOLVE =================
export const AdminResolveReportController = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { result, reason } = req.body;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const allowedResults = ["confirmed", "rejected", "dismissed"];
    if (!allowedResults.includes(String(result || "").trim())) {
      return res.status(400).json({
        message: `Invalid result. Must be one of: ${allowedResults.join(", ")}`,
      });
    }

    // ================= UPDATE REPORT =================
    report.status = "closed";
    report.result = String(result).trim();
    report.adminNote = String(reason ?? "").trim();

    report.timeline.push({
      action: "closed",
      actorId: req.user?._id || report.reporterId,
      note: "Admin resolved report",
      at: new Date(),
    });

    await report.save();

    // ================= AUTO HANDLE PRODUCT =================
    if (report.result === "confirmed" && report.targetType === "product") {
      const count = await Report.countDocuments({
        targetType: "product",
        targetId: report.targetId,
        result: "confirmed",
        isDeleted: false,
      });

      const product = await Product.findById(report.targetId);

      // 🔥 CHỈ disable, KHÔNG banned
      if (product && count >= 3 && product.activeStatus !== "inactive") {
        await Product.findByIdAndUpdate(report.targetId, {
          activeStatus: "inactive",
          inactiveBy: "admin",
          inactiveReason: "Sản phẩm bị report >= 3 lần",
          inactiveAt: new Date(),
          inactiveActorId: req.user?._id,
        });

        console.log("PRODUCT DISABLED SUCCESSFULLY");
      }
    }

    // ================= HANDLE SHOP =================
    if (report.result === "confirmed" && report.targetType === "shop") {
      const count = await Report.countDocuments({
        targetType: "shop",
        targetId: report.targetId,
        result: "confirmed",
        isDeleted: false,
      });

      if (count >= 3) {
        await Shop.findByIdAndUpdate(report.targetId, {
          activeStatus: "inactive",
          inactiveBy: "admin",
          inactiveReason: "Shop bị report >= 3 lần",
        });

        console.log("SHOP DISABLED SUCCESSFULLY");
      }
    }

    // ================= FIND SELLER =================
    let sellerId = null;

    if (report.targetType === "product" && report.targetSnapshot?.shopId) {
      const shop = await Shop.findById(report.targetSnapshot.shopId).select("ownerId");
      if (shop) sellerId = shop.ownerId;
    }

    if (report.targetType === "shop") {
      const shop = await Shop.findById(report.targetId).select("ownerId");
      if (shop) sellerId = shop.ownerId;
    }

    // ================= NOTIFICATION =================
    if (sellerId) {
      if (report.targetType === "product") {
        await createProductReportNotification({
          userId: sellerId,
          reportId: report._id,
          reportCode: report.code,
          productName: report.targetSnapshot?.name,
          reason: report.reason,
          description: report.description,
        });
      }

      if (report.targetType === "shop") {
        await createShopReportNotification({
          userId: sellerId,
          reportId: report._id,
          reportCode: report.code,
          shopName: report.targetSnapshot?.name,
          reason: report.reason,
          description: report.description,
        });
      }
    }

    return res.json({
      message: "Report resolved successfully",
    });
  } catch (err) {
    console.error("ADMIN_RESOLVE_REPORT_ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};