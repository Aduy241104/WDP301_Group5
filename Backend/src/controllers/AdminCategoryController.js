import { StatusCodes } from "http-status-codes";
import { ShopCategory } from "../models/ShopCategory.js";

/**
 * GET /api/admin/categories
 * Admin lấy danh sách category để dùng cho form chón
 */
export const getAdminCategories = async (req, res) => {
    try {

        const categories = await ShopCategory.find()
            .select("_id name")
            .sort({ name: 1 });

        return res.status(StatusCodes.OK).json(categories);

    } catch (error) {

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });

    }
};

