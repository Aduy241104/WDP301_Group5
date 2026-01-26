import { StatusCodes } from "http-status-codes";
import { Banner } from "../models/Banner.js";

// Public API: Get banners by position
export const getBannersByPosition = async (req, res) => {
    try {
        const { position } = req.params;
        const now = new Date();

        // Validate position
        const validPositions = ["home_top", "home_mid", "home_popup"];
        if (!validPositions.includes(position)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: `Invalid position. Must be one of: ${validPositions.join(", ")}`,
            });
        }

        // Get active banners (not deleted, within date range, sorted by priority)
        const banners = await Banner.find({
            position,
            isDeleted: false,
            startAt: { $lte: now },
            endAt: { $gte: now },
        })
            .select("title imageUrl linkUrl linkType linkTargetId position priority height")
            .sort({ priority: -1, createdAt: -1 })
            .limit(10)
            .lean();

        return res.status(StatusCodes.OK).json({
            position,
            banners,
            count: banners.length,
        });
    } catch (err) {
        console.error("GET_BANNERS_BY_POSITION_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

// -----------------------------
// API trả banner popup hiện tại
export const getPopupBanner = async (req, res) => {
    try {
        const now = new Date();

        const popupBanner = await Banner.findOne({
            position: "home_popup",
            isDeleted: false,
            startAt: { $lte: now },
            endAt: { $gte: now },
        })
            .select("title imageUrl subtitle linkUrl linkType linkTargetId")
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        if (!popupBanner) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No popup banner found" });
        }

        return res.status(StatusCodes.OK).json({ banner: popupBanner });
    } catch (err) {
        console.error("GET_POPUP_BANNER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
// Thêm banner
export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    return res.status(StatusCodes.CREATED).json({ banner });
  } catch (err) {
    console.error("CREATE_BANNER_ERROR:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};

// Cập nhật banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Banner not found" });
    }
    return res.status(StatusCodes.OK).json({ banner });
  } catch (err) {
    console.error("UPDATE_BANNER_ERROR:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};

// Xóa banner (soft delete)
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!banner) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Banner not found" });
    }
    return res.status(StatusCodes.OK).json({ message: "Banner deleted", banner });
  } catch (err) {
    console.error("DELETE_BANNER_ERROR:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
  }
};
