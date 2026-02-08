import mongoose, { Types } from "mongoose";

import Cart from "../models/Cart.js";
import Variant from "../models/Variant.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Voucher from "../models/Voucher.js";
import VoucherUsage from "../models/VoucherUsage.js";
import Order from "../models/Order.js";
import OrderAddressSnapshot from "../models/OrderAddressSnapshot.js";
import Shop from "../models/Shop.js";

/* ------------------------ helpers ------------------------ */

const money = (n) => Math.max(0, Math.round(Number(n || 0)));

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

const oid = (id) => new Types.ObjectId(id);

const genOrderCode = () => {
    const d = new Date();
    const y = String(d.getFullYear()).slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rnd = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    return `UT${y}${m}${day}-${rnd}`;
};

// bạn có thể thay logic ship ở đây
const calcShippingFeePerShop = () => 20000;

function calcDiscount({ discountType, discountValue, baseAmount, maxDiscountValue }) {
    baseAmount = money(baseAmount);
    const dv = Number(discountValue || 0);
    const maxD = Number(maxDiscountValue || 0);

    let discount = 0;
    if (discountType === "percent") {
        const pct = Math.max(0, Math.min(100, dv));
        discount = Math.floor((baseAmount * pct) / 100);
        if (maxD > 0) discount = Math.min(discount, money(maxD));
    } else if (discountType === "fixed") {
        discount = money(dv);
    } else {
        discount = 0;
    }

    return money(Math.min(discount, baseAmount));
}

async function validateVoucherOrThrow({
    session,
    code,
    scope,
    shopId,
    userId,
    baseAmount,
}) {
    if (!code) return { voucher: null, discountAmount: 0 };

    const filter = {
        code: String(code).trim(),
        scope,
        isDeleted: false,
    };

    if (scope === "shop") filter.shopId = shopId;
    if (scope === "system") filter.shopId = null;

    const v = await Voucher.findOne(filter).session(session).lean();
    if (!v) throw { status: 400, message: "VOUCHER_NOT_FOUND", data: { code, scope, shopId } };

    const now = new Date();
    if (v.startAt && now < new Date(v.startAt)) throw { status: 400, message: "VOUCHER_NOT_STARTED", data: { code } };
    if (v.endAt && now > new Date(v.endAt)) throw { status: 400, message: "VOUCHER_EXPIRED", data: { code } };

    if (money(baseAmount) < money(v.minOrderValue || 0)) {
        throw { status: 400, message: "VOUCHER_MIN_ORDER_NOT_MET", data: { code, baseAmount, minOrderValue: v.minOrderValue || 0 } };
    }

    const usageLimitTotal = money(v.usageLimitTotal || 0);
    const usedCount = money(v.usedCount || 0);
    if (usageLimitTotal > 0 && usedCount >= usageLimitTotal) {
        throw { status: 400, message: "VOUCHER_USAGE_LIMIT_REACHED", data: { code } };
    }

    const usageLimitPerUser = money(v.usageLimitPerUser || 0);
    if (usageLimitPerUser > 0) {
        const usedByUser = await VoucherUsage.countDocuments({ voucherId: v._id, userId })
            .session(session);
        if (usedByUser >= usageLimitPerUser) {
            throw { status: 400, message: "VOUCHER_USER_LIMIT_REACHED", data: { code } };
        }
    }

    // VoucherSchema có thể có "ship" nhưng Order voucher snapshot của bạn chỉ percent/fixed
    if (!["percent", "fixed"].includes(v.discountType)) {
        throw { status: 400, message: "VOUCHER_TYPE_NOT_SUPPORTED", data: { code, discountType: v.discountType } };
    }

    const discountAmount = calcDiscount({
        discountType: v.discountType,
        discountValue: v.discountValue,
        baseAmount,
        maxDiscountValue: v.maxDiscountValue || 0,
    });

    return { voucher: v, discountAmount };
}

function makeVoucherSnapshot(v, { scope, shopId, appliedDiscountAmount }) {
    if (!v) return null;
    return {
        voucherId: v._id,
        code: v.code,
        scope,
        shopId: scope === "shop" ? shopId : null,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minOrderValue: v.minOrderValue || 0,
        maxDiscountValue: v.maxDiscountValue || 0,
        appliedDiscountAmount: money(appliedDiscountAmount || 0),
    };
}

