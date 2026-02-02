import { CategorySchema } from "../models/CategorySchema.js";

/**
 * GET /category-schemas
 * Lấy danh sách category schema cho seller chọn
 */
export const getCategorySchemas = async (req, res) => {
  try {
    const schemas = await CategorySchema.find({
      isDeleted: false,
      isActive: true, // nếu có
    })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Lấy danh sách category schema thành công",
      data: schemas,
    });
  } catch (error) {
    console.error("getCategorySchemas error:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách category schema",
    });
  }
};
