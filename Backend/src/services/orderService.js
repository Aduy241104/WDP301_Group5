import { Types } from "mongoose";
import { Cart } from "../models/Cart.js";
import { Variant } from "../models/Variant.js";
import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { Voucher } from "../models/Voucher.js";
import { VoucherUsage } from "../models/VoucherUsage.js";
import { Order } from "../models/Order.js";
import { OrderAddressSnapshot } from "../models/OrderAddressSnapshot.js";
import { Shop } from "../models/Shop.js";
import { createOrderStatusNotification } from "../services/notificationService.js";
import {
  genOrderCode,
  money,
  calcShippingFeePerShop,
  allocateProportional,
  allocateEqualCappedByShip,
  groupByShop,
  makeVoucherSnapshot,
  loadAndValidateVoucher,
} from "../utils/orderHelper.js";

const oid = (id) => new Types.ObjectId(id);

const throwE = (status, message, data) => {
  throw { status, message, data };
};

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
  // If cart is empty return error
  const cart = await Cart.findOne({ userId: userObjectId }).lean();
  if (!cart?.items?.length) throwE(400, "CART_EMPTY");

  const qtyMap = new Map(
    cart.items.map((it) => [String(it.variantId), Number(it.quantity || 0)]),
  );

  const selected = [];
  const missingInCart = [];

  // access variant from user request
  for (const vid of variantObjectIds) {
    const qty = qtyMap.get(String(vid));
    if (!qty) missingInCart.push(String(vid));
    else selected.push({ variantId: vid, quantity: Math.max(1, qty) });
  }


  // if selected product from cart == 0 return error
  if (!selected.length)
    throwE(400, "NO_SELECTED_ITEMS_IN_CART", { missingInCart });

  // 2) load variants/products/inventory
  const variants = await Variant.find({
    _id: { $in: selected.map((x) => x.variantId) },
    isDeleted: false,
    status: "active",
  }).lean();

  const variantById = new Map(variants.map((v) => [String(v._id), v]));
  const productIds = [...new Set(variants.map((v) => String(v.productId)))].map(
    oid,
  );

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

  const invByVariantId = new Map(
    inventories.map((inv) => [String(inv.variantId), inv]),
  );

  // 3) validate items & lines
  const invalidItems = []; // Item đéo hợp lệ để tạo order
  const lines = []; // item hợp lệ để tạo order

  // duyệt product để check hợp lệ
  for (const s of selected) {
    const v = variantById.get(String(s.variantId));
    if (!v) {
      invalidItems.push({
        variantId: String(s.variantId),
        reason: "VARIANT_NOT_FOUND",
      });
      continue;
    }

    const p = productById.get(String(v.productId));
    if (!p) {
      invalidItems.push({
        variantId: String(s.variantId),
        reason: "PRODUCT_NOT_FOUND_OR_INACTIVE",
      });
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
    lines.push({
      shopId: p.shopId,
      product: p,
      variant: v,
      quantity: s.quantity,
      price,
      lineTotal: money(price * s.quantity),
    });
  }

  // nếu không có item nào valid sau khi lọc qua thì trả về lỗi lun <3
  if (!lines.length) throwE(400, "ALL_ITEMS_INVALID", { invalidItems });

  // 4) group ptoduct theo shops
  const groups = groupByShop(lines);

  // 5) load shops
  const shops = await Shop.find({
    _id: { $in: groups.map((g) => oid(g.shopId)) },
  }).lean();
  const shopById = new Map(shops.map((s) => [String(s._id), s]));

  // 6) apply shop voucher + shipping + grandBeforeSystem
  let grandBeforeSystem = 0;

  for (const g of groups) {
    g.shippingFee = money(calcShippingFeePerShop());
    const shopVoucherCode = (shopCodes[g.shopId] || "").trim();

    const { voucher, discountAmount } = await loadAndValidateVoucher({
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

  // ship total across shops
//   const shipTotal = money(groups.reduce((s, g) => s + money(g.shippingFee), 0));

  // 7) system voucher (FIX: if ship voucher, base should be shipTotal)
  let systemVoucher = null;
  let systemDiscount = 0;

  if (systemCode) {
    const systemR = await loadAndValidateVoucher({
      code: systemCode,
      scope: "system",
      shopId: null,
      userId: userObjectId,
      baseAmount: grandBeforeSystem, //luôn dùng shipTotal
    });

    systemVoucher = systemR.voucher;
    systemDiscount = systemR.discountAmount;
  }

  const grandTotal = money(Math.max(0, grandBeforeSystem - systemDiscount));

  // 8) allocate system discount
  let allocs = [];
  if (systemVoucher?.discountType === "ship") {
    // evenly split across shops, capped by shippingFee each
    allocs = allocateEqualCappedByShip(
      systemDiscount,
      groups.map((g) => g.shippingFee),
    );
  } else {
    // other system types: proportional by (items + shipping)
    allocs = allocateProportional(
      systemDiscount,
      groups.map((g) => money(g.totalAfterShopVoucher + g.shippingFee)),
    );
  }
  groups.forEach((g, i) => (g.systemAllocatedDiscount = allocs[i]));

  // 9) Decrement stock FIRST (atomic). Track what we decremented for rollback.
  const decremented = []; // { variantId, qty }
  try {
    for (const ln of lines) {
      const r = await Inventory.updateOne(
        { variantId: ln.variant._id, stock: { $gte: ln.quantity } },
        { $inc: { stock: -ln.quantity }, $set: { updatedAt: new Date() } },
      );

      if (r.modifiedCount !== 1)
        throwE(409, "OUT_OF_STOCK_RACE", { variantId: String(ln.variant._id) });

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

        totalAmount: money(
          g.totalAfterShopVoucher + g.shippingFee - g.systemAllocatedDiscount,
        ),

        paymentMethod: paymentMethod || "",
        paymentStatus: "unpaid",
        orderStatus: "created",
        statusHistory: [{ status: "created", changedAt: new Date() }],
      });
      // TẠO NOTIFICATION CHO SELLER
      await createOrderStatusNotification({
        userId: shopDoc.ownerId,
        orderId: orderDoc._id,
        orderCode: orderDoc.orderCode,
        status: "created",
        targetRole: "seller",
        url: `/seller/orders/${orderDoc._id}`,
      });

      await OrderAddressSnapshot.create([
        {
          _id: deliverySnapshotId,
          orderId: orderDoc._id,
          type: "delivery",
          contact: deliveryAddress.contact,
          address: deliveryAddress.address,
          createdAt: new Date(),
        },
      ]);

      if (g.shopVoucher) {
        const up = await VoucherUsage.updateOne(
          {
            voucherId: g.shopVoucher._id,
            userId: userObjectId,
            orderId: orderDoc._id,
          },
          { $setOnInsert: { usedAt: new Date() } },
          { upsert: true },
        );

        if (up.upsertedCount === 1) {
          await Voucher.updateOne(
            { _id: g.shopVoucher._id },
            { $inc: { usedCount: 1 } },
          );
        }
      }

      // system voucher usage: attach to EVERY order (multi-shop), use upsert
      if (systemVoucher) {
        await VoucherUsage.updateOne(
          {
            voucherId: systemVoucher._id,
            userId: userObjectId,
            orderId: orderDoc._id,
          },
          { $setOnInsert: { usedAt: new Date() } },
          { upsert: true },
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

    // Keep system usedCount as "per checkout" (1 time), not per order
    if (systemVoucher) {
      await Voucher.updateOne(
        { _id: systemVoucher._id },
        { $inc: { usedCount: 1 } },
      );
    }

    // 11) Pull cart items
    await Cart.updateOne(
      { userId: userObjectId },
      {
        $pull: {
          items: { variantId: { $in: lines.map((x) => x.variant._id) } },
        },
        $set: { updatedAt: new Date() },
      },
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
            { $inc: { stock: d.qty }, $set: { updatedAt: new Date() } },
          ),
        ),
      );
    }
    throw e;
  }
}
