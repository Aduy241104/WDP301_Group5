import { StatusCodes } from "http-status-codes";
import { Voucher } from "../models/Voucher.js";
import { Shop } from "../models/Shop.js";

const normalizeCode = (value) => String(value || "").trim().toUpperCase();

async function getSellerShop(userId) {
    return Shop.findOne({ ownerId: userId, isDeleted: false, status: "approved" }).lean();
}

export const createShopVoucher = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Approved shop not found" });
        }

        const { code, discountPercentage, expirationDate } = req.body;
        const normalizedCode = normalizeCode(code);
        const discount = Number(discountPercentage);
        const end = expirationDate ? new Date(expirationDate) : null;

        if (!normalizedCode || !Number.isFinite(discount) || discount <= 0 || discount > 100 || !end || Number.isNaN(end.getTime())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "code, discountPercentage (1-100), expirationDate are required",
            });
        }

        const existed = await Voucher.findOne({ code: normalizedCode, isDeleted: false }).lean();
        if (existed) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Voucher code already exists" });
        }

        const start = new Date();
        if (end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "expirationDate must be in the future" });
        }

        const voucher = await Voucher.create({
            scope: "shop",
            shopId: shop._id,
            code: normalizedCode,
            name: normalizedCode,
            discountType: "percent",
            discountValue: discount,
            startAt: start,
            endAt: end,
            createdBy: sellerId,
            createdByRole: "seller",
            isActive: true,
        });

        return res.status(StatusCodes.CREATED).json({ message: "Create shop voucher success", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const getShopVoucherList = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Approved shop not found" });
        }

        const vouchers = await Voucher.find({
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        }).sort({ createdAt: -1 }).lean();

        return res.status(StatusCodes.OK).json({ message: "Get shop vouchers success", data: vouchers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const updateShopVoucher = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Approved shop not found" });
        }

        const { voucherId } = req.params;
        const { isActive, discountPercentage, expirationDate } = req.body;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
        }

        if (typeof isActive === "boolean") voucher.isActive = isActive;
        if (typeof discountPercentage !== "undefined") {
            const discount = Number(discountPercentage);
            if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "discountPercentage must be between 1 and 100" });
            }
            voucher.discountValue = discount;
        }
        if (expirationDate) {
            const end = new Date(expirationDate);
            if (Number.isNaN(end.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid expirationDate" });
            }
            voucher.endAt = end;
        }

        await voucher.save();
        return res.status(StatusCodes.OK).json({ message: "Update shop voucher success", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const deleteShopVoucher = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Approved shop not found" });
        }

        const { voucherId } = req.params;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
        }

        voucher.isDeleted = true;
        voucher.deletedAt = new Date();
        voucher.deletedBy = sellerId;
        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Delete shop voucher success" });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
