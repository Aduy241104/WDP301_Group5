import { StatusCodes } from "http-status-codes";
import { SellerRequest } from "../../models/SellerRequest.js";
import { User } from "../../models/User.js";
import { Shop } from "../../models/Shop.js";

// Approve seller registration
export const AdminApproveSellerController = async (req, res) => {
    try {
        const { requestId } = req.params;

        const sellerRequest = await SellerRequest.findById(requestId);
        if (!sellerRequest || sellerRequest.isDeleted) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Seller request not found." });
        }

        if (sellerRequest.status === "approved") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Seller request already approved." });
        }
        if (sellerRequest.status === "rejected") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Seller request already rejected." });
        }

        const user = await User.findById(sellerRequest.userId);
        if (!user) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });

        // Update request
        sellerRequest.status = "approved";
        sellerRequest.rejectReason = "";
        await sellerRequest.save();

        // Promote user -> seller (keep blocked/active status as-is)
        if (user.role !== "seller") {
            user.role = "seller";
            await user.save();
        }

        // Ensure a shop exists (create from request if not exists)
        const existingShop = await Shop.findOne({ ownerId: user._id, isDeleted: false });
        let shop = existingShop;
        if (!existingShop) {
            shop = await Shop.create({
                ownerId: user._id,
                name: sellerRequest.shopName,
                description: sellerRequest.description ?? "",
                status: "approved",
                isBlockedByAdmin: false,
                shopAddress: sellerRequest.shopAddress,
                shopPickupAddresses: [],
            });
        } else if (existingShop.status === "pending") {
            existingShop.status = "approved";
            existingShop.isBlockedByAdmin = false;
            await existingShop.save();
        }

        return res.status(StatusCodes.OK).json({
            message: "Seller request approved.",
            sellerRequest,
            user: { id: user._id, role: user.role, status: user.status },
            shop,
        });
    } catch (err) {
        console.error("ADMIN_APPROVE_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};

