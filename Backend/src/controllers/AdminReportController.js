import { StatusCodes } from "http-status-codes";
import { Report } from "../models/Report.js";
import { createReportResultNotification } from "../services/notificationService.js";
import { Shop } from "../models/Shop.js";

// View Report List
export const AdminReportListController = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    const status = String(req.query.status ?? "").trim();
    if (status) query.status = status;

    const targetType = String(req.query.targetType ?? "").trim();
    if (targetType) query.targetType = targetType;

    const category = String(req.query.category ?? "").trim();
    if (category) query.category = category;

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
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

// View Report Detail
export const AdminReportDetailController = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findOne({ _id: reportId, isDeleted: false })
      .populate("reporterId", "email fullName avatar")
      .populate("timeline.actorId", "email fullName")
      .lean();

    if (!report) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Report not found" });
    }

    return res.status(StatusCodes.OK).json({
      report,
    });
  } catch (err) {
    console.error("ADMIN_REPORT_DETAIL_ERROR:", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

// Classify Report - Classify reports by shop, product, or user
export const AdminClassifyReportController = async (req, res) => {
  try {
    const { targetType } = req.query;
    const validTargetTypes = ["shop", "product", "user"];
    if (targetType && !validTargetTypes.includes(targetType)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Invalid targetType. Must be one of: ${validTargetTypes.join(", ")}`,
      });
    }
    const query = { isDeleted: false };
    if (targetType) {
      query.targetType = targetType;
    }

    // Group by targetType and count
    const classification = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$targetType",
          count: { $sum: 1 },
          reports: {
            $push: {
              _id: "$_id",
              reporterId: "$reporterId",
              targetId: "$targetId",
              category: "$category",
              status: "$status",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          targetType: "$_id",
          count: 1,
          reports: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get total counts
    const totalByType = await Report.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$targetType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          targetType: "$_id",
          count: 1,
        },
      },
    ]);

    const summary = {
      total: await Report.countDocuments({ isDeleted: false }),
      byType: totalByType.reduce((acc, item) => {
        acc[item.targetType] = item.count;
        return acc;
      }, {}),
    };

    return res.status(StatusCodes.OK).json({
      message: "Reports classified successfully",
      summary,
      classification: targetType ? classification : null,
      details: targetType ? classification[0]?.reports || [] : null,
    });
  } catch (err) {
    console.error("ADMIN_CLASSIFY_REPORT_ERROR:", err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error." });
  }
};

export const AdminResolveReportController = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { result, reason } = req.body;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let sellerId = null;

    // Nếu report PRODUCT
    if (report.targetType === "product" && report.targetSnapshot?.shopId) {
      const shop = await Shop.findById(report.targetSnapshot.shopId).select(
        "ownerId",
      );

      if (shop) {
        sellerId = shop.ownerId;
      }
    }

    // Nếu report SHOP
    if (report.targetType === "shop") {
      const shop = await Shop.findById(report.targetId).select("ownerId");

      if (shop) {
        sellerId = shop.ownerId;
      }
    }

    // update report
    report.status = "closed";
    report.result = result;
    report.reason = reason;

    report.timeline.push({
      action: "closed",
      actorId: req.user?._id || report.reporterId,
      note: "Admin resolved report",
      at: new Date(),
    });

    await report.save();

    // gửi notification cho seller
    if (sellerId) {
      await createReportResultNotification({
        userId: sellerId,
        reportId: report._id,
        reportCode: report.code,
        targetType: report.targetType,
        targetName: report.targetSnapshot?.name,
        reason: report.reason,
        description: report.description,
        targetRole: "seller",
      });
    }

    res.json({
      message: "Report resolved and notification sent",
    });
  } catch (err) {
    console.error("ADMIN_RESOLVE_REPORT_ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
