import mongoose, { Types } from "mongoose";
import { Cart } from "../models/Cart.js";
import { Variant } from "../models/Variant.js";
import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { Voucher } from "../models/Voucher.js";
import { VoucherUsage } from "../models/VoucherUsage.js";
import { Order } from "../models/Order.js";
import { OrderAddressSnapshot } from "../models/OrderAddressSnapshot.js";
import { Shop } from "../models/Shop.js";

const money = (n) => Math.max(0, Math.round(Number(n || 0)));
const oid = (id) => new Types.ObjectId(id);

const throwE = (status, message, data) => {
    throw { status, message, data };
};

const genOrderCode = () => {
    const d = new Date();
    const y = String(d.getFullYear()).slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rnd = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    return `UT${y}${m}${day}-${rnd}`;
};

const calcShippingFeePerShop = () => 20000;

const calcDiscount = (v, baseAmount) => {
    const base = money(baseAmount);
    if (!v) return 0;

    if (v.discountType === "percent") {
        const pct = Math.max(0, Math.min(100, Number(v.discountValue || 0)));
        let d = Math.floor((base * pct) / 100);
        const maxD = money(v.maxDiscountValue || 0);
        if (maxD > 0) d = Math.min(d, maxD);
        return money(Math.min(d, base));
    }

    if (v.discountType === "fixed") {
        return money(Math.min(money(v.discountValue || 0), base));
    }

    return 0;
};

const allocateProportional = (totalDiscount, bases) => {
    const total = money(totalDiscount);
    if (total <= 0) return bases.map(() => 0);

    const sum = bases.reduce((s, x) => s + money(x), 0) || 1;
    let remaining = total;

    return bases.map((b, i) => {
        if (i === bases.length - 1) return money(remaining);
        const alloc = Math.floor((total * money(b)) / sum);
        remaining -= alloc;
        return money(alloc);
    });
};

const makeVoucherSnapshot = (v, { scope, shopId, appliedDiscountAmount }) => {
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
};

async function loadAndValidateVoucherNoTxn({ code, scope, shopId, userId, baseAmount }) {
    if (!code) return { voucher: null, discountAmount: 0 };

    const filter = { code: String(code).trim(), scope, isDeleted: false };
    if (scope === "shop") filter.shopId = shopId;
    if (scope === "system") filter.shopId = null;

    const v = await Voucher.findOne(filter).lean();
    if (!v) throwE(400, "VOUCHER_NOT_FOUND", { code, scope, shopId });

    const now = new Date();
    if (v.startAt && now < new Date(v.startAt)) throwE(400, "VOUCHER_NOT_STARTED", { code });
    if (v.endAt && now > new Date(v.endAt)) throwE(400, "VOUCHER_EXPIRED", { code });

    if (money(baseAmount) < money(v.minOrderValue || 0)) {
        throwE(400, "VOUCHER_MIN_ORDER_NOT_MET", { code, baseAmount, minOrderValue: v.minOrderValue || 0 });
    }

    // usage limits (best-effort, still can race without transaction)
    const usageLimitTotal = money(v.usageLimitTotal || 0);
    if (usageLimitTotal > 0 && money(v.usedCount || 0) >= usageLimitTotal) {
        throwE(400, "VOUCHER_USAGE_LIMIT_REACHED", { code });
    }

    const usageLimitPerUser = money(v.usageLimitPerUser || 0);
    if (usageLimitPerUser > 0) {
        const usedByUser = await VoucherUsage.countDocuments({ voucherId: v._id, userId });
        if (usedByUser >= usageLimitPerUser) throwE(400, "VOUCHER_USER_LIMIT_REACHED", { code });
    }

    if (!["percent", "fixed"].includes(v.discountType)) {
        throwE(400, "VOUCHER_TYPE_NOT_SUPPORTED", { code, discountType: v.discountType });
    }

    return { voucher: v, discountAmount: calcDiscount(v, baseAmount) };
}

function groupByShop(lines) {
    const map = new Map();
    for (const ln of lines) {
        const sid = String(ln.shopId);
        if (!map.has(sid)) map.set(sid, { shopId: sid, items: [], subtotal: 0 });
        const g = map.get(sid);
        g.items.push(ln);
        g.subtotal += ln.lineTotal;
    }
    return [...map.values()].map((g) => ({ ...g, subtotal: money(g.subtotal) }));
}

