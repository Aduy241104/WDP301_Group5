import { StatusCodes } from "http-status-codes";
import { SellerRequest } from "../../models/SellerRequest.js";

// View the list of seller registrations (no filter)
export const AdminSellerRegistrationListController = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
        const skip = (page - 1) * limit;

        const query = { isDeleted: false };

        const [items, total] = await Promise.all([
            SellerRequest.find(query)
                .populate("userId", "email fullName phone role status")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            SellerRequest.countDocuments(query),
        ]);

        return res.status(StatusCodes.OK).json({
            items,
            paging: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        console.error("ADMIN_SELLER_REG_LIST_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

