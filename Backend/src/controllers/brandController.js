import { Brand } from "../models/Brand.js";

/**
 * GET /brands
 * Lấy danh sách brand (cho seller chọn)
 */
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({
      isDeleted: false,
      isActive: true, // nếu bạn có field này
    })
      .select("_id name")
      .sort({ name: 1 });

    return res.status(200).json({
      message: "Lấy danh sách brand thành công",
      data: brands,
    });
  } catch (error) {
    console.error("getBrands error:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy danh sách brand",
    });
  }
};
