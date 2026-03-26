import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { CategorySchema } from "../models/CategorySchema.js";

/**
 * GET /api/admin/Category
 * Danh mục đang hoạt động (cho dropdown form brand / seller)
 */
export const getAdminCategories = async (req, res) => {
    try {
        const categories = await CategorySchema.find({
            isDeleted: false,
            isActive: true,
        })
            .select("_id name")
            .sort({ name: 1 });

        return res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};

/**
 * GET /api/admin/Category/manage
 * Danh sách đầy đủ cho admin (phân trang)
 */
export const listAdminCategories = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            CategorySchema.find({ isDeleted: false })
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CategorySchema.countDocuments({ isDeleted: false }),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0,
            },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};

/**
 * GET /api/admin/Category/:id
 */
export const getAdminCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid category id." });
        }

        const category = await CategorySchema.findOne({
            _id: id,
            isDeleted: false,
        }).lean();

        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Category not found." });
        }

        return res.status(StatusCodes.OK).json(category);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};

/**
 * POST /api/admin/Category
 */
export const createAdminCategory = async (req, res) => {
    try {
        const name = String(req.body.name ?? "").trim();
        const isActive = req.body.isActive !== false;

        if (!name) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "name is required." });
        }

        const dup = await CategorySchema.findOne({
            name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
            isDeleted: false,
        });

        if (dup) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Category name already exists." });
        }

        const category = await CategorySchema.create({
            name,
            isActive,
        });

        return res.status(StatusCodes.CREATED).json(category);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};

/**
 * PUT /api/admin/Category/:id
 */
export const updateAdminCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid category id." });
        }

        const category = await CategorySchema.findOne({
            _id: id,
            isDeleted: false,
        });

        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Category not found." });
        }

        if (req.body.name !== undefined) {
            const name = String(req.body.name).trim();
            if (!name) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "name cannot be empty." });
            }
            const dup = await CategorySchema.findOne({
                _id: { $ne: id },
                name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
                isDeleted: false,
            });
            if (dup) {
                return res.status(StatusCodes.CONFLICT).json({ message: "Category name already exists." });
            }
            category.name = name;
        }

        if (req.body.isActive !== undefined) {
            category.isActive = Boolean(req.body.isActive);
        }

        await category.save();

        return res.status(StatusCodes.OK).json(category);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: error.message,
        });
    }
};
