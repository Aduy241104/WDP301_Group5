import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";
import { SellerRequest } from "../models/SellerRequest.js";

// View detailed seller profile information.
export const AdminViewSellerProfileController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean();
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        const [shops, latestRequest] = await Promise.all([
            Shop.find({ ownerId: userId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
            SellerRequest.findOne({ userId, isDeleted: false }).sort({ createdAt: -1 }).lean(),
        ]);

        return res.status(StatusCodes.OK).json({
            user,
            shops,
            latestSellerRequest: latestRequest,
        });
    } catch (err) {
        console.error("ADMIN_VIEW_SELLER_PROFILE_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
