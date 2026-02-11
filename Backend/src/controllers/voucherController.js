import mongoose from "mongoose";
import { Voucher } from "../models/Voucher.js";
import { VoucherUsage } from "../models/VoucherUsage.js";
import { StatusCodes } from "http-status-codes";

const { Types } = mongoose;

const money = (n) => Math.max(0, Math.floor(Number(n || 0)));
const now = () => new Date();

const fail = (payload, reason) => ({
    ...payload,
    discount: 0,
    total: payload.totalBeforeDiscount,
    voucher: { code: payload.code || null, applied: false, reason },
});

async function checkPerUserLimit(voucherId, userId, limitPerUser) {
    if (!limitPerUser || limitPerUser <= 0) return true;
    if (!userId) return true;
    const cnt = await VoucherUsage.countDocuments({
        voucherId: new Types.ObjectId(voucherId),
        userId: new Types.ObjectId(userId),
    });
    return cnt < limitPerUser;
}

function checkCommonVoucherRules(voucher, baseAmount) {
    const t = now();
    if (voucher.startAt && t < new Date(voucher.startAt)) return "NOT_STARTED";
    if (voucher.endAt && t > new Date(voucher.endAt)) return "EXPIRED";

    if (baseAmount < money(voucher.minOrderValue)) return "MIN_ORDER_NOT_MET";

    const limitTotal = Number(voucher.usageLimitTotal || 0);
    const usedCount = Number(voucher.usedCount || 0);
    if (limitTotal > 0 && usedCount >= limitTotal) return "OUT_OF_USAGE";

    return null;
}

/**
 * 1) SHOP VOUCHER PREVIEW
 * POST /checkout/shops/:shopId/apply-voucher
 * body: { voucherCode, subTotal }
 */
export const applyShopVoucherPreview = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { shopId } = req.params;
        const code = String(req.body?.voucherCode || "").trim();
        const subTotal = money(req.body?.subTotal);

        if (!Types.ObjectId.isValid(shopId)) {
            return res.status(400).json({ message: "Invalid shopId" });
        }

        // no code -> return as is
        if (!code) {
            return res.json({
                shopId,
                subTotal,
                discount: 0,
                total: subTotal,
                voucher: null,
            });
        }

        const voucher = await Voucher.findOne({
            code,
            scope: "shop",
            shopId: new Types.ObjectId(shopId),
            isDeleted: false,
        }).lean();

        const basePayload = { shopId, code, subTotal, totalBeforeDiscount: subTotal };

        if (!voucher) return res.json(fail(basePayload, "VOUCHER_NOT_FOUND"));

        // discountType must be percent/fixed for shop
        if (!["percent", "fixed"].includes(voucher.discountType)) {
            return res.json(fail(basePayload, "INVALID_DISCOUNT_TYPE"));
        }

        const commonErr = checkCommonVoucherRules(voucher, subTotal);
        if (commonErr) return res.json(fail(basePayload, commonErr));

        const okUser = await checkPerUserLimit(voucher._id, userId, Number(voucher.usageLimitPerUser || 0));
        if (!okUser) return res.json(fail(basePayload, "PER_USER_LIMIT_REACHED"));

        // calc discount
        let discount = 0;
        if (voucher.discountType === "fixed") {
            discount = money(voucher.discountValue);
        } else {
            discount = money((subTotal * Number(voucher.discountValue || 0)) / 100);
        }

        const maxD = money(voucher.maxDiscountValue);
        if (maxD > 0) discount = Math.min(discount, maxD);
        discount = Math.min(discount, subTotal);

        return res.json({
            shopId,
            subTotal,
            discount,
            total: money(subTotal - discount),
            voucher: { code, scope: "shop", applied: true },
        });
    } catch (e) {
        next(e);
    }
};

/**
 * 2) SYSTEM FREE-SHIP VOUCHER PREVIEW
 * POST /checkout/system/apply-voucher
 * body: { voucherCode, grandSubTotal, shippingFeeTotal }
 */
export const applySystemShipVoucherPreview = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const code = String(req.body?.voucherCode || "").trim();
        const grandSubTotal = money(req.body?.grandSubTotal);
        const shippingFeeTotal = money(req.body?.shippingFeeTotal);

        // no code -> return as is
        if (!code) {
            return res.json({
                grandSubTotal,
                shippingFeeTotal,
                shipDiscount: 0,
                grandTotal: money(grandSubTotal + shippingFeeTotal),
                voucher: null,
            });
        }

        const voucher = await Voucher.findOne({
            code,
            scope: "system",
            isDeleted: false,
        }).lean();

        const basePayload = {
            code,
            grandSubTotal,
            shippingFeeTotal,
            totalBeforeDiscount: money(grandSubTotal + shippingFeeTotal),
        };

        if (!voucher) return res.json(fail(basePayload, "VOUCHER_NOT_FOUND"));

        // system voucher must be ship
        if (voucher.discountType !== "ship") {
            return res.json(fail(basePayload, "INVALID_DISCOUNT_TYPE"));
        }

        // Common rules: minOrderValue áp trên grandSubTotal (tiền hàng)
        const commonErr = checkCommonVoucherRules(voucher, grandSubTotal);
        if (commonErr) return res.json(fail(basePayload, commonErr));

        const okUser = await checkPerUserLimit(voucher._id, userId, Number(voucher.usageLimitPerUser || 0));
        if (!okUser) return res.json(fail(basePayload, "PER_USER_LIMIT_REACHED"));

        // ship discount cap:
        // ưu tiên maxDiscountValue nếu >0, còn không dùng discountValue
        const cap = money(voucher.maxDiscountValue) > 0 ? money(voucher.maxDiscountValue) : money(voucher.discountValue);
        const shipDiscount = Math.min(shippingFeeTotal, cap);

        return res.json({
            grandSubTotal,
            shippingFeeTotal,
            shipDiscount,
            grandTotal: money(grandSubTotal + shippingFeeTotal - shipDiscount),
            voucher: { code, scope: "system", applied: true },
        });
    } catch (e) {
        next(e);
    }
};

export const getVoucherByShop = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shopId } = req.params;

        const shopVouchers = await Voucher.find({
            scope: "shop",
            shopId: shopId,
            isDeleted: false,
            startAt: { $lte: new Date() },
            endAt: { $gte: new Date() }
        }).lean();

        const voucherIds = shopVouchers.map((v) => v._id);
        const shopVouchersMap = new Map(
            shopVouchers.map(v => [v._id.toString(), v])
        );

        const voucherUseage = await VoucherUsage.find({ voucherId: { $in: voucherIds }, userId }).lean();

        for (const vu of voucherUseage) {
            const key = vu.voucherId.toString();
            shopVouchersMap.delete(key); // delete ko cần has cũng được
        }

        const shopVouchersArr = [...shopVouchersMap.values()];
        res.status(StatusCodes.OK).json({ message: "get voucher by shop success", vouchers: shopVouchersArr })

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}
