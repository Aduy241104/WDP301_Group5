import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ShopCategory } from "../models/ShopCategory.js";
import { Product } from "../models/Product.js";

const normalizeCategoryName = (value = "") =>
    value
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase("vi-VN");

/**
 * GET /api/seller/categories
 * Seller view categories of their shop
 */
export const getSellerCategories = async (req, res) => {
    try {
        const shopId = req.shop._id;

        const categories = await ShopCategory.find({
            shopId,
            isDeleted: { $ne: true },
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Get categories successfully",
            data: categories,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

// restore category after main revert
/**
 * POST /api/seller/categories
 * Seller add new category
 */
export const createCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { name } = req.body;

        const cleanedName = (name || "")
            .normalize("NFKC")
            .replace(/\s+/g, " ")
            .trim();

        if (!cleanedName) {
            return res.status(400).json({
                message: "Category name is required",
            });
        }

        const normalizedInputName = normalizeCategoryName(cleanedName);
        const existingCategories = await ShopCategory.find({
            shopId,
            isDeleted: { $ne: true },
        })
            .select("name")
            .lean();

        const existed = existingCategories.some(
            (category) => normalizeCategoryName(category?.name || "") === normalizedInputName
        );

        if (existed) {
            return res.status(400).json({
                message: "Category already exists",
            });
        }

        const newCategory = await ShopCategory.create({
            shopId,
            name: cleanedName,
        });

        return res.status(201).json({
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/**
 * PUT /api/seller/categories/:categoryId
 * Seller edit category name
 */
export const updateCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { categoryId } = req.params;
        const { name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const category = await ShopCategory.findOne({
            _id: categoryId,
            shopId,
            isDeleted: { $ne: true },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const duplicated = await ShopCategory.findOne({
            _id: { $ne: categoryId },
            shopId,
            name: name.trim(),
            isDeleted: { $ne: true },
        });

        if (duplicated) {
            return res.status(400).json({ message: "Category already exists" });
        }

        category.name = name.trim();
        await category.save();

        return res.status(200).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/**
 * DELETE /api/seller/categories/:categoryId
 * Seller delete category (soft delete)
 */
export const deleteCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        const category = await ShopCategory.findOne({
            _id: categoryId,
            shopId,
            isDeleted: { $ne: true },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        category.isDeleted = true;
        category.deletedAt = new Date();
        if (req.user && req.user.id) {
            category.deletedBy = req.user.id;
        }
        await category.save();

        await Product.updateMany(
            { shopId, shopCategoryId: category._id },
            { $set: { shopCategoryId: null } }
        );

        return res.status(200).json({
            message: "Category deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/**
 * GET /api/seller/categories/:categoryId/products
 * Seller view products in a category
 */
export const getCategoryProducts = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { categoryId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        const category = await ShopCategory.findOne({
            _id: categoryId,
            shopId,
            isDeleted: { $ne: true },
        }).lean();

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const productIds = Array.isArray(category.productIds)
            ? category.productIds
            : [];

        if (!productIds.length) {
            return res.status(200).json({
                message: "Get category products successfully",
                data: [],
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: 0,
                    totalPages: 0,
                },
            });
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find({
                _id: { $in: productIds },
                shopId,
                isDeleted: { $ne: true },
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("brandId", "name")
                .lean(),
            Product.countDocuments({
                _id: { $in: productIds },
                shopId,
                isDeleted: { $ne: true },
            }),
        ]);

        return res.status(200).json({
            message: "Get category products successfully",
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/**
 * GET /api/seller/categories/:categoryId/available-products
 * List products of shop that are NOT in this category yet
 */
export const getAvailableProductsForCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { categoryId } = req.params;
        const { keyword = "", page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        const category = await ShopCategory.findOne({
            _id: categoryId,
            shopId,
            isDeleted: { $ne: true },
        }).lean();

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const productIdsInCategory = Array.isArray(category.productIds)
            ? category.productIds
            : [];

        const filter = {
            shopId,
            isDeleted: { $ne: true },
        };

        if (productIdsInCategory.length) {
            filter._id = { $nin: productIdsInCategory };
        }

        if (keyword && keyword.trim() !== "") {
            filter.name = { $regex: keyword.trim(), $options: "i" };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate("brandId", "name")
                .lean(),
            Product.countDocuments(filter),
        ]);

        return res.status(200).json({
            message: "Get available products successfully",
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/**
 * POST /api/seller/categories/:categoryId/products
 * Seller add products to category
 */
export const addProductsToCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { categoryId } = req.params;
        const { productIds } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                message: "productIds must be a non-empty array",
            });
        }

        const validProductIds = productIds.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
        );

        if (!validProductIds.length) {
            return res.status(400).json({
                message: "No valid productIds provided",
            });
        }

        const category = await ShopCategory.findOne({
            _id: categoryId,
            shopId,
            isDeleted: { $ne: true },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const products = await Product.find({
            _id: { $in: validProductIds },
            shopId,
            isDeleted: { $ne: true },
        }).select("_id");

        if (!products.length) {
            return res.status(400).json({
                message: "No valid products found to add",
            });
        }

        const productIdSet = new Set(
            (category.productIds || []).map((id) => id.toString())
        );

        for (const p of products) {
            productIdSet.add(p._id.toString());
        }

        category.productIds = Array.from(productIdSet).map(
            (id) => new mongoose.Types.ObjectId(id)
        );
        await category.save();

        await Product.updateMany(
            {
                _id: { $in: products.map((p) => p._id) },
                shopId,
            },
            { $set: { shopCategoryId: category._id } }
        );

        return res.status(200).json({
            message: "Products added to category successfully",
            data: {
                categoryId: category._id,
                productIds: category.productIds,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/**
 * DELETE /api/seller/categories/:categoryId/products/:productId
 * Seller remove product from category
 */
export const deleteProductFromCategory = async (req, res) => {
    try {
        const shopId = req.shop._id;
        const { categoryId, productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid categoryId" });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid productId" });
        }

        const category = await ShopCategory.findOne({
            _id: categoryId,
            shopId,
            isDeleted: { $ne: true },
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId,
            isDeleted: { $ne: true },
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const productIds = Array.isArray(category.productIds)
            ? category.productIds
            : [];

        if (!productIds.some((id) => id.toString() === productId)) {
            return res.status(400).json({
                message: "Product not in this category",
            });
        }

        category.productIds = productIds.filter(
            (id) => id.toString() !== productId
        );
        await category.save();

        await Product.findByIdAndUpdate(
            productId,
            { $set: { shopCategoryId: null } },
            { new: true }
        );

        return res.status(200).json({
            message: "Product removed from category successfully",
            data: {
                categoryId: category._id,
                productIds: category.productIds,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};