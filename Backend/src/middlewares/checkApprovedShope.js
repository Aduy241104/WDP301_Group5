import { Shop } from "../models/Shop.js";

export const checkApprovedShop = async (req, res, next) => {
    try {
        const shop = await Shop.findOne({
            ownerId: req.user.id,
            isDeleted: false,
        });

        if (!shop) {
            return res.status(404).json({
                message: "Không tìm thấy cửa hàng",
            });
        }

        // Nếu shop đang ở trạng thái pending, trả về thông báo đang chờ duyệt
        if (shop.status === "pending") {
            return res.status(403).json({
                message: "Cửa hàng của bạn đang chờ duyệt. Vui lòng đợi quản trị viên phê duyệt.",
                shopStatus: "pending",
            });
        }

        // Nếu shop bị blocked
        if (shop.status === "blocked") {
            return res.status(403).json({
                message: "Cửa hàng của bạn đã bị khóa",
                shopStatus: "blocked",
            });
        }

        // Chỉ cho phép khi shop đã được approved
        if (shop.status !== "approved") {
            return res.status(403).json({
                message: "Cửa hàng chưa được duyệt",
                shopStatus: shop.status,
            });
        }

        req.shop = shop;
        next();
    } catch (error) {
        console.error("checkApprovedShop error:", error);
        return res.status(500).json({
            message: "Lỗi server khi kiểm tra trạng thái cửa hàng",
        });
    }
};

