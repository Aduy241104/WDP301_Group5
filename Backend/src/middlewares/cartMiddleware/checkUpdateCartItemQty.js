// middlewares/checkUpdateCartItemQty.js
import { StatusCodes } from "http-status-codes";
import { Variant } from "../../models/Variant.js";
import { Product } from "../../models/Product.js";
import { Inventory } from "../../models/Inventory.js";
import { Cart } from "../../models/Cart.js";
import mongoose from "mongoose";

export const checkUpdateCartItemQty = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { variantId } = req.params;
        const { quantity } = req.body;

        //validate params
        if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid or missing variantId.",
            });
        }

        //validate body
        const requestedQty = Number(quantity);
        if (!Number.isInteger(requestedQty) || requestedQty < 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Quantity must be an integer >= 1.",
            });
        }

        //cart + item tồn tại?
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Cart not found." });
        }

        const existed = cart.items.find((it) => String(it.variantId) === String(variantId));
        if (!existed) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Item not found in cart." });
        }

        //variant active + not deleted
        const variant = await Variant.findOne({
            _id: variantId,
            status: "active",
            isDeleted: false,
        }).lean();

        if (!variant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Variant not found or inactive.",
            });
        }

        //product active + approved + not deleted
        const product = await Product.findOne({
            _id: variant.productId,
            isDeleted: false,
            activeStatus: "active",
            status: "approved",
        }).lean();

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Product not found or inactive.",
            });
        }

        //stock
        const inventory = await Inventory.findOne({ variantId }).lean();
        const stock = inventory?.stock ?? 0;

        if (stock <= 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Out of stock." });
        }

        if (requestedQty > stock) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Quantity exceeds available stock.",
                stock,
                requestedQty,
            });
        }

        //attach cho controller
        req.cartItemCtx = {
            variantId,
            requestedQty,
            stock,
        };

        next();
    } catch (error) {
        console.error("CHECK_UPDATE_CART_ITEM_QTY_ERROR:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to validate update cart item.",
        });
    }
};
