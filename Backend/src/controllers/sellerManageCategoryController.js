import { StatusCodes } from "http-status-codes";
import { ShopCategory } from "../models/ShopCategory.js";

/**
 * GET /api/shop-categories
 * Seller view categories of their shop
 */
export const getSellerCategories = async (req, res) => {
    try {
        const shopId = req.shop._id;

        const categories = await ShopCategory.find({ shopId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Get categories successfully",
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


/**
 * POST /api/shop-categories
 * Seller add new category
 */
export const createCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existed = await ShopCategory.findOne({ shopId, name });

        if (existed) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const newCategory = await ShopCategory.create({
            shopId,
            name
        });

        return res.status(201).json({
            message: "Category created successfully",
            data: newCategory
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
