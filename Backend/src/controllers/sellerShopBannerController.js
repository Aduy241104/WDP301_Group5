import mongoose from "mongoose";
import { Banner } from "../models/Banner.js";

/**
 * Map position UI → enum trong schema
 */
const POSITION_MAP = {
  top: "home_top",
  slider: "home_mid",
  popup: "home_popup",
};

const normalizePosition = (position) => {
  if (!position) return undefined;
  return POSITION_MAP[position] || position;
};



// ================= GET =================
export const getShopBanners = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const query = {
      createdBy: req.user.id,
      isDeleted: false,
    };

    if (req.query.position) {
      query.position = normalizePosition(req.query.position);
    }

    const banners = await Banner.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= CREATE =================
export const addShopBanner = async (req, res) => {
  try {
    const {
      title,
      imageUrl,
      linkUrl = "",
      linkType,
      linkTargetId = null,
      position,
      priority = 0,
      startAt,
      endAt,
    } = req.body;

    // 🔥 VALIDATION TRƯỚC KHI CREATE
    if (!title || !imageUrl || !linkType || !position || !startAt || !endAt) {
      return res.status(400).json({
        message:
          "Thiếu field bắt buộc: title, imageUrl, linkType, position, startAt, endAt",
      });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        message: "startAt hoặc endAt không hợp lệ",
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        message: "endAt phải lớn hơn startAt",
      });
    }

    let validatedLinkTargetId = null;
    if (linkTargetId && mongoose.Types.ObjectId.isValid(linkTargetId)) {
      validatedLinkTargetId = new mongoose.Types.ObjectId(linkTargetId);
    }

    const banner = await Banner.create({
      title,
      imageUrl,
      linkUrl,
      linkType,
      linkTargetId: validatedLinkTargetId,
      position: normalizePosition(position),
      priority: Number(priority),
      startAt: startDate,
      endAt: endDate,

      // 🔥 AUTO GÁN SELLER
      createdBy: req.user.id,
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// ================= UPDATE =================
export const updateShopBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findOne({
      _id: id,
      createdBy: req.user.id,
      isDeleted: false,
    });

    if (!banner) {
      return res.status(404).json({
        message: "Không tìm thấy banner hoặc không có quyền",
      });
    }

    if (req.body.position) {
      req.body.position = normalizePosition(req.body.position);
    }

    if (req.body.startAt) {
      const startDate = new Date(req.body.startAt);
      if (isNaN(startDate)) {
        return res.status(400).json({ message: "startAt không hợp lệ" });
      }
      banner.startAt = startDate;
    }

    if (req.body.endAt) {
      const endDate = new Date(req.body.endAt);
      if (isNaN(endDate)) {
        return res.status(400).json({ message: "endAt không hợp lệ" });
      }
      banner.endAt = endDate;
    }

    Object.assign(banner, req.body);

    banner.updatedBy = req.user._id;

    await banner.save();

    res.status(200).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// ================= DELETE (SOFT DELETE) =================
export const deleteShopBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findOne({
      _id: id,
      createdBy: req.user.id,
      isDeleted: false,
    });

    if (!banner) {
      return res.status(404).json({
        message: "Không tìm thấy banner hoặc không có quyền",
      });
    }

    banner.isDeleted = true;
    banner.deletedAt = new Date();
    banner.deletedBy = req.user._id;

    await banner.save();

    res.status(200).json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};