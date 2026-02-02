import crypto from "crypto";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";
import { Variant } from "../models/Variant.js";
import { Inventory } from "../models/Inventory.js";
import { Brand } from "../models/Brand.js";

async function ensureUniqueSku(productIdsOfShop) {
  for (let i = 0; i < 10; i++) {
    const sku = "SKU-" + crypto.randomBytes(6).toString("hex").toUpperCase();
    const exists = await Variant.findOne({
      productId: { $in: productIdsOfShop },
      sku,
      isDeleted: false,
    });
    if (!exists) return sku;
  }
  return "SKU-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

/**
 * GET /seller/products
 * Seller xem danh sách sản phẩm của shop mình
 */
export const getSellerProductList = async (req, res) => {
  try {
      const shopId = req.shop._id;

      const {
          page = 1,
          limit = 10,
          keyword = "",
          status,
          activeStatus,
      } = req.query;

      const filter = {
          shopId,
          isDeleted: false,
      };

      // 🔍 Tìm theo tên sản phẩm
      if (keyword && keyword.trim() !== "") {
          filter.name = { $regex: keyword.trim(), $options: "i" };
      }

      // 📌 Lọc theo trạng thái duyệt (pending / approved / rejected)
      if (status) {
          filter.status = status;
      }

      // 📌 Lọc theo trạng thái bán (active / inactive)
      if (activeStatus) {
          filter.activeStatus = activeStatus;
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

      const productIds = products.map((p) => p._id);
      const variantGroups = await Variant.aggregate([
          { $match: { productId: { $in: productIds }, isDeleted: false } },
          { $group: { _id: "$productId", skus: { $push: "$sku" } } },
      ]);
      const skuMap = {};
      variantGroups.forEach((g) => {
          skuMap[g._id.toString()] = g.skus;
      });

      const data = products.map((p) => ({
          ...p,
          skus: skuMap[p._id.toString()] || [],
      }));

      return res.status(200).json({
          message: "Lấy danh sách sản phẩm thành công",
          data,
          pagination: {
              page: Number(page),
              limit: Number(limit),
              total,
              totalPages: Math.ceil(total / limit),
          },
      });
  } catch (error) {
      console.error("getSellerProductList error:", error);
      return res.status(500).json({
          message: "Lỗi server khi lấy danh sách sản phẩm",
      });
  }
};


export const createProduct = async (req, res) => {
    try {
        const {
            brandId,
            categorySchemaId,
            name,
            description,
            origin,
            images,
            attributes,
            variants
        } = req.body;

        const shopId = req.shop?._id;
        if (!shopId) {
            return res.status(400).json({ message: "Shop not found in request" });
        }

        if (!variants || variants.length === 0) {
            throw new Error("Sản phẩm phải có ít nhất 1 phân loại");
        }

        const productIdsOfShop = await Product.find({ shopId, isDeleted: false }).distinct("_id");
        const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

        // Convert attributes array [{ key, value }] to Map/object for Mongoose
        let attributesMap = {};
        if (Array.isArray(attributes) && attributes.length > 0) {
            attributes.forEach((a) => {
                if (a?.key) {
                    attributesMap[a.key] = a.value;
                }
            });
        } else if (attributes && typeof attributes === "object" && !Array.isArray(attributes)) {
            attributesMap = attributes;
        }

        const product = await Product.create({
            shopId,
            brandId,
            categorySchemaId,
            name,
            slug,
            description,
            origin,
            images,
            attributes: attributesMap,
            defaultPrice: Math.min(...variants.map(v => v.price)),
            status: "pending",
        });

        for (const v of variants) {
            const sku = await ensureUniqueSku(productIdsOfShop);
            productIdsOfShop.push(product._id);

            const variant = await Variant.create({
                productId: product._id,
                sku,
                size: v.size || "",
                price: v.price,
            });

            await Inventory.create({
                variantId: variant._id,
                stock: v.stock || 0,
                threshold: 5,
            });
        }

        return res.status(201).json({
            message: "Tạo sản phẩm thành công",
            productId: product._id,
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};
