// middlewares/validateAddToCart.js
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

export const validateAddToCart = (req, res, next) => {
    const { variantId, quantity } = req.body;

    // variantId
    if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Invalid or missing variantId.",
        });
    }

    // quantity
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Quantity must be an integer greater than or equal to 1.",
        });
    }

    next();
};