/**
 * No-transaction version:
 * - Validate
 * - Decrement stock atomically
 * - Create orders/snapshots
 * - If any step fails after decrement -> compensate (increment stock back)
 */
export async function createOrdersFromCartService({
    userId,
    variantIds,
    deliveryAddress,
    vouchers,
    paymentMethod,
}) {
    const userObjectId = oid(userId);
    const variantObjectIds = variantIds.map(oid);

    const systemCode = (vouchers?.systemCode || "").trim();
    const shopCodes = vouchers?.shopCodes || {};

    // 1) cart
    const cart = await Cart.findOne({ userId: userObjectId }).lean();
    if (!cart?.items?.length) throwE(400, "CART_EMPTY");

    const qtyMap = new Map(cart.items.map((it) => [String(it.variantId), Number(it.quantity || 0)]));

    const selected = [];
    const missingInCart = [];

    for (const vid of variantObjectIds) {
        const qty = qtyMap.get(String(vid));
        if (!qty) missingInCart.push(String(vid));
        else selected.push({ variantId: vid, quantity: Math.max(1, qty) });
    }

    if (!selected.length) throwE(400, "NO_SELECTED_ITEMS_IN_CART", { missingInCart });

    // 2) load variants/products/inventory
    const variants = await Variant.find({
        _id: { $in: selected.map((x) => x.variantId) },
        isDeleted: false,
        status: "active",
    }).lean();

    const variantById = new Map(variants.map((v) => [String(v._id), v]));
    const productIds = [...new Set(variants.map((v) => String(v.productId)))].map(oid);

    const products = await Product.find({
        _id: { $in: productIds },
        isDeleted: false,
        activeStatus: "active",
        status: "approved",
    }).lean();

    const productById = new Map(products.map((p) => [String(p._id), p]));

    const inventories = await Inventory.find({
        variantId: { $in: selected.map((x) => x.variantId) },
    }).lean();

    const invByVariantId = new Map(inventories.map((inv) => [String(inv.variantId), inv]));

    // 3) validate items & lines
    const invalidItems = [];
    const lines = [];

    for (const s of selected) {
        const v = variantById.get(String(s.variantId));
        if (!v) { invalidItems.push({ variantId: String(s.variantId), reason: "VARIANT_NOT_FOUND" }); continue; }

        const p = productById.get(String(v.productId));
        if (!p) { invalidItems.push({ variantId: String(s.variantId), reason: "PRODUCT_NOT_FOUND_OR_INACTIVE" }); continue; }

        const inv = invByVariantId.get(String(s.variantId));
        const stock = Number(inv?.stock ?? 0);
        if (stock < s.quantity) {
            invalidItems.push({ variantId: String(s.variantId), reason: "OUT_OF_STOCK", stock, requestedQty: s.quantity });
            continue;
        }

        const price = money(v.price);
        lines.push({
            shopId: p.shopId,
            product: p,
            variant: v,
            quantity: s.quantity,
            price,
            lineTotal: money(price * s.quantity),
        });
    }
 if (!lines.length) throwE(400, "ALL_ITEMS_INVALID", { invalidItems 
   });

    // 4) group shops
    const groups = groupByShop(lines);

    // 5) load shops
    const shops = await Shop.find({ _id: { $in: groups.map((g) => oid(g.shopId)) } }).lean();
    const shopById = new Map(shops.map((s) => [String(s._id), s]));

    // 6) apply shop voucher + shipping + grandBeforeSystem
    let grandBeforeSystem = 0;

    for (const g of groups) {
        g.shippingFee = money(calcShippingFeePerShop());
        const shopVoucherCode = (shopCodes[g.shopId] || "").trim();

        const { voucher, discountAmount } = await loadAndValidateVoucherNoTxn({
            code: shopVoucherCode,
            scope: "shop",
            shopId: oid(g.shopId),
            userId: userObjectId,
            baseAmount: g.subtotal,
        });

        g.shopVoucher = voucher;
        g.shopDiscount = discountAmount;
        g.totalAfterShopVoucher = money(g.subtotal - g.shopDiscount);

        grandBeforeSystem += g.totalAfterShopVoucher + g.shippingFee;
    }

    grandBeforeSystem = money(grandBeforeSystem);

    // 7) system voucher
    const systemR = await loadAndValidateVoucherNoTxn({
        code: systemCode,
        scope: "system",
        shopId: null,
        userId: userObjectId,
        baseAmount: grandBeforeSystem,
    });

    const systemVoucher = systemR.voucher;
    const systemDiscount = systemR.discountAmount;

    const grandTotal = money(grandBeforeSystem - systemDiscount);

    // 8) allocate system discount
    const allocs = allocateProportional(
        systemDiscount,
        groups.map((g) => money(g.totalAfterShopVoucher + g.shippingFee))
    );
    groups.forEach((g, i) => (g.systemAllocatedDiscount = allocs[i]));

    // 9) Decrement stock FIRST (atomic). Track what we decremented for rollback.
    const decremented = []; // { variantId, qty }
    try {
        for (const ln of lines) {
            const r = await Inventory.updateOne(
                { variantId: ln.variant._id, stock: { $gte: ln.quantity } },
                { $inc: { stock: -ln.quantity }, $set: { updatedAt: new Date() } }
            );

            if (r.modifiedCount !== 1) throwE(409, "OUT_OF_STOCK_RACE", { variantId: String(ln.variant._id) });

            decremented.push({ variantId: ln.variant._id, qty: ln.quantity });
        }

        // 10) Create orders + snapshots + voucher usages
        const createdOrders = [];

        for (const g of groups) {
            const shopDoc = shopById.get(g.shopId);
            if (!shopDoc) throwE(400, "SHOP_NOT_FOUND", { shopId: g.shopId });

            const items = g.items.map((ln) => ({
                productId: ln.product._id,
                variantId: ln.variant._id,
                productName: ln.product.name,
                variantLabel: ln.variant.size ? `Size ${ln.variant.size}` : "",
                price: ln.price,
                quantity: ln.quantity,
            }));

            const deliverySnapshotId = new Types.ObjectId();

            const orderDoc = await Order.create({
                orderCode: genOrderCode(),
                userId: userObjectId,
                shop: oid(g.shopId),

                deliveryAddressSnapshotId: deliverySnapshotId,

                items,

                subtotal: g.subtotal,
                shippingFee: g.shippingFee,

                voucher: makeVoucherSnapshot(g.shopVoucher, {
                    scope: "shop",
                    shopId: oid(g.shopId),
                    appliedDiscountAmount: g.shopDiscount,
                }),

                totalAmount: money(g.totalAfterShopVoucher + g.shippingFee - g.systemAllocatedDiscount),

                paymentMethod: paymentMethod || "",
                paymentStatus: "unpaid",
                orderStatus: "created",
                statusHistory: [{ status: "created", changedAt: new Date() }],
            });

            await OrderAddressSnapshot.create([
                { _id: deliverySnapshotId, orderId: orderDoc._id, type: "delivery", contact: deliveryAddress.contact, address: deliveryAddress.address, createdAt: new Date() },
            ]);

            if (g.shopVoucher) {
                await VoucherUsage.create({ voucherId: g.shopVoucher._id, userId: userObjectId, orderId: orderDoc._id, usedAt: new Date() });
                await Voucher.updateOne({ _id: g.shopVoucher._id }, { $inc: { usedCount: 1 } });
            }

            if (systemVoucher) {
                await VoucherUsage.create({ voucherId: systemVoucher._id, userId: userObjectId, orderId: orderDoc._id, usedAt: new Date() });
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

        if (systemVoucher) {
            await Voucher.updateOne({ _id: systemVoucher._id }, { $inc: { usedCount: 1 } });
        }

        // 11) Pull cart items
        await Cart.updateOne(
            { userId: userObjectId },
            { $pull: { items: { variantId: { $in: lines.map((x) => x.variant._id) } } }, $set: { updatedAt: new Date() } }
        );

        return {
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
            warnings: { invalidItems, missingInCart },
        };
    } catch (e) {
        // rollback stock (best-effort)
        if (decremented.length) {
            await Promise.all(
                decremented.map((d) =>
                    Inventory.updateOne(
                        { variantId: d.variantId },
                        { $inc: { stock: d.qty }, $set: { updatedAt: new Date() } }
                    )
                )
            );
        }
        throw e;
    }
}
