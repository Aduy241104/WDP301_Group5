import { StatusCodes } from "http-status-codes";
import { Shop } from "../../models/Shop.js";

// View the list of shops
export const AdminShopListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };
        const status = String(req.query.status ?? "").trim();
        if (status) query.status = status;

        const [items, total] = await Promise.all([
            Shop.find(query)
                .populate("ownerId", "email fullName phone role status")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Shop.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_SHOP_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

