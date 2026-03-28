import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { SellerEmailLog } from "../models/SellerEmailLog.js";
import { sendCustomEmail } from "../utils/mailer.js";

// ============================================
// ADMIN: SEND EMAIL TO SELLER
// POST /api/admin/seller-emails/send
// ============================================
export const AdminSendSellerEmailController = async (req, res) => {
  try {
    const adminId = req.user.id;

    const {
      sellerId,
      subject,
      content,
      contentType = "text", // "text" | "html"
    } = req.body;

    if (!sellerId || !subject || !content) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Missing required fields: sellerId, subject, content",
      });
    }

    const seller = await User.findOne({ _id: sellerId, role: "seller" })
      .select("_id email fullName")
      .lean();

    if (!seller) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Seller not found",
      });
    }

    const html = contentType === "html" ? String(content) : undefined;
    const text = contentType !== "html" ? String(content) : undefined;

    let log;
    try {
      await sendCustomEmail({
        to: seller.email,
        subject,
        html,
        text,
      });

      log = await SellerEmailLog.create({
        adminId,
        sellerId: seller._id,
        toEmail: seller.email,
        subject,
        content: String(content),
        status: "sent",
      });
    } catch (mailErr) {
      log = await SellerEmailLog.create({
        adminId,
        sellerId: seller._id,
        toEmail: seller.email,
        subject,
        content: String(content),
        status: "failed",
        error: mailErr?.message || "Failed to send email",
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Send seller email finished",
      data: log,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

// ============================================
// ADMIN: VIEW LIST SENT EMAILS (SELLERS)
// GET /api/admin/seller-emails
// ============================================
export const AdminSellerEmailListController = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const sellerId = req.query.sellerId ? String(req.query.sellerId) : null;
    const status = req.query.status ? String(req.query.status).trim() : null;

    if (status && !["sent", "failed"].includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid status. Must be: sent, failed",
      });
    }

    const filter = {};
    if (sellerId) filter.sellerId = sellerId;
    if (status) filter.status = status;

    const [total, items] = await Promise.all([
      SellerEmailLog.countDocuments(filter),
      SellerEmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sellerId", "_id email fullName role status")
        .lean(),
    ]);

    return res.status(StatusCodes.OK).json({
      message: "Get seller email list success",
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

