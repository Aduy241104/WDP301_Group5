import { StatusCodes } from "http-status-codes";
import { Voucher } from "../models/Voucher.js";

const toDate = (value) => (value ? new Date(value) : null);
const normalizeCode = (value) => String(value || "").trim().toUpperCase();

export const adminCreateSystemVoucher = async (req, res) => {
    try {
        const { code, name, description, discountValue, maxDiscountValue, minOrderValue, startAt, endAt } = req.body;
        const normalizedCode = normalizeCode(code);

        if (!normalizedCode || !name || !startAt || !endAt) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "code, name, startAt, endAt are required" });
        }

        const start = toDate(startAt);
        const end = toDate(endAt);
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid startAt/endAt" });
        }

        const existed = await Voucher.findOne({ code: normalizedCode, isDeleted: false }).lean();
        if (existed) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Voucher code already exists" });
        }

        const voucher = await Voucher.create({
            scope: "system",
            shopId: null,
            code: normalizedCode,
            name: String(name).trim(),
            description: String(description || "").trim(),
            discountType: "ship",
            discountValue: Number(discountValue || 0),
            maxDiscountValue: Number(maxDiscountValue || discountValue || 0),
            minOrderValue: Number(minOrderValue || 0),
            startAt: start,
            endAt: end,
            createdBy: req.user.id,
            createdByRole: "admin",
            isActive: true,
        });

        return res.status(StatusCodes.CREATED).json({ message: "Create system voucher success", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const adminGetSystemVoucherList = async (req, res) => {
    try {
        const vouchers = await Voucher.find({
            scope: "system",
            isDeleted: false,
        }).sort({ createdAt: -1 }).lean();

        return res.status(StatusCodes.OK).json({ message: "Get system vouchers success", data: vouchers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const adminGetSystemVoucherDetail = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "system",
            isDeleted: false,
        }).lean();

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
        }

        return res.status(StatusCodes.OK).json({ message: "Get system voucher detail success", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const adminUpdateSystemVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const { name, description, discountValue, maxDiscountValue, minOrderValue, startAt, endAt } = req.body;

        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "system",
            isDeleted: false,
        });
        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
        }

        const start = toDate(startAt);
        const end = toDate(endAt);
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid startAt/endAt" });
        }

        voucher.name = String(name || voucher.name).trim();
        voucher.description = String(description || "").trim();
        voucher.discountValue = Number(discountValue || 0);
        voucher.maxDiscountValue = Number(maxDiscountValue || discountValue || 0);
        voucher.minOrderValue = Number(minOrderValue || 0);
        voucher.startAt = start;
        voucher.endAt = end;

        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Update system voucher success", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const adminToggleSystemVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const { isActive } = req.body;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "system",
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
        }

        voucher.isActive = Boolean(isActive);
        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Toggle system voucher success", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const adminDeleteSystemVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "system",
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Voucher not found" });
        }

        voucher.isDeleted = true;
        voucher.deletedAt = new Date();
        voucher.deletedBy = req.user.id;
        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Delete system voucher success" });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
