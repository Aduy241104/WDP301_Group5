import { Report } from "../models/Report.js";
import { Shop } from "../models/Shop.js";
import mongoose from "mongoose";

export const SellerReportListController = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const shops = await Shop.find({ ownerId: sellerId }).select("_id name");

    const shopMap = {};
    shops.forEach((s) => {
      shopMap[s._id.toString()] = s.name;
    });

    const shopIds = shops.map((s) => s._id);

    const reports = await Report.find({
      "targetSnapshot.shopId": { $in: shopIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("category reason status targetSnapshot createdAt");

    const formattedReports = reports.map((r) => ({
      _id: r._id,
      category: r.category,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,

      target: {
        id: r.targetSnapshot?.shopId,
        name:
          r.targetSnapshot?.name || // product name
          "—",
      },
    }));

    return res.status(200).json({
      reports: formattedReports,
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

    // ❌ validate id
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: "Invalid reportId" });
    }

    const report = await Report.findOne({
      _id: reportId,
      isDeleted: false,
    }).lean();

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    let shopName = null;

    // ==============================
    // 🔥 CHECK PERMISSION + GET NAME
    // ==============================

    if (report.targetType === "product") {
      const shopId = report.targetSnapshot?.shopId;

      if (!shopId) {
        return res.status(400).json({
          message: "Invalid report snapshot",
        });
      }

      const shop = await Shop.findById(shopId).select("name ownerId");

      if (!shop) {
        return res.status(403).json({
          message: "Shop not found",
        });
      }

      if (shop.ownerId.toString() !== sellerId.toString()) {
        return res.status(403).json({
          message: "No permission",
        });
      }

      shopName = shop.name;
    } else if (report.targetType === "shop") {
      const shop = await Shop.findById(report.targetId).select("name ownerId");

      if (!shop) {
        return res.status(403).json({
          message: "Shop not found",
        });
      }

      if (shop.ownerId.toString() !== sellerId.toString()) {
        return res.status(403).json({
          message: "No permission",
        });
      }

      shopName = shop.name;
    }

    // ==============================
    // 🔥 RESPONSE CHUẨN HÓA
    // ==============================

    const sellerReport = {
      _id: report._id,
      targetType: report.targetType,
      category: report.category,
      reason: report.reason,
      description: report.description,
      images: report.images,
      status: report.status,
      createdAt: report.createdAt,

      // 👇 unify data cho FE
      target: {
        id: report.targetId || report.targetSnapshot?.shopId,
        name:
          report.targetSnapshot?.name || // product
          shopName || // shop
          report.targetSnapshot?.shopName ||
          "—",
      },
    };

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
export const SellerShopReportListController = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const shops = await Shop.find({ ownerId: sellerId }).select("_id name");

    const shopMap = {};
    shops.forEach((s) => {
      shopMap[s._id.toString()] = s.name;
    });

    const shopIds = shops.map((s) => s._id);

    const reports = await Report.find({
      targetType: "shop",
      targetId: { $in: shopIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("category reason status createdAt targetId");

    // 🔥 map thêm shopName
    const formattedReports = reports.map((r) => ({
      _id: r._id,
      category: r.category,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt,

      target: {
        id: r.targetId,
        name: shopMap[r.targetId.toString()] || "—",
      },
    }));

    return res.status(200).json({
      reports: formattedReports,
    });

  } catch (err) {
    console.error("SELLER_SHOP_REPORT_LIST_ERROR:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
