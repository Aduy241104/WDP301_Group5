import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";
import { Types } from "mongoose";
import { createOrdersFromCartService } from "../services/orderService.js";
import { Order } from "../models/Order.js";
import { OrderAddressSnapshot } from "../models/OrderAddressSnapshot.js";
import { StatusCodes } from "http-status-codes";

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

export const createOrdersFromCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        if (!userId || !Types.ObjectId.isValid(userId)) return res.status(401).json({ message: "Unauthorized" });

        const result = await createOrdersFromCartService({
            userId: String(userId),
            ...req.body, // variantIds, deliveryAddress, vouchers, paymentMethod
        });

        return res.status(201).json(result);
    } catch (err) {
        const status = err?.status || 500;
        if (status >= 500) console.error("[createOrdersFromCart]", err);

        return res.status(status).json({
            message: err?.message || "Create order failed",
            error: err?.data || null,
        });
    }
};

const ALLOWED_STATUSES = ["created", "confirmed", "shipped", "delivered", "cancelled"];

export const listMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const status = String(req.query.status || "created").trim();
        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid status",
                allowed: ALLOWED_STATUSES,
            });
        }

        // pagination
        const pageRaw = Number(req.query.page || 1);
        const limitRaw = Number(req.query.limit || 10);

        const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
        const limit = Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 50 ? limitRaw : 10;
        const skip = (page - 1) * limit;

        const filter = {
            userId,
            ...(status ? { orderStatus: status } : {}),
        };

        // chạy song song: count + list
        const [total, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)

                // shop info (nếu cần list theo shop)
                .populate({
                    path: "shop",
                    select: "_id name avatar",
                })

                // join product
                .populate({
                    path: "items.productId",
                    select: "_id name images",
                })

                // join variant
                .populate({
                    path: "items.variantId",
                    select: "_id sku size price status",
                })

                .select("-trackingCode -createdAt -updatedAt")
                // tối ưu: trả object thuần
                .lean(),
        ]);

        const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

        // optional: map lại items cho FE dễ dùng (giữ snapshot + thêm joined)
        const mapped = (orders || []).map((o) => ({
            _id: o._id,
            orderCode: o.orderCode,
            shop: o.shop,
            orderStatus: o.orderStatus,
            paymentStatus: o.paymentStatus,
            paymentMethod: o.paymentMethod,
            trackingCode: o.trackingCode,

            subtotal: o.subtotal,
            shippingFee: o.shippingFee,
            voucher: o.voucher,
            totalAmount: o.totalAmount,

            statusHistory: o.statusHistory,
            deliveredAt: o.deliveredAt,
            cancelledAt: o.cancelledAt,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,

            items: (o.items || []).map((it) => ({
                productId: it.productId?._id || it.productId, // khi populate fail vẫn còn id
                variantId: it.variantId?._id || it.variantId,

                // snapshot fields (nguồn “chuẩn” của order history)
                productName: it.productName,
                variantLabel: it.variantLabel,
                price: it.price,
                quantity: it.quantity,

                // joined info cho UI
                product: it.productId && typeof it.productId === "object" ? it.productId : null,
                variant: it.variantId && typeof it.variantId === "object" ? it.variantId : null,
            })),
        }));

        return res.status(StatusCodes.OK).json({
            message: "Get orders success",
            filter: { status },
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            orders: mapped,
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server error",
            error: err?.message || null,
        });
    }
};

export const getMyOrderDetail = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { orderId } = req.params;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid orderId" });
        }

        // Load order + owner check
        const order = await Order.findOne({ _id: orderId, userId })
            .populate({ path: "shop", select: "_id name avatar" })
            .populate({
                path: "items.productId",
                select: "_id name slug images isDeleted",
                transform: (doc) => {
                    if (!doc) return null;
                    return {
                        _id: doc._id,
                        name: doc.name,
                        slug: doc.slug,
                        image: doc.images?.[0] || null,
                        isDeleted: doc.isDeleted,
                    };
                },
            })
            .populate({
                path: "items.variantId",
                select: "_id sku size price status isDeleted",
            })
            .lean();

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
        }

        // Load address snapshots (delivery required, pickup optional)
        const snapshotIds = [
            order.deliveryAddressSnapshotId,
            order.pickupAddressSnapshotId,
        ].filter(Boolean);

        const snapshots = snapshotIds.length
            ? await OrderAddressSnapshot.find({ _id: { $in: snapshotIds } }).lean()
            : [];

        const delivery = snapshots.find(
            (s) => String(s._id) === String(order.deliveryAddressSnapshotId)
        );

        // 3) Map items để FE dùng dễ: snapshot + joined
        const items = (order.items || []).map((it) => ({
            productId: it.productId?._id || it.productId,
            variantId: it.variantId?._id || it.variantId,

            // snapshot
            productName: it.productName,
            variantLabel: it.variantLabel,
            price: it.price,
            quantity: it.quantity,

            // joined
            product: it.productId && typeof it.productId === "object" ? it.productId : null,
            variant: it.variantId && typeof it.variantId === "object" ? it.variantId : null,

            lineTotal: Number(it.price || 0) * Number(it.quantity || 0),
        }));

        return res.status(StatusCodes.OK).json({
            message: "Get order detail success",
            order: {
                _id: order._id,
                orderCode: order.orderCode,

                shop: order.shop,

                orderStatus: order.orderStatus,
                trackingCode: order.trackingCode,
                statusHistory: order.statusHistory,

                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,

                subtotal: order.subtotal,
                shippingFee: order.shippingFee,
                voucher: order.voucher,
                totalAmount: order.totalAmount,

                deliveryAddress: delivery
                    ? { contact: delivery.contact, address: delivery.address }
                    : null,

                deliveredAt: order.deliveredAt,
                cancelledAt: order.cancelledAt,

                createdAt: order.createdAt,
                updatedAt: order.updatedAt,

                items,
            },
        });
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Server error",
            error: err?.message || null,
        });
    }
};