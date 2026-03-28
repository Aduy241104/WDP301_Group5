import { StatusCodes } from "http-status-codes";
import { Voucher } from "../models/Voucher.js";
import crypto from "crypto";

const toDate = (value) => (value ? new Date(value) : null);
const normalizeCode = (value) => String(value || "").trim().toUpperCase();

// Hàm helper tạo mã ngẫu nhiên nếu không có code truyền vào
const generateRandomCode = () => {
    return `SV-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

export const adminCreateSystemVoucher = async (req, res) => {
    try {
        const {
            code,
            name,
            description,
            discountValue,
            minOrderValue,
            usageLimitTotal,    // Nhận từ FE
            usageLimitPerUser,  // Nhận từ FE
            startAt,
            endAt
        } = req.body;

        // 1. Xử lý mã Voucher (Ưu tiên code từ FE, không có thì random)
        let finalCode = code ? normalizeCode(code) : generateRandomCode();

        // 2. Validate cơ bản các trường bắt buộc
        if (!name || !startAt || !endAt) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Tên voucher và thời gian áp dụng là bắt buộc."
            });
        }

        // 3. Xử lý thời gian
        const start = toDate(startAt);
        const end = toDate(endAt);
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Thời gian bắt đầu/kết thúc không hợp lệ hoặc ngày kết thúc phải sau ngày bắt đầu."
            });
        }

        // 4. Kiểm tra trùng mã (chỉ check các voucher đang còn hiệu lực)
        const existed = await Voucher.findOne({
            scope: "system",
            code: finalCode,
            isDeleted: false,
            endAt: { $gte: new Date() },
        }).lean();

        if (existed) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Mã voucher này đã tồn tại và đang có hiệu lực. Vui lòng chọn mã khác.",
            });
        }

        // 5. Khởi tạo bản ghi Voucher mới
        const voucher = await Voucher.create({
            scope: "system",
            shopId: null, // Voucher hệ thống không thuộc shop nào
            code: finalCode,
            name: String(name).trim(),
            description: String(description || "").trim(),
            discountType: "ship", // Loại giảm giá (theo logic ship bạn đã chọn)

            discountValue: Number(discountValue || 0),
            // Mặc định maxDiscountValue bằng discountValue vì bạn đã bỏ trường này ở FE
            maxDiscountValue: Number(discountValue || 0),
            minOrderValue: Number(minOrderValue || 0),

            // Cập nhật giới hạn sử dụng theo ảnh Schema của bạn
            usageLimitTotal: Number(usageLimitTotal || 0),      // 0 = không giới hạn tổng
            usageLimitPerUser: Number(usageLimitPerUser || 1),  // Mặc định mỗi người 1 lần
            usedCount: 0,                                       // Ban đầu chưa ai dùng

            startAt: start,
            endAt: end,
            createdBy: req.user.id,
            createdByRole: "admin",
            isActive: true,
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Tạo voucher hệ thống thành công.",
            data: voucher
        });
    } catch (error) {
        console.error("Error creating voucher:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Lỗi hệ thống: " + error.message
        });
    }
};

export const adminGetSystemVoucherList = async (req, res) => {
    try {
        const vouchers = await Voucher.find({
            scope: "system",
            isDeleted: false,
        }).sort({ createdAt: -1 }).lean();

        return res.status(StatusCodes.OK).json({ message: "Lấy danh sách voucher hệ thống thành công.", data: vouchers });
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
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        return res.status(StatusCodes.OK).json({ message: "Lấy chi tiết voucher hệ thống thành công.", data: voucher });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const adminUpdateSystemVoucher = async (req, res) => {
    try {
        const { voucherId } = req.params;
        const { name, description, discountValue, maxDiscountValue, minOrderValue, usageLimitTotal, startAt, endAt } = req.body;

        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "system",
            isDeleted: false,
        });
        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        const start = toDate(startAt);
        const end = toDate(endAt);
        if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Thời gian bắt đầu/kết thúc không hợp lệ." });
        }

        voucher.name = String(name || voucher.name).trim();
        voucher.description = String(description || "").trim();
        voucher.discountValue = Number(discountValue || 0);
        voucher.maxDiscountValue = Number(maxDiscountValue || discountValue || 0);
        voucher.minOrderValue = Number(minOrderValue || 0);
        voucher.startAt = start;
        voucher.endAt = end;
        voucher.usageLimitTotal = Number(usageLimitTotal || 0);

        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Cập nhật voucher hệ thống thành công.", data: voucher });
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
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        voucher.isActive = Boolean(isActive);
        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Cập nhật trạng thái voucher thành công.", data: voucher });
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
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        voucher.isDeleted = true;
        voucher.deletedAt = new Date();
        voucher.deletedBy = req.user.id;
        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Xóa voucher hệ thống thành công." });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
