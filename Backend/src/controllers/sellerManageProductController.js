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

export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const shopId = req.shop?._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ProductId không hợp lệ" });
        }

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

        if (!variants || variants.length === 0) {
            return res.status(400).json({
                message: "Sản phẩm phải có ít nhất 1 phân loại",
            });
        }

        const product = await Product.findOne({
            _id: productId,
            shopId,
            isDeleted: false,
        });

        if (!product) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm hoặc không có quyền",
            });
        }

        /* =======================
           XỬ LÝ ATTRIBUTES
        ======================= */
        let attributesMap = {};
        if (Array.isArray(attributes)) {
            attributes.forEach((a) => {
                if (a?.key) attributesMap[a.key] = a.value;
            });
        } else if (attributes && typeof attributes === "object") {
            attributesMap = attributes;
        }

        /* =======================
           UPDATE PRODUCT
        ======================= */
        if (name) {
            product.name = name;
            product.slug = name.toLowerCase().trim().replace(/\s+/g, "-");
        }

        if (brandId) product.brandId = brandId;
        if (categorySchemaId) product.categorySchemaId = categorySchemaId;
        if (description !== undefined) product.description = description;
        if (origin !== undefined) product.origin = origin;
        if (images) product.images = images;
        if (attributes) product.attributes = attributesMap;

        product.defaultPrice = Math.min(...variants.map(v => v.price));
        product.status = "pending"; // update lại thì chờ duyệt lại

        await product.save();

        /* =======================
           XỬ LÝ VARIANTS
        ======================= */
        const existingVariants = await Variant.find({
            productId,
            isDeleted: false,
        });

        const existingVariantMap = new Map();
        existingVariants.forEach(v => {
            existingVariantMap.set(v._id.toString(), v);
        });

        const incomingVariantIds = [];

        const productIdsOfShop = await Product
            .find({ shopId, isDeleted: false })
            .distinct("_id");

        for (const v of variants) {
            // 🔁 Update variant cũ
            if (v._id && existingVariantMap.has(v._id)) {
                const variant = existingVariantMap.get(v._id);

                variant.size = v.size || "";
                variant.price = v.price;
                await variant.save();

                await Inventory.findOneAndUpdate(
                    { variantId: variant._id },
                    { stock: v.stock ?? 0 },
                    { new: true }
                );

                incomingVariantIds.push(v._id.toString());
            }
            // ➕ Tạo variant mới
            else {
                const sku = await ensureUniqueSku(productIdsOfShop);

                const newVariant = await Variant.create({
                    productId,
                    sku,
                    size: v.size || "",
                    price: v.price,
                });

                await Inventory.create({
                    variantId: newVariant._id,
                    stock: v.stock || 0,
                    threshold: 5,
                });

                incomingVariantIds.push(newVariant._id.toString());
            }
        }

        /* =======================
           SOFT DELETE VARIANT BỊ XOÁ
        ======================= */
        for (const oldVariant of existingVariants) {
            if (!incomingVariantIds.includes(oldVariant._id.toString())) {
                oldVariant.isDeleted = true;
                await oldVariant.save();
            }
        }

        return res.status(200).json({
            message: "Cập nhật sản phẩm thành công",
            productId: product._id,
        });
    } catch (error) {
        console.error("updateProduct error:", error);
        return res.status(500).json({
            message: "Lỗi server khi cập nhật sản phẩm",
        });
    }
};

/**
 * GET /seller/products/:productId
 * Seller xem chi tiết 1 sản phẩm của shop mình (kèm variants + stock)
 */
export const getSellerProductDetail = async (req, res) => {
  try {
    const { productId } = req.params;
    const shopId = req.shop?._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ProductId không hợp lệ" });
    }

    const product = await Product.findOne({
      _id: productId,
      shopId,
      isDeleted: false,
    })
      .populate("brandId", "name")
      .lean();

    if (!product) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm hoặc không có quyền" });
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
      .select("variantId stock")
      .lean();

    const stockMap = new Map(
      inventories.map((inv) => [inv.variantId.toString(), inv.stock])
    );

    const variantsWithStock = variants.map((v) => ({
      ...v,
      stock: stockMap.get(v._id.toString()) ?? 0,
    }));

    return res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      data: {
        ...product,
        variants: variantsWithStock,
      },
    });
  } catch (error) {
    console.error("getSellerProductDetail error:", error);
    return res.status(500).json({
      message: "Lỗi server khi lấy chi tiết sản phẩm",
    });
  }
};