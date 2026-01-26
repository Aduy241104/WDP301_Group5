import { StatusCodes } from "http-status-codes";
import { User } from "../../models/User.js";
import { Shop } from "../../models/Shop.js";

// Unblock a seller account
export const AdminUnblockSellerController = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        user.status = "active";
        await user.save();

        // Unblock shops (set back to approved if they were blocked by admin)
        await Shop.updateMany(
            { ownerId: userId, isDeleted: false },
            { $set: { status: "approved", isBlockedByAdmin: false } }
        );

        return res.status(StatusCodes.OK).json({
            message: "Seller unblocked.",
            user: { id: user._id, role: user.role, status: user.status },
        });
    } catch (err) {
        console.error("ADMIN_UNBLOCK_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

