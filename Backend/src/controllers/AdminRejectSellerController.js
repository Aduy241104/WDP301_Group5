import { StatusCodes } from "http-status-codes";
import { SellerRequest } from "../models/SellerRequest.js";

// Reject seller registration with reason
export const AdminRejectSellerController = async (req, res) => {
    try {
        const { requestId } = req.params;
        const rejectReason = String(req.body.rejectReason ?? "").trim();
        if (!rejectReason) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "rejectReason is required." });
        }

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

        sellerRequest.status = "rejected";
        sellerRequest.rejectReason = rejectReason;
        await sellerRequest.save();

        return res.status(StatusCodes.OK).json({
            message: "Seller request rejected.",
            sellerRequest,
        });
    } catch (err) {
        console.error("ADMIN_REJECT_SELLER_ERROR:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
};
