import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { sendEmail } from "../services/emailService.js";

/**
 * POST /api/admin/emails/send-selected
 */
export const AdminSendEmailToSelectedSellers = async (req, res) => {
  try {
    const { subject, html, text, sellerUserIds } = req.body;

    if (!subject || (!html && !text)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "subject + content required",
      });
    }

    if (!Array.isArray(sellerUserIds) || sellerUserIds.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "sellerUserIds must be non-empty array",
      });
    }

    const objectIds = sellerUserIds
      .map((id) => String(id))
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const users = await User.find({
      _id: { $in: objectIds },
      role: "seller",
      status: "active",
    }).select("_id email");

    if (!users.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "No active sellers found",
      });
    }

    let success = 0;
    let failed = 0;

    for (const user of users) {
      const noti = await Notification.create({
        userId: user._id,
        type: "system",
        title: subject,
        message: text || "",
        targetRole: "seller",

        data: {
          email: true,
          emailStatus: "pending",
          subject,
        },
      });

      try {
        await sendEmail({
          to: user.email,
          subject,
          html,
          text,
        });

        noti.data.emailStatus = "sent";
        noti.data.sentAt = new Date();
        success++;
      } catch (err) {
        noti.data.emailStatus = "failed";
        noti.data.emailError = err.message;
        failed++;
      }

      await noti.save();
    }

    return res.status(StatusCodes.OK).json({
      message: "Emails processed",
      success,
      failed,
      total: users.length,
    });
  } catch (err) {
    console.error("SEND_EMAIL_ERROR:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

/**
 * POST /api/admin/emails/broadcast
 */
export const AdminBroadcastEmailToSellers = async (req, res) => {
  try {
    const { subject, html, text } = req.body;

    if (!subject || (!html && !text)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "subject + content required",
      });
    }

    const sellers = await User.find({
      role: "seller",
      status: "active",
    }).select("_id email");

    let success = 0;
    let failed = 0;

    for (const user of sellers) {
      const noti = await Notification.create({
        userId: user._id,
        type: "system",
        title: subject,
        message: text || "",
        targetRole: "seller",
        isBroadcast: true,

        data: {
          email: true,
          emailStatus: "pending",
          subject,
        },
      });

      try {
        await sendEmail({
          to: user.email,
          subject,
          html,
          text,
        });

        noti.data.emailStatus = "sent";
        noti.data.sentAt = new Date();
        success++;
      } catch (err) {
        noti.data.emailStatus = "failed";
        noti.data.emailError = err.message;
        failed++;
      }

      await noti.save();
    }

    return res.status(StatusCodes.OK).json({
      message: "Broadcast done",
      success,
      failed,
      total: sellers.length,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "error",
    });
  }
};

/**
 * GET /api/admin/emails
 */
export const AdminGetEmailHistory = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const query = {
      type: "system",
      targetRole: "seller",
      "data.email": true,
    };

    const items = await Notification.find(query)
      .populate("userId", "email fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return res.status(StatusCodes.OK).json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "error",
    });
  }
};