function allocateProportional(totalDiscount, bases) {
    const sum = bases.reduce((s, x) => s + money(x), 0) || 1;
    let remaining = money(totalDiscount);

    return bases.map((b, idx) => {
        if (totalDiscount <= 0) return 0;
        if (idx === bases.length - 1) return remaining;

        const alloc = Math.floor((money(totalDiscount) * money(b)) / sum);
        remaining -= alloc;
        return money(alloc);
    });
}

/* ------------------------ controller ------------------------ */

export const createOrdersFromCart = async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId || !isValidObjectId(userId)) return res.status(401).json({ message: "Unauthorized" });

    const userObjectId = oid(userId);

    // ✅ đã được Joi validate + normalize
    const { variantIds, deliveryAddress, vouchers, paymentMethod } = req.body;

    const variantObjectIds = variantIds.map(oid);
    const systemCode = (vouchers.systemCode || "").trim();
    const shopCodes = vouchers.shopCodes || {};

    const session = await mongoose.startSession();

    try {
        let responsePayload = null;

        await session.withTransaction(async () => {
            /* 1) Load cart & pick selected items */
            const cart = await Cart.findOne({ userId: userObjectId }).session(session).lean();
            if (!cart?.items?.length) throw { status: 400, message: "CART_EMPTY" };

            // map variantId -> qty from cart
            const cartQtyByVariant = new Map(cart.items.map((it) => [String(it.variantId), Number(it.quantity || 0)]));

            const selected = [];
            const missingInCart = [];

            for (const vid of variantObjectIds) {
                const key = String(vid);
                const qty = cartQtyByVariant.get(key);
                if (!qty) missingInCart.push(key);
                else selected.push({ variantId: vid, quantity: Math.max(1, qty) });
            }

            if (selected.length === 0) {
                throw { status: 400, message: "NO_SELECTED_ITEMS_IN_CART", data: { missingInCart } };
            }

            /* 2) Load variants */
            const variants = await Variant.find({
                _id: { $in: selected.map((x) => x.variantId) },
                isDeleted: false,
                status: "active",
            }).session(session).lean();

            const variantById = new Map(variants.map((v) => [String(v._id), v]));

            /* 3) Load products */
            const productIds = [...new Set(variants.map((v) => String(v.productId)))]
                .filter(isValidObjectId)
                .map(oid);

            const products = await Product.find({
                _id: { $in: productIds },
                isDeleted: false,
                activeStatus: "active",
                status: "approved",
            }).session(session).lean();

            const productById = new Map(products.map((p) => [String(p._id), p]));

            /* 4) Load inventory */
            const inventories = await Inventory.find({
                variantId: { $in: selected.map((x) => x.variantId) },
            }).session(session).lean();

            const invByVariantId = new Map(inventories.map((inv) => [String(inv.variantId), inv]));

            /* 5) Validate items & build lines */
            const invalidItems = [];
            const lines = [];

            for (const s of selected) {
                const v = variantById.get(String(s.variantId));
                if (!v) {
                    invalidItems.push({ variantId: String(s.variantId), reason: "VARIANT_NOT_FOUND" });
                    continue;
                }

                const p = productById.get(String(v.productId));
                if (!p) {
                    invalidItems.push({ variantId: String(s.variantId), reason: "PRODUCT_NOT_FOUND_OR_INACTIVE" });
                    continue;
                }

                const inv = invByVariantId.get(String(s.variantId));
                const stock = Number(inv?.stock ?? 0);
                if (stock < s.quantity) {
                    invalidItems.push({
                        variantId: String(s.variantId),
                        reason: "OUT_OF_STOCK",
                        stock,
                        requestedQty: s.quantity,
                    });
                    continue;
                }

                const price = money(v.price);
                const lineTotal = money(price * s.quantity);

                lines.push({
                    shopId: String(p.shopId),
                    product: p,
                    variant: v,
                    quantity: s.quantity,
                    price,
                    lineTotal,
                });
            }

            if (lines.length === 0) {
                throw { status: 400, message: "ALL_ITEMS_INVALID", data: { invalidItems } };
            }

            /* 6) Group by shopId */
            const groupsMap = new Map();
            for (const ln of lines) {
                if (!groupsMap.has(ln.shopId)) {
                    groupsMap.set(ln.shopId, {
                        shopId: ln.shopId,
                        items: [],
                        subtotal: 0,
                        shippingFee: 0,
                        shopVoucher: null,
                        shopDiscount: 0,
                        totalAfterShopVoucher: 0,
                        systemAllocatedDiscount: 0,
                    });
                }
                const g = groupsMap.get(ln.shopId);
                g.items.push(ln);
                g.subtotal += ln.lineTotal;
            }

            const groups = [...groupsMap.values()].map((g) => ({ ...g, subtotal: money(g.subtotal) }));

            /* 7) Load shops (for pickup snapshot) */
            const shopIds = groups.map((g) => oid(g.shopId));
            const shops = await Shop.find({ _id: { $in: shopIds } }).session(session).lean();
            const shopById = new Map(shops.map((s) => [String(s._id), s]));

            /* 8) Apply shop vouchers + shipping per shop */
            let grandBeforeSystem = 0;

            for (const g of groups) {
                g.shippingFee = money(calcShippingFeePerShop());

                const shopVoucherCode = (shopCodes[g.shopId] || "").trim();
                if (shopVoucherCode) {
                    const { voucher, discountAmount } = await validateVoucherOrThrow({
                        session,
                        code: shopVoucherCode,
                        scope: "shop",
                        shopId: oid(g.shopId),
                        userId: userObjectId,
                        baseAmount: g.subtotal,
                    });

                    g.shopVoucher = voucher;
                    g.shopDiscount = discountAmount;
                }

                g.totalAfterShopVoucher = money(g.subtotal - g.shopDiscount);
                grandBeforeSystem += g.totalAfterShopVoucher + g.shippingFee;
            }

            grandBeforeSystem = money(grandBeforeSystem);

            /* 9) Apply system voucher on grand total */
            let systemVoucher = null;
            let systemDiscount = 0;

            if (systemCode) {
                const r = await validateVoucherOrThrow({
                    session,
                    code: systemCode,
                    scope: "system",
                    shopId: null,
                    userId: userObjectId,
                    baseAmount: grandBeforeSystem,
                });

                systemVoucher = r.voucher;
                systemDiscount = r.discountAmount;
            }

            const grandTotal = money(grandBeforeSystem - systemDiscount);

            /* 10) Allocate system discount to each order (proportional) */
            const bases = groups.map((g) => money(g.totalAfterShopVoucher + g.shippingFee));
            const allocs = allocateProportional(systemDiscount, bases);
            groups.forEach((g, i) => (g.systemAllocatedDiscount = allocs[i]));

            /* 11) Create orders + snapshots + decrement stock + voucher usage */
            const createdOrders = [];

            for (const g of groups) {
                const shopDoc = shopById.get(g.shopId);
                if (!shopDoc) throw { status: 400, message: "SHOP_NOT_FOUND", data: { shopId: g.shopId } };

                // ✅ CHỖ BẠN CẦN CHỈNH theo ShopSchema thật của bạn
                // mình đang giả định shopDoc.pickupAddress = { contact, address }
                const pickup = shopDoc.pickupAddress;
                if (!pickup?.contact || !pickup?.address) {
                    throw { status: 400, message: "SHOP_PICKUP_ADDRESS_MISSING", data: { shopId: g.shopId } };
                }

                const orderItems = g.items.map((ln) => ({
                    productId: ln.product._id,
                    variantId: ln.variant._id,
                    productName: ln.product.name,
                    variantLabel: ln.variant.size ? `Size ${ln.variant.size}` : "",
                    price: ln.price,
                    quantity: ln.quantity,
                }));

                const orderCode = genOrderCode();

                // tạo order trước, set sẵn snapshotId để dùng _id cố định
                const pickupSnapshotId = new Types.ObjectId();
                const deliverySnapshotId = new Types.ObjectId();

                const orderTotal = money(
                    g.totalAfterShopVoucher + g.shippingFee - g.systemAllocatedDiscount
                );

                const shopVoucherSnapshot = makeVoucherSnapshot(g.shopVoucher, {
                    scope: "shop",
                    shopId: oid(g.shopId),
                    appliedDiscountAmount: g.shopDiscount,
                });

                const created = await Order.create(
                    [
                        {
                            orderCode,
                            userId: userObjectId,
                            shop: oid(g.shopId),

                            pickupAddressSnapshotId: pickupSnapshotId,
                            deliveryAddressSnapshotId: deliverySnapshotId,

                            items: orderItems,

                            subtotal: g.subtotal,
                            shippingFee: g.shippingFee,

                            // schema của bạn chỉ có 1 voucher field → mình lưu shop voucher ở đây
                            voucher: shopVoucherSnapshot || null,

                            totalAmount: orderTotal,

                            paymentMethod: paymentMethod || "",
                            paymentStatus: "unpaid",
                            orderStatus: "created",
                            statusHistory: [{ status: "created", changedAt: new Date() }],
                        },
                    ],
                    { session }
                );

                const orderDoc = created[0];

                // snapshots
                await OrderAddressSnapshot.create(
                    [
                        {
                            _id: pickupSnapshotId,
                            orderId: orderDoc._id,
                            type: "pickup",
                            contact: pickup.contact,
                            address: pickup.address,
                            createdAt: new Date(),
                        },
                        {
                            _id: deliverySnapshotId,
                            orderId: orderDoc._id,
                            type: "delivery",
                            contact: deliveryAddress.contact,
                            address: deliveryAddress.address,
                            createdAt: new Date(),
                        },
                    ],
                    { session }
                );

                // decrement stock (atomic)
                for (const ln of g.items) {
                    const qty = ln.quantity;

                    const r = await Inventory.updateOne(
                        { variantId: ln.variant._id, stock: { $gte: qty } },
                        { $inc: { stock: -qty }, $set: { updatedAt: new Date() } },
                        { session }
                    );

                    if (r.modifiedCount !== 1) {
                        throw { status: 409, message: "OUT_OF_STOCK_RACE", data: { variantId: String(ln.variant._id) } };
                    }
                }

                // voucher usage logs
                if (g.shopVoucher) {
                    await VoucherUsage.create(
                        [{ voucherId: g.shopVoucher._id, userId: userObjectId, orderId: orderDoc._id, usedAt: new Date() }],
                        { session }
                    );

                    await Voucher.updateOne({ _id: g.shopVoucher._id }, { $inc: { usedCount: 1 } }, { session });
                }

                // system voucher usage (log per order) — increment usedCount once later
                if (systemVoucher) {
                    await VoucherUsage.create(
                        [{ voucherId: systemVoucher._id, userId: userObjectId, orderId: orderDoc._id, usedAt: new Date() }],
                        { session }
                    );
                }

                createdOrders.push({
                    orderId: orderDoc._id,
                    orderCode: orderDoc.orderCode,
                    shopId: g.shopId,
                    subtotal: orderDoc.subtotal,
                    shippingFee: orderDoc.shippingFee,
                    voucher: orderDoc.voucher,
                    systemAllocatedDiscount: g.systemAllocatedDiscount,
                    totalAmount: orderDoc.totalAmount,
                });
            }

            // system voucher usedCount increment ONCE per checkout
            if (systemVoucher) {
                await Voucher.updateOne({ _id: systemVoucher._id }, { $inc: { usedCount: 1 } }, { session });
            }

            /* 12) Remove purchased items from cart */
            const boughtVariantIds = lines.map((ln) => ln.variant._id);

            await Cart.updateOne(
                { userId: userObjectId },
                { $pull: { items: { variantId: { $in: boughtVariantIds } } }, $set: { updatedAt: new Date() } },
                { session }
            );

            responsePayload = {
                message: "Create orders success",
                grandTotal,
                systemVoucher: systemVoucher
                    ? {
                        voucherId: systemVoucher._id,
                        code: systemVoucher.code,
                        scope: "system",
                        discountType: systemVoucher.discountType,
                        discountValue: systemVoucher.discountValue,
                        minOrderValue: systemVoucher.minOrderValue || 0,
                        maxDiscountValue: systemVoucher.maxDiscountValue || 0,
                        appliedDiscountAmount: systemDiscount,
                    }
                    : null,
                orders: createdOrders,
                warnings: {
                    invalidItems,
                    missingInCart,
                },
            };
        });

        return res.status(201).json(responsePayload);
    } catch (err) {
        const status = err?.status || 500;

        if (status >= 500) console.error("[createOrdersFromCart]", err);

        return res.status(status).json({
            message:
                err?.message === "CART_EMPTY"
                    ? "Cart is empty"
                    : err?.message === "NO_SELECTED_ITEMS_IN_CART"
                        ? "No selected items found in cart"
                        : err?.message === "ALL_ITEMS_INVALID"
                            ? "All selected items are invalid"
                            : err?.message === "OUT_OF_STOCK_RACE"
                                ? "Some items are out of stock"
                                : err?.message || "Create order failed",
            error: err?.data || null,
        });
    } finally {
        session.endSession();
    }
};
