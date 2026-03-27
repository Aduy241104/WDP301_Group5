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
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Không tìm thấy cửa hàng đã được duyệt." });
        }

        const { code, discountPercentage, discountType, usageLimitTotal, expirationDate } = req.body;
        const normalizedCode = normalizeCode(code);
        const discount = Number(discountPercentage);
        const end = expirationDate ? new Date(expirationDate) : null;
        const type = discountType === "fixed" ? "fixed" : "percent";

        if (!normalizedCode || !Number.isFinite(discount) || discount <= 0 || !end || Number.isNaN(end.getTime())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Vui lòng nhập đầy đủ mã voucher, giá trị giảm và ngày hết hạn hợp lệ.",
            });
        }

        if (type === "percent" && (discount <= 0 || discount > 100)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Giá trị giảm theo % phải nằm trong khoảng 1 - 100.",
            });
        }

        const existed = await Voucher.findOne({
            scope: "shop",
            shopId: shop._id,
            code: normalizedCode,
            isDeleted: false,
            endAt: { $gte: new Date() },
        }).lean();
        if (existed) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Mã voucher này đang tồn tại và còn hiệu lực trong shop. Vui lòng chọn mã khác hoặc chờ voucher cũ hết hạn.",
            });
        }

        const start = new Date();
        if (end <= start) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Ngày hết hạn phải lớn hơn thời điểm hiện tại." });
        }

        const voucher = await Voucher.create({
            scope: "shop",
            shopId: shop._id,
            code: normalizedCode,
            name: normalizedCode,
            discountType: type,
            discountValue: discount,
            startAt: start,
            endAt: end,
            usageLimitTotal: Number(usageLimitTotal || 0),
            createdBy: sellerId,
            createdByRole: "seller",
            isActive: true,
        });

        return res.status(StatusCodes.CREATED).json({ message: "Tạo voucher cho shop thành công.", data: voucher });
    } catch (error) {
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

        return res.status(StatusCodes.OK).json({ message: "Lấy chi tiết voucher shop thành công.", data: voucher });
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
        const { isActive, discountPercentage, discountType, usageLimitTotal, expirationDate } = req.body;
        const voucher = await Voucher.findOne({
            _id: voucherId,
            scope: "shop",
            shopId: shop._id,
            isDeleted: false,
        });

        if (!voucher) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy voucher." });
        }

        if (typeof isActive === "boolean") voucher.isActive = isActive;
        if (typeof discountPercentage !== "undefined") {
            const discount = Number(discountPercentage);
            if (!Number.isFinite(discount) || discount <= 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Giá trị giảm phải lớn hơn 0." });
            }
            voucher.discountValue = discount;
        }
        if (typeof discountType !== "undefined") {
            const type = discountType === "fixed" ? "fixed" : "percent";
            if (type === "percent" && (voucher.discountValue <= 0 || voucher.discountValue > 100)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Giá trị giảm theo % phải nằm trong khoảng 1 - 100." });
            }
            voucher.discountType = type;
        }
        if (typeof usageLimitTotal !== "undefined") {
            const limit = Number(usageLimitTotal);
            if (!Number.isFinite(limit) || limit < 0) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Số lượt sử dụng tối đa phải lớn hơn hoặc bằng 0." });
            }
            voucher.usageLimitTotal = limit;
        }
        if (expirationDate) {
            const end = new Date(expirationDate);
            if (Number.isNaN(end.getTime())) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Ngày hết hạn không hợp lệ." });
            }
            voucher.endAt = end;
        }

        await voucher.save();
        return res.status(StatusCodes.OK).json({ message: "Cập nhật voucher shop thành công.", data: voucher });
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
