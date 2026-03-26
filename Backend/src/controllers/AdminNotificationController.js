import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Report } from "../models/Report.js";
import { Shop } from "../models/Shop.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";

/**
 * GET /api/admin/sellers/notify-candidates
 * Danh sách seller đang active để admin chọn gửi thông báo (không cần biết Mongo ID).
 */
export const AdminSellerNotifyCandidatesController = async (req, res) => {
    try {
        const keyword = String(req.query.keyword ?? "").trim();
        const limit = Math.min(500, Math.max(1, Number(req.query.limit ?? 300)));

        const filter = { role: "seller", status: "active" };
        if (keyword) {
            filter.$or = [
                { fullName: { $regex: keyword, $options: "i" } },
                { email: { $regex: keyword, $options: "i" } },
                { phone: { $regex: keyword, $options: "i" } },
            ];
        }

        const items = await User.find(filter)
            .select("_id email fullName phone")
            .sort({ fullName: 1, email: 1 })
            .limit(limit)
            .lean();

        return res.status(StatusCodes.OK).json({
            items: items.map((u) => ({
                _id: u._id,
                email: u.email,
                fullName: u.fullName,
                phone: u.phone ?? "",
            })),
            totalReturned: items.length,
        });
    } catch (err) {
        console.error("ADMIN_SELLER_NOTIFY_CANDIDATES_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

async function resolveSellerUserIdFromReport(report) {
    if (report.targetType === "shop") {
        const shop = await Shop.findOne({
            _id: report.targetId,
            isDeleted: false,
        })
            .select("ownerId")
            .lean();
        return shop?.ownerId ?? null;
    }

    if (report.targetType === "product") {
        const product = await Product.findOne({
            _id: report.targetId,
            isDeleted: false,
        })
            .select("shopId")
            .lean();
        if (!product?.shopId) return null;
        const shop = await Shop.findOne({
            _id: product.shopId,
            isDeleted: false,
        })
            .select("ownerId")
            .lean();
        return shop?.ownerId ?? null;
    }

    if (report.targetType === "user") {
        const user = await User.findById(report.targetId).select("role").lean();
        if (user?.role === "seller") {
            return report.targetId;
        }
        return null;
    }

    return null;
}

/**
 * POST /api/admin/reports/:reportId/notify-seller
 * Gửi thông báo kết quả xử lý khiếu nại tới seller liên quan.
 */
export const AdminNotifySellerReportResultController = async (req, res) => {
    try {
        const { reportId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid reportId." });
        }

        const message = String(req.body.message ?? "").trim();
        const title = String(req.body.title ?? "").trim() || "Kết quả xử lý khiếu nại";
        const reportResult = String(req.body.reportResult ?? "").trim();
        const reportReason = String(req.body.reportReason ?? "").trim();

        if (!message) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "message is required." });
        }

        const report = await Report.findOne({ _id: reportId, isDeleted: false }).lean();
        if (!report) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Report not found." });
        }

        const sellerUserId = await resolveSellerUserIdFromReport(report);
        if (!sellerUserId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:
                    "Could not resolve a seller for this report (shop/product owner or reported user must be seller).",
            });
        }

        const reportCode = String(report._id).slice(-8).toUpperCase();

        await Notification.create({
            userId: sellerUserId,
            type: "report_result",
            title,
            message,
            reportId: report._id,
            targetRole: "seller",
            isBroadcast: false,
            data: {
                reportCode,
                reportResult: reportResult || report.status || "",
                reportReason: reportReason || report.reason || "",
                // Seller system route for report detail
                url: `/seller/reports/${report._id}`,
            },
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Notification sent to seller.",
            sellerUserId,
        });
    } catch (err) {
        console.error("ADMIN_NOTIFY_SELLER_REPORT_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/admin/notifications/broadcast-sellers
 * Gửi thông báo hệ thống tới tất cả seller (active, không bị block).
 */
export const AdminBroadcastSellersNotificationController = async (req, res) => {
    try {
        const title = String(req.body.title ?? "").trim();
        const message = String(req.body.message ?? "").trim();

        if (!title || !message) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "title and message are required.",
            });
        }

        const sellers = await User.find({
            role: "seller",
            status: "active",
        })
            .select("_id")
            .lean();

        if (!sellers.length) {
            return res.status(StatusCodes.OK).json({
                message: "No active sellers found.",
                inserted: 0,
            });
        }

        const docs = sellers.map((u) => ({
            userId: u._id,
            type: "system",
            title,
            message,
            targetRole: "seller",
            isBroadcast: true,
            data: { url: "" },
        }));

        const inserted = await Notification.insertMany(docs);

        return res.status(StatusCodes.CREATED).json({
            message: "Broadcast notifications created.",
            inserted: inserted.length,
        });
    } catch (err) {
        console.error("ADMIN_BROADCAST_SELLERS_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

/**
 * POST /api/admin/notifications/selected-sellers
 * Gửi thông báo hệ thống tới một số seller cụ thể (theo User._id).
 * Body: { title, message, sellerUserIds: string[] }
 */
export const AdminNotifySelectedSellersController = async (req, res) => {
    try {
        const title = String(req.body.title ?? "").trim();
        const message = String(req.body.message ?? "").trim();
        const rawIds = req.body.sellerUserIds ?? req.body.userIds;

        if (!title || !message) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "title and message are required.",
            });
        }

        if (!Array.isArray(rawIds) || rawIds.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "sellerUserIds must be a non-empty array of user ObjectIds.",
            });
        }

        const uniqueStrings = [
            ...new Set(
                rawIds
                    .map((id) => String(id ?? "").trim())
                    .filter(Boolean)
            ),
        ];

        const objectIds = [];
        const invalidIds = [];
        for (const s of uniqueStrings) {
            if (mongoose.Types.ObjectId.isValid(s)) {
                objectIds.push(new mongoose.Types.ObjectId(s));
            } else {
                invalidIds.push(s);
            }
        }

        if (objectIds.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "No valid ObjectIds in sellerUserIds.",
                invalidIds,
            });
        }

        const users = await User.find({
            _id: { $in: objectIds },
            role: "seller",
            status: "active",
        })
            .select("_id")
            .lean();

        const foundSet = new Set(users.map((u) => String(u._id)));
        const notSellerOrInactive = objectIds
            .map((id) => String(id))
            .filter((id) => !foundSet.has(id));

        if (users.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "No matching active sellers for the given IDs.",
                invalidIds,
                notSellerOrInactive: notSellerOrInactive.map((id) => id),
            });
        }

        const docs = users.map((u) => ({
            userId: u._id,
            type: "system",
            title,
            message,
            targetRole: "seller",
            isBroadcast: false,
            data: { url: "" },
        }));

        const inserted = await Notification.insertMany(docs);

        return res.status(StatusCodes.CREATED).json({
            message: "Notifications sent to selected sellers.",
            inserted: inserted.length,
            invalidIds: invalidIds.length ? invalidIds : undefined,
            skippedNotSellerOrInactive: notSellerOrInactive.length ? notSellerOrInactive : undefined,
        });
    } catch (err) {
        console.error("ADMIN_NOTIFY_SELECTED_SELLERS_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
