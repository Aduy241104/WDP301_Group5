import { Report } from "../models/Report.js";
import { Shop } from "../models/Shop.js";
import mongoose from "mongoose";

export const SellerReportListController = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const shops = await Shop.find({ ownerId: sellerId }).select("_id");

    const shopIds = shops.map((s) => s._id);

    const reports = await Report.find({
      "targetSnapshot.shopId": { $in: shopIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("category reason status targetSnapshot createdAt");

    return res.status(200).json({
      reports,
    });
  } catch (err) {
    console.error("SELLER_REPORT_LIST_ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const SellerReportDetailController = async (req, res) => {
  try {
    const { reportId } = req.params;
    const sellerId = req.user.id;

    console.log("===== SELLER REPORT DETAIL =====");
    console.log("reportId:", reportId);
    console.log("sellerId:", sellerId);

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      console.log("Invalid reportId format");
      return res.status(400).json({ message: "Invalid reportId" });
    }

    const report = await Report.findOne({
      _id: reportId,
      isDeleted: false,
    }).lean();

    console.log("report:", report);

    if (!report) {
      console.log("Report not found");
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // kiểm tra quyền seller
    if (report.targetType === "product") {
      const shopId = report.targetSnapshot?.shopId;

      console.log("SnapshotShopId:", shopId);

      if (!shopId) {
        console.log("Snapshot shopId missing");
        return res.status(400).json({
          message: "Invalid report snapshot",
        });
      }

      const shop = await Shop.findById(shopId);

      console.log("Shop found:", shop);
      console.log("Shop ownerId:", shop?.ownerId);
      console.log("Current sellerId:", sellerId);

      if (!shop) {
        console.log("Shop not found");
        return res.status(403).json({
          message: "Shop not found or no permission",
        });
      }

      if (shop.ownerId.toString() !== sellerId.toString()) {
        console.log("Permission denied: seller is not shop owner");
        return res.status(403).json({
          message: "You do not have permission to view this report",
        });
      }
    }

    const sellerReport = {
      _id: report._id,
      targetType: report.targetType,
      category: report.category,
      reason: report.reason,
      description: report.description,
      images: report.images,
      status: report.status,
      createdAt: report.createdAt,
      targetSnapshot: report.targetSnapshot,
    };

    console.log("Return report success");

    return res.status(200).json({
      report: sellerReport,
    });
  } catch (err) {
    console.error("SELLER_REPORT_DETAIL_ERROR:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};