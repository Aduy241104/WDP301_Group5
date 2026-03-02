// middlewares/checkAddToCartAvailability.js
import { StatusCodes } from "http-status-codes";
import { Variant } from "../../models/Variant.js";
import { Product } from "../../models/Product.js";
import { Inventory } from "../../models/Inventory.js";
import { Cart } from "../../models/Cart.js";
import mongoose from "mongoose";

export const checkAddToCartAvailability = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { variantId, quantity } = req.body;
        const addQty = Number(quantity);

        // variantId
        if (!variantId || !mongoose.Types.ObjectId.isValid(variantId)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid or missing variantId.",
            });
        }

        // validate quantity
        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Quantity must be an integer greater than or equal to 1.",
            });
        }

        //Variant
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

        //Product
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

        //Inventory
        const inventory = await Inventory.findOne({ variantId }).lean();
        const stock = inventory?.stock ?? 0;

        if (stock <= 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Out of stock.",
            });
        }

        // Quantity hiện tại trong cart
        const cart = await Cart.findOne({ userId }).lean();
        let currentQty = 0;

        if (cart) {
            const existingItem = cart.items.find(
                (it) => String(it.variantId) === String(variantId)
            );
            currentQty = existingItem ? Number(existingItem.quantity) : 0;
        }

        const nextQty = currentQty + addQty;

        if (nextQty > stock) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Quantity exceeds available stock.",
                stock,
                currentQty,
                addQty,
                nextQty,
            });
        }

        // Gắn data đã validate cho controller
        req.cartValidated = {
            variant,
            product,
            stock,
            currentQty,
            nextQty,
        };

        next();
    } catch (error) {
        console.error("CHECK_ADD_TO_CART_ERROR:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to validate cart item.",
        });
    }
};
