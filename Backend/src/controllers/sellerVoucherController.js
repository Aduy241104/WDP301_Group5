import { StatusCodes } from "http-status-codes";
import { Voucher } from "../models/Voucher.js";
import { Shop } from "../models/Shop.js";
import crypto from "crypto";

const normalizeCode = (value) => String(value || "").trim().toUpperCase();

async function getSellerShop(userId) {
    return Shop.findOne({ ownerId: userId, isDeleted: false, status: "approved" }).lean();
}


export const createShopVoucher = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Không tìm thấy cửa hàng đã được duyệt." });
        }

        const {
            code,
            discountValue,
            discountType,
            minOrderValue,
            maxDiscountValue,
            usageLimitTotal,
            usageLimitPerUser,
            expirationDate
        } = req.body;

        // 1. TỰ ĐỘNG TẠO MÃ NẾU KHÔNG CÓ
        let finalCode;
        if (!code || code.trim() === "") {
            // Tạo mã dạng: SHOP-A1B2C3
            finalCode = `SHOP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        } else {
            finalCode = normalizeCode(code);
        }

        const discount = Number(discountValue);
        const end = expirationDate ? new Date(expirationDate) : null;
        const type = discountType === "fixed" ? "fixed" : "percent";
        const start = new Date();

        // 2. VALIDATE
        if (!Number.isFinite(discount) || discount <= 0 || !end || Number.isNaN(end.getTime())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Giá trị giảm và ngày hết hạn là bắt buộc.",
            });
        }

        if (type === "percent" && discount > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Giá trị giảm theo % không được vượt quá 100.",
            });
        }

        if (end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Ngày hết hạn phải lớn hơn thời điểm hiện tại." });
        }

        // 3. KIỂM TRA TRÙNG MÃ (Trong phạm vi của Shop này)
        const existed = await Voucher.findOne({
            scope: "shop",
            shopId: shop._id,
            code: finalCode,
            isDeleted: false,
            endAt: { $gte: new Date() },
        }).lean();

        if (existed) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Mã voucher này đã tồn tại và còn hiệu lực. Vui lòng thử lại hoặc nhập mã khác.",
            });
        }

        // 4. TẠO VOUCHER
        const voucher = await Voucher.create({
            scope: "shop",
            shopId: shop._id,
            code: finalCode,
            name: finalCode, // Hoặc lấy name từ FE nếu có
            description: `Giảm ${discount}${type === "percent" ? "%" : "VND"} cho đơn hàng từ ${Number(minOrderValue || 0).toLocaleString()}VND`,
            discountType: type,
            discountValue: discount,

            // Các trường bổ sung
            minOrderValue: Number(minOrderValue || 0),
            maxDiscountValue: type === "fixed" ? discount : Number(maxDiscountValue || 0),
            usageLimitTotal: Number(usageLimitTotal || 0),
            usageLimitPerUser: Number(usageLimitPerUser || 1),
            usedCount: 0,

            startAt: start,
            endAt: end,
            createdBy: sellerId,
            createdByRole: "seller",
            isActive: true,
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Tạo voucher cho shop thành công.",
            data: voucher
        });
    } catch (error) {
        console.error("Error at createShopVoucher:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const getShopVoucherList = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Không tìm thấy cửa hàng đã được duyệt." });
        }

        const vouchers = await Voucher.find({
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        }).sort({ createdAt: -1 }).lean();

        return res.status(StatusCodes.OK).json({ message: "Lấy danh sách voucher shop thành công.", data: vouchers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};


export const getShopVoucherDetail = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Không tìm thấy cửa hàng đã được duyệt." });
        }

        const { voucherId } = req.params;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        }).lean();

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        return res.status(StatusCodes.OK).json({
            message: "Lấy chi tiết voucher shop thành công.",
            data: voucher
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const updateShopVoucher = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Không tìm thấy cửa hàng đã được duyệt." });
        }

        const { voucherId } = req.params;
        const {
            isActive,
            discountValue,
            discountType,
            minOrderValue,
            maxDiscountValue,
            usageLimitTotal,
            usageLimitPerUser,
            expirationDate
        } = req.body;

        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        // 1. Cập nhật trạng thái kích hoạt
        if (typeof isActive === "boolean") voucher.isActive = isActive;

        // 2. Cập nhật Loại và Giá trị giảm (Cần validate đồng thời)
        const newType = discountType || voucher.discountType;
        const newValue = typeof discountValue !== "undefined" ? Number(discountValue) : voucher.discountValue;
        const newMinOrder = typeof minOrderValue !== "undefined" ? Number(minOrderValue) : voucher.minOrderValue;

        if (newValue <= 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Giá trị giảm phải lớn hơn 0." });
        }

        if (newType === "percent" && newValue > 100) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Giảm theo % không được quá 100%." });
        }

        // VALIDATE QUAN TRỌNG: Giá cố định không được lớn hơn đơn tối thiểu
        if (newType === "fixed" && newValue > newMinOrder) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Số tiền giảm không được lớn hơn giá trị đơn hàng tối thiểu."
            });
        }

        voucher.discountType = newType;
        voucher.discountValue = newValue;
        voucher.minOrderValue = newMinOrder;

        // 3. Cập nhật Giảm tối đa
        if (newType === "fixed") {
            voucher.maxDiscountValue = newValue; // Luôn bằng discountValue nếu là fixed
        } else {
            voucher.maxDiscountValue = typeof maxDiscountValue !== "undefined" ? Number(maxDiscountValue) : voucher.maxDiscountValue;
        }

        // 4. Cập nhật Lượt dùng & Giới hạn mỗi khách
        const newLimitTotal = typeof usageLimitTotal !== "undefined" ? Number(usageLimitTotal) : voucher.usageLimitTotal;
        const newLimitPerUser = typeof usageLimitPerUser !== "undefined" ? Number(usageLimitPerUser) : voucher.usageLimitPerUser;

        if (newLimitTotal > 0 && newLimitPerUser > newLimitTotal) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Lượt dùng mỗi khách không được cao hơn tổng số lượt dùng."
            });
        }

        voucher.usageLimitTotal = newLimitTotal;
        voucher.usageLimitPerUser = newLimitPerUser;

        // 5. Cập nhật Ngày hết hạn
        if (expirationDate) {
            const end = new Date(expirationDate);
            if (Number.isNaN(end.getTime()) || end <= new Date()) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Ngày hết hạn không hợp lệ hoặc phải ở tương lai." });
            }
            voucher.endAt = end;
        }

        await voucher.save();
        return res.status(StatusCodes.OK).json({
            message: "Cập nhật voucher shop thành công.",
            data: voucher
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const deleteShopVoucher = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const shop = await getSellerShop(sellerId);
        if (!shop) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Không tìm thấy cửa hàng đã được duyệt." });
        }

        const { voucherId } = req.params;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        voucher.isDeleted = true;
        voucher.deletedAt = new Date();
        voucher.deletedBy = sellerId;
        await voucher.save();

        return res.status(StatusCodes.OK).json({ message: "Xóa voucher shop thành công." });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
