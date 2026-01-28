// middlewares/checkDeleteCartItem.js
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Cart } from "../../models/Cart.js";

export const checkDeleteCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { variantId } = req.params;

        // validate params
        if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid or missing variantId.",
            });
        }

        // cart + item tồn tại
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Cart not found." });
        }

        const existed = cart.items.some((it) => String(it.variantId) === String(variantId));
        if (!existed) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Item not found in cart." });
        }

        req.cartItemCtx = { variantId };
        next();
    } catch (error) {
        console.error("CHECK_DELETE_CART_ITEM_ERROR:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to validate delete cart item.",
        });
    }
};
