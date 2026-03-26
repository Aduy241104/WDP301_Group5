import { Voucher } from "../models/Voucher.js";
import { VoucherUsage } from "../models/VoucherUsage.js";
import mongoose from "mongoose";

export const genOrderCode = () => {
    const d = new Date();
    const y = String(d.getFullYear()).slice(-2);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rnd = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    return `UT${y}${m}${day}-${rnd}`;
};

export const calcDiscount = (v, baseAmount) => {
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

    if (v.discountType === "ship") {
        return money(Math.min(money(v.discountValue || 0), base));
    }

    return 0;
};

export const allocateProportional = (totalDiscount, bases) => {
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

export const allocateEqualCappedByShip = (totalDiscount, shippingFees) => {
    const total = money(totalDiscount);
    const fees = shippingFees.map(money);
    const n = fees.length;

    if (total <= 0 || n === 0) return fees.map(() => 0);

    const shipTotal = fees.reduce((s, x) => s + x, 0);
    if (shipTotal <= 0) return fees.map(() => 0);

    const cappedTotal = Math.min(total, shipTotal);

    const baseEach = Math.floor(cappedTotal / n);
    let rem = cappedTotal - baseEach * n;

    const allocs = fees.map((fee) => {
        let a = baseEach + (rem > 0 ? 1 : 0);
        if (rem > 0) rem--;
        return Math.min(a, fee);
    });

    // re-distribute leftover if some shops had small shipping fee
    let sumAlloc = allocs.reduce((s, x) => s + x, 0);
    let leftover = cappedTotal - sumAlloc;

    if (leftover > 0) {
        for (let i = 0; i < n && leftover > 0; i++) {
            const cap = fees[i] - allocs[i];
            if (cap <= 0) continue;
            const add = Math.min(cap, leftover);
            allocs[i] += add;
            leftover -= add;
        }
    }

    return allocs.map(money);
};

export function groupByShop(lines) {
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

export const makeVoucherSnapshot = (v, { scope, shopId, appliedDiscountAmount }) => {
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

export async function loadAndValidateVoucher({ code, scope, shopId, userId, baseAmount }) {
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

    // xem xét bỏ
    const usageLimitPerUser = money(v.usageLimitPerUser || 0);
    if (usageLimitPerUser > 0) {
        // NOTE: with new VoucherUsage index (voucherId,userId,orderId),
        // this counts "per order" usage. Multi-shop checkout => counts multiple usages.
        const usedByUser = await VoucherUsage.countDocuments({ voucherId: v._id, userId });
        if (usedByUser >= usageLimitPerUser) throwE(400, "VOUCHER_USER_LIMIT_REACHED", { code });
    }

    if (!["percent", "fixed", "ship"].includes(v.discountType)) {
        throwE(400, "VOUCHER_TYPE_NOT_SUPPORTED", { code, discountType: v.discountType });
    }

    return { voucher: v, discountAmount: calcDiscount(v, baseAmount) };
}

export const money = (n) => Math.max(0, Math.round(Number(n || 0)));

export const calcShippingFeePerShop = () => 20000;


export const sumById = (items = [], field) =>
    items.reduce((m, it) => {
        const id = it?.[field];
        const qty = Number(it?.quantity) || 0;
        if (!id || qty <= 0) return m;
        const key = String(id);
        m.set(key, (m.get(key) || 0) + qty);
        return m;
    }, new Map());

export const bulkInc = async (Model, filterKey, map, incKey, now, upsert = false) => {
    if (!map.size) return;
    const ops = [...map.entries()].map(([id, qty]) => ({
        updateOne: {
            filter: { [filterKey]: new mongoose.Types.ObjectId(id) },
            update: { $inc: { [incKey]: qty }, ...(now ? { $set: { updatedAt: now } } : {}) },
            ...(upsert ? { upsert: true } : {}),
        },
    }));
    await Model.bulkWrite(ops);
};