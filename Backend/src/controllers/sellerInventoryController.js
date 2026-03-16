import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Inventory } from "../models/Inventory.js";
import { Variant } from "../models/Variant.js";
import { Product } from "../models/Product.js";

/**
 * GET /api/seller/inventory
 * Seller xem danh sách tồn kho (inventory) của shop mình
 */
export const getSellerInventoryList = async (req, res) => {
    try {
        const shopId = req.shop?._id;
        if (!shopId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Shop không tồn tại" });
        }

        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;
        const keyword = String(req.query.keyword ?? "").trim();
        const sortStock = String(req.query.sortStock ?? "").toLowerCase(); // asc or desc

        const pipeline = [
            // Join variant
            {
                $lookup: {
                    from: "variants",
                    localField: "variantId",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: "$variant" },

            // Join product
            {
                $lookup: {
                    from: "products",
                    localField: "variant.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },

            // Filter theo shop
            {
                $match: {
                    "product.shopId": new mongoose.Types.ObjectId(shopId),
                    "product.isDeleted": { $ne: true },
                    "variant.isDeleted": { $ne: true },
                    "isDeleted": { $ne: true }
                },
            },
        ];

        // Search
        if (keyword) {
            const regex = { $regex: keyword, $options: "i" };
            pipeline.push({
                $match: {
                    $or: [
                        { "variant.sku": regex },
                        { "product.name": regex },
                    ],
                },
            });
        }

        // 🔥 GROUP THEO PRODUCT (quan trọng nhất)
        pipeline.push(
            {
                $group: {
                    _id: "$product._id",
                    name: { $first: "$product.name" },
                    images: { $first: "$product.images" },
                    totalStock: { $sum: "$stock" },
                    variantCount: { $sum: 1 },
                    updatedAt: { $max: "$updatedAt" },
                },
            }
        );

        // sort by stock if requested, otherwise default to updatedAt
        if (sortStock === "asc") {
            pipeline.push({ $sort: { totalStock: 1 } });
        } else if (sortStock === "desc") {
            pipeline.push({ $sort: { totalStock: -1 } });
        } else {
            pipeline.push({ $sort: { updatedAt: -1 } });
        }

        pipeline.push(
            {
                $facet: {
                    items: [
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    totalCount: [
                        { $count: "count" },
                    ],
                },
            }
        );

        const result = await Inventory.aggregate(pipeline);

        const items = result[0]?.items || [];
        const total = result[0]?.totalCount[0]?.count || 0;

        return res.status(StatusCodes.OK).json({
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (err) {
        console.error("SELLER_INVENTORY_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error."
        });
    }
};

/**
 * GET /api/seller/inventory/product/:productId
 * Seller xem tất cả variant + inventory của 1 product
 */
export const getSellerProductInventory = async (req, res) => {
    try {
        const shopId = req.shop?._id;
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "productId không hợp lệ" });
        }

        const product = await Product.findById(productId).lean();
        if (!product || String(product.shopId) !== String(shopId)) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Bạn không có quyền truy cập sản phẩm này" });
        }

        // Get all variants of this product with their inventory
        const variants = await Variant.find({
            productId,
            isDeleted: false,
        }).lean();

        const variantIds = variants.map((v) => v._id);
        const inventories = await Inventory.find({ variantId: { $in: variantIds } }).lean();
        const invMap = {};
        inventories.forEach((inv) => {
            invMap[String(inv.variantId)] = inv;
        });

        const variantsWithInventory = variants.map((v) => ({
            ...v,
            inventory: invMap[String(v._id)] || null,
        }));

        return res.status(StatusCodes.OK).json({
            data: { product, variants: variantsWithInventory },
        });
    } catch (err) {
        console.error("SELLER_PRODUCT_INVENTORY_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

/**
 * PUT /api/seller/inventory/:inventoryId
 * Seller cập nhật lại stock
 */
export const updateInventoryStock = async (req, res) => {
    try {
        const shopId = req.shop?._id;
        const { inventoryId } = req.params;
        let { stock } = req.body;

        if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "inventoryId không hợp lệ" });
        }

        stock = Number(stock);
        if (isNaN(stock) || stock < 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "stock phải là số >= 0" });
        }

            const inventory = await Inventory.findById(inventoryId);
        if (!inventory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Inventory không tồn tại" });
        }

        const variant = await Variant.findById(inventory.variantId).lean();
        if (!variant) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Variant không tồn tại" });
        }
        const product = await Product.findById(variant.productId).lean();
        if (!product || String(product.shopId) !== String(shopId)) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Bạn không có quyền cập nhật bản ghi này" });
        }

        inventory.stock = stock;
        inventory.updatedAt = new Date();
        await inventory.save();

        return res.status(StatusCodes.OK).json({ message: "Cập nhật inventory thành công", data: inventory });
    } catch (err) {
        console.error("SELLER_UPDATE_INVENTORY_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

/**
 * GET /api/seller/inventory/statistics
 * Seller xem thống kê tổng quan tồn kho (tổng stock, số sản phẩm, số variant, low stock)
 */
export const getSellerInventoryStatistics = async (req, res) => {
    try {
        const shopId = req.shop?._id;
        if (!shopId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Shop không tồn tại" });
        }

        // threshold for low-stock variants
        const lowStockThreshold = Math.max(0, Number(req.query.lowStockThreshold ?? 5));

        const pipeline = [
            // lookup variant
            {
                $lookup: {
                    from: "variants",
                    localField: "variantId",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: "$variant" },

            // lookup product
            {
                $lookup: {
                    from: "products",
                    localField: "variant.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },

            // filter shop products
            {
                $match: {
                    "product.shopId": new mongoose.Types.ObjectId(shopId),
                    "product.isDeleted": { $ne: true },
                    "variant.isDeleted": { $ne: true },
                    "isDeleted": { $ne: true },
                },
            },

            // group to compute totals
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" },
                    variantCount: { $sum: 1 },
                    productSet: { $addToSet: "$product._id" },
                    lowStockCount: {
                        $sum: {
                            $cond: [{ $lte: ["$stock", lowStockThreshold] }, 1, 0],
                        },
                    },
                    outOfStockVariantCount: {
                        $sum: {
                            $cond: [{ $eq: ["$stock", 0] }, 1, 0],
                        },
                    },
                    outOfStockProductSet: {
                        $addToSet: {
                            $cond: [{ $eq: ["$stock", 0] }, "$product._id", "$$REMOVE"],
                        },
                    },
                    inventoryValue: {
                        $sum: { $multiply: ["$stock", "$variant.price"] },
                    },
                    avgStockPerVariant: { $avg: "$stock" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalStock: 1,
                    variantCount: 1,
                    productCount: { $size: "$productSet" },
                    lowStockCount: 1,
                    outOfStockVariantCount: 1,
                    outOfStockProductCount: { $size: "$outOfStockProductSet" },
                    inventoryValue: { $round: ["$inventoryValue", 2] },
                    avgStockPerVariant: { $round: ["$avgStockPerVariant", 2] },
                },
            },
        ];

        const [stats] = await Inventory.aggregate(pipeline);
        const result = stats || {
            totalStock: 0,
            variantCount: 0,
            productCount: 0,
            lowStockCount: 0,
        };

        return res.status(StatusCodes.OK).json({
            message: "Inventory statistics retrieved successfully",
            ...result,
        });
    } catch (err) {
        console.error("SELLER_INVENTORY_STATISTICS_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
