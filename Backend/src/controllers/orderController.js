import { Cart } from "../models/Cart.js";
import { Types } from "mongoose";

export const prepareOrdersFromCart = async (req, res, next) => {
    try {
        const rawUserId = req.user?.id;
        const { variantIds } = req.body;

        if (!Types.ObjectId.isValid(rawUserId)) {
            return res.status(401).json({ message: "UserId không hợp lệ" });
        }

        const userObjId = new Types.ObjectId(rawUserId);

        if (!Array.isArray(variantIds) || variantIds.length === 0) {
            return res.status(400).json({ message: "variantIds phải là mảng và không được rỗng" });
        }

        const variantIdsObj = variantIds
            .filter(Types.ObjectId.isValid)
            .map((id) => new Types.ObjectId(id));

        const cart = await Cart.findOne({ userId: userObjId }).lean();

        if (!cart) return res.status(404).json({ message: "Giỏ hàng không tồn tại" });

        const pipeline = [
            { $match: { userId: userObjId } },
            //tách từng items thành từng document riêng lẻ
            { $unwind: "$items" },
            { $match: { "items.variantId": { $in: variantIdsObj } } },

            // join Variant
            {
                $lookup: {
                    from: "variants",
                    localField: "items.variantId",
                    foreignField: "_id",
                    as: "variant",
                },
            },
            { $unwind: { path: "$variant", preserveNullAndEmptyArrays: true } },

            // join Product
            {
                $lookup: {
                    from: "products",
                    localField: "variant.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

            // join Shop
            {
                $lookup: {
                    from: "shops",
                    localField: "product.shopId",
                    foreignField: "_id",
                    as: "shop",
                },
            },
            { $unwind: { path: "$shop", preserveNullAndEmptyArrays: true } },

            // join Inventory
            {
                $lookup: {
                    from: "inventories",
                    localField: "items.variantId",
                    foreignField: "variantId",
                    as: "inventory",
                },
            },
            { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },

            // compute flags
            {
                $addFields: {
                    qty: "$items.quantity",
                    price: "$variant.price",
                    stock: { $ifNull: ["$inventory.stock", 0] },
                    lineTotal: { $multiply: ["$items.quantity", { $ifNull: ["$variant.price", 0] }] },

                    // validate chain
                    variantOk: {
                        $and: [
                            { $ne: ["$variant", null] },
                            { $eq: ["$variant.status", "active"] },
                            { $eq: ["$variant.isDeleted", false] },
                        ],
                    },
                    productOk: {
                        $and: [
                            { $ne: ["$product", null] },
                            { $eq: ["$product.isDeleted", false] },
                            { $eq: ["$product.status", "approved"] },
                            { $eq: ["$product.activeStatus", "active"] },
                        ],
                    },
                    shopOk: {
                        $and: [
                            { $ne: ["$shop", null] },
                            { $eq: ["$shop.isDeleted", false] },
                            { $eq: ["$shop.status", "approved"] },
                            { $eq: ["$shop.isBlockedByAdmin", false] },
                        ],
                    },
                    stockOk: { $gte: [{ $ifNull: ["$inventory.stock", 0] }, "$items.quantity"] },
                },
            },
            {
                $addFields: {
                    isAvailable: { $and: ["$variantOk", "$productOk", "$shopOk", "$stockOk"] },
                    errorCode: {
                        $switch: {
                            branches: [
                                { case: { $not: ["$variantOk"] }, then: "VARIANT_INVALID" },
                                { case: { $not: ["$productOk"] }, then: "PRODUCT_INVALID" },
                                { case: { $not: ["$shopOk"] }, then: "SHOP_INVALID" },
                                { case: { $not: ["$stockOk"] }, then: "OUT_OF_STOCK" },
                            ],
                            default: null,
                        },
                    },
                },
            },

            // project item for response
            {
                $project: {
                    _id: 0,
                    variantId: "$items.variantId",
                    qty: 1,
                    price: 1,
                    stock: 1,
                    lineTotal: 1,
                    isAvailable: 1,
                    errorCode: 1,

                    variant: {
                        _id: "$variant._id",
                        sku: "$variant.sku",
                        size: "$variant.size",
                        price: "$variant.price",
                    },
                    product: {
                        _id: "$product._id",
                        name: "$product.name",
                        slug: "$product.slug",
                        images: "$product.images",
                        shopId: "$product.shopId",
                    },
                    shop: {
                        _id: "$shop._id",
                        name: "$shop.name",
                        avatar: "$shop.avatar",
                        contactPhone: "$shop.contactPhone",
                    },
                },
            },

            // group by shop
            {
                $group: {
                    _id: "$shop._id",
                    shop: { $first: "$shop" },
                    items: { $push: "$$ROOT" },
                    subTotal: { $sum: "$lineTotal" },
                    hasInvalid: { $max: { $cond: [{ $eq: ["$isAvailable", false] }, 1, 0] } },
                },
            },

            // split valid/invalid inside each shop group
            {
                $addFields: {
                    validItems: {
                        $filter: { input: "$items", as: "it", cond: { $eq: ["$$it.isAvailable", true] } },
                    },
                    invalidItems: {
                        $filter: { input: "$items", as: "it", cond: { $eq: ["$$it.isAvailable", false] } },
                    },
                },
            },

            {
                $project: {
                    _id: 0,
                    shopId: "$_id",
                    shop: 1,
                    subTotal: 1,
                    validItems: 1,
                    invalidItems: 1,
                },
            },
        ];

        const groups = await Cart.aggregate(pipeline);

        // gom lỗi chung + tính tổng
        const invalidItems = [];
        let grandTotal = 0;
        let shippingFee = 0;

        for (const g of groups) {
            // chỉ cộng total từ item hợp lệ
            const validTotal = (g.validItems || []).reduce((s, it) => s + (it.lineTotal || 0), 0);
            g.subTotal = validTotal;
            grandTotal += validTotal;
            shippingFee += 20000;
            for (const it of g.invalidItems || []) {
                invalidItems.push({
                    variantId: it.variant,
                    product: it.product,
                    reason: it.errorCode,
                    stock: it.stock,
                    requestedQty: it.qty,
                });
            }
            delete g.invalidItems;
        }

        grandTotal += shippingFee;

        return res.json({
            message: "Prepare orders success",
            grandTotal,
            shippingFee,
            groups,
            invalidItems,
        });
    } catch (err) {
        next(err);
    }
};
