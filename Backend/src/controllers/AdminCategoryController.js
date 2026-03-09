import { StatusCodes } from "http-status-codes";
import { CategorySchema } from "../models/CategorySchema.js";

/**
 * GET /api/admin/categories
 * Admin lấy danh sách category để dùng cho form chọn
 */
export const getAdminCategories = async (req, res) => {
  try {

    const categories = await CategorySchema.find({
      isDeleted: false,
      isActive: true
    })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(StatusCodes.OK).json(categories);

  } catch (error) {

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message
    });

  }
};