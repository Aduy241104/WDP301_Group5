import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { Shop } from "../models/Shop.js";

// Block a seller account
export const AdminBlockSellerController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        user.status = "blocked";
        await user.save();

        // Also block shops owned by this user
        await Shop.updateMany(
            { ownerId: userId, isDeleted: false },
            { $set: { status: "blocked", isBlockedByAdmin: true } }
        );

        return res.status(StatusCodes.OK).json({
            message: "Seller blocked.",
            user: { id: user._id, role: user.role, status: user.status },
        });
    } catch (err) {
        console.error("ADMIN_BLOCK_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
