import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Variant } from "../models/Variant.js";
import { Inventory } from "../models/Inventory.js";
import { Shop } from "../models/Shop.js";
import { Brand } from "../models/Brand.js";

// ============================================
// PRODUCT LIST (ADMIN)
// ============================================
// View all products on the platform with filters:
// - status: pending / approved / rejected
// - activeStatus: active / inactive
// - shopId: filter by shop
// - keyword: search by product name or SKU
export const AdminProductListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const rawKeyword = String(req.query.keyword ?? "").trim();
        const status = String(req.query.status ?? "").trim();
        const activeStatus = String(req.query.activeStatus ?? "").trim();
        const shopId = String(req.query.shopId ?? "").trim();

        const filter = { isDeleted: false };

        if (status) {
            filter.status = status;
        }
        if (activeStatus) {
            filter.activeStatus = activeStatus;
        }
        if (shopId) {
            if (!mongoose.Types.ObjectId.isValid(shopId)) {
                return res
                    .status(StatusCodes.BAD_REQUEST)
                    .json({ message: "Invalid shopId." });
            }
            filter.shopId = new mongoose.Types.ObjectId(shopId);
        }

        let skuProductIds = [];
        const keyword = rawKeyword;
        if (keyword) {
            const skuRegex = new RegExp(keyword, "i");
            skuProductIds = await Variant.find({
                sku: { $regex: skuRegex },
                isDeleted: false,
            }).distinct("productId");

            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { _id: { $in: skuProductIds } },
            ];
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("brandId", "name")
                .populate("shopId", "name ownerId")
                .lean(),
            Product.countDocuments(filter),
        ]);

        const productIds = products.map((p) => p._id);
        const variantGroups = await Variant.aggregate([
            { $match: { productId: { $in: productIds }, isDeleted: false } },
            { $group: { _id: "$productId", skus: { $push: "$sku" } } },
        ]);
        const skuMap = {};
        variantGroups.forEach((g) => {
            skuMap[g._id.toString()] = g.skus;
        });

        const items = products.map((p) => ({
            _id: p._id,
            name: p.name,
            status: p.status,
            rejectReason: p.rejectReason,
            activeStatus: p.activeStatus,
            defaultPrice: p.defaultPrice,
            totalSale: p.totalSale,
            ratingAvg: p.ratingAvg,
            shop: p.shopId
                ? {
                      _id: p.shopId._id,
                      name: p.shopId.name,
                      ownerId: p.shopId.ownerId,
                  }
                : null,
            brand: p.brandId
                ? {
                      _id: p.brandId._id,
                      name: p.brandId.name,
                  }
                : null,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            skus: skuMap[p._id.toString()] ?? [],
        }));

        return res.status(StatusCodes.OK).json({
            items,
            paging: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error("ADMIN_PRODUCT_LIST_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

// ============================================
// PRODUCT DETAIL (ADMIN)
// ============================================
export const AdminProductDetailController = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid productId." });
        }

        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
        })
            .populate("brandId", "name")
            .populate("shopId", "name ownerId")
            .populate("categorySchemaId", "name")
            .lean();

        if (!product) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Product not found." });
        }

        const variants = await Variant.find({
            productId,
            isDeleted: false,
        })
            .select("_id sku size price status")
            .lean();

        const variantIds = variants.map((v) => v._id);
        const inventories = await Inventory.find({
            variantId: { $in: variantIds },
        })
            .select("variantId stock threshold")
            .lean();

        const stockMap = new Map(
            inventories.map((inv) => [inv.variantId.toString(), inv])
        );

        const variantsWithStock = variants.map((v) => {
            const inv = stockMap.get(v._id.toString());
            return {
                ...v,
                stock: inv?.stock ?? 0,
                threshold: inv?.threshold ?? 0,
            };
        });

        return res.status(StatusCodes.OK).json({
            product: {
                ...product,
                variants: variantsWithStock,
            },
        });
    } catch (err) {
        console.error("ADMIN_PRODUCT_DETAIL_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

// ============================================
// APPROVE / REJECT PRODUCT (ADMIN)
// ============================================
export const AdminApproveProductController = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid productId." });
        }

        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Product not found." });
        }

        if (product.status === "approved") {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Product already approved." });
        }

        product.status = "approved";
        product.rejectReason = "";
        // Khi duyệt, tự động kích hoạt sản phẩm nếu đang ở trạng thái inactive
        product.activeStatus = "active";
        product.inactiveBy = null;
        product.inactiveReason = "";
        product.inactiveAt = null;
        product.inactiveActorId = null;
        product.publishedAt = product.publishedAt || new Date();

        await product.save();

        return res.status(StatusCodes.OK).json({
            message: "Product approved.",
            product: {
                id: product._id,
                status: product.status,
                activeStatus: product.activeStatus,
            },
        });
    } catch (err) {
        console.error("ADMIN_APPROVE_PRODUCT_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

export const AdminRejectProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const rejectReason = String(req.body.rejectReason ?? "").trim();

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid productId." });
        }

        if (!rejectReason) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "rejectReason is required." });
        }

        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Product not found." });
        }

        if (product.status === "rejected") {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Product already rejected." });
        }

        product.status = "rejected";
        product.rejectReason = rejectReason;
        await product.save();

        return res.status(StatusCodes.OK).json({
            message: "Product rejected.",
            product: {
                id: product._id,
                status: product.status,
                rejectReason: product.rejectReason,
            },
        });
    } catch (err) {
        console.error("ADMIN_REJECT_PRODUCT_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

// ============================================
// ACTIVATE / INACTIVATE PRODUCT (ADMIN)
// ============================================
export const AdminActivateProductController = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid productId." });
        }

        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Product not found." });
        }

        product.activeStatus = "active";
        product.inactiveBy = null;
        product.inactiveReason = "";
        product.inactiveAt = null;
        product.inactiveActorId = null;

        if (!product.publishedAt) {
            product.publishedAt = new Date();
        }

        await product.save();

        return res.status(StatusCodes.OK).json({
            message: "Product activated.",
            product: {
                id: product._id,
                activeStatus: product.activeStatus,
            },
        });
    } catch (err) {
        console.error("ADMIN_ACTIVATE_PRODUCT_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

export const AdminInactivateProductController = async (req, res) => {
    try {
        const { productId } = req.params;
        const inactiveReason = String(req.body.inactiveReason ?? "").trim();

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Invalid productId." });
        }

        const product = await Product.findOne({
            _id: productId,
            isDeleted: false,
        });

        if (!product) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Product not found." });
        }

        product.activeStatus = "inactive";
        product.inactiveBy = "admin";
        product.inactiveReason = inactiveReason;
        product.inactiveAt = new Date();

        if (req.user && req.user.id) {
            product.inactiveActorId = req.user.id;
        }

        await product.save();

        return res.status(StatusCodes.OK).json({
            message: "Product set to inactive.",
            product: {
                id: product._id,
                activeStatus: product.activeStatus,
                inactiveBy: product.inactiveBy,
            },
        });
    } catch (err) {
        console.error("ADMIN_INACTIVATE_PRODUCT_ERROR:", err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Internal server error." });
    }
};